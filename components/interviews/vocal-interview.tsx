"use client"

import { useState, useEffect, useRef } from "react"
import { useConversation } from "@elevenlabs/react"
import {
  Mic,
  MicOff,
  PhoneOff,
  Clock,
  Waves,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { updateVoiceInterviewStatus, saveVoiceInterviewTranscription, analyzeAndSaveVoiceInterview } from "@/actions/ai.action"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: "ai" | "user"
  content: string
  timestamp: Date
}

interface TranscriptionSegment {
  id: string
  speaker: "ai" | "user"
  text: string
  timestamp: Date
  confidence?: number
}

interface InterviewData {
  id: string
  title: string
  company: string
  domain: string
  technologies: string[]
  description: string
  duration: number
  difficulty: string
}

interface VocalInterviewProps {
  interviewData?: InterviewData
  onComplete?: (score: number, answers: Record<string, any>) => void
}

// Loading messages for the "Duolingo-style" screen
const LOADING_MESSAGES = [
  "Analyse de votre intonation...",
  "Vérification de la pertinence technique...",
  "Comparaison avec les meilleurs candidats...",
  "Détection des hésitations...",
  "Calcul du score de confiance...",
  "Génération du feedback détaillé...",
  "Finalisation du rapport..."
]

export default function VocalInterview({ interviewData, onComplete }: VocalInterviewProps) {

  const [hasPermission, setHasPermission] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedTranscript, setExpandedTranscript] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  // Call state tracking
  const [showCallEnded, setShowCallEnded] = useState(false)

  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    if (scrollRef.current) {
      // Use a small timeout to ensure DOM update
      setTimeout(() => {
        if (scrollRef.current) {
          const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      }, 100);
    }
  }, [messages, expandedTranscript])

  // Loading Screen Animation Effect
  useEffect(() => {
    if (isAnalyzing) {
      const messageInterval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
      }, 2500)

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 5; // Incrément aléatoire pour effet naturel
        })
      }, 800)

      return () => {
        clearInterval(messageInterval)
        clearInterval(progressInterval)
      }
    } else {
      setLoadingProgress(0)
      setLoadingMessageIndex(0)
    }
  }, [isAnalyzing])

  // ElevenLabs Configuration
  const conversation = useConversation({
    onConnect: () => {
      setErrorMessage("")
    },
    onDisconnect: () => {
      if (!showCallEnded && !isAnalyzing && callDuration > 5) {
        endCall()
      }
    },
    onMessage: (message) => {
      if (message.message && message.message.trim()) {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: message.source === "ai" ? "ai" : "user",
          content: message.message,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, newMessage])

        const transcriptSegment: TranscriptionSegment = {
          id: Date.now().toString() + "_transcript",
          speaker: message.source === "ai" ? "ai" : "user",
          text: message.message,
          timestamp: new Date(),
          confidence: 0.95,
        }
        setTranscription((prev) => [...prev, transcriptSegment])
      }
    },
    onError: (error: string | Error) => {
      const errorMsg = typeof error === "string" ? error : error.message
      setErrorMessage(errorMsg)
      console.error("ElevenLabs Error:", error)
    },
  })

  const { status, isSpeaking } = conversation
  const isCallActive = status === "connected"

  // Helper to format time
  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Microphone Permission
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setHasPermission(true)
      } catch (error) {
        setErrorMessage("Accès au microphone requis.")
      }
    }
    requestMicPermission()
  }, [])

  // Timer
  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current) }
  }, [isCallActive])

  // Auto-start
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (hasPermission && status === "disconnected" && callDuration === 0 && !errorMessage && !showCallEnded) {
      timeout = setTimeout(() => {
        startCall()
      }, 1000)
    }
    return () => clearTimeout(timeout)
  }, [hasPermission, status, errorMessage])

  const startCall = async () => {
    if (!hasPermission || !interviewData) return
    try {
      setErrorMessage("")
      if (!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
        setErrorMessage("Configuration agent manquante.")
        return
      }

      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
        dynamicVariables: {
          technologies: interviewData.technologies?.join(", ") || "General",
          context: interviewData.description || "Entretien technique",
          domain: interviewData.domain || "DEVELOPMENT",
          difficulty: interviewData.difficulty || "MID",
          company: interviewData.company || "Mock Interview",
          time: interviewData.duration?.toString() || "30",
        }
      })

      if (interviewData.id && !interviewData.id.startsWith("custom-")) {
        await updateVoiceInterviewStatus(interviewData.id, "active")
      }
    } catch (error) {
      setErrorMessage("Impossible de démarrer l'entretien.")
    }
  }

  const endCall = async () => {
    try {
      await conversation.endSession()
    } catch (e) { console.error(e) }

    if (callDuration < 5) {
      router.push("/interviews")
      return
    }

    setIsAnalyzing(true)
    setShowCallEnded(true)

    if (interviewData?.id && !interviewData.id.startsWith("custom-")) {
      try {
        await saveVoiceInterviewTranscription(interviewData.id, transcription, callDuration)

        // Set progress to something visually reassuring before API call
        setLoadingProgress(10)

        // Analysis via API route (Gemini)
        const res = await analyzeAndSaveVoiceInterview(interviewData.id, transcription, callDuration)

        setLoadingProgress(100)

        if (res.success && res.feedback) {
          // Small delay to let user see 100%
          setTimeout(() => {
            onComplete?.(res.feedback.note || 0, { transcription, messages, duration: callDuration })
          }, 500)
        } else {
          setErrorMessage("Erreur lors de l'analyse.")
          // Still Allow exit even if analysis fails
          setTimeout(() => {
            onComplete?.(0, { transcription, messages, duration: callDuration })
          }, 3000)
        }
      } catch (error) {
        console.error(error)
        setTimeout(() => {
          onComplete?.(0, { transcription, messages, duration: callDuration })
        }, 3000)
      }
    } else {
      onComplete?.(0, { transcription, messages, duration: callDuration })
    }
    // Note: isAnalyzing needs to stay true until component unmounts or parent handles it
  }

  // Animation Variants
  const pulseVariants = {
    idle: { scale: 1, opacity: 0.5, boxShadow: "0 0 0 0px rgba(16, 185, 129, 0)" },
    speaking: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      boxShadow: [
        "0 0 0 0px rgba(16, 185, 129, 0.2)",
        "0 0 0 20px rgba(16, 185, 129, 0.1)",
        "0 0 0 0px rgba(16, 185, 129, 0)"
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  }

  if (showCallEnded || isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 space-y-8 max-w-md mx-auto w-full">
        <div className="relative w-full flex justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full opacity-50 animate-pulse" />
          <Sparkles className="w-20 h-20 text-emerald-600 dark:text-emerald-400 animate-spin-slow relative z-10" />
        </div>

        <div className="space-y-4 text-center w-full">
          <motion.h2
            key={loadingMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-bold text-slate-900 dark:text-slate-100"
          >
            {LOADING_MESSAGES[loadingMessageIndex]}
          </motion.h2>
          <p className="text-slate-500">Cela ne devrait prendre que quelques secondes...</p>
        </div>

        <div className="w-full space-y-2">
          <Progress value={loadingProgress} className="h-3 bg-slate-100 dark:bg-slate-800" />
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>ANALYSIS_PROTOCOL_V2</span>
            <span>{Math.round(loadingProgress)}%</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-emerald-400/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[40%] -left-[10%] w-[60vw] h-[60vw] bg-blue-400/10 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Compact Header */}
      <header className="relative z-10 px-4 py-3 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50 h-14">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-tight">{interviewData?.title || "Entretien"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">{formatCallTime(callDuration)}</span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
            isCallActive
              ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              isCallActive ? "bg-red-500 animate-pulse" : "bg-amber-500"
            )} />
            {isCallActive ? "LIVE" : "INIT"}
          </div>
        </div>
      </header>

      {/* Main Interface Layout - IMMERSIVE/CENTERED */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-4 md:p-8">

        {/* LARGE Visualizer */}
        <div className="relative w-full max-w-lg aspect-square flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Speaking Rings - Larger */}
              {status === "connected" && (
                <>
                  <motion.div
                    variants={pulseVariants}
                    animate={isSpeaking ? "speaking" : "idle"}
                    className="absolute w-[70%] h-[70%] rounded-full bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-400/20"
                  />
                  <motion.div
                    animate={{
                      scale: isSpeaking ? [1, 1.25, 1] : 1,
                      opacity: isSpeaking ? 0.3 : 0.1
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    className="absolute w-[50%] h-[50%] rounded-full border border-emerald-500/10"
                  />
                </>
              )}

              {/* Core Circle - Larger */}
              <div className="w-40 h-40 md:w-56 md:h-56 bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center relative z-20 border-[6px] border-slate-50 dark:border-slate-800 transition-all duration-300 group">
                {isSpeaking ? (
                  <div className="flex gap-1.5 items-end h-16">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [12, 48, 12] }}
                        transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.1 }}
                        className="w-2 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  <Mic className={cn(
                    "w-16 h-16 transition-colors duration-300",
                    status === "connected" ? "text-slate-700 dark:text-slate-300" : "text-slate-300 dark:text-slate-600"
                  )} />
                )}
              </div>

              {/* Status below orb */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                {status === "connected" ? (
                  <span className={cn(
                    "text-sm font-medium tracking-widest uppercase",
                    isSpeaking ? "text-emerald-500 animate-pulse" : "text-slate-400"
                  )}>
                    {isSpeaking ? "L'IA parle..." : "À vous..."}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400 animate-pulse">Initialisation connexion...</span>
                )}
              </div>

              {errorMessage && (
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-full max-w-sm text-center z-30">
                  <Alert variant="destructive" className="py-2 px-3 h-auto text-xs shadow-lg bg-red-50 border-red-200 text-red-700">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subtitles / Latest Transcript - ALWAYS VISIBLE for both AI and USER */}
        <div className="w-full max-w-2xl min-h-[5rem] flex items-center justify-center mb-12">
          <AnimatePresence mode="wait">
            {messages.length > 0 && (
              <motion.div
                key={messages[messages.length - 1].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center px-6 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
              >
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider mb-2 block",
                  messages[messages.length - 1].type === "ai" ? "text-emerald-500" : "text-blue-500"
                )}>
                  {messages[messages.length - 1].type === "ai" ? "IA" : "VOUS"}
                </span>
                <p className={cn(
                  "text-lg md:text-xl font-medium leading-relaxed",
                  messages[messages.length - 1].type === "ai"
                    ? "text-slate-800 dark:text-slate-200"
                    : "text-slate-600 dark:text-slate-300 italic"
                )}>
                  "{messages[messages.length - 1].content}"
                </p>
              </motion.div>
            )}
            {messages.length === 0 && status === "connected" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-400 text-sm italic"
              >
                La conversation va commencer...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 md:gap-8 mt-auto pb-8">
          <Button
            size="icon"
            variant="outline"
            className={cn(
              "h-16 w-16 rounded-full border-2 transition-all hover:scale-105",
              isMuted ? "bg-red-50 border-red-200 text-red-600" : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
            )}
            onClick={async () => {
              await conversation.setVolume({ volume: isMuted ? 1 : 0 })
              setIsMuted(!isMuted)
            }}
          >
            {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </Button>

          <Button
            size="lg"
            className="h-20 px-10 rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-xl shadow-red-500/30 text-xl font-medium transition-all hover:scale-105 active:scale-95"
            onClick={endCall}
          >
            <PhoneOff className="w-8 h-8 mr-3" />
            Finir
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-16 w-16 rounded-full transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
              expandedTranscript ? "bg-emerald-50 text-emerald-600" : "text-slate-500"
            )}
            onClick={() => setExpandedTranscript(!expandedTranscript)}
          >
            {expandedTranscript ? <ChevronDown className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
          </Button>
        </div>

        {/* Right/Bottom: Live Transcription Panel (Sidebar) */}
        <div className={cn(
          "fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out transform",
          expandedTranscript ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <span className="text-sm font-semibold uppercase text-slate-500 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Historique
            </span>
            <Button variant="ghost" size="icon" onClick={() => setExpandedTranscript(false)}>
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-2 mt-20">
                  <Waves className="w-10 h-10" />
                  <p className="text-sm">En attente de la conversation...</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col max-w-[90%]",
                    msg.type === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium tracking-wide uppercase">
                      {msg.type === "user" ? "Vous" : "IA"}
                    </span>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.type === "user"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-br-none"
                        : "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-100 rounded-bl-none"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-300 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  )
}
