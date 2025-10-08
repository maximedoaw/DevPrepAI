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
    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
      <Button 
        variant="outline" 
        onClick={onPrevious} 
        disabled={currentQuestionIndex === 0 || isSaving} 
        className="px-4 sm:px-6 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm disabled:opacity-50 w-full sm:w-auto order-2 sm:order-1"
      >
        <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        <span className="text-sm sm:text-base">Précédent</span>
      </Button>
      <Button
        onClick={onNext}
        disabled={isSaving}
        className="px-4 sm:px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 w-full sm:w-auto order-1 sm:order-2"
      >
        {isLastQuestion ? (
          <>
            <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-sm sm:text-base">{isSaving ? "Sauvegarde..." : "Terminer"}</span>
          </>
        ) : (
          <>
            <span className="text-sm sm:text-base">Suivant</span>
            <ArrowLeft className="ml-2 h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
          </>
        )}
      </Button>
    </div>
  )
}
