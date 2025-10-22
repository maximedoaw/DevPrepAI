"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQuery, useMutation } from "@tanstack/react-query"
import { getInterviewById, quizSaveAnswer } from "@/actions/interview.action"
import { validateInterviewAnswers, calculateTotalScore } from "@/lib/interview-validation"
import { formatTimeDetailed } from "@/lib/time-utils"
import { InterviewContent } from "./interview-content"
import DevLoader from "@/components/dev-loader"
import VocalInterview from "@/components/interviews/vocal-interview"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "coding" | "open-ended"
  points: number
  options?: string[]
  correctAnswer?: number
  codeTemplate?: string
  expectedOutput?: string
}

interface Interview {
  id: string
  title: string
  company: string
  duration: number
  difficulty: string
  type: string
  questions: Question[]
  totalPoints: number
  description?: string
  technology?: string[]
}

interface InterviewContainerProps {
  interviewId: string
}

export function InterviewContainer({ interviewId }: InterviewContainerProps) {
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const router = useRouter()

  const {
    data: interview,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interview", interviewId],
    queryFn: async () => {
      const result = await getInterviewById(interviewId)
      if (result && typeof result.questions === "string") {
        return {
          ...result,
          questions: JSON.parse(result.questions),
        }
      }
      return result
    },
  })

  const {
    mutate: saveQuiz,
    isPending: isSaving,
    error: saveError,
    isError
  } = useMutation({
    mutationKey: ['saveQuizResult', interviewId],
    mutationFn: async (data: {
      quizId: string
      answers: Record<string, any>
      timeSpent: number
      score: number
    }) => {
      const result = await quizSaveAnswer({
        quizId: data.quizId,
        answers: data.answers,
        timeSpent: data.timeSpent,
        score: data.score
      })
      if (!result.success) {
        throw new Error("Échec de la sauvegarde des résultats")
      }
      return result
    },
    onSuccess: (data) => {
      if (data.quizResult) {
        toast.success("Interview terminée ! 🎉")
      }
    },
    onError: (error: Error) => {
      console.error("Erreur lors de la sauvegarde:", error)
      toast.error(error.message || "Une erreur est survenue lors de la sauvegarde des résultats")
    },
  })

  // Initialize timer
  useEffect(() => {
    if (interview && !hasStarted) {
      setTimeLeft(interview.duration * 60)
      setTimeout(() => {
        setIsRunning(true)
        setHasStarted(true)
        toast.success("Interview démarrée ! Timer activé automatiquement.")
      }, 1500)
    }
  }, [interview, hasStarted])

  // Timer logic
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
    return formatTimeDetailed(seconds)
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interview!.questions.length - 1) {
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

  const handleCompleteInterview = async () => {
    setIsCompleted(true)
    setIsRunning(false)

    const score = calculateScore()
    const timeSpent = interview!.duration * 60 - timeLeft

    saveQuiz({
      quizId: interview!.id,
      answers,
      timeSpent,
      score,
    })
  }

  const calculateScore = () => {
    if (!interview) return 0

    // Utiliser la nouvelle fonction de validation
    const validations = validateInterviewAnswers(interview.questions, answers)
    const scoreResult = calculateTotalScore(validations)
    
    return scoreResult.percentage
  }


  // Loading state
  if (isLoading) {
    return <DevLoader/>
  }

  // Error state
  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Interview non trouvée</h2>
          <p className="text-gray-600 mb-4">L'interview avec l'ID "{interviewId}" n'existe pas.</p>
          <Button onClick={() => router.push("/interviews")}>Retour aux interviews</Button>
        </Card>
      </div>
    )
  }

  // Validate questions
  if (!interview.questions || !Array.isArray(interview.questions) || interview.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucune question trouvée</h2>
          <p className="text-gray-600 mb-4">Cette interview ne contient aucune question valide.</p>
          <Button onClick={() => router.push("/interviews")}>Retour aux interviews</Button>
        </Card>
      </div>
    )
  }

  // Affichage spécifique pour MOCK_INTERVIEW (vocal)
  if (interview.type === "MOCK_INTERVIEW") {
    return (
      <VocalInterview 
        interviewData={{
          id: interview.id,
          title: interview.title,
          company: interview.company,
          domain: interview.technology?.[0] || "DEVELOPMENT",
          technologies: interview.technology || [],
          description: interview.description || "",
          duration: interview.duration,
          difficulty: interview.difficulty
        }}
        onComplete={(score, answers) => {
          // Sauvegarder les résultats de l'interview vocal
          const payload = {
            quizId: interview.id,
            answers: answers,
            timeSpent: Math.max(0, (interview.duration || 0) - (timeLeft || 0)),
            score: score,
          }
          saveQuiz(payload)
        }}
      />
    )
  }

  return (
    <InterviewContent
      interview={{
        ...interview,
        description: interview.description || undefined,
        technology: interview.technology || []
      }}
      currentQuestionIndex={currentQuestionIndex}
      answers={answers}
      timeLeft={timeLeft}
      isRunning={isRunning}
      isCompleted={isCompleted}
      onAnswerChange={handleAnswerChange}
      onNextQuestion={handleNextQuestion}
      onPreviousQuestion={handlePreviousQuestion}
      onCompleteInterview={handleCompleteInterview}
      calculateScore={calculateScore}
      formatTime={formatTime}
      isSaving={isSaving}
      saveError={saveError}
    />
  )
}
