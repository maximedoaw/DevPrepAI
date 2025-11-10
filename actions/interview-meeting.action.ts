"use server"

import prisma from "@/db/prisma"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

export type InterviewMeetingStatus = "PLANNED" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

export interface ScheduleInterviewMeetingInput {
  organizerId: string
  jobPostingId: string
  candidateId: string
  applicationId?: string | null
  scheduledAt: string
  durationMinutes?: number | null
  meetingLink?: string | null
  location?: string | null
  notes?: string | null 
  status?: InterviewMeetingStatus
  candidateNotes?: string | null
}

export async function getInterviewSchedulingContext(organizerId: string) {
  if (!organizerId) {
    throw new Error("Identifiant utilisateur requis pour charger les données d'entretien.")
  }

  const jobs = await prisma.jobPosting.findMany({
    where: { userId: organizerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      applications: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  })

  return {
    jobs: jobs.map((job) => ({
      id: job.id,
      title: job.title,
      candidates: job.applications.map((app: (typeof job.applications)[number]) => ({
        applicationId: app.id,
        status: app.status,
        user: {
          id: app.user.id,
          firstName: app.user.firstName,
          lastName: app.user.lastName,
          email: app.user.email,
        },
      })),
    })),
  }
}

export async function getInterviewMeetings(organizerId: string) {
  if (!organizerId) {
    throw new Error("Identifiant utilisateur requis pour charger les entretiens programmés.")
  }

  const meetings = await prisma.interviewMeeting.findMany({
    where: { organizerId },
    orderBy: [{ scheduledAt: "asc" }],
    include: {
      job: {
        select: { id: true, title: true },
      },
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      application: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  })

  return meetings
}

export async function scheduleInterviewMeeting(input: ScheduleInterviewMeetingInput) {
  if (!input.organizerId) {
    throw new Error("Organisateur requis pour planifier un entretien.")
  }
  if (!input.jobPostingId) {
    throw new Error("Veuillez sélectionner une offre d'emploi.")
  }
  if (!input.candidateId) {
    throw new Error("Veuillez sélectionner un candidat.")
  }
  if (!input.scheduledAt) {
    throw new Error("La date et l'heure de l'entretien sont requises.")
  }

  const scheduledDate = new Date(input.scheduledAt)
  if (Number.isNaN(scheduledDate.getTime())) {
    throw new Error("Format de date invalide.")
  }

  const meeting = await prisma.interviewMeeting.create({
    data: {
      organizerId: input.organizerId,
      jobPostingId: input.jobPostingId,
      candidateId: input.candidateId,
      applicationId: input.applicationId ?? null,
      scheduledAt: scheduledDate,
      durationMinutes: input.durationMinutes ?? 30,
      meetingLink: input.meetingLink?.trim() || null,
      location: input.location?.trim() || null,
      notes: input.notes?.trim() || null,
      status: input.status ?? "PLANNED",
      candidateNotes: input.candidateNotes?.trim() || null,
    },
    select: meetingSelect,
  })

  revalidatePath("/enterprise/enterprise-interviews")
  revalidatePath("/candidat/meetings")

  return meeting
}

const meetingSelect = {
  id: true,
  organizerId: true,
  jobPostingId: true,
  candidateId: true,
  applicationId: true,
  scheduledAt: true,
  durationMinutes: true,
  meetingLink: true,
  location: true,
  notes: true,
  status: true,
  reminderSent: true,
  candidateNotes: true,
  candidateRespondedAt: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  job: {
    select: { id: true, title: true },
  },
  organizer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  candidate: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  application: {
    select: {
      id: true,
      status: true,
    },
  },
} as const

export type MeetingWithRelations = Prisma.InterviewMeetingGetPayload<{
  select: typeof meetingSelect
}>

export interface MeetingFilters {
  page?: number
  pageSize?: number
  status?: InterviewMeetingStatus | "ALL"
  jobPostingId?: string
  search?: string
  upcomingOnly?: boolean
  publishedOnly?: boolean
}

export interface MeetingListResult {
  meetings: MeetingWithRelations[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNextPage: boolean
  }
}

export async function listInterviewMeetings(
  organizerId: string,
  filters: MeetingFilters = {}
): Promise<MeetingListResult> {
  if (!organizerId) {
    throw new Error("Identifiant utilisateur requis pour charger les entretiens.")
  }

  const {
    page = 1,
    pageSize = 5,
    status,
    jobPostingId,
    search,
    upcomingOnly,
  } = filters

  const where: Prisma.InterviewMeetingWhereInput = {
    organizerId,
  }

  if (status && status !== "ALL") {
    where.status = status
  }

  if (jobPostingId) {
    where.jobPostingId = jobPostingId
  }

  if (upcomingOnly) {
    where.scheduledAt = {
      gte: new Date(),
    }
  }

  if (filters.publishedOnly) {
    ;(where as Prisma.InterviewMeetingWhereInput & { isPublished?: boolean }).isPublished = true
  }

  if (search && search.trim().length > 0) {
    const term = search.trim()
    where.OR = [
      { candidate: { firstName: { contains: term, mode: "insensitive" } } },
      { candidate: { lastName: { contains: term, mode: "insensitive" } } },
      { candidate: { email: { contains: term, mode: "insensitive" } } },
      { job: { title: { contains: term, mode: "insensitive" } } },
    ]
  }

  const skip = Math.max(0, (page - 1) * pageSize)
  const take = Math.max(1, pageSize)

  const [items, total] = await prisma.$transaction([
    prisma.interviewMeeting.findMany({
      where,
      orderBy: {
        scheduledAt: upcomingOnly ? "asc" : "desc",
      },
      skip,
      take,
      select: meetingSelect,
    }),
    prisma.interviewMeeting.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / take))

  return {
    meetings: items as MeetingWithRelations[],
    pagination: {
      page,
      pageSize: take,
      total,
      totalPages,
      hasNextPage: page < totalPages,
    },
  }
}

export interface UpdateInterviewMeetingInput {
  jobPostingId?: string
  candidateId?: string
  applicationId?: string | null
  scheduledAt?: string
  durationMinutes?: number | null
  meetingLink?: string | null
  location?: string | null
  notes?: string | null
  status?: InterviewMeetingStatus
  candidateNotes?: string | null
}

export async function updateInterviewMeeting(meetingId: string, updates: UpdateInterviewMeetingInput) {
  if (!meetingId) {
    throw new Error("Identifiant d'entretien requis.")
  }

  const data: Prisma.InterviewMeetingUpdateInput = {}

  if (updates.jobPostingId) {
    data.job = { connect: { id: updates.jobPostingId } }
  }

  if (updates.candidateId) {
    data.candidate = { connect: { id: updates.candidateId } }
  }

  if (updates.applicationId !== undefined) {
    data.application = updates.applicationId
      ? { connect: { id: updates.applicationId } }
      : { disconnect: true }
  }
  if (updates.durationMinutes !== undefined) data.durationMinutes = updates.durationMinutes
  if (updates.meetingLink !== undefined) data.meetingLink = updates.meetingLink?.trim() || null
  if (updates.location !== undefined) data.location = updates.location?.trim() || null
  if (updates.notes !== undefined) data.notes = updates.notes?.trim() || null
  if (updates.status) data.status = updates.status
  if (updates.candidateNotes !== undefined) {
    data.candidateNotes = updates.candidateNotes?.trim() || null
  }

  if (updates.scheduledAt) {
    const newDate = new Date(updates.scheduledAt)
    if (Number.isNaN(newDate.getTime())) {
      throw new Error("Format de date invalide.")
    }
    data.scheduledAt = newDate
  }

  const meeting = await prisma.interviewMeeting.update({
    where: { id: meetingId },
    data,
    select: meetingSelect,
  })

  revalidatePath("/enterprise/enterprise-interviews")
  revalidatePath("/candidat/meetings")

  return meeting
}

export async function cancelInterviewMeeting(meetingId: string, notes?: string | null) {
  if (!meetingId) {
    throw new Error("Identifiant d'entretien requis pour annuler.")
  }

  const meeting = await prisma.interviewMeeting.update({
    where: { id: meetingId },
    data: {
      status: "CANCELLED",
      notes: notes !== undefined ? notes?.trim() || null : undefined,
      candidateRespondedAt: new Date(),
    },
    select: meetingSelect,
  })

  revalidatePath("/enterprise/enterprise-interviews")
  revalidatePath("/candidat/meetings")
  return meeting
}

export async function deleteInterviewMeeting(meetingId: string) {
  if (!meetingId) {
    throw new Error("Identifiant d'entretien requis pour supprimer.")
  }

  await prisma.interviewMeeting.delete({
    where: { id: meetingId },
  })

  revalidatePath("/enterprise/enterprise-interviews")
  revalidatePath("/candidat/meetings")
  return { success: true }
}

export async function publishInterviewMeeting(meetingId: string) {
  if (!meetingId) {
    throw new Error("Identifiant d'entretien requis pour l'envoi.")
  }

  const meeting = await prisma.interviewMeeting.update({
    where: { id: meetingId },
    data: {
      isPublished: true,
      publishedAt: new Date(),
    } as Prisma.InterviewMeetingUncheckedUpdateInput,
    select: meetingSelect,
  })

  revalidatePath("/enterprise/enterprise-interviews")
  revalidatePath("/candidat/meetings")
  return meeting
}

export interface CandidateMeetingFilters extends MeetingFilters {}

export async function listCandidateMeetings(
  candidateId: string,
  filters: CandidateMeetingFilters = {}
): Promise<MeetingListResult> {
  if (!candidateId) {
    throw new Error("Identifiant candidat requis.")
  }

  const {
    page = 1,
    pageSize = 5,
    status,
    jobPostingId,
    search,
    upcomingOnly,
    publishedOnly = true,
  } = filters

  const where: Prisma.InterviewMeetingWhereInput = {
    candidateId,
  }

  if (publishedOnly) {
    ;(where as Prisma.InterviewMeetingWhereInput & { isPublished?: boolean }).isPublished = true
  }

  if (status && status !== "ALL") {
    where.status = status
  }

  if (jobPostingId) {
    where.jobPostingId = jobPostingId
  }

  if (upcomingOnly) {
    where.scheduledAt = {
      gte: new Date(),
    }
  }

  if (search && search.trim().length > 0) {
    const term = search.trim()
    where.OR = [
      { organizer: { firstName: { contains: term, mode: "insensitive" } } },
      { organizer: { lastName: { contains: term, mode: "insensitive" } } },
      { organizer: { email: { contains: term, mode: "insensitive" } } },
      { job: { title: { contains: term, mode: "insensitive" } } },
    ]
  }

  const skip = Math.max(0, (page - 1) * pageSize)
  const take = Math.max(1, pageSize)

  const [items, total] = await prisma.$transaction([
    prisma.interviewMeeting.findMany({
      where,
      orderBy: { scheduledAt: upcomingOnly ? "asc" : "desc" },
      skip,
      take,
      select: meetingSelect,
    }),
    prisma.interviewMeeting.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / take))

  return {
    meetings: items as MeetingWithRelations[],
    pagination: {
      page,
      pageSize: take,
      total,
      totalPages,
      hasNextPage: page < totalPages,
    },
  }
}

export async function respondToInterviewMeeting(
  meetingId: string,
  accepted: boolean,
  options?: { notes?: string | null }
) {
  if (!meetingId) {
    throw new Error("Identifiant d'entretien requis.")
  }

  const meeting = await prisma.interviewMeeting.update({
    where: { id: meetingId },
    data: {
      status: accepted ? "CONFIRMED" : "CANCELLED",
      candidateNotes: options?.notes?.trim() || null,
      candidateRespondedAt: new Date(),
    },
    select: meetingSelect,
  })

  revalidatePath("/enterprise/enterprise-interviews")
  revalidatePath("/candidat/meetings")
  return meeting
}

export async function getInterviewMeetingById(
  meetingId: string,
  viewerId: string,
  mode: "organizer" | "candidate"
) {
  if (!meetingId) throw new Error("Identifiant d'entretien requis.")
  if (!viewerId) throw new Error("Identifiant utilisateur requis.")

  const meeting = await prisma.interviewMeeting.findUnique({
    where: { id: meetingId },
    select: meetingSelect,
  })

  if (!meeting) {
    throw new Error("Entretien introuvable.")
  }

  if (mode === "organizer" && meeting.organizerId !== viewerId) {
    throw new Error("Accès non autorisé à cet entretien.")
  }

  if (mode === "candidate") {
    if (meeting.candidateId !== viewerId || !meeting.isPublished) {
      throw new Error("Accès non autorisé à cet entretien.")
    }
  }

  return meeting
}

