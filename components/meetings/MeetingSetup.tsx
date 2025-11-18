"use client"

import { useState } from "react"
import { Video, VideoOff, Mic, MicOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface MeetingSetupProps {
  onJoin: (settings: { videoEnabled: boolean; audioEnabled: boolean }) => void
  meetingTitle?: string
}

export function MeetingSetup({ onJoin, meetingTitle }: MeetingSetupProps) {
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      // Vérifier les permissions avant de rejoindre
      if (videoEnabled) {
        await navigator.mediaDevices.getUserMedia({ video: true })
      }
      if (audioEnabled) {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      onJoin({
        videoEnabled,
        audioEnabled,
      })
    } catch (err) {
      console.error("Erreur lors de la vérification des permissions:", err)
      setIsJoining(false)
      // On continue quand même avec les paramètres choisis
      onJoin({
        videoEnabled: false,
        audioEnabled: false,
      })
    }
  }

  return (
    <Card className="border border-emerald-100/60 dark:border-emerald-900/40 bg-slate-50 dark:bg-slate-950 shadow-lg">
      <CardHeader className="border-b border-emerald-100 dark:border-emerald-900/40 bg-white/50 dark:bg-slate-900/50">
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
          Configuration de l'appel
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          {meetingTitle ? `Préparation pour : ${meetingTitle}` : "Vérifiez vos paramètres avant de rejoindre"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Toggle caméra */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900/50">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={cn(
                "p-2 rounded-lg",
                videoEnabled
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}
            >
              {videoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="video-toggle" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                Caméra
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {videoEnabled ? "Activée" : "Désactivée"}
              </p>
            </div>
          </div>
          <Switch
            id="video-toggle"
            checked={videoEnabled}
            onCheckedChange={setVideoEnabled}
            className="data-[state=checked]:bg-emerald-600"
          />
        </div>

        {/* Toggle microphone */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900/50">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={cn(
                "p-2 rounded-lg",
                audioEnabled
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}
            >
              {audioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="audio-toggle" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                Microphone
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {audioEnabled ? "Activé" : "Désactivé"}
              </p>
            </div>
          </div>
          <Switch
            id="audio-toggle"
            checked={audioEnabled}
            onCheckedChange={setAudioEnabled}
            className="data-[state=checked]:bg-emerald-600"
          />
        </div>

        {/* Bouton rejoindre */}
        <Button
          onClick={handleJoin}
          disabled={isJoining}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
          size="lg"
        >
          {isJoining ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Rejoindre l'appel
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
