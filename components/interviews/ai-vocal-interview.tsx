"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  const [messages, setMessages] = useState<Message[]>([])
  const [transcription, setTranscription] = useState<TranscriptSegment[]>([])
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)

  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioLevelRef = useRef<NodeJS.Timeout | null>(null)
  const isEndingCallRef = useRef(false)

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

  const jobContext = useMemo(() => {
    const technologies = (interviewData.technologies || []).join(", ") || "Non spécifiées"
    return `Poste: ${interviewData.title} - ${interviewData.company}\nDomaine: ${interviewData.domain || "Non spécifié"}\nTechnologies clés: ${technologies}\nDurée prévue: ${interviewData.duration || 30} minutes\nNiveau: ${interviewData.difficulty || "Intermédiaire"}\nDescription: ${interviewData.description || "Non fournie"}`
  }, [interviewData])

  const answeredCount = useMemo(() => messages.filter((msg) => msg.author === "user").length, [messages])
  const activeQuestionIndex = questions.length === 0 ? 0 : Math.min(answeredCount, questions.length - 1)
  const progressValue = questions.length === 0 ? 0 : Math.min((answeredCount / questions.length) * 100, 100)

  const conversation = useConversation({
    onConnect: () => {
      setErrorMessage("")
      setIsCallActive(true)
      const intro: Message = {
        id: `intro-${Date.now()}`,
        author: "ai",
        content: `Bonjour ! Je suis votre coach IA. Nous allons parcourir ${questions.length || "quelques"} question(s) pour ${interviewData.company}. Prenez le temps de détailler vos réponses, je vous accompagnerai tout au long de l'entretien.`,
        timestamp: new Date(),
      }
      setMessages((prev) => (prev.length === 0 ? [intro] : prev))
    },
    onDisconnect: () => {
      clearIntervalTimer()
      clearAudioInterval()
      setIsCallActive(false)
      if (!isEndingCallRef.current && transcription.length > 0) {
        void finalizeInterview()
      }
      isEndingCallRef.current = false
    },
    onMessage: (message: any) => {
      if (!message.message || !message.message.trim()) return

      const formatted: Message = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        author: message.source === "ai" ? "ai" : "user",
          content: message.message,
          timestamp: new Date(),
        }
      setMessages((prev) => [...prev.slice(-199), formatted])

      const segment: TranscriptSegment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}-transcript`,
          speaker: message.source === "ai" ? "ai" : "user",
          text: message.message,
          timestamp: new Date(),
          confidence: 0.95,
        }
      setTranscription((prev) => [...prev.slice(-199), segment])
    },
    onError: (error: any) => {
      const message = typeof error === "string" ? error : error?.message
      setErrorMessage(message || "Une erreur est survenue lors de l'entretien")
    },
  })

  const { status, isSpeaking } = conversation

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
    if (status === "connected" && !isMuted) {
      audioLevelRef.current = setInterval(() => {
        const base = isSpeaking ? 65 : 25
        setAudioLevel(base + Math.random() * 25)
      }, 180)
    } else {
      setAudioLevel(0)
      clearAudioInterval()
    }

    return clearAudioInterval
  }, [status, isMuted, isSpeaking])

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

  const startCall = async () => {
    if (!hasPermission) {
      setErrorMessage("Veuillez autoriser l'accès au microphone pour démarrer l'entretien")
      return
    }
    if (!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
      setErrorMessage("Agent ElevenLabs non configuré. Contactez l'administrateur.")
      return
    }

    try {
      setErrorMessage("")
      setMessages([])
      setTranscription([])
      setCallDuration(0)

      let voiceInterviewId = currentInterviewId
      if (!voiceInterviewId) {
        const created = await createVoiceInterview({
          technologies: interviewData.technologies || [],
          context: `${jobContext}\n\n${questionContext}`,
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
          interviewScript: questionContext,
          conversationStyle: "Encourageant, professionnel, clair"
        },
      })

      if (voiceInterviewId) {
        await updateVoiceInterviewStatus(voiceInterviewId, "active", conversationId)
      }
    } catch (error) {
      console.error("Error starting vocal interview:", error)
      setErrorMessage("Impossible de démarrer l'entretien. Réessayez dans quelques instants.")
    }
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

  const finalizeInterview = async () => {
    clearIntervalTimer()
    clearAudioInterval()
    setIsCallActive(false)

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

  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 })
      setIsMuted((prev) => !prev)
    } catch (error) {
      console.error("Error toggling mute:", error)
      setErrorMessage("Impossible de basculer le micro.")
    }
  }

  const toggleSpeaker = async () => {
    try {
      await conversation.setVolume({ volume: isSpeakerOn ? 0 : 1 })
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
                        {formatDuration(callDuration)}
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
                  <div className="mt-2 flex items-end gap-1">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <span
                        key={index}
                        className="w-2 rounded-full bg-gradient-to-t from-green-500 via-emerald-400 to-teal-300 transition-all"
                            style={{
                          height: `${Math.max(8, audioLevel - index * 5)}px`,
                          opacity: audioLevel > index * 8 ? 1 : 0.2,
                            }}
                          />
                        ))}
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
                  <p className="font-semibold text-green-600 dark:text-green-400">{formatDuration(callDuration)}</p>
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
                        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                          {question.question}
                        </p>
                        {question.expectedAnswer && (
                          <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:border-emerald-600/30 dark:bg-emerald-900/30 dark:text-emerald-200">
                            <strong>Réponse attendue :</strong>
                            <p className="mt-1 leading-relaxed">{question.expectedAnswer}</p>
                          </div>
                        )}
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
