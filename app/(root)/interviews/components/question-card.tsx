"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestionRenderer } from "./question-renderer"

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

interface QuestionCardProps {
  question: Question
  answer: any
  onAnswerChange: (answer: any) => void
}

export function QuestionCard({ question, answer, onAnswerChange }: QuestionCardProps) {
  return (
    <Card className="mb-4 sm:mb-6 border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700/50 dark:to-slate-600/50 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl leading-relaxed text-gray-900 dark:text-white">{question.question}</CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <span>{question.points} points</span>
          {question.type === "coding" && (
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700 shadow-sm text-xs">
              Coding Challenge
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="bg-white/50 dark:bg-slate-800/50 p-4 sm:p-6">
        <QuestionRenderer question={question} answer={answer} onAnswerChange={onAnswerChange} />
      </CardContent>
    </Card>
  )
}
