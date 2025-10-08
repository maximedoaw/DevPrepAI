"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/interviews/code-editor"
import { AnswerHelper } from "./answer-helper"
import { useState } from "react"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "coding" | "open-ended"
  points: number
  options?: string[]
  correctAnswer?: any // Peut être number, string, etc.
  codeTemplate?: string
  expectedOutput?: string
  explanation?: string
}

interface QuestionRendererProps {
  question: Question
  answer: any
  onAnswerChange: (answer: any) => void
}

export function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  const [showAnswer, setShowAnswer] = useState(false)

  // Déterminer si on peut afficher l'aide pour ce type de question
  const canShowHelp = ["multiple-choice", "coding", "open-ended", "scenario"].includes(question.type)

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  // Rendu du contenu principal de la question
  const renderQuestionContent = () => {
    switch (question.type) {
    case "multiple-choice":
      return (
        <div className="space-y-2 sm:space-y-3">
        <RadioGroup value={answer?.toString()} onValueChange={(value) => onAnswerChange(Number.parseInt(value))}>
          {question.options?.map((option: string, index: number) => (
            <div
              key={index}
              className={`flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg transition-all duration-200 border shadow-sm hover:shadow-md cursor-pointer ${
                answer === index 
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700" 
                  : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-blue-300/50 dark:hover:border-slate-500"
              }`}
            >
              <RadioGroupItem 
                value={index.toString()} 
                id={`option-${index}`}
                className="border-slate-300 dark:border-slate-600 mt-0.5 flex-shrink-0"
              />
              <Label 
                htmlFor={`option-${index}`} 
                className="cursor-pointer flex-1 text-xs sm:text-sm text-gray-900 dark:text-white font-medium leading-relaxed"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
        </div>
      )

    case "coding":
      return (
        <div className="space-y-4">
          <CodeEditor value={answer || question.codeTemplate || ""} onChange={onAnswerChange} language="javascript" />
          {question.expectedOutput && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Sortie attendue :</div>
              <code className="text-blue-700 dark:text-blue-300">{question.expectedOutput}</code>
            </div>
          )}
        </div>
      )

    case "open-ended":
      return (
        <div className="space-y-3">
          <Textarea
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Tapez votre réponse détaillée ici..."
            className="min-h-32 sm:min-h-40 resize-none bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm text-sm sm:text-base"
          />
          {question.expectedOutput && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                <strong>Indice:</strong> {question.expectedOutput}
              </p>
            </div>
          )}
        </div>
      )

    default:
      return <div className="text-gray-600 dark:text-gray-400">Type de question non supporté</div>
    }
  }

  return (
    <div className="space-y-4">
      {/* Contenu principal de la question */}
      {renderQuestionContent()}

      {/* Aide aux réponses pour les types supportés */}
      {canShowHelp && (
        <AnswerHelper
          question={question}
          userAnswer={answer}
          showAnswer={showAnswer}
          onToggleAnswer={toggleAnswer}
        />
      )}
    </div>
  )
}
