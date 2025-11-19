"use client"

import { useState } from "react"
import { MeetingRoom } from "@/components/meetings/MeetingRoom"
import { MeetingSetup } from "@/components/meetings/MeetingSetup"

interface MeetingPageClientProps {
  meetingId: string
  meetingTitle: string
  viewerName: string
  candidateName?: string
}

export default function MeetingPageClient({
  meetingId,
  meetingTitle,
  viewerName,
  candidateName,
}: MeetingPageClientProps) {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [meetingSettings, setMeetingSettings] = useState<{
    videoEnabled: boolean
    audioEnabled: boolean
  }>({
    videoEnabled: false,
    audioEnabled: true
  })

  const handleJoin = (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    setMeetingSettings(settings)
    setIsSetupComplete(true)
  }

  const handleLeave = () => {
    setIsSetupComplete(false)
  }

  return (
    <div className="space-y-4">
      {!isSetupComplete ? (
        <MeetingSetup onJoin={handleJoin} meetingTitle={meetingTitle} />
      ) : (
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
              meetingId={meetingId}
              settings={meetingSettings}
              onLeave={handleLeave}
            />
          </div>
        </div>
      )}
    </div>
  )
}