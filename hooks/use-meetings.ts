"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  cancelInterviewMeeting,
  deleteInterviewMeeting,
  getInterviewSchedulingContext,
  listCandidateMeetings,
  listInterviewMeetings,
  publishInterviewMeeting,
  respondToInterviewMeeting,
  scheduleInterviewMeeting,
  updateInterviewMeeting,
  type MeetingFilters,
  type MeetingListResult,
  type UpdateInterviewMeetingInput,
} from "@/actions/interview-meeting.action"

type MeetingMode = "organizer" | "candidate"

export interface UseMeetingsOptions {
  userId?: string
  filters?: MeetingFilters
  enabled?: boolean
  mode?: MeetingMode
}

export function useMeetings(options: UseMeetingsOptions) {
  const { userId, filters, enabled = true, mode = "organizer" } = options
  const queryClient = useQueryClient()

  const normalizedFilters = useMemo(() => {
    const baseFilters: MeetingFilters | undefined = filters
      ? {
          ...filters,
          jobPostingId:
            filters.jobPostingId && filters.jobPostingId !== "ALL"
              ? filters.jobPostingId
              : undefined,
        }
      : undefined

    if (mode === "candidate") {
      return {
        ...baseFilters,
        publishedOnly: true,
      }
    }

    return baseFilters
  }, [filters, mode])

  const meetingsQuery = useQuery<MeetingListResult>({
    queryKey: ["interview-meetings", mode, userId, normalizedFilters],
    queryFn: () =>
      mode === "organizer"
        ? listInterviewMeetings(userId!, normalizedFilters)
        : listCandidateMeetings(userId!, normalizedFilters),
    enabled: Boolean(enabled && userId),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 20,
    placeholderData: (previousData) => previousData ?? undefined,
  })

  const contextQuery = useQuery({
    queryKey: ["interview-context", userId],
    queryFn: () => getInterviewSchedulingContext(userId!),
    enabled: Boolean(mode === "organizer" && userId),
    staleTime: 1000 * 60 * 5,
  })

  const invalidateMeetings = () => {
    queryClient.invalidateQueries({ queryKey: ["interview-meetings", mode, userId] })
  }

  const schedule = useMutation({
    mutationFn: scheduleInterviewMeeting,
    onSuccess: () => {
      toast.success("Entretien programmé avec succès")
      invalidateMeetings()
      queryClient.invalidateQueries({ queryKey: ["interview-context", userId] })
    },
    onError: (error: any) => {
      toast.error(error?.message || "Impossible de planifier l'entretien")
    },
  })

  const update = useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: UpdateInterviewMeetingInput }) =>
      updateInterviewMeeting(meetingId, data),
    onSuccess: () => {
      toast.success("Entretien mis à jour")
      invalidateMeetings()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Impossible de mettre à jour l'entretien")
    },
  })

  const cancel = useMutation({
    mutationFn: ({ meetingId, notes }: { meetingId: string; notes?: string | null }) =>
      cancelInterviewMeeting(meetingId, notes),
    onSuccess: () => {
      toast.success("Entretien annulé")
      invalidateMeetings()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Impossible d'annuler l'entretien")
    },
  })

  const remove = useMutation({
    mutationFn: deleteInterviewMeeting,
    onSuccess: () => {
      toast.success("Entretien supprimé")
      invalidateMeetings()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Impossible de supprimer l'entretien")
    },
  })

  const publish = useMutation({
    mutationFn: publishInterviewMeeting,
    onSuccess: () => {
      toast.success("Proposition envoyée au candidat")
      invalidateMeetings()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Impossible d'envoyer la proposition")
    },
  })

  const respond = useMutation({
    mutationFn: ({
      meetingId,
      accepted,
      notes,
    }: {
      meetingId: string
      accepted: boolean
      notes?: string | null
    }) => respondToInterviewMeeting(meetingId, accepted, { notes }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.accepted
          ? "Entretien accepté"
          : "Entretien refusé"
      )
      invalidateMeetings()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Impossible d'enregistrer la réponse")
    },
  })

  const upcomingCount = useMemo(() => {
    if (!meetingsQuery.data) return 0
    const now = new Date()
    return meetingsQuery.data.meetings.filter(
      (meeting) =>
        meeting.status !== "CANCELLED" && new Date(meeting.scheduledAt) >= now
    ).length
  }, [meetingsQuery.data])

  return {
    meetingsQuery,
    contextQuery,
    scheduleMeeting: schedule.mutate,
    updateMeeting: update.mutate,
    cancelMeeting: cancel.mutate,
    deleteMeeting: remove.mutate,
    publishMeeting: publish.mutate,
    respondMeeting: respond.mutate,
    scheduleMutation: schedule,
    updateMutation: update,
    cancelMutation: cancel,
    deleteMutation: remove,
    publishMutation: publish,
    respondMutation: respond,
    upcomingCount,
    mode,
  }
}
