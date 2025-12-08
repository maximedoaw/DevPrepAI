"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  useStreamVideoClient, 
  Call, 
  StreamVideo, 
  StreamCall, 
  SpeakerLayout,
  PaginatedGridLayout,
  CallParticipantsList, 
  CallControls, 
  useCallStateHooks, 
  StreamTheme,
  useCall,
  ParticipantView
} from "@stream-io/video-react-sdk"
import { Loader2, AlertCircle, Video, VideoOff, Mic, MicOff, Settings, Users, X, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { updateInterviewRoom } from "@/actions/room.action"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface RoomVideoProps {
  room: {
    id: string
    userId: string
    trainers?: any[]
    candidates?: any[]
  }
  roomTitle?: string
}

// Composant de setup pré-appel
function PreCallSetup({ 
  onJoin, 
  onCancel 
}: { 
  onJoin: (settings: { videoEnabled: boolean; audioEnabled: boolean }) => void
  onCancel: () => void
}) {
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const toggleVideo = useCallback(async () => {
    try {
      setVideoEnabled(prev => !prev)
    } catch (error) {
      console.error("Erreur lors du changement de caméra:", error)
      toast.error("Impossible de changer l'état de la caméra")
    }
  }, [])

  const toggleAudio = useCallback(async () => {
    try {
      setAudioEnabled(prev => !prev)
    } catch (error) {
      console.error("Erreur lors du changement de micro:", error)
      toast.error("Impossible de changer l'état du micro")
    }
  }, [])

  const handleJoin = () => {
    setIsLoading(true)
    onJoin({ videoEnabled, audioEnabled })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 shadow-2xl">
        <CardHeader className="border-b border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-slate-800 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Configuration de l'appel
            </CardTitle>
            <button
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Configurez votre caméra et votre micro avant de rejoindre l'appel
          </p>

          {/* Contrôle caméra */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Caméra
            </label>
            <button
              onClick={toggleVideo}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                videoEnabled
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {videoEnabled ? (
                  <Video className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <VideoOff className="h-5 w-5 text-slate-400" />
                )}
                <span className="font-medium text-slate-800 dark:text-white">
                  {videoEnabled ? "Caméra activée" : "Caméra désactivée"}
                </span>
              </div>
              {videoEnabled && (
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
          </div>

          {/* Contrôle micro */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Microphone
            </label>
            <button
              onClick={toggleAudio}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                audioEnabled
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {audioEnabled ? (
                  <Mic className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <MicOff className="h-5 w-5 text-slate-400" />
                )}
                <span className="font-medium text-slate-800 dark:text-white">
                  {audioEnabled ? "Micro activé" : "Micro désactivé"}
                </span>
              </div>
              {audioEnabled && (
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-slate-200 dark:border-slate-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleJoin}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Rejoindre l'appel"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RoomVideoContent({ 
  call, 
  onLeave, 
  showParticipants, 
  setShowParticipants,
  roomId,
  isOwner,
  videoEnabled,
  audioEnabled,
  roomTitle
}: { 
  call: Call
  onLeave?: () => void
  showParticipants: boolean
  setShowParticipants: (show: boolean) => void
  roomId: string
  isOwner: boolean
  videoEnabled: boolean
  audioEnabled: boolean
  roomTitle?: string
}) {
  const { useParticipants, useLocalParticipant } = useCallStateHooks()
  const participants = useParticipants()
  const localParticipant = useLocalParticipant()
  const router = useRouter()

  // Appliquer les paramètres initiaux
  useEffect(() => {
    if (call && localParticipant) {
      if (!videoEnabled) {
        call.camera.disable().catch(() => {})
      }
      if (!audioEnabled) {
        call.microphone.disable().catch(() => {})
      }
    }
  }, [call, localParticipant, videoEnabled, audioEnabled])

  const handleLeave = async () => {
    if (onLeave) {
      onLeave()
    } else {
      router.push("/rooms")
    }
  }

  // Utiliser GridLayout si plus de 2 participants, sinon SpeakerLayout
  const useGridLayout = participants.length > 2

  return (
    <StreamTheme>
      <div className="flex flex-col gap-4 h-full w-full bg-white dark:bg-slate-950 overflow-hidden [&_.str-video__notification]:hidden">
        {/* Zone vidéo principale */}
        <div className="flex flex-col gap-4 md:flex-row flex-1 overflow-hidden p-4">
          <div className="flex-1 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 relative shadow-lg group flex items-center justify-center border border-slate-200 dark:border-slate-800">
            <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-black/50 backdrop-blur-md text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <h3 className="font-semibold text-lg">{roomTitle || "Room d'entretien"}</h3>
            </div>
            <div className="w-full h-full [&_.str-video__paginated-grid-layout]:h-full [&_.str-video__paginated-grid-layout]:w-full [&_.str-video__participant-view]:h-full [&_.str-video__participant-view]:w-full">
              <PaginatedGridLayout groupSize={participants.length <= 2 ? 2 : 4} />
            </div>
          </div>
          
          {/* Liste des participants (Responsive) */}
          {showParticipants && (
            <div className="absolute inset-0 z-10 md:static md:w-80 lg:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl md:shadow-none overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Participants ({participants.length})
                </h3>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Fermer la liste des participants"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ScrollArea className="flex-1 bg-white dark:bg-slate-900">
                <div className="p-2">
                  <CallParticipantsList onClose={() => setShowParticipants(false)} />
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        
        {/* Contrôles */}
        <div className="px-4 pb-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <CallControls onLeave={handleLeave} />
          </div>
          
          {!showParticipants && (
            <Button
              onClick={() => setShowParticipants(true)}
              variant="outline"
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Participants
            </Button>
          )}

          {isOwner && (
            <Button
              onClick={async () => {
                if(confirm("Êtes-vous sûr de vouloir terminer cette room pour tout le monde ?")) {
                  try {
                    await updateInterviewRoom(roomId, { endedAt: new Date() })
                    toast.success("Room terminée")
                    router.refresh()
                  } catch (error) {
                    toast.error("Erreur lors de la fermeture de la room")
                  }
                }
              }}
              variant="destructive"
              className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800"
            >
              Terminer la room
            </Button>
          )}
        </div>
      </div>
    </StreamTheme>
  )
}

export default function RoomVideo({ room, roomTitle }: RoomVideoProps) {
  const client = useStreamVideoClient()
  const { user: kindeUser, isLoading: kindeLoading } = useKindeBrowserClient()
  const [call, setCall] = useState<Call | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [showSetup, setShowSetup] = useState(true)
  const [callSettings, setCallSettings] = useState<{ videoEnabled: boolean; audioEnabled: boolean } | null>(null)
  const router = useRouter()

  // Vérifier que l'utilisateur est autorisé à accéder à cette room
  useEffect(() => {
    if (kindeLoading || !kindeUser?.id) {
      if (!kindeLoading) {
        setIsAuthorized(false)
      }
      return
    }

    const trainers = Array.isArray(room.trainers) ? room.trainers : []
    const candidates = Array.isArray(room.candidates) ? room.candidates : []
    
    const isOwner = room.userId === kindeUser.id
    const isTrainer = trainers.some((t: any) => t && t.id === kindeUser.id)
    const isCandidate = candidates.some((c: any) => c && c.id === kindeUser.id)
    
    const authorized = isOwner || isTrainer || isCandidate
    setIsAuthorized(authorized)
    
    if (!authorized) {
      setError("Vous n'êtes pas autorisé à accéder à cette room. Seuls les formateurs et candidats assignés peuvent y accéder.")
    }
  }, [kindeUser?.id, room.userId, room.trainers, room.candidates, kindeLoading])

  const handleJoinCall = useCallback(async (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    if (!client || isAuthorized === false) return

    setCallSettings(settings)
    setShowSetup(false)
    setIsJoining(true)
    setError(null)

    try {
      const activeCall = client.call("default", room.id)
      await activeCall.join({ create: true })

      // Appliquer les paramètres
      if (!settings.videoEnabled) {
        await activeCall.camera.disable()
      }
      if (!settings.audioEnabled) {
        await activeCall.microphone.disable()
      }

      setCall(activeCall)
    } catch (err) {
      console.error("Erreur lors de la jonction à la room", err)
      setError(
        err instanceof Error ? err.message : "Impossible de rejoindre la room vidéo"
      )
      setShowSetup(true)
    } finally {
      setIsJoining(false)
    }
  }, [client, room.id, isAuthorized])

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (call) {
        call.leave().catch(() => {})
      }
    }
  }, [call])

  // Afficher un message d'erreur si l'utilisateur n'est pas autorisé
  if (isAuthorized === false || (error && error.includes("pas autorisé"))) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error || "Vous n'êtes pas autorisé à accéder à cette room. Seuls les formateurs et candidats assignés peuvent y accéder."}
          </p>
          <Link href="/rooms">
            <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
              Retour aux rooms
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Afficher les erreurs de connexion
  if (error && !error.includes("pas autorisé")) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Erreur de connexion</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setError(null)
                setShowSetup(true)
                setCallSettings(null)
              }}
              variant="outline"
            >
              Réessayer
            </Button>
            <Link href="/rooms">
              <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
                Retour
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Attendre la vérification d'autorisation
  if (isAuthorized === null || kindeLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-lg">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Vérification des permissions...</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Veuillez patienter quelques instants</p>
      </div>
    )
  }

  // Afficher le setup pré-appel
  if (showSetup && !call) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-lg">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Préparation de l'appel...</h3>
        </div>
        <PreCallSetup 
          onJoin={handleJoinCall}
          onCancel={() => router.push("/rooms")}
        />
      </>
    )
  }

  if (!client || !call || isJoining) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-lg">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Connexion à la room...</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Veuillez patienter quelques instants</p>
      </div>
    )
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <RoomVideoContent
          call={call}
          showParticipants={showParticipants}
          setShowParticipants={setShowParticipants}
          roomId={room.id}
          isOwner={client.state.user?.id === room.userId}
          videoEnabled={callSettings?.videoEnabled ?? true}
          audioEnabled={callSettings?.audioEnabled ?? true}
          roomTitle={roomTitle}
        />
      </StreamCall>
    </StreamVideo>
  )
}
