"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Play, Pause, Square, Volume2, Clock, User, Bot, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  type: "ai" | "user"
  content: string
  timestamp: Date
  duration?: number
}

export default function AIVocalInterview() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [isAISpeaking, setIsAISpeaking] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout>(null)
  const audioLevelRef = useRef<NodeJS.Timeout>(null)

  const questions = [
    "Bonjour ! Je suis votre assistant IA pour cet entretien technique. Pouvez-vous vous présenter brièvement ?",
    "Expliquez-moi la différence entre une fonction synchrone et asynchrone en JavaScript.",
    "Comment optimiseriez-vous les performances d'une application React ?",
    "Décrivez votre approche pour déboguer un problème de performance dans une API.",
    "Quels sont les principes SOLID et comment les appliquez-vous ?",
    "Comment géreriez-vous l'état global dans une application complexe ?",
  ]

  useEffect(() => {
    if (interviewStarted) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [interviewStarted])

  useEffect(() => {
    if (isRecording) {
      // Simuler le niveau audio
      audioLevelRef.current = setInterval(() => {
        setAudioLevel(Math.random() * 100)
      }, 100)
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
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startInterview = () => {
    setInterviewStarted(true)
    setIsAISpeaking(true)

    // Ajouter la première question
    const firstMessage: Message = {
      id: "1",
      type: "ai",
      content: questions[0],
      timestamp: new Date(),
    }
    setMessages([firstMessage])

    // Simuler la fin de la parole de l'IA
    setTimeout(() => {
      setIsAISpeaking(false)
    }, 3000)
  }

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true)
      setIsPlaying(false)
    } else {
      setIsRecording(false)

      // Simuler l'ajout de la réponse de l'utilisateur
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: "Réponse enregistrée (simulation)",
        timestamp: new Date(),
        duration: Math.floor(Math.random() * 60) + 10,
      }

      setMessages((prev) => [...prev, userMessage])

      // Passer à la question suivante après un délai
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          const nextQuestion = currentQuestion + 1
          setCurrentQuestion(nextQuestion)
          setIsAISpeaking(true)

          const aiMessage: Message = {
            id: Date.now().toString() + "_ai",
            type: "ai",
            content: questions[nextQuestion],
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, aiMessage])

          setTimeout(() => {
            setIsAISpeaking(false)
          }, 3000)
        }
      }, 1000)
    }
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const endInterview = () => {
    setInterviewStarted(false)
    setIsRecording(false)
    setIsPlaying(false)
    setElapsedTime(0)
    setCurrentQuestion(0)
    setMessages([])
    setIsAISpeaking(false)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entretien Technique IA</h1>
          <p className="text-muted-foreground">Interface vocale pour entretien développeur</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>
          <Badge variant={interviewStarted ? "default" : "secondary"}>
            {interviewStarted ? "En cours" : "En attente"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contrôles principaux */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Contrôles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!interviewStarted ? (
                <Button onClick={startInterview} className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer l'entretien
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="w-full"
                    size="lg"
                    disabled={isAISpeaking}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Arrêter l'enregistrement
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Commencer à répondre
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={togglePlayback}
                    variant="outline"
                    className="w-full"
                    disabled={isRecording || isAISpeaking}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Réécouter
                      </>
                    )}
                  </Button>

                  <Button onClick={endInterview} variant="outline" className="w-full">
                    <Square className="h-4 w-4 mr-2" />
                    Terminer l'entretien
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Niveau audio */}
          {isRecording && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Niveau audio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={audioLevel} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Silencieux</span>
                    <span>Fort</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progression */}
          {interviewStarted && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Question {currentQuestion + 1}</span>
                    <span>{questions.length} total</span>
                  </div>
                  <Progress value={(currentQuestion / (questions.length - 1)) * 100} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px] p-4">
                {!interviewStarted ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Cliquez sur "Démarrer l'entretien" pour commencer</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          {message.type === "ai" ? (
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback className="bg-green-100 text-green-600">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {message.type === "ai" ? "Assistant IA" : "Vous"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.duration && (
                              <Badge variant="outline" className="text-xs">
                                {message.duration}s
                              </Badge>
                            )}
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              message.type === "ai" ? "bg-blue-50 text-blue-900" : "bg-green-50 text-green-900"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isAISpeaking && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">Assistant IA</span>
                            <Badge variant="outline" className="text-xs animate-pulse">
                              En train de parler...
                            </Badge>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-50">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isRecording && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-100 text-green-600">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">Vous</span>
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              <Mic className="h-3 w-3 mr-1" />
                              Enregistrement...
                            </Badge>
                          </div>
                          <div className="p-3 rounded-lg bg-green-50 border-2 border-green-200 border-dashed">
                            <p className="text-green-700 text-sm">Parlez maintenant...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
