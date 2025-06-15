"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, Play, Pause, CheckCircle, AlertCircle, Trophy, RotateCcw } from "lucide-react"
import { MOCK_INTERVIEWS, DIFFICULTY_CONFIG, TYPE_CONFIG } from "@/constants"
import { toast } from "sonner"
import { CodeEditor } from "@/components/interviews/code-editor"

export default function InterviewPage() {
  const router = useRouter()
  const params = useParams()
  const interviewId = params.id as string

  const interview = MOCK_INTERVIEWS.find((i) => i.id === interviewId)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (interview && !hasStarted) {
      setTimeLeft(interview.duration * 60)
      // Auto-start timer
      setTimeout(() => {
        setIsRunning(true)
        setHasStarted(true)
        toast.success("Interview démarrée ! Timer activé automatiquement.")
      }, 1000)
    }
  }, [interview, hasStarted])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false)
            handleCompleteInterview()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Interview non trouvée</h2>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = interview.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100
  const typeConfig = TYPE_CONFIG[interview.type]
  const difficultyConfig = DIFFICULTY_CONFIG[interview.difficulty]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      toast.success("Question suivante !")
    } else {
      handleCompleteInterview()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleCompleteInterview = () => {
    setIsCompleted(true)
    setIsRunning(false)
    toast.success("Interview terminée ! 🎉")
  }

  const calculateScore = () => {
    let totalPoints = 0
    let earnedPoints = 0

    interview.questions.forEach((question) => {
      totalPoints += question.points
      if (question.type === "multiple-choice" && answers[question.id] === question.correctAnswer) {
        earnedPoints += question.points
      } else if (question.type === "open-ended" && answers[question.id]?.trim()) {
        // Pour les questions ouvertes, on donne des points si il y a une réponse
        earnedPoints += question.points * 0.8 // 80% des points
      } else if (question.type === "coding" && answers[question.id]?.trim()) {
        // Pour le coding, on donne des points si il y a du code
        earnedPoints += question.points * 0.7 // 70% des points
      }
    })

    return Math.round((earnedPoints / totalPoints) * 100)
  }

  if (isCompleted) {
    const score = calculateScore()
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-fit">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interview Terminée !
            </CardTitle>
            <p className="text-gray-600 mt-2">
              "{interview.title}" - {interview.company}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {score}%
              </div>
              <Progress value={score} className="h-4 mb-4" />
              <p className="text-lg text-gray-600">
                {score >= 90
                  ? "🎉 Excellent ! Vous maîtrisez parfaitement le sujet !"
                  : score >= 80
                    ? "🚀 Très bien ! Quelques points à améliorer."
                    : score >= 60
                      ? "👍 Bon travail ! Continuez à vous entraîner."
                      : "💪 Continuez vos efforts, vous progressez !"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{interview.questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatTime(interview.duration * 60 - timeLeft)}</div>
                <div className="text-sm text-gray-600">Temps utilisé</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Refaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${typeConfig.color}`}>
                  <span className="text-lg">{typeConfig.icon}</span>
                </div>
                <div>
                  <h1 className="font-semibold text-lg">{interview.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{interview.company}</span>
                    <Badge className={`${difficultyConfig.bg} ${difficultyConfig.text} border-0 text-xs`}>
                      {interview.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono text-lg ${timeLeft < 300 ? "text-red-600 font-bold" : ""}`}>
                  {formatTime(timeLeft)}
                </span>
                {!isRunning && timeLeft > 0 ? (
                  <Button size="sm" onClick={() => setIsRunning(true)} variant="outline">
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setIsRunning(false)} variant="outline">
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium">
                Question {currentQuestionIndex + 1} sur {interview.questions.length}
              </span>
              <span className="text-gray-600">{Math.round(progress)}% complété</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="mb-6 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{currentQuestion.points} points</span>
              {currentQuestion.type === "coding" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Coding Challenge
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button
            onClick={handleNextQuestion}
            className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {currentQuestionIndex === interview.questions.length - 1 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Terminer
              </>
            ) : (
              <>
                Suivant
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface QuestionRendererProps {
  question: any
  answer: any
  onAnswerChange: (answer: any) => void
}

function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  switch (question.type) {
    case "multiple-choice":
      return (
        <div className="space-y-3">
          <RadioGroup value={answer?.toString()} onValueChange={(value) => onAnswerChange(Number.parseInt(value))}>
            {question.options?.map((option: string, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )

    case "coding":
      return (
        <div className="space-y-4">
          <CodeEditor value={answer || question.codeTemplate || ""} onChange={onAnswerChange} language="javascript" />
          {question.expectedOutput && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">Sortie attendue :</div>
              <code className="text-blue-700">{question.expectedOutput}</code>
            </div>
          )}
        </div>
      )

    case "open-ended":
      return (
        <Textarea
          value={answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Tapez votre réponse détaillée ici..."
          className="min-h-40 resize-none"
        />
      )

    default:
      return <div>Type de question non supporté</div>
  }
}
