"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Lightbulb, CheckCircle, XCircle, Code, MessageSquare } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { extractCorrectAnswer, formatCorrectAnswer, isAnswerCorrect } from "@/lib/answer-extractor"
import { testWithRealData } from "@/lib/answer-debug"

interface AnswerHelperProps {
  question: {
    id: string
    question: string
    type: "multiple-choice" | "coding" | "open-ended" | "scenario"
    points: number
    options?: string[]
    correctAnswer?: number
    codeTemplate?: string
    expectedOutput?: string
    explanation?: string
  }
  userAnswer?: any
  showAnswer: boolean
  onToggleAnswer: () => void
}

export function AnswerHelper({ question, userAnswer, showAnswer, onToggleAnswer }: AnswerHelperProps) {
  // Debug: afficher les données brutes
  console.log("🔍 AnswerHelper - Raw question data:", question)
  
  // Test avec les données réelles
  const debugResult = testWithRealData(question)
  
  // Extraire la réponse correcte depuis les données de la question
  const extractedAnswer = extractCorrectAnswer(question)
  console.log("🔍 AnswerHelper - Extracted answer:", extractedAnswer)
  
  const isCorrect = isAnswerCorrect(extractedAnswer, userAnswer)

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return <CheckCircle className="h-4 w-4" />
      case "coding":
        return <Code className="h-4 w-4" />
      case "open-ended":
      case "scenario":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700"
      case "coding":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700"
      case "open-ended":
      case "scenario":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    }
  }

  const renderCorrectAnswer = () => {
    const correctAnswerText = formatCorrectAnswer(extractedAnswer)
    
    // Fallback: si l'extraction ne fonctionne pas, afficher les données brutes
    const fallbackAnswer = question.correctAnswer || "Réponse non définie"
    const fallbackExplanation = question.explanation || "Aucune explication disponible"
    
    console.log("🔍 AnswerHelper - Rendering answer:", {
      extracted: correctAnswerText,
      fallback: fallbackAnswer,
      explanation: fallbackExplanation
    })
    
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-700 dark:text-green-300">Réponse correcte :</span>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <span className="font-medium text-green-800 dark:text-green-200">
                {correctAnswerText !== "Réponse non définie" ? correctAnswerText : fallbackAnswer}
              </span>
              {correctAnswerText === "Réponse non définie" && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Utilisation des données brutes
                </div>
              )}
            </div>
          </div>
        )

      case "coding":
        return (
          <div className="space-y-3">
            {extractedAnswer.expectedOutput && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">Sortie attendue :</span>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <code className="text-green-800 dark:text-green-200 font-mono text-sm">
                    {extractedAnswer.expectedOutput}
                  </code>
                </div>
              </div>
            )}
            {extractedAnswer.codeTemplate && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">Template suggéré :</span>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <pre className="text-blue-800 dark:text-blue-200 font-mono text-xs sm:text-sm whitespace-pre-wrap break-words">
                    {extractedAnswer.codeTemplate}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )

      case "open-ended":
      case "scenario":
        return (
          <div className="space-y-3">
            {correctAnswerText && correctAnswerText !== "Réponse modèle non définie" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">Réponse modèle :</span>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                    {correctAnswerText}
                  </p>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Conseils pour une bonne réponse :</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <ul className="text-amber-800 dark:text-amber-200 space-y-1 text-xs sm:text-sm">
                  <li>• Structurez votre réponse avec une introduction, développement et conclusion</li>
                  <li>• Utilisez des exemples concrets quand c'est possible</li>
                  <li>• Mentionnez les bonnes pratiques et considérations techniques</li>
                  <li>• Soyez précis et détaillé dans vos explications</li>
                </ul>
              </div>
            </div>
          </div>
        )
    }
    return null
  }

 

  return (
    <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-700/50 dark:to-slate-600/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
            {getQuestionIcon(question.type)}
            Aide et Réponses
          </CardTitle>
          <Badge className={`${getQuestionTypeColor(question.type)} shadow-sm text-xs`}>
            {question.type.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Bouton pour révéler/cacher la réponse */}
        <div className="flex justify-center">
          <Button
            onClick={onToggleAnswer}
            variant="outline"
            size="sm"
            className={`border-2 transition-all duration-200 text-xs sm:text-sm ${
              showAnswer 
                ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" 
                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            {showAnswer ? (
              <>
                <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Masquer la réponse</span>
                <span className="sm:hidden">Masquer</span>
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Voir la réponse</span>
                <span className="sm:hidden">Voir</span>
              </>
            )}
          </Button>
        </div>

        {/* Affichage de la réponse correcte si révélation activée */}
        {showAnswer && renderCorrectAnswer()}

        {/* Explication si disponible */}
        {(question.explanation || extractedAnswer.explanation) && showAnswer && (
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Explication :</strong> {question.explanation || extractedAnswer.explanation}
            </AlertDescription>
          </Alert>
        )}

        {/* Conseils généraux */}
        {!showAnswer && (
          <Alert className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <Lightbulb className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <AlertDescription className="text-gray-700 dark:text-gray-300">
              <strong>Conseil :</strong> Cliquez sur "Voir la réponse" pour obtenir de l'aide si vous êtes bloqué.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
