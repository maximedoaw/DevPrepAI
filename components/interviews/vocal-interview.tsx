"use client"

import { useState, useEffect, useRef } from "react"
import { useConversation } from "@elevenlabs/react"
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Clock,
  User,
  Bot,
  Waves,
  Circle,
  AlertCircle,
  Code,
  Terminal,
  ArrowLeft,
  X,
  Plus,
  RotateCcw,
  Sparkles,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { createVoiceInterview, updateVoiceInterviewStatus, saveVoiceInterviewTranscription, analyzeAndSaveVoiceInterview } from "@/actions/ai.action"
import { InterviewConfig } from "./interview-config"
import { PREDEFINED_INTERVIEWS } from "./predefined-interviews"

interface Message {
  id: string
  type: "ai" | "user"
  content: string
  timestamp: Date
  duration?: number
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

interface AdaptiveVocalInterviewProps {
  interviewData?: InterviewData
  onComplete?: (score: number, answers: Record<string, any>) => void
  showConfig?: boolean
}

export default function VocalInterview({ interviewData, onComplete, showConfig = false }: AdaptiveVocalInterviewProps) {
  
  const [hasPermission, setHasPermission] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([])
  const [currentPhase, setCurrentPhase] = useState<"intro" | "questions" | "conclusion">("intro")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [showSetup, setShowSetup] = useState(false) // Commencer directement l'interview
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null)
  const [showCallEnded, setShowCallEnded] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showInterviewConfig, setShowInterviewConfig] = useState(showConfig)
  const [currentInterviewData, setCurrentInterviewData] = useState<InterviewData | null>(interviewData || null)

  const callTimerRef = useRef<NodeJS.Timeout>(null)
  const audioLevelRef = useRef<NodeJS.Timeout>(null)
  const transcriptionRef = useRef<NodeJS.Timeout>(null)

  const router = useRouter()

  // Configuration ElevenLabs adaptée au domaine
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs")
      setErrorMessage("")

      // Message d'introduction adapté au domaine
      const domainMessages: Record<string, string> = {
        'DEVELOPMENT': "Bonjour ! Je suis votre assistant IA pour cet entretien technique de développement. Nous allons explorer vos compétences en programmation et architecture logicielle.",
        'DATA_SCIENCE': "Bonjour ! Je suis votre assistant IA pour cet entretien en Data Science. Nous allons évaluer vos compétences en analyse de données, machine learning et statistiques.",
        'MOBILE': "Bonjour ! Je suis votre assistant IA pour cet entretien de développement mobile. Nous allons examiner vos compétences en développement d'applications mobiles.",
        'WEB': "Bonjour ! Je suis votre assistant IA pour cet entretien de développement web. Nous allons explorer vos compétences en technologies web et frameworks frontend/backend.",
        'DEVOPS': "Bonjour ! Je suis votre assistant IA pour cet entretien DevOps. Nous allons évaluer vos compétences en déploiement, infrastructure et automatisation.",
        'ENGINEERING': "Bonjour ! Je suis votre assistant IA pour cet entretien d'ingénierie logicielle. Nous allons examiner vos compétences en architecture et développement système.",
        'DESIGN': "Bonjour ! Je suis votre assistant IA pour cet entretien de design UX/UI. Nous allons explorer vos compétences en conception d'interface et expérience utilisateur.",
        'FINANCE': "Bonjour ! Je suis votre assistant IA pour cet entretien en analyse financière. Nous allons évaluer vos compétences en modélisation financière et analyse de données.",
        'BUSINESS': "Bonjour ! Je suis votre assistant IA pour cet entretien en stratégie business. Nous allons examiner vos compétences en analyse stratégique et gestion de projet.",
        'MARKETING': "Bonjour ! Je suis votre assistant IA pour cet entretien en marketing digital. Nous allons explorer vos compétences en stratégie marketing et analytics.",
        'PRODUCT': "Bonjour ! Je suis votre assistant IA pour cet entretien en product management. Nous allons évaluer vos compétences en gestion de produit et stratégie produit.",
        'MANAGEMENT': "Bonjour ! Je suis votre assistant IA pour cet entretien en management. Nous allons examiner vos compétences en leadership et gestion d'équipe.",
        'EDUCATION': "Bonjour ! Je suis votre assistant IA pour cet entretien en formation. Nous allons explorer vos compétences pédagogiques et en conception de programmes.",
        'HEALTH': "Bonjour ! Je suis votre assistant IA pour cet entretien en santé digitale. Nous allons évaluer vos compétences en technologies de santé et conformité.",
        'CYBERSECURITY': "Bonjour ! Je suis votre assistant IA pour cet entretien en cybersécurité. Nous allons examiner vos compétences en sécurité informatique et gestion des risques.",
        'ARCHITECTURE': "Bonjour ! Je suis votre assistant IA pour cet entretien en architecture cloud. Nous allons explorer vos compétences en conception d'infrastructure et solutions cloud.",
        'COMMUNICATION': "Bonjour ! Je suis votre assistant IA pour cet entretien en communication. Nous allons évaluer vos compétences en communication stratégique et relations publiques."
      }

      const introMessage: Message = {
        id: "intro",
        type: "ai",
        content: domainMessages[currentInterviewData?.domain || 'DEVELOPMENT'] || domainMessages['DEVELOPMENT'],
        timestamp: new Date(),
      }
      setMessages([introMessage])
      setCurrentPhase("intro")
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs")
      endCall()
    },
    onMessage: (message) => {
      console.log("Received message:", message)

      // Ajouter le message à la conversation
      if (message.message && message.message.trim()) {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: message.source === "ai" ? "ai" : "user",
          content: message.message,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, newMessage])

        // Ajouter à la transcription
        const transcriptSegment: TranscriptionSegment = {
          id: Date.now().toString() + "_transcript",
          speaker: message.source === "ai" ? "ai" : "user",
          text: message.message,
          timestamp: new Date(),
          confidence: 0.95,
        }
        setTranscription((prev) => [...prev.slice(-15), transcriptSegment])
      }
    },
    onError: (error: string | Error) => {
      const errorMsg = typeof error === "string" ? error : error.message
      setErrorMessage(errorMsg)
      console.error("ElevenLabs Error:", error)
    },
  })

  const { status, isSpeaking } = conversation

  const formatCallTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Demander la permission du microphone
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setHasPermission(true)
        setErrorMessage("")
      } catch (error) {
        setErrorMessage("Accès au microphone refusé. Veuillez autoriser l'accès pour utiliser l'entretien vocal.")
        console.error("Error accessing microphone:", error)
      }
    }

    requestMicPermission()
  }, [])

  // Timer pour la durée de l'appel
  useEffect(() => {
    if (status === "connected") {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [status])

  // Simulation du niveau audio
  useEffect(() => {
    if (status === "connected" && !isMuted) {
      audioLevelRef.current = setInterval(() => {
        const baseLevel = isSpeaking ? 60 : 20
        setAudioLevel(baseLevel + Math.random() * 40)
      }, 150)
    } else {
      setAudioLevel(0)
      if (audioLevelRef.current) {
        clearInterval(audioLevelRef.current)
      }
    }

    return () => {
      if (audioLevelRef.current) {
        clearInterval(audioLevelRef.current)
      }
    }
  }, [status, isMuted, isSpeaking])

  const startCall = async () => {
    if (!hasPermission) {
      setErrorMessage("Permission du microphone requise pour démarrer l'entretien")
      return
    }

    try {
      setErrorMessage("")

      // Vérifier que l'agent ID est configuré
      if (!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
        setErrorMessage("Agent DevPrepAI non configuré. Veuillez configurer NEXT_PUBLIC_ELEVENLABS_AGENT_ID")
        return
      }

      const conversationId = await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
        dynamicVariables: {
          technologies: currentInterviewData?.technologies?.join(", ") || "",
          context: currentInterviewData?.description || "",
          domain: currentInterviewData?.domain || "DEVELOPMENT",
          difficulty: currentInterviewData?.difficulty || "MID",
          company: currentInterviewData?.company || "",
          time: currentInterviewData?.duration?.toString() || "30",
        }
      })

      console.log("Started ElevenLabs conversation:", conversationId)
      
      // Mettre à jour le statut de l'entretien
      if (currentInterviewId) {
        await updateVoiceInterviewStatus(currentInterviewId, "active", conversationId)
      }
      
      setCurrentPhase("intro")
      setQuestionIndex(0)
    } catch (error) {
      setErrorMessage("Impossible de démarrer la conversation avec DevPrepAI")
      console.error("Error starting conversation:", error)
    }
  }

  const endCall = async () => {
    try {
      await conversation.endSession()
    } catch (error) {
      console.error("Error ending conversation:", error)
    }

    // Sauvegarder la transcription et les données de l'entretien
    if (currentInterviewId && transcription.length > 0) {
      try {
        await saveVoiceInterviewTranscription(
          currentInterviewId,
          transcription,
          callDuration,
          {
            messages: messages,
            phase: currentPhase,
            questionIndex: questionIndex
          },
          undefined // Score à calculer plus tard
        )
        // Appel Gemini pour feedback
        setIsAnalyzing(true)
        const res = await analyzeAndSaveVoiceInterview(currentInterviewId, transcription, callDuration)
        if (res.success && res.feedback) {
          setIsAnalyzing(false)
          // Calculer un score basé sur la conversation
          const score = calculateConversationScore()
          onComplete?.(score, { transcription, messages, duration: callDuration })
        } else if (res.error) {
          setErrorMessage(res.error)
        }
        setIsAnalyzing(false)
      } catch (error) {
        setIsAnalyzing(false)
        console.error("Erreur lors de la sauvegarde/analyse de la transcription:", error)
      }
    }

    // Afficher l'écran de fin d'appel
    setShowCallEnded(true)

    // Nettoyer tous les timers
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }
    if (audioLevelRef.current) {
      clearInterval(audioLevelRef.current)
      audioLevelRef.current = null
    }
    if (transcriptionRef.current) {
      clearInterval(transcriptionRef.current)
      transcriptionRef.current = null
    }
  }

  const calculateConversationScore = () => {
    // Score basé sur la durée de conversation et le nombre de messages
    const baseScore = Math.min(100, Math.max(20, (callDuration / 60) * 10 + messages.length * 2))
    return Math.round(baseScore)
  }

  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 })
      setIsMuted(!isMuted)
      setErrorMessage("")
    } catch (error) {
      setErrorMessage("Impossible de changer le volume")
      console.error("Error changing volume:", error)
    }
  }

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
  }

  const isCallActive = status === "connected"

  // Démarrer automatiquement l'interview
  useEffect(() => {
    if (hasPermission && !showSetup) {
      startCall()
    }
  }, [hasPermission, showSetup])

  // Si on est en mode configuration ou qu'aucune donnée n'est fournie
  if (showInterviewConfig || !currentInterviewData) {
    return (
      <InterviewConfig
        onStartInterview={(data) => {
          setCurrentInterviewData(data)
          setShowInterviewConfig(false)
        }}
        predefinedInterviews={PREDEFINED_INTERVIEWS}
      />
    )
  }

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
  <div className="max-w-4xl mx-auto p-4 md:p-6">
    {/* Header élégant */}
    <div className="text-center mb-8">
      <div className="inline-flex flex-col items-center gap-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl px-8 py-6 mb-6 shadow-2xl">
        <div className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl shadow-lg">
          <Mic className="h-8 w-8 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {currentInterviewData.title}
          </h1>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 font-mono text-xs">
              {currentInterviewData.domain}
            </Badge>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 font-mono text-xs">
              {currentInterviewData.company}
            </Badge>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 font-mono text-xs">
              {currentInterviewData.difficulty}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    {/* Zone de conversation principale */}
    <div className="space-y-6">
      {/* Carte de conversation */}
      <Card className="border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xl rounded-2xl">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 dark:text-slate-200 flex items-center gap-2 font-mono text-sm">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              INTERVIEW VOCAL EN DIRECT
            </CardTitle>
            <div className="flex items-center gap-4">
              {isCallActive && (
                <>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-mono text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                      {formatCallTime(callDuration)}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-xs ${
                    status === "connected"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
                  }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      status === "connected" ? "bg-emerald-500" : "bg-yellow-500"
                    }`} />
                    {status === "connected" ? "EN DIRECT" : "CONNEXION..."}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-6">
            {!isCallActive ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center shadow-lg">
                  <Mic className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-mono text-slate-700 dark:text-slate-300">Prêt pour votre interview</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Cliquez sur le bouton pour démarrer la conversation vocale
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 ${message.type === "ai" ? "flex-row" : "flex-row-reverse"}`}>
                    <Avatar className={`h-10 w-10 border-2 shadow-lg ${
                      message.type === "ai" 
                        ? "border-blue-300 dark:border-blue-600" 
                        : "border-emerald-300 dark:border-emerald-600"
                    }`}>
                      {message.type === "ai" ? (
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] space-y-2 ${message.type === "user" ? "text-right" : ""}`}>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium font-mono">
                          {message.type === "ai" ? "ASSISTANT IA" : "VOUS"}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl shadow-sm border ${
                          message.type === "ai"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800"
                            : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800"
                        }`}
                      >
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {isSpeaking && (
                  <div className="flex gap-4 animate-pulse">
                    <Avatar className="h-10 w-10 border-2 border-blue-300 dark:border-blue-600 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium font-mono">ASSISTANT IA</span>
                        <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 text-xs font-mono dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300">
                          EN TRAIN DE RÉPONDRE...
                        </Badge>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                            Transcription et génération de la réponse...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Zone de contrôle vocale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte de contrôle principal */}
        <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Bouton d'appel principal */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Button
                    onClick={isCallActive ? endCall : startCall}
                    size="lg"
                    disabled={!hasPermission || status === "connecting"}
                    className={`w-20 h-20 rounded-full border-4 transition-all duration-300 shadow-2xl ${
                      isCallActive
                        ? "bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-red-300 dark:border-red-600 shadow-red-500/40"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-emerald-300 dark:border-emerald-600 shadow-emerald-500/40"
                    } ${!hasPermission ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isCallActive ? (
                      <PhoneOff className="h-8 w-8 text-white" />
                    ) : (
                      <Phone className="h-8 w-8 text-white" />
                    )}
                  </Button>
                  
                  {isCallActive && (
                    <div className="absolute -inset-4 border-4 border-emerald-400/20 dark:border-emerald-600/30 rounded-full animate-ping"></div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-lg font-semibold font-mono text-slate-800 dark:text-slate-200">
                    {isCallActive ? "Terminer l'appel" : "Démarrer l'interview"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isCallActive
                      ? "Cliquez pour terminer la conversation"
                      : !hasPermission
                      ? "Autorisation microphone requise"
                      : "Prêt à commencer"}
                  </p>
                </div>
              </div>

              {/* Contrôles audio */}
              {isCallActive && (
                <div className="flex items-center gap-4">
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    size="lg"
                    className={`w-16 h-16 rounded-full border-2 transition-all shadow-lg ${
                      isMuted
                        ? "bg-gradient-to-br from-red-50 to-rose-100 border-red-300 text-red-600 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400"
                        : "bg-white border-blue-300 text-blue-700 hover:bg-blue-50 dark:bg-slate-700 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-slate-600"
                    }`}
                  >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>

                  <Button
                    onClick={toggleSpeaker}
                    variant="outline"
                    size="lg"
                    className={`w-16 h-16 rounded-full border-2 transition-all shadow-lg ${
                      !isSpeakerOn
                        ? "bg-gradient-to-br from-red-50 to-rose-100 border-red-300 text-red-600 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400"
                        : "bg-white border-purple-300 text-purple-700 hover:bg-purple-50 dark:bg-slate-700 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-slate-600"
                    }`}
                  >
                    {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                  </Button>
                </div>
              )}
            </div>

            {/* Indicateur audio */}
            {isCallActive && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Waves className="h-4 w-4 text-blue-500" />
                    NIVEAU MICRO
                  </span>
                  {isSpeaking && (
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 text-xs font-mono dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300">
                      IA ÉCOUTE ET RÉPOND
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Progress 
                    value={audioLevel} 
                    className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full"
                  />
                  <div className="flex justify-center gap-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 rounded-full transition-all duration-150 ${
                          audioLevel > (i * 12.5) 
                            ? "bg-gradient-to-t from-emerald-400 via-blue-500 to-purple-500 shadow-md"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                        style={{
                          height: `${Math.max(4, (audioLevel / 100) * 20)}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Carte de transcription en temps réel */}
        <Card className="border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xl rounded-2xl">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 py-4">
            <CardTitle className="text-slate-800 dark:text-slate-200 flex items-center gap-2 font-mono text-sm">
              <Circle className="h-4 w-4 text-amber-500 animate-pulse" />
              TRANSCRIPTION
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[140px]">
              {!isCallActive ? (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 text-sm text-center">
                  <div className="space-y-2">
                    <Waves className="h-6 w-6 mx-auto text-amber-500" />
                    <p className="font-mono">Transcription en direct</p>
                  </div>
                </div>
              ) : transcription.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Circle className="h-3 w-3 text-amber-500 animate-pulse" />
                    <span className="font-mono">En attente de la parole...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {transcription.slice(-3).map((segment) => (
                    <div
                      key={segment.id}
                      className={`p-3 rounded-xl border-l-2 ${
                        segment.speaker === "ai"
                          ? "bg-blue-50 border-l-blue-500 dark:bg-blue-900/20 dark:border-l-blue-400"
                          : "bg-emerald-50 border-l-emerald-500 dark:bg-emerald-900/20 dark:border-l-emerald-400"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-mono ${
                          segment.speaker === "ai" 
                            ? "text-blue-700 dark:text-blue-300" 
                            : "text-emerald-700 dark:text-emerald-300"
                        }`}>
                          {segment.speaker === "ai" ? "IA" : "VOUS"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {segment.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm leading-tight">
                        {segment.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Écran de fin d'appel */}
    {showCallEnded && (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center shadow-2xl">
                <PhoneOff className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Interview Terminée</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Durée : <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{formatCallTime(callDuration)}</span>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Analyse de votre performance en cours...
                </p>
              </div>

              <Button
                onClick={() => onComplete?.(calculateConversationScore(), { transcription, messages, duration: callDuration })}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-mono shadow-lg w-full py-3 text-lg rounded-xl"
              >
                Voir les résultats
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
  </div>
</div>
  )
}
