"use client"

import { InterviewHeader } from "./interview-header"
import { ProgressCard } from "./progress-card"
import { QuestionCard } from "./question-card"
import { NavigationControls } from "./navigation-controls"
import { CompletionScreen } from "./completion-screen"
import React from "react"
import { quizSaveAnswer } from "@/actions/interview.action"

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
}

interface InterviewContentProps {
  interview: Interview
  currentQuestionIndex: number
  answers: Record<string, any>
  timeLeft: number
  isRunning: boolean
  isCompleted: boolean
  onAnswerChange: (questionId: string, answer: any) => void
  onNextQuestion: () => void
  onPreviousQuestion: () => void
  onCompleteInterview: () => void
  calculateScore: () => number
  formatTime: (seconds: number) => string
  isSaving?: boolean
  saveError?: Error | null
}

export function InterviewContent({
  interview,
  currentQuestionIndex,
  answers,
  timeLeft,
  isRunning,
  isCompleted,
  onAnswerChange,
  onNextQuestion,
  onPreviousQuestion,
  onCompleteInterview,
  calculateScore,
  formatTime,
  isSaving,
  saveError,
}: InterviewContentProps) {
  const [saving, setSaving] = React.useState(false)
  const [saveErr, setSaveErr] = React.useState<Error | null>(null)
  const hasSavedRef = React.useRef(false)

  // Enregistrer automatiquement le résultat quand l'interview est complétée
  React.useEffect(() => {
    const save = async () => {
      try {
        setSaving(true)
        setSaveErr(null)
        const payload = {
          quizId: interview.id,
          answers: answers,
          timeSpent: Math.max(0, (interview.duration || 0) - (timeLeft || 0)),
          score: calculateScore(),
        }
        await quizSaveAnswer(payload)
        setSaving(false)
      } catch (e: any) {
        setSaving(false)
        setSaveErr(new Error(e?.message || "Erreur lors de l'enregistrement"))
      }
    }

    if (isCompleted && !hasSavedRef.current) {
      hasSavedRef.current = true
      void save()
    }
  }, [isCompleted, interview.id, answers, timeLeft, calculateScore])
  // Completion screen
  if (isCompleted) {
    return (
      <CompletionScreen interview={interview} score={calculateScore()} timeLeft={timeLeft} formatTime={formatTime} />
    )
  }

  // Normaliser les types de question pour supporter plusieurs formats
  const rawQuestion = interview.questions[currentQuestionIndex]
  const normalizedType = ((): Question["type"] => {
    const t = (rawQuestion as any)?.type
    if (t === "multiple_choice" || t === "multiple-choice") return "multiple-choice"
    if (t === "coding") return "coding"
    if (t === "open-ended" || t === "text" || t === "scenario") return "open-ended"
    return "multiple-choice"
  })()
  const currentQuestion: Question = {
    id: rawQuestion.id,
    question: (rawQuestion as any).question,
    type: normalizedType,
    points: (rawQuestion as any).points ?? 0,
    options: (rawQuestion as any).options,
    correctAnswer: typeof (rawQuestion as any).correctAnswer === 'number' ? (rawQuestion as any).correctAnswer : undefined,
    codeTemplate: (rawQuestion as any).codeSnippet || (rawQuestion as any).codeTemplate,
    expectedOutput: (rawQuestion as any).expectedOutput,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <InterviewHeader interview={interview} timeLeft={timeLeft} isRunning={isRunning} formatTime={formatTime} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {(saveError || saveErr) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {(saveError || saveErr)?.message}
          </div>
        )}

        <ProgressCard currentQuestionIndex={currentQuestionIndex} totalQuestions={interview.questions.length} />

        <QuestionCard
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswerChange={(answer) => onAnswerChange(currentQuestion.id, answer)}
        />

        <NavigationControls
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={interview.questions.length}
          onPrevious={onPreviousQuestion}
          onNext={onNextQuestion}
          isSaving={isSaving || saving}
        />
      </div>
    </div>
  )
}
