"use client"

import { useEffect, useState, useCallback } from "react"
import { useStreamVideoClient } from "@stream-io/video-react-sdk"
import {
  Call,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  useCallStateHooks,
} from "@stream-io/video-react-sdk"
import "@stream-io/video-react-sdk/dist/css/styles.css"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { updateInterviewMeeting } from "@/actions/interview-meeting.action"
import { toast } from "sonner"

interface MeetingRoomProps {
  callId?: string
  meetingId?: string
  settings: {
    videoEnabled: boolean
    audioEnabled: boolean
  }
  onLeave?: () => void
}

function MeetingRoomContent({ 
  call, 
  onLeave, 
  showParticipants, 
  setShowParticipants,
  meetingId 
}: { 
  call: Call
  onLeave?: () => void
  showParticipants: boolean
  setShowParticipants: (show: boolean) => void
  meetingId?: string
}) {
  const { useParticipants } = useCallStateHooks()
  const participants = useParticipants()
  const [hasCheckedCompletion, setHasCheckedCompletion] = useState(false)

  // Vérifier si tous les participants ont quitté
  useEffect(() => {
    if (!meetingId || hasCheckedCompletion || participants.length > 0) {
      return
    }

    // Si aucun participant n'est présent (tous ont quitté)
    const checkCompletion = async () => {
      try {
        await updateInterviewMeeting(meetingId, { status: "COMPLETED" })
        setHasCheckedCompletion(true)
        toast.success("Réunion terminée automatiquement")
        if (onLeave) {
          onLeave()
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error)
      }
    }

    // Délai pour éviter les mises à jour multiples
    const timeoutId = setTimeout(() => {
      void checkCompletion()
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [participants.length, meetingId, hasCheckedCompletion, onLeave])

  return (
    <StreamTheme>
      <div className="flex flex-col gap-4 h-full bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row flex-1 overflow-hidden px-4">
          <div className="flex-1 overflow-hidden rounded-xl border border-emerald-200 bg-slate-950/5 dark:bg-slate-950 dark:border-emerald-900/40">
            <SpeakerLayout />
          </div>
          {showParticipants && (
            <div className="md:w-80 lg:w-96 border rounded-xl border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900/50 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Participants
                </h3>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xl font-bold leading-none"
                  aria-label="Fermer la liste des participants"
                >
                  ×
                </button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  <CallParticipantsList onClose={() => setShowParticipants(false)} />
                </div>
              </ScrollArea>
            </div>
          )}
          {!showParticipants && (
            <button
              onClick={() => setShowParticipants(true)}
              className="md:w-80 lg:w-96 border rounded-xl border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900/50 p-4 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              Afficher les participants
            </button>
          )}
        </div>
        <div className="px-4 pb-4 bg-white/50 dark:bg-slate-900/50 border-t border-emerald-100 dark:border-emerald-900/40">
          <CallControls onLeave={onLeave} />
        </div>
      </div>
    </StreamTheme>
  )
}

export function MeetingRoom({ callId, meetingId, settings, onLeave }: MeetingRoomProps) {
  const client = useStreamVideoClient()
  const [call, setCall] = useState<Call | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  useEffect(() => {
    if (!client) {
      setError("Client Stream non initialisé")
      return
    }

    let activeCall: Call | null = null
    let isUnmounted = false

    const joinCall = async () => {
      try {
        setIsJoining(true)
        setError(null)

        // Créer et rejoindre l'appel avec le callId ou un ID par défaut
        const finalCallId = callId || "meeting-call"
        activeCall = client.call("default", finalCallId)

        await activeCall.join({ create: true })

        // Appliquer les paramètres
        if (!settings.videoEnabled) {
          await activeCall.camera.disable()
        }
        if (!settings.audioEnabled) {
          await activeCall.microphone.disable()
        }

        if (isUnmounted) {
          await activeCall.leave().catch(() => undefined)
          return
        }

        setCall(activeCall)

        // Écouter les événements de déconnexion
        const handleCallEnded = () => {
          if (onLeave) {
            onLeave()
          }
        }

        activeCall.on("call.ended", handleCallEnded)
      } catch (err) {
        console.error("Erreur lors de la jonction à l'appel", err)
        setError(
          err instanceof Error ? err.message : "Impossible de rejoindre l'appel vidéo"
        )
      } finally {
        if (!isUnmounted) {
          setIsJoining(false)
        }
      }
    }

    void joinCall()

    return () => {
      isUnmounted = true
      void (async () => {
        try {
          if (activeCall) {
            await activeCall.leave().catch(() => undefined)
          }
        } catch (err) {
          console.error("Erreur lors de la déconnexion", err)
        }
      })()
    }
  }, [client, callId, settings, onLeave])

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10">
        <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">
          <div className="font-semibold">Erreur de connexion</div>
          <div className="mt-2">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!client || !call || isJoining) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] sm:min-h-[600px] bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium">Connexion à la salle de réunion…</span>
        </div>
      </div>
    )
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <MeetingRoomContent
          call={call}
          onLeave={onLeave}
          showParticipants={showParticipants}
          setShowParticipants={setShowParticipants}
          meetingId={meetingId}
        />
      </StreamCall>
    </StreamVideo>
  )
}