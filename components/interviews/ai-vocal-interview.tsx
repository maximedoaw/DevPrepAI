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
import { CallEndedScreen } from "./call-ended-screen"

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

export default function AIVocalInterview() {
  
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
  const [showSetup, setShowSetup] = useState(true)
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [context, setContext] = useState("")
  const [customTechnology, setCustomTechnology] = useState("")
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null)
  const [interviewDuration, setInterviewDuration] = useState("30")
  const [showCallEnded, setShowCallEnded] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const callTimerRef = useRef<NodeJS.Timeout>(null)
  const audioLevelRef = useRef<NodeJS.Timeout>(null)
  const transcriptionRef = useRef<NodeJS.Timeout>(null)

  const router = useRouter()

  // Technologies disponibles
  const availableTechnologies = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C#", "C++", "Go",
    "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Flutter", "Vue.js", "Angular", "Svelte",
    "Express.js", "Django", "Flask", "Spring Boot", "ASP.NET", "Laravel", "Rails", "GraphQL",
    "REST API", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes", "AWS", "Azure",
    "GCP", "Git", "CI/CD", "Agile", "Scrum", "DevOps", "Microservices", "Serverless", "Machine Learning",
    "Data Science", "Blockchain", "Web3", "Mobile Development", "Game Development"
  ]

  // Options de durée d'entretien (en minutes)
  const durationOptions = [
    { value: "10", label: "10 minutes" },
    { value: "15", label: "15 minutes" },
    { value: "20", label: "20 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 heure" },
    { value: "90", label: "1h 30" },
    { value: "120", label: "2 heures" }
  ]

  // Configuration ElevenLabs
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs")
      setErrorMessage("")

      // Ajouter le message d'introduction
      const introMessage: Message = {
        id: "intro",
        type: "ai",
        content:
          "Bonjour ! Je suis votre assistant IA pour cet entretien technique. Nous allons commencer par quelques questions sur votre parcours et vos compétences techniques.",
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

  // Simulation du niveau audio (en attendant l'API ElevenLabs pour les niveaux audio)
  useEffect(() => {
    if (status === "connected" && !isMuted) {
      audioLevelRef.current = setInterval(() => {
        // Simuler un niveau audio plus élevé quand l'IA parle
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
          technologies: selectedTechnologies.join(", "),
          context: context,
          time: interviewDuration,
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

  const toggleMute = async () => {
    try {
      // ElevenLabs utilise setVolume pour contrôler le son
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

  // Fonctions pour la gestion des technologies
  const addTechnology = (tech: string) => {
    if (!selectedTechnologies.includes(tech)) {
      setSelectedTechnologies([...selectedTechnologies, tech])
    }
  }

  const removeTechnology = (tech: string) => {
    setSelectedTechnologies(selectedTechnologies.filter(t => t !== tech))
  }

  const addCustomTechnology = () => {
    if (customTechnology.trim() && !selectedTechnologies.includes(customTechnology.trim())) {
      setSelectedTechnologies([...selectedTechnologies, customTechnology.trim()])
      setCustomTechnology("")
    }
  }

  const canStartInterview = selectedTechnologies.length > 0 && context.trim().length > 0

  const handleStartInterview = async () => {
    if (canStartInterview) {
      try {
        // Créer l'entretien dans la base de données
        const result = await createVoiceInterview({
          technologies: selectedTechnologies,
          context: context,
          duration: parseInt(interviewDuration)
        })

        if (result.success && result.voiceInterview) {
          setCurrentInterviewId(result.voiceInterview.id)
          setShowSetup(false)
          startCall()
        } else {
          setErrorMessage("Erreur lors de la création de l'entretien")
        }
      } catch (error) {
        console.error("Erreur lors de la création de l'entretien:", error)
        setErrorMessage("Erreur lors de la création de l'entretien")
      }
    }
  }

  const handleRestartInterview = () => {
    setShowCallEnded(false)
    setCallDuration(0)
    setMessages([])
    setTranscription([])
    setCurrentPhase("intro")
    setQuestionIndex(0)
    setErrorMessage("")
    startCall()
  }

  const handleNewInterview = () => {
    setShowCallEnded(false)
    setShowSetup(true)
    setCallDuration(0)
    setMessages([])
    setTranscription([])
    setCurrentPhase("intro")
    setQuestionIndex(0)
    setErrorMessage("")
    setCurrentInterviewId(null)
    setSelectedTechnologies([])
    setContext("")
    setCustomTechnology("")
    setInterviewDuration("30")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec style développeur */}
        <div className="text-center mb-8">
          {/* Bouton de retour */}
          <div className="flex justify-start mb-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-blue-50 font-mono shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>

          <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl px-8 py-6 mb-6 shadow-lg">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Terminal className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Entretien Technique IA
              </h1>
              <p className="text-blue-600 font-mono text-sm mt-1">DevPrepAI Interview System</p>
            </div>
          </div>
        </div>

        {/* Écran de fin d'appel */}
        {showCallEnded && (
          <CallEndedScreen
            callDuration={callDuration}
            selectedTechnologies={selectedTechnologies}
            handleRestartInterview={handleRestartInterview}
            handleNewInterview={handleNewInterview}
            formatCallTime={formatCallTime}
            interviewId={currentInterviewId || undefined}
            transcription={transcription}
          />
        )}

        {/* Interface de configuration */}
        {showSetup && (
          <div className="max-w-5xl mx-auto">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className=" text-white rounded-t-lg">
                <CardTitle className="font-mono flex items-center gap-3">
                  <Sparkles className="h-6 w-6" />
                  Configuration de l'entretien
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Sélection des technologies */}
                <div className="space-y-4">
                  <Label className="text-gray-700 font-mono text-lg font-semibold flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-600" />
                    Technologies à évaluer
                  </Label>
                  
                  {/* Technologies sélectionnées */}
                  {selectedTechnologies.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {selectedTechnologies.map((tech) => (
                        <Badge
                          key={tech}
                          className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200 font-mono px-4 py-2 text-sm shadow-sm"
                        >
                          {tech}
                          <button
                            onClick={() => removeTechnology(tech)}
                            className="ml-2 hover:text-emerald-900 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Liste des technologies disponibles */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {availableTechnologies.map((tech) => (
                      <Button
                        key={tech}
                        variant="outline"
                        size="sm"
                        onClick={() => addTechnology(tech)}
                        disabled={selectedTechnologies.includes(tech)}
                        className={`font-mono text-xs transition-all duration-200 ${
                          selectedTechnologies.includes(tech)
                            ? "bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-300 text-emerald-700 shadow-md"
                            : "bg-white/60 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        {tech}
                      </Button>
                    ))}
                  </div>

                  {/* Ajout de technologie personnalisée */}
                  <div className="flex gap-3">
                    <Input
                      placeholder="Ajouter une technologie personnalisée..."
                      value={customTechnology}
                      onChange={(e) => setCustomTechnology(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomTechnology()}
                      className="font-mono border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                    <Button
                      onClick={addCustomTechnology}
                      disabled={!customTechnology.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-mono shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Sélection de la durée */}
                <div className="space-y-4">
                  <Label className="text-gray-700 font-mono text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Durée de l'entretien
                  </Label>
                  <Select value={interviewDuration} onValueChange={setInterviewDuration}>
                    <SelectTrigger className="w-full md:w-80 font-mono border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Sélectionnez la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="font-mono">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 font-mono">
                    Durée minimale : 10 minutes • Durée maximale : 2 heures
                  </p>
                </div>

                {/* Contexte de l'entretien */}
                <div className="space-y-4">
                  <Label className="text-gray-700 font-mono text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    Contexte de l'entretien
                  </Label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Décrivez le contexte de l'entretien (niveau d'expérience, type de poste, entreprise, etc.)..."
                    className="w-full p-4 border border-blue-200 rounded-lg resize-none font-mono text-sm focus:border-blue-400 focus:ring-blue-400"
                    rows={4}
                  />
                </div>

                {/* Bouton de démarrage */}
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleStartInterview}
                    disabled={!canStartInterview}
                    className={`px-10 py-4 font-mono text-lg transition-all duration-300 ${
                      canStartInterview
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <Phone className="h-6 w-6 mr-3" />
                    Démarrer l'entretien
                  </Button>
                </div>

                {!canStartInterview && (
                  <p className="text-center text-gray-500 text-sm font-mono">
                    Veuillez sélectionner au moins une technologie et décrire le contexte
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interface d'appel (affichée seulement après configuration) */}
        {!showSetup && !showCallEnded && (
          <>
            {/* Status Badge */}
            {status && (
              <div className="mb-4 text-center">
                <Badge
                  className={`${
                    status === "connected"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : status === "connecting"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                  } border font-mono`}
                >
                  {status === "connected"
                    ? "CONNECTED"
                    : status === "connecting"
                      ? "CONNECTING..."
                      : status === "disconnected"
                        ? "DISCONNECTED"
                        : status.toUpperCase()}
                </Badge>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 max-w-2xl mx-auto">
                <Alert className="bg-red-50 border-red-200 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono">{errorMessage}</AlertDescription>
                </Alert>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Call Controls - Left Panel */}
              <div className="xl:col-span-3 space-y-6">
                {/* Main Call Control */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardContent className="p-6">
                    <div className="text-center space-y-6">
                      {/* Call Button */}
                      <div className="relative">
                        <Button
                          onClick={isCallActive ? endCall : startCall}
                          size="lg"
                          disabled={!hasPermission || status === "connecting"}
                          className={`w-24 h-24 rounded-full border-4 transition-all duration-300 ${
                            isCallActive
                              ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-red-400 shadow-xl shadow-red-500/30"
                              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-emerald-400 shadow-xl shadow-emerald-500/30"
                          } ${!hasPermission ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isCallActive ? (
                            <PhoneOff className="h-10 w-10 text-white" />
                          ) : (
                            <Phone className="h-10 w-10 text-white" />
                          )}
                        </Button>

                        {isCallActive && (
                          <div className="absolute -inset-6 border-4 border-emerald-400/30 rounded-full animate-ping"></div>
                        )}
                      </div>

                      <div className="text-gray-900">
                        <p className="text-xl font-semibold font-mono">
                          {isCallActive ? "END CALL" : "START INTERVIEW"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isCallActive
                            ? "Click to hang up"
                            : !hasPermission
                              ? "Microphone permission required"
                              : status === "connecting"
                                ? "Connecting..."
                                : "Click to begin"}
                        </p>
                      </div>

                      {/* Call Controls */}
                      {isCallActive && (
                        <div className="flex justify-center gap-4">
                          <Button
                            onClick={toggleMute}
                            variant="outline"
                            size="lg"
                            className={`w-16 h-16 rounded-full border-2 transition-all ${
                              isMuted
                                ? "bg-gradient-to-r from-red-100 to-pink-100 border-red-400 text-red-600 shadow-md"
                                : "bg-white/60 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-md"
                            }`}
                          >
                            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                          </Button>

                          <Button
                            onClick={toggleSpeaker}
                            variant="outline"
                            size="lg"
                            className={`w-16 h-16 rounded-full border-2 transition-all ${
                              !isSpeakerOn
                                ? "bg-gradient-to-r from-red-100 to-pink-100 border-red-400 text-red-600 shadow-md"
                                : "bg-white/60 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-md"
                            }`}
                          >
                            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                          </Button>
                        </div>
                      )}

                      {/* Bouton d'arrêt d'urgence supplémentaire */}
                      {isCallActive && (
                        <div className="mt-4">
                          <Button
                            onClick={endCall}
                            variant="outline"
                            className="w-full bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700 hover:bg-red-100 font-mono shadow-md"
                          >
                            <PhoneOff className="h-4 w-4 mr-2" />
                            END INTERVIEW
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Audio Level Indicator */}
                {isCallActive && (
                  <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gray-900 text-sm flex items-center gap-2 font-mono">
                        <Waves className="h-4 w-4 text-blue-600" />
                        AUDIO LEVEL
                        {isSpeaking && (
                          <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 animate-pulse text-xs font-mono">AI SPEAKING</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Progress value={audioLevel} className="h-3 bg-gray-200" />
                        <div className="flex justify-between text-xs text-gray-600 font-mono">
                          <span>SILENT</span>
                          <span>LOUD</span>
                        </div>
                      </div>

                      {/* Visual Audio Bars */}
                      <div className="flex justify-center gap-1">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 bg-gradient-to-t from-emerald-500 via-blue-500 to-purple-500 rounded-full transition-all duration-150 ${
                              audioLevel > (i * 12.5) ? "opacity-100" : "opacity-30"
                            }`}
                            style={{
                              height: `${Math.max(8, (audioLevel / 100) * 40)}px`,
                            }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Status */}
                {isCallActive && (
                  <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gray-900 text-sm font-mono">AI STATUS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <Badge
                          className={`${
                            isSpeaking
                              ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200"
                              : "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200"
                          } border animate-pulse font-mono`}
                        >
                          {isSpeaking ? "🗣️ AI SPEAKING" : "👂 LISTENING"}
                        </Badge>
                      </div>

                      <div className="text-center text-sm text-gray-600">
                        <p className="font-mono">{isSpeaking ? "AI is asking a question" : "You can respond now"}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Content Area */}
              <div className="xl:col-span-9 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversation Panel */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader className="border-b border-blue-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900 flex items-center gap-2 font-mono">
                        <Code className="h-5 w-5 text-blue-600" />
                        VOICE CHAT
                        {isSpeaking && (
                          <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 animate-pulse font-mono">AI SPEAKING</Badge>
                        )}
                      </CardTitle>
                      {/* Chronomètre repositioné ici pour desktop */}
                      {isCallActive && (
                        <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-lg border border-emerald-200 shadow-sm">
                          <Clock className="h-4 w-4 text-emerald-600" />
                          <span className="font-mono text-emerald-600 text-sm font-semibold">{formatCallTime(callDuration)}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px] p-4">
                      {!isCallActive ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center space-y-4">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                              <Phone className="h-10 w-10 text-blue-600" />
                            </div>
                            <p className="text-lg font-mono">Start call to begin interview</p>
                            <p className="text-sm text-gray-400">Real-time voice conversation with ElevenLabs</p>
                            {!hasPermission && <p className="text-sm text-yellow-600 font-mono">⚠️ Microphone permission required</p>}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div key={message.id} className="flex gap-3">
                              <Avatar className="h-12 w-12 border-2 border-blue-200 shadow-md">
                                {message.type === "ai" ? (
                                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600">
                                    <Bot className="h-6 w-6" />
                                  </AvatarFallback>
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-600">
                                    <User className="h-6 w-6" />
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-700 text-sm font-mono">
                                    {message.type === "ai" ? "AI ASSISTANT" : "YOU"}
                                  </span>
                                  <span className="text-xs text-gray-500 font-mono">{message.timestamp.toLocaleTimeString()}</span>
                                </div>
                                <div
                                  className={`p-4 rounded-xl border shadow-sm ${
                                    message.type === "ai"
                                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                                      : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                                  }`}
                                >
                                  <p className="text-gray-900 leading-relaxed">{message.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {isSpeaking && (
                            <div className="flex gap-3">
                              <Avatar className="h-12 w-12 border-2 border-blue-300 shadow-md">
                                <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600">
                                  <Bot className="h-6 w-6" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-700 text-sm font-mono">AI ASSISTANT</span>
                                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 animate-pulse text-xs font-mono">
                                    SPEAKING...
                                  </Badge>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm">
                                  <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce"></div>
                                    <div
                                      className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"
                                      style={{ animationDelay: "0.1s" }}
                                    ></div>
                                    <div
                                      className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce"
                                      style={{ animationDelay: "0.2s" }}
                                    ></div>
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

                {/* Live Transcription Panel */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader className="border-b border-red-200/50 bg-gradient-to-r from-red-50 to-pink-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900 flex items-center gap-2 font-mono">
                        <Circle className="h-5 w-5 text-red-500 animate-pulse" />
                        LIVE TRANSCRIPTION
                        {isCallActive && <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-0 font-mono">LIVE</Badge>}
                      </CardTitle>
                      {/* Chronomètre mobile */}
                      {isCallActive && (
                        <div className="lg:hidden flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-lg border border-emerald-200 shadow-sm">
                          <Clock className="h-4 w-4 text-emerald-600" />
                          <span className="font-mono text-emerald-600 text-sm font-semibold">{formatCallTime(callDuration)}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px] p-4">
                      {!isCallActive ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center space-y-4">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg">
                              <Waves className="h-10 w-10 text-red-500" />
                            </div>
                            <p className="text-lg font-mono">Auto transcription</p>
                            <p className="text-sm text-gray-400">
                              Conversation will be transcribed in real-time by ElevenLabs
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transcription.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="inline-flex items-center gap-2 text-gray-500">
                                <Circle className="h-4 w-4 text-red-500 animate-pulse" />
                                <span className="font-mono">Waiting for transcription...</span>
                              </div>
                            </div>
                          ) : (
                            transcription.map((segment) => (
                              <div
                                key={segment.id}
                                className={`p-4 rounded-xl border-l-4 shadow-sm ${
                                  segment.speaker === "ai"
                                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-blue-500"
                                    : "bg-gradient-to-r from-emerald-50 to-teal-50 border-l-emerald-500"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className={`text-xs font-medium font-mono ${
                                      segment.speaker === "ai" ? "text-blue-700" : "text-emerald-700"
                                    }`}
                                  >
                                    {segment.speaker === "ai" ? "AI" : "YOU"}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 font-mono">
                                      {segment.timestamp.toLocaleTimeString()}
                                    </span>
                                    {segment.confidence && (
                                      <Badge className="text-xs bg-white/60 text-gray-700 border-0 font-mono shadow-sm">
                                        {Math.round(segment.confidence * 100)}%
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-900 text-sm leading-relaxed">{segment.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
