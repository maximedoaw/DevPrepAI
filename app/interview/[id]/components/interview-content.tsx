"use client"

import { InterviewHeader } from "./interview-header"
import { ProgressCard } from "./progress-card"
import { QuestionCard } from "./question-card"
import { NavigationControls } from "./navigation-controls"
import { CompletionScreen } from "./completion-screen"

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
  // Completion screen
  if (isCompleted) {
    return (
      <CompletionScreen interview={interview} score={calculateScore()} timeLeft={timeLeft} formatTime={formatTime} />
    )
  }

  const currentQuestion = interview.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <InterviewHeader interview={interview} timeLeft={timeLeft} isRunning={isRunning} formatTime={formatTime} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {saveError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {saveError.message}
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
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}
