"use client"

import { useState } from "react"
import { Plus, Trash2, Code, FileText, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"

interface Question {
  id: string
  type: 'multiple_choice' | 'coding' | 'scenario'
  points: number
  question: string
  explanation?: string
  correctAnswer: string
  options?: string[]
  codeSnippet?: string
}

interface InterviewBuilderProps {
  quizType: 'QCM' | 'TECHNICAL' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS'
  questions: Question[]
  onQuestionsChange: (questions: Question[]) => void
}

export function InterviewBuilder({ quizType, questions, onQuestionsChange }: InterviewBuilderProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  const getQuestionTypeConfig = () => {
    switch (quizType) {
      case 'QCM':
        return {
          type: 'multiple_choice' as const,
          title: 'Questions à Choix Multiple',
          icon: FileText,
          description: 'Ajoutez des questions avec plusieurs choix de réponse'
        }
      case 'TECHNICAL':
        return {
          type: 'coding' as const,
          title: 'Questions de Codage',
          icon: Code,
          description: 'Créez des exercices de programmation avec éditeur de code'
        }
      case 'MOCK_INTERVIEW':
      case 'SOFT_SKILLS':
        return {
          type: 'scenario' as const,
          title: 'Questions de Scénario',
          icon: MessageSquare,
          description: 'Définissez des situations professionnelles à analyser'
        }
      default:
        return {
          type: 'multiple_choice' as const,
          title: 'Questions',
          icon: FileText,
          description: 'Ajoutez des questions au test'
        }
    }
  }

  const config = getQuestionTypeConfig()

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: config.type,
      points: 10,
      question: '',
      correctAnswer: '',
      explanation: '',
      ...(config.type === 'multiple_choice' && { options: ['', '', '', ''] }),
      ...(config.type === 'coding' && { codeSnippet: '// Votre code ici\n' })
    }
    onQuestionsChange([...questions, newQuestion])
    setExpandedQuestion(newQuestion.id)
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onQuestionsChange(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const deleteQuestion = (id: string) => {
    onQuestionsChange(questions.filter(q => q.id !== id))
    if (expandedQuestion === id) {
      setExpandedQuestion(null)
    }
  }

  const updateOption = (questionId: string, index: number, value: string) => {
    const question = questions.find(q => q.id === questionId)
    if (question && question.options) {
      const newOptions = [...question.options]
      newOptions[index] = value
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId)
  }

  const renderMultipleChoiceQuestion = (question: Question) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`question-${question.id}`}>Question *</Label>
        <Textarea
          id={`question-${question.id}`}
          placeholder="Entrez la question..."
          value={question.question}
          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Options de réponse *</Label>
        <div className="grid gap-2">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                {String.fromCharCode(65 + index)}
              </Badge>
              <Input
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => updateOption(question.id, index, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`correct-answer-${question.id}`}>Réponse correcte *</Label>
        <Select
          value={question.correctAnswer}
          onValueChange={(value) => updateQuestion(question.id, { correctAnswer: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez la bonne réponse" />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option, index) => (
              <SelectItem key={index} value={option}>
                {String.fromCharCode(65 + index)}: {option || `Option ${String.fromCharCode(65 + index)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`explanation-${question.id}`}>Explication</Label>
        <Textarea
          id={`explanation-${question.id}`}
          placeholder="Expliquez pourquoi cette réponse est correcte..."
          value={question.explanation || ''}
          onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  )

  const renderCodingQuestion = (question: Question) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`question-${question.id}`}>Énoncé du problème *</Label>
        <Textarea
          id={`question-${question.id}`}
          placeholder="Décrivez l'exercice de programmation..."
          value={question.question}
          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`code-snippet-${question.id}`}>Squelette de code</Label>
        <div className="border rounded-lg overflow-hidden">
          <CodeMirror
            value={question.codeSnippet || ''}
            height="200px"
            extensions={[javascript()]}
            theme={oneDark}
            onChange={(value) => updateQuestion(question.id, { codeSnippet: value })}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`correct-answer-${question.id}`}>Solution attendue *</Label>
        <div className="border rounded-lg overflow-hidden">
          <CodeMirror
            value={question.correctAnswer}
            height="200px"
            extensions={[javascript()]}
            theme={oneDark}
            onChange={(value) => updateQuestion(question.id, { correctAnswer: value })}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`explanation-${question.id}`}>Explication</Label>
        <Textarea
          id={`explanation-${question.id}`}
          placeholder="Expliquez la solution et les concepts clés..."
          value={question.explanation || ''}
          onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  )

  const renderScenarioQuestion = (question: Question) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`question-${question.id}`}>Scénario *</Label>
        <Textarea
          id={`question-${question.id}`}
          placeholder="Décrivez la situation professionnelle..."
          value={question.question}
          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`correct-answer-${question.id}`}>Réponse attendue *</Label>
        <Textarea
          id={`correct-answer-${question.id}`}
          placeholder="Décrivez la réponse idéale ou les points clés à aborder..."
          value={question.correctAnswer}
          onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`explanation-${question.id}`}>Critères d'évaluation</Label>
        <Textarea
          id={`explanation-${question.id}`}
          placeholder="Listez les compétences évaluées et les critères de notation..."
          value={question.explanation || ''}
          onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  )

  const renderQuestionContent = (question: Question) => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoiceQuestion(question)
      case 'coding':
        return renderCodingQuestion(question)
      case 'scenario':
        return renderScenarioQuestion(question)
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <config.icon className="w-5 h-5" />
            {config.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {config.description}
          </p>
        </div>
        <Button onClick={addQuestion} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une question
        </Button>
      </div>

      {/* Liste des questions */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {questions.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600">
            <CardContent className="text-center py-12">
              <config.icon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Aucune question ajoutée
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Commencez par ajouter votre première question
              </p>
              <Button onClick={addQuestion} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une question
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id} className="border border-slate-200 dark:border-slate-700">
              <CardHeader 
                className="pb-3 cursor-pointer" 
                onClick={() => toggleQuestion(question.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <CardTitle className="text-base">
                      {question.question || `Question ${index + 1}`}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      {question.points} pts
                    </Badge>
                    {expandedQuestion === question.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedQuestion === question.id && (
                <CardContent className="space-y-4 pt-0">
                  {/* Points */}
                  <div className="flex items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={`points-${question.id}`}>Points</Label>
                      <Input
                        id={`points-${question.id}`}
                        type="number"
                        min="1"
                        max="100"
                        value={question.points}
                        onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  {/* Contenu de la question */}
                  {renderQuestionContent(question)}

                  {/* Actions */}
                  <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Résumé */}
      {questions.length > 0 && (
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {questions.length} question{questions.length > 1 ? 's' : ''} ajoutée{questions.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total: {questions.reduce((sum, q) => sum + q.points, 0)} points
                </p>
              </div>
              <Badge variant="secondary" className="text-lg">
                {questions.reduce((sum, q) => sum + q.points, 0)} pts
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}