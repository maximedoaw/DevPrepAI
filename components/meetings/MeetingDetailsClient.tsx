"use client"

import { useState } from "react"
import { MeetingRoom } from "./MeetingRoom"
import { MeetingSetup } from "./MeetingSetup"

interface MeetingDetailsClientProps {
  meetingId: string
  meetingTitle: string
  viewerName: string
  candidateName?: string
}

export default function MeetingDetailsClient({
  meetingId,
  meetingTitle,
  viewerName,
  candidateName,
}: MeetingDetailsClientProps) {
  const [showSetup, setShowSetup] = useState(true)
  const [meetingSettings, setMeetingSettings] = useState<{
    videoEnabled: boolean
    audioEnabled: boolean
  } | null>(null)

  const handleJoin = (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    setMeetingSettings(settings)
    setShowSetup(false)
  }

  const handleLeave = () => {
    setMeetingSettings(null)
    setShowSetup(true)
  }

  if (showSetup) {
    return (
      <div className="space-y-4">
        <MeetingSetup onJoin={handleJoin} meetingTitle={meetingTitle} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-100/60 dark:border-emerald-900/40 bg-white dark:bg-slate-900/50 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 border-b border-emerald-200 dark:border-emerald-900/40 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Appel vidéo en cours
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <p>Connecté en tant que {viewerName}</p>
            {candidateName && candidateName !== viewerName && (
              <p className="sm:before:content-['•'] sm:before:mx-2">
                Candidat : {candidateName}
              </p>
            )}
          </div>
        </div>
        <div className="min-h-[500px] sm:min-h-[600px] bg-slate-950 dark:bg-slate-950">
          <MeetingRoom
            callId={meetingId}
            meetingTitle={meetingTitle}
            settings={meetingSettings || undefined}
            onLeave={handleLeave}
          />
        </div>
      </div>
    </div>
  )
}

