"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useStreamVideoClient } from "@stream-io/video-react-sdk"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMemo } from "react"
import {
  type ScheduleInterviewMeetingInput,
  type UpdateInterviewMeetingInput,
  type MeetingWithRelations,
  type MeetingListResult,
  type MeetingFilters,
  scheduleInterviewMeeting,
  updateInterviewMeeting,
  cancelInterviewMeeting,
  deleteInterviewMeeting,
  publishInterviewMeeting,
  respondToInterviewMeeting,
  listInterviewMeetings,
  listCandidateMeetings,
  getInterviewSchedulingContext,
} from "@/actions/interview-meeting.action"

const meetingKeys = {
  all: ["meetings"] as const,
  lists: () => [...meetingKeys.all, "list"] as const,
  list: (filters: any) => [...meetingKeys.lists(), filters] as const,
  context: (userId: string) => [...meetingKeys.all, "context", userId] as const,
}

export const useMeetingsAction = () => {
  const router = useRouter()
  const client = useStreamVideoClient()

  const createInstantMeeting = async () => {
    if (!client) {
      toast.error("Client Stream non disponible")
      return
    }

    try {
      const id = crypto.randomUUID()
      const call = client.call("default", id)

      await call.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            description: "Meeting créé avec succès",
          },
        },
      })

      router.push(`/meetings/${id}`)
      toast.success("Meeting créé avec succès")
    } catch (error) {
      console.error(error)
      toast.error("Échec de l'initiation du meeting")
    }
  }

  const joinMeeting = (callId: string) => {
    if (!client) {
      toast.error("Impossible de rejoindre le meeting. Veuillez réessayer.")
      return
    }
    router.push(`/meetings/${callId}`)
  }

  return { createInstantMeeting, joinMeeting }
}

interface UseMeetingsOptions {
  userId?: string
  filters: MeetingFilters
  enabled?: boolean
  mode: "organizer" | "candidate"
}

export function useMeetings({ userId, filters, enabled = true, mode }: UseMeetingsOptions) {
  const queryClient = useQueryClient()

  const meetingsQuery = useQuery({
    queryKey: meetingKeys.list({ userId, filters, mode }),
    queryFn: () => {
      if (!userId) throw new Error("User ID required")
      if (mode === "organizer") {
        return listInterviewMeetings(userId, filters)
      } else {
        return listCandidateMeetings(userId, filters)
      }
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 2,
  })

  const contextQuery = useQuery({
    queryKey: meetingKeys.context(userId || ""),
    queryFn: () => {
      if (!userId) throw new Error("User ID required")
      return getInterviewSchedulingContext(userId)
    },
    enabled: enabled && !!userId && mode === "organizer",
    staleTime: 1000 * 60 * 5,
  })

  const scheduleMutation = useMutation({
    mutationFn: scheduleInterviewMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: meetingKeys.context(userId || "") })
      toast.success("Entretien planifié avec succès")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la planification")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: UpdateInterviewMeetingInput }) =>
      updateInterviewMeeting(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
      toast.success("Entretien mis à jour avec succès")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour")
    },
  })

  const cancelMutation = useMutation({
    mutationFn: ({ meetingId }: { meetingId: string }) => cancelInterviewMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
      toast.success("Entretien annulé")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'annulation")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInterviewMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
      toast.success("Entretien supprimé")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression")
    },
  })

  const publishMutation = useMutation({
    mutationFn: publishInterviewMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
      toast.success("Invitation envoyée au candidat")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi")
    },
  })

  const respondMutation = useMutation({
    mutationFn: ({
      meetingId,
      accepted,
      notes,
    }: {
      meetingId: string
      accepted: boolean
      notes?: string
    }) => respondToInterviewMeeting(meetingId, accepted, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
      toast.success("Réponse envoyée avec succès")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi de la réponse")
    },
  })

  const upcomingCount = useMemo(() => {
    if (!meetingsQuery.data?.meetings) return 0
    const now = new Date()
    return meetingsQuery.data.meetings.filter(
      (meeting) =>
        meeting.status !== "CANCELLED" &&
        meeting.status !== "COMPLETED" &&
        new Date(meeting.scheduledAt) >= now
    ).length
  }, [meetingsQuery.data])

  return {
    meetingsQuery,
    contextQuery,
    scheduleMutation,
    updateMutation,
    cancelMutation,
    deleteMutation,
    publishMutation,
    respondMutation,
    scheduleMeeting: scheduleMutation.mutate,
    updateMeeting: updateMutation.mutate,
    cancelMeeting: cancelMutation.mutate,
    deleteMeeting: deleteMutation.mutate,
    publishMeeting: publishMutation.mutate,
    respondMeeting: respondMutation.mutate,
    upcomingCount,
  }
}
