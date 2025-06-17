"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/interviews/code-editor"

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

interface QuestionRendererProps {
  question: Question
  answer: any
  onAnswerChange: (answer: any) => void
}

export function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  switch (question.type) {
    case "multiple-choice":
      return (
        <div className="space-y-3">
          <RadioGroup value={answer?.toString()} onValueChange={(value) => onAnswerChange(Number.parseInt(value))}>
            {question.options?.map((option: string, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 text-sm">
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
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">Sortie attendue :</div>
              <code className="text-blue-700">{question.expectedOutput}</code>
            </div>
          )}
        </div>
      )

    case "open-ended":
      return (
        <Textarea
          value={answer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Tapez votre réponse détaillée ici..."
          className="min-h-40 resize-none"
        />
      )

    default:
      return <div>Type de question non supporté</div>
  }
}
