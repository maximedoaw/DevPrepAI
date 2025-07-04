"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressCardProps {
  currentQuestionIndex: number
  totalQuestions: number
}

export function ProgressCard({ currentQuestionIndex, totalQuestions }: ProgressCardProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex justify-between text-sm mb-3">
          <span className="font-medium">
            Question {currentQuestionIndex + 1} sur {totalQuestions}
          </span>
          <span className="text-gray-600">{Math.round(progress)}% complété</span>
        </div>
        <Progress value={progress} className="h-3" />
      </CardContent>
    </Card>
  )
}
