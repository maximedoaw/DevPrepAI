"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useConversation } from "@elevenlabs/react"
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Waves,
  Clock,
  User,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  Target,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  analyzeAndSaveVoiceInterview,
  createVoiceInterview,
  saveVoiceInterviewTranscription,
  updateVoiceInterviewStatus,
} from "@/actions/ai.action"

interface Message {
  id: string
  author: "ai" | "user"
  content: string
  timestamp: Date
}

interface TranscriptSegment {
  id: string
  speaker: "ai" | "user"
  text: string
  timestamp: Date
  confidence?: number
}

interface InterviewInfo {
  id: string
  title: string
  company: string
  domain?: string
  technologies?: string[]
  description?: string
  duration?: number
  difficulty?: string
}

interface InterviewQuestion {
  id: string
  question: string
  expectedAnswer?: string
  evaluationCriteria?: string
}

interface AIVocalInterviewProps {
  interviewData: InterviewInfo
  questions?: InterviewQuestion[]
  onComplete: (score: number, answers: Record<string, any>) => void
}

export default function AIVocalInterview({ interviewData, questions = [], onComplete }: AIVocalInterviewProps) {
  
  const [hasPermission, setHasPermission] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [wavePhase, setWavePhase] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [transcription, setTranscription] = useState<TranscriptSegment[]>([])
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioLevelRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const disconnectRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isEndingCallRef = useRef(false)
  const reconnectAttemptsRef = useRef(0)
  const isSessionStartingRef = useRef(false)
  const pendingResumeRef = useRef(false)
  const resumeConversationRef = useRef<() => void>(() => {})
  const lastAuthorRef = useRef<"ai" | "user" | null>(null)

  const jobContext = useMemo(() => {
    const technologies = (interviewData.technologies || []).join(", ") || "Non spécifiées"
    return `Poste: ${interviewData.title} - ${interviewData.company}\nDomaine: ${interviewData.domain || "Non spécifié"}\nTechnologies clés: ${technologies}\nDurée prévue: ${interviewData.duration || 30} minutes\nNiveau: ${interviewData.difficulty || "Intermédiaire"}\nDescription: ${interviewData.description || "Non fournie"}`
  }, [interviewData])

  const conversationContext = useMemo(() => {
    const technologies = (interviewData.technologies || []).join(", ") || "Non spécifiées"
    return `Focus entretien: ${interviewData.title} (niveau ${interviewData.difficulty || "Intermédiaire"})\nTechnologies principales: ${technologies}`
  }, [interviewData])

  const questionContext = useMemo(() => {
    if (!questions.length) return "Aucune question fournie"
    return questions
      .map((q, index) => {
        const expected = q.expectedAnswer ? `Réponse attendue: ${q.expectedAnswer}` : "Réponse attendue: non spécifiée"
        const criteria = q.evaluationCriteria ? `Critères: ${q.evaluationCriteria}` : "Critères: —"
        return `Question ${index + 1}: ${q.question}\n${expected}\n${criteria}`
      })
      .join("\n\n")
  }, [questions])

  const activeQuestionIndex = questions.length === 0 ? 0 : Math.min(currentQuestionIndex, questions.length - 1)
  const progressValue = questions.length === 0 ? 0 : Math.min((answeredCount / questions.length) * 100, 100)

  const conversation = useConversation({
    micMuted: isMuted,
    onConnect: () => {
      clearDisconnectRetry()
      reconnectAttemptsRef.current = 0
      pendingResumeRef.current = false
      setInterviewStarted(true)
      setElapsedTime(0)
      setErrorMessage("")
      setIsCallActive(true)
      const intro: Message = {
        id: `intro-${Date.now()}`,
        author: "ai",
        content: `Bonjour ! Je suis votre coach IA. Nous allons parcourir ${questions.length || "quelques"} question(s) pour ${interviewData.company}. Prenez le temps de détailler vos réponses, je vous accompagnerai tout au long de l'entretien.`,
        timestamp: new Date(),
      }
      setMessages((prev) => (prev.length === 0 ? [intro] : prev))
      lastAuthorRef.current = "ai"
      sendAgentContext()
    },
    onDisconnect: () => {
      clearIntervalTimer()
      clearAudioInterval()
      clearDisconnectRetry()
      setIsCallActive(false)
      setInterviewStarted(false)

      if (isEndingCallRef.current) {
        isEndingCallRef.current = false
        void finalizeInterview()
        return
      }

      const allQuestionsAnswered = questions.length > 0 && answeredCount >= questions.length
      if (allQuestionsAnswered) {
        void finalizeInterview()
        return
      }

      reconnectAttemptsRef.current += 1
      if (reconnectAttemptsRef.current <= 3) {
        setErrorMessage("Connexion perdue, tentative de reprise de l'entretien…")
        if (!pendingResumeRef.current) {
          pendingResumeRef.current = true
          const retryDelay = 800 * reconnectAttemptsRef.current
          disconnectRetryTimeoutRef.current = setTimeout(() => {
            pendingResumeRef.current = false
            resumeConversationRef.current()
          }, retryDelay)
        }
      } else {
        setErrorMessage("Connexion interrompue. Cliquez sur « Reprendre » pour continuer l'entretien.")
      }
    },
    onMessage: (message: any) => {
      if (!message.message || !message.message.trim()) return

      const author: "ai" | "user" = message.source === "ai" ? "ai" : "user"
      const previousAuthor = lastAuthorRef.current

      const formatted: Message = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        author,
        content: message.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev.slice(-199), formatted])

      const segment: TranscriptSegment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}-transcript`,
        speaker: author,
        text: message.message,
        timestamp: new Date(),
        confidence: 0.95,
      }
      setTranscription((prev) => [...prev.slice(-199), segment])
      if (author === "user" && previousAuthor !== "user") {
        setAnsweredCount((prev) => {
          if (questions.length === 0) {
            return prev
          }

          if (prev >= questions.length) {
            return prev
          }

          const isAnswerForCurrent = prev === Math.min(currentQuestionIndex, questions.length - 1)
          if (!isAnswerForCurrent) {
            return prev
          }

          const next = prev + 1
          if (next < questions.length) {
            setCurrentQuestionIndex(next)
          }
          return next
        })
      }

      lastAuthorRef.current = author
    },
    onError: (error: any) => {
      const message = typeof error === "string" ? error : error?.message
      setErrorMessage(message || "Une erreur est survenue lors de l'entretien")
    },
  })

  const { status, isSpeaking } = conversation

  useEffect(() => {
    setIsAISpeaking(isSpeaking)
  }, [isSpeaking])

  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setHasPermission(true)
        setErrorMessage("")
      } catch (error) {
        setHasPermission(false)
        setErrorMessage("L'accès au microphone est requis pour passer cet entretien.")
      }
    }

    void requestMicPermission()
  }, [])

  useEffect(() => {
    if (status === "connected") {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      clearIntervalTimer()
    }

    return clearIntervalTimer
  }, [status])

  useEffect(() => {
    if (interviewStarted) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [interviewStarted])

  useEffect(() => {
    setIsRecording(status === "connected" && !isMuted)
  }, [status, isMuted])

  useEffect(() => {
    if (isRecording) {
      audioLevelRef.current = setInterval(() => {
        const base = isAISpeaking ? 48 : 20
        setAudioLevel(base + Math.random() * 20)
        setWavePhase((previous) => previous + 0.35)
      }, 160)
    } else {
      setAudioLevel(0)
      clearAudioInterval()
    }

    return clearAudioInterval
  }, [isRecording, isAISpeaking])

  const clearIntervalTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }
  }

  const clearAudioInterval = () => {
    if (audioLevelRef.current) {
      clearInterval(audioLevelRef.current)
      audioLevelRef.current = null
    }
  }

  const clearDisconnectRetry = () => {
    if (disconnectRetryTimeoutRef.current) {
      clearTimeout(disconnectRetryTimeoutRef.current)
      disconnectRetryTimeoutRef.current = null
    }
  }

  const currentQuestion = questions[activeQuestionIndex]

  const agentContext = useMemo(() => {
    const baseIntro = conversationContext
    const progressInfo = questions.length
      ? `Progression: ${answeredCount}/${questions.length}`
      : `Réponses fournies: ${answeredCount}`
    const current = questions.length ? questions[Math.min(activeQuestionIndex, questions.length - 1)] : null
    const next =
      questions.length > 0 && activeQuestionIndex + 1 < questions.length ? questions[activeQuestionIndex + 1] : null
    const currentLine = current ? `Question actuelle: ${current.question}` : "Question actuelle: —"
    const nextLine = next ? `Question suivante: ${next.question}` : "Question suivante: —"
    return `${baseIntro}\n${progressInfo}\n${currentLine}\n${nextLine}`
  }, [activeQuestionIndex, answeredCount, conversationContext, questions])

  const sendAgentContext = useCallback(() => {
    if (status !== "connected") return
    try {
      conversation.sendContextualUpdate(agentContext)
    } catch (error) {
      console.error("Error sending contextual update:", error)
    }
  }, [agentContext, conversation, status])

  const startConversationSession = useCallback(
    async (mode: "initial" | "resume" = "initial") => {
      if (mode === "resume" && (status === "connecting" || status === "connected")) {
        return
      }

    if (!hasPermission) {
      setErrorMessage("Veuillez autoriser l'accès au microphone pour démarrer l'entretien")
      return
    }
    if (!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
      setErrorMessage("Agent ElevenLabs non configuré. Contactez l'administrateur.")
      return
    }
    if (isSessionStartingRef.current) {
      return
    }

    isSessionStartingRef.current = true

    try {
      if (mode === "initial") {
        setErrorMessage("")
        setMessages([])
        setTranscription([])
        setCallDuration(0)
        setElapsedTime(0)
        setAnsweredCount(0)
        setCurrentQuestionIndex(0)
        setInterviewStarted(false)
        lastAuthorRef.current = null
      } else {
        setErrorMessage("Reconnexion en cours…")
      }

      let voiceInterviewId = currentInterviewId
      if (!voiceInterviewId) {
        const created = await createVoiceInterview({
          technologies: interviewData.technologies || [],
          context: `${jobContext}\n\n${conversationContext}\n\n${questionContext}`,
          duration: interviewData.duration || 30,
        })

        if (!created.success || !created.voiceInterview) {
          setErrorMessage(created.error || "Impossible de préparer l'entretien")
          return
        }
        voiceInterviewId = created.voiceInterview.id
        setCurrentInterviewId(created.voiceInterview.id)
      }

      const conversationId = await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        dynamicVariables: {
          jobContext,
          interviewFocus: conversationContext,
          interviewScript: questionContext,
          conversationStyle: "Encourageant, professionnel, clair",
        },
      })

      if (voiceInterviewId) {
        await updateVoiceInterviewStatus(voiceInterviewId, "active", conversationId)
      }
    } catch (error) {
      console.error("Error starting vocal interview:", error)
      setErrorMessage(mode === "initial" ? "Impossible de démarrer l'entretien. Réessayez dans quelques instants." : "Reconnexion impossible. Cliquez sur « Reprendre » pour réessayer.")
    } finally {
      isSessionStartingRef.current = false
    }
    },
    [
      conversation,
      currentInterviewId,
      hasPermission,
      interviewData.duration,
      interviewData.technologies,
      jobContext,
      conversationContext,
      questionContext,
      status,
    ]
  )

  useEffect(() => {
    resumeConversationRef.current = () => {
      void startConversationSession("resume")
    }
  }, [startConversationSession])

  const startCall = () => {
    reconnectAttemptsRef.current = 0
    clearDisconnectRetry()
    void startConversationSession("initial")
  }

  const endCall = async () => {
    try {
      isEndingCallRef.current = true
      await conversation.endSession()
    } catch (error) {
      console.error("Error ending conversation:", error)
    } finally {
      await finalizeInterview()
    }
  }

  useEffect(() => {
    sendAgentContext()
  }, [sendAgentContext])

  useEffect(() => {
    return () => {
      clearDisconnectRetry()
    }
  }, [])

  const finalizeInterview = async () => {
    clearIntervalTimer()
    clearAudioInterval()
    clearDisconnectRetry()
    setIsCallActive(false)
    setInterviewStarted(false)
    setIsRecording(false)
    setAnsweredCount(0)
    setCurrentQuestionIndex(0)
    setElapsedTime(0)
    lastAuthorRef.current = null

    if (!currentInterviewId || transcription.length === 0) {
      onComplete(0, {
        transcription,
        messages,
        feedback: null,
        callDuration,
        technologies: interviewData.technologies || [],
      })
      return
    }

    try {
      setIsAnalyzing(true)
      await saveVoiceInterviewTranscription(currentInterviewId, transcription, callDuration)
      const analysis = await analyzeAndSaveVoiceInterview(currentInterviewId, transcription, callDuration)

      if (analysis.success) {
        const score = analysis.feedback?.score ?? 0
        onComplete(score, {
          transcription,
          messages,
          feedback: analysis.feedback ?? null,
          callDuration,
          technologies: interviewData.technologies || [],
        })
      } else {
        onComplete(0, {
          transcription,
          messages,
          feedback: analysis.feedback ?? null,
          error: analysis.error,
          callDuration,
          technologies: interviewData.technologies || [],
        })
      }
      } catch (error) {
      console.error("Error finalizing interview:", error)
      onComplete(0, {
        transcription,
        messages,
        feedback: null,
        error: (error as Error).message,
        callDuration,
        technologies: interviewData.technologies || [],
      })
    } finally {
      if (currentInterviewId) {
        await updateVoiceInterviewStatus(currentInterviewId, "completed")
      }
      setIsAnalyzing(false)
    }
  }

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const toggleSpeaker = () => {
    try {
      conversation.setVolume({ volume: isSpeakerOn ? 0 : 1 })
      setIsSpeakerOn((prev) => !prev)
    } catch (error) {
      console.error("Error toggling speaker:", error)
      setErrorMessage("Impossible d'ajuster le volume.")
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:px-8">
        <div className="space-y-6 lg:w-2/3">
          <Card className="border border-slate-200/70 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-950/60">
            <CardHeader className="flex flex-col gap-3 border-b border-slate-200/60 dark:border-slate-800/60 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-green-600 dark:text-green-500">
                  Simulation d'entretien vocal
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {interviewData.title} • {interviewData.company}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300">
                  <Target className="mr-1 h-3.5 w-3.5" />
                  {questions.length} question{questions.length > 1 && "s"}
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {formatDuration(callDuration)}
                        </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    status === "connected"
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : status === "connecting"
                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400"
                  )}
                >
                  {status === "connected" ? "En cours" : status === "connecting" ? "Connexion..." : "Hors ligne"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
            {errorMessage && (
                <Alert variant="destructive" className="mx-4 mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="mt-4 flex flex-col gap-4 px-4 pb-4">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 dark:border-slate-800/60 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Progression des réponses</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {answeredCount}/{questions.length}
                    </span>
                  </div>
                  <Progress value={progressValue} className="mt-2 h-2" />
                </div>

                <div className="rounded-2xl border border-slate-900/10 bg-slate-900 text-slate-50 shadow-inner dark:border-slate-700/60 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-400">
                      <Waves className="h-4 w-4" />
                      Flux de la conversation
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      {isSpeaking ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                          L'IA parle
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          À vous de répondre
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(elapsedTime)}
                      </span>
                      </div>
                      </div>

                  <ScrollArea className="h-[420px] px-4 py-3">
                    <div className="space-y-4">
                      {messages.length === 0 && (
                        <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
                          <Waves className="mb-3 h-10 w-10" />
                          <p>Démarrez l'entretien pour suivre la discussion en temps réel.</p>
                        </div>
                      )}

                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            message.author === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          {message.author === "ai" && (
                            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-green-500/40 bg-green-500/10">
                              <Bot className="h-4 w-4 text-green-400" />
                            </div>
                          )}

                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl border p-4 text-sm shadow-sm transition-all",
                              message.author === "ai"
                                ? "border-green-500/30 bg-slate-900/80 text-slate-100"
                                : "border-green-500/20 bg-green-50 text-slate-900 dark:border-green-500/30 dark:bg-green-900/30 dark:text-green-50"
                            )}
                          >
                            <p className="leading-relaxed">{message.content}</p>
                            <span className="mt-2 block text-xs text-slate-400">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>

                          {message.author === "user" && (
                            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
                              <User className="h-4 w-4 text-green-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                      </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Niveau audio</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{Math.round(audioLevel)}</span>
                  </div>
                  <div className="mt-2 flex items-end gap-1.5">
                    {Array.from({ length: 14 }).map((_, index) => {
                      const amplitude = Math.max(14, audioLevel * 0.45)
                      const waveFactor = (Math.sin(wavePhase + index * 0.55) + 1) / 2
                      const height = Math.max(8, amplitude * (0.45 + 0.55 * waveFactor))
                      const opacity = 0.35 + 0.55 * waveFactor
                      return (
                        <span
                          key={`wave-bar-${index}`}
                          className="w-2 rounded-full bg-gradient-to-t from-emerald-400/60 via-emerald-300/70 to-teal-200/80 transition-[height,opacity] duration-150 ease-out"
                          style={{
                            height,
                            opacity,
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
                      </div>
                    </CardContent>
                  </Card>

          <Card className="border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-950/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-500">
                <Sparkles className="h-5 w-5" />
                Commandes de l'entretien
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Gérez l'appel, le micro et le haut-parleur.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {isCallActive ? (
                  <Button
                    onClick={endCall}
                    className="h-14 w-14 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                ) : (
                  <Button
                    onClick={startCall}
                    disabled={status === "connecting" || isAnalyzing}
                    className="h-14 w-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700"
                  >
                    {status === "connecting" ? <Loader2 className="h-6 w-6 animate-spin" /> : <Phone className="h-6 w-6" />}
                  </Button>
                )}

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <p>{isCallActive ? "Entretien en cours" : "Prêt à démarrer"}</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">{formatDuration(elapsedTime)}</p>
                </div>
                      </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={toggleMute}
                  className={cn(
                    "h-12 w-12 rounded-full border-emerald-200 text-emerald-600 transition",
                    isMuted && "border-red-200 text-red-500"
                  )}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleSpeaker}
                  className="h-12 w-12 rounded-full border-emerald-200 text-emerald-600 transition hover:border-emerald-300"
                >
                  <Waves className="h-5 w-5" />
                </Button>
                      </div>
                    </CardContent>
                  </Card>
        </div>

        <div className="flex-1 space-y-6">
          <Card className="border border-slate-200/70 bg-white/90 shadow-lg backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-500">
                <Briefcase className="h-5 w-5" />
                Contexte du poste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>{interviewData.description || "Le recruteur n'a pas fourni de description détaillée."}</p>
              <div className="grid gap-2 rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 text-xs dark:border-slate-800/60 dark:bg-slate-900/60">
                <span>
                  <strong className="text-slate-700 dark:text-slate-200">Domaine :</strong> {interviewData.domain || "Non précisé"}
                </span>
                <span>
                  <strong className="text-slate-700 dark:text-slate-200">Technologies :</strong> {(interviewData.technologies || []).join(", ") || "Aucune"}
                </span>
                <span>
                  <strong className="text-slate-700 dark:text-slate-200">Durée estimée :</strong> {interviewData.duration || 30} min
                </span>
                <span>
                  <strong className="text-slate-700 dark:text-slate-200">Niveau :</strong> {interviewData.difficulty || "Intermédiaire"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/70 bg-white/90 shadow-lg backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-500">
                <FileText className="h-5 w-5" />
                Script de l'entretien
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Consultez les questions prévues pour préparer vos réponses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[360px] pr-3">
                <div className="space-y-4">
                  {questions.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Aucune question spécifique n'a été définie pour cet entretien.
                    </p>
                  )}

                  {questions.map((question, index) => {
                    const isCurrent = index === activeQuestionIndex
                    const isCompleted = index < answeredCount
                    const shouldReveal = index <= activeQuestionIndex
                    return (
                      <div
                        key={question.id}
                        className={cn(
                          "rounded-xl border p-4 transition-all",
                          isCompleted && "border-green-400/60 bg-green-50/60 dark:border-green-700/60 dark:bg-green-900/30",
                          isCurrent && !isCompleted &&
                            "border-emerald-400/60 bg-emerald-50/70 shadow-inner dark:border-emerald-700/60 dark:bg-emerald-900/30",
                          !isCompleted && !isCurrent && "border-slate-200/70 bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-green-400/60 bg-green-500/10 text-xs text-green-600 dark:border-green-600/60 dark:text-green-300">
                              {index + 1}
                            </span>
                            Question {index + 1}
                          </div>
                          {isCompleted && (
                            <Badge className="flex items-center gap-1 border-green-500/40 bg-green-500/20 text-green-700 dark:border-green-600/60 dark:bg-green-900/40 dark:text-green-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Répondue
                                  </Badge>
                          )}
                        </div>
                        <p
                          className={cn(
                            "mt-2 text-sm leading-relaxed transition-all",
                            shouldReveal
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-400/80 blur-[3px] dark:text-slate-500/80"
                          )}
                        >
                          {question.question}
                        </p>
                        {question.evaluationCriteria && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <strong>Critères :</strong> {question.evaluationCriteria}
                          </p>
                                    )}
                                  </div>
                    )
                  })}
                        </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

          {isAnalyzing && (
            <Card className="border border-emerald-200/70 bg-emerald-50/70 shadow-lg dark:border-emerald-800/60 dark:bg-emerald-900/40">
              <CardContent className="flex items-center gap-3 py-4 text-sm text-emerald-800 dark:text-emerald-200">
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyse de vos réponses en cours... Merci de patienter quelques secondes.
              </CardContent>
            </Card>
          )}
            </div>
      </div>
    </div>
  )
}
