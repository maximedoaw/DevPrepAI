"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestionRenderer } from "./question-renderer"
import { cn } from "@/lib/utils"

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
  isTechnical?: boolean
}

export function QuestionCard({ question, answer, onAnswerChange, isTechnical }: QuestionCardProps) {
  return (
    <Card className={cn(
      "mb-4 sm:mb-6 border-0 shadow-xl overflow-hidden transition-all duration-300",
      isTechnical ? "bg-emerald-50/10 dark:bg-emerald-950/5 ring-1 ring-emerald-500/10" : "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
    )}>
      <CardHeader className={cn(
        "border-b p-4 sm:p-6",
        isTechnical
          ? "border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-transparent"
          : "border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700/50 dark:to-slate-600/50"
      )}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em]",
              isTechnical ? "text-emerald-500" : "text-slate-400"
            )}>
              Question de réflexion
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn(
                "font-black text-[10px] px-2 py-0.5 uppercase tracking-widest border-none rounded-lg",
                isTechnical ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                {question.points} points
              </Badge>
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-black leading-tight text-slate-900 dark:text-white">
            {question.question}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-8">
        <QuestionRenderer question={question} answer={answer} onAnswerChange={onAnswerChange} />
      </CardContent>
    </Card>
  )
}
