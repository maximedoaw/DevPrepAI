"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, Play, Pause } from "lucide-react"
import { type Interview, type Question, DIFFICULTY_COLORS } from "@/constants"
import { toast } from "sonner"
import { CodeEditor } from "./code-editor"

interface InterviewModalProps {
  interview: Interview
  onClose: () => void
}

export function InterviewModal({ interview, onClose }: InterviewModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(interview.duration * 60) // en secondes
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = interview.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartTimer = () => {
    setIsRunning(true)
    toast.success("Interview démarrée !")
  }

  const handlePauseTimer = () => {
    setIsRunning(false)
    toast.info("Interview mise en pause")
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
    toast.success("Interview terminée !")
  }

  const calculateScore = () => {
    let correct = 0
    interview.questions.forEach((question) => {
      if (question.type === "multiple-choice" && answers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / interview.questions.length) * 100)
  }

  if (isCompleted) {
    const score = calculateScore()
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <DialogHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-gray-900 dark:text-white">Interview Terminée !</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">Voici vos résultats pour "{interview.title}"</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 shadow-lg">
              <CardHeader className="border-b border-blue-200/50 dark:border-slate-600/50">
                <CardTitle className="text-center text-gray-900 dark:text-white">Votre Score</CardTitle>
              </CardHeader>
              <CardContent className="bg-white/50 dark:bg-slate-800/50">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{score}%</div>
                  <Progress value={score} className="h-3 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {score >= 80
                      ? "Excellent travail !"
                      : score >= 60
                        ? "Bon travail, continuez à vous améliorer !"
                        : "Continuez à vous entraîner !"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button onClick={onClose} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">Fermer</Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
                Refaire l'Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        <DialogHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 -m-6 mb-6 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-gray-900 dark:text-white">{interview.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                {interview.company} •
                <Badge className={`${DIFFICULTY_COLORS[interview.difficulty.toLowerCase()]} shadow-sm`}>{interview.difficulty}</Badge>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className={`font-mono ${timeLeft < 300 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>{formatTime(timeLeft)}</span>
              {!isRunning ? (
                <Button size="sm" onClick={handleStartTimer} disabled={timeLeft === 0} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg">
                  <Play className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handlePauseTimer} className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
                  <Pause className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4 border border-blue-200/50 dark:border-slate-600/50">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Question {currentQuestionIndex + 1} sur {interview.questions.length}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.round(progress)}% complété</span>
            </div>
            <Progress value={progress} className="h-3 shadow-sm" />
          </div>

          {/* Question */}
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700/50 dark:to-slate-600/50">
              <CardTitle className="text-lg text-gray-900 dark:text-white">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="bg-white/50 dark:bg-slate-800/50">
              <QuestionRenderer
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm disabled:opacity-50">
              Précédent
            </Button>
            <Button onClick={handleNextQuestion} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
              {currentQuestionIndex === interview.questions.length - 1 ? "Terminer" : "Suivant"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface QuestionRendererProps {
  question: Question
  answer: any
  onAnswerChange: (answer: any) => void
}

function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  switch (question.type) {
    case "multiple-choice":
      return (
        <RadioGroup value={answer?.toString()} onValueChange={(value) => onAnswerChange(Number.parseInt(value))}>
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )

    case "coding":
      return (
        <div className="space-y-4">
          <CodeEditor value={answer || question.codeTemplate || ""} onChange={onAnswerChange} language="javascript" />
          {question.expectedOutput && (
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg p-3 border border-blue-200/50 dark:border-slate-600/50">
              <strong className="text-gray-900 dark:text-white">Sortie attendue :</strong> {question.expectedOutput}
            </div>
          )}
        </div>
      )

    case "open-ended":
      return (
        <Textarea
          value={answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Tapez votre réponse ici..."
          className="min-h-32"
        />
      )

    default:
      return <div>Type de question non supporté</div>
  }
}
