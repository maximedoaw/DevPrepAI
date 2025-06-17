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
    <Card className="mb-6 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{question.points} points</span>
          {question.type === "coding" && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Coding Challenge
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <QuestionRenderer question={question} answer={answer} onAnswerChange={onAnswerChange} />
      </CardContent>
    </Card>
  )
}
