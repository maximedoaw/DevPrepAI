"use server"

import prisma from "@/db/prisma"
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
    },
    include: {
      job: { select: { id: true, title: true } },
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

  revalidatePath("/enterprise/enterprise-interviews")

  return meeting
}

