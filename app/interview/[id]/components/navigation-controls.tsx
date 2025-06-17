"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"

interface NavigationControlsProps {
  currentQuestionIndex: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  isSaving?: boolean
}

export function NavigationControls({
  currentQuestionIndex,
  totalQuestions,
  onPrevious,
  onNext,
  isSaving,
}: NavigationControlsProps) {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onPrevious} disabled={currentQuestionIndex === 0 || isSaving} className="px-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Précédent
      </Button>
      <Button
        onClick={onNext}
        disabled={isSaving}
        className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        {isLastQuestion ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {isSaving ? "Sauvegarde..." : "Terminer"}
          </>
        ) : (
          <>
            Suivant
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </>
        )}
      </Button>
    </div>
  )
}
