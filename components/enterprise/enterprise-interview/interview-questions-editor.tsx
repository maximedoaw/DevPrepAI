"use client"

import { useState } from "react"
import { Plus, Trash2, Code, FileText, MessageSquare, ChevronDown, ChevronUp, Save } from "lucide-react"
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

interface InterviewQuestionsEditorProps {
  quizType: 'QCM' | 'TECHNICAL' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS'
  questions: Question[]
  onQuestionsChange: (questions: Question[]) => void
  onSave?: () => void
  isSaving?: boolean
  totalPoints?: number // Total de points attendu pour le test
}

export function InterviewQuestionsEditor({ 
  quizType, 
  questions, 
  onQuestionsChange, 
  onSave,
  isSaving = false,
  totalPoints
}: InterviewQuestionsEditorProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions)
  
  // Calculer la somme des points
  const totalQuestionsPoints = localQuestions.reduce((sum, q) => sum + (q.points || 0), 0)
  const pointsDifference = totalPoints ? totalPoints - totalQuestionsPoints : 0

  const getQuestionTypeConfig = () => {
    switch (quizType) {
      case 'QCM':
        return {
          type: 'multiple_choice' as const,
          title: 'Questions à Choix Multiple',
          icon: FileText,
          description: 'Modifiez les questions avec plusieurs choix de réponse'
        }
      case 'TECHNICAL':
        return {
          type: 'coding' as const,
          title: 'Questions de Codage',
          icon: Code,
          description: 'Éditez les exercices de programmation'
        }
      case 'MOCK_INTERVIEW':
      case 'SOFT_SKILLS':
        return {
          type: 'scenario' as const,
          title: 'Questions de Scénario',
          icon: MessageSquare,
          description: 'Modifiez les situations professionnelles'
        }
      default:
        return {
          type: 'multiple_choice' as const,
          title: 'Questions',
          icon: FileText,
          description: 'Éditez les questions du test'
        }
    }
  }

  const config = getQuestionTypeConfig()

  // Synchroniser les questions locales avec les props
  const syncQuestions = (updatedQuestions: Question[]) => {
    setLocalQuestions(updatedQuestions)
    onQuestionsChange(updatedQuestions)
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: config.type,
      points: 10,
      question: '',
      correctAnswer: '',
      explanation: '',
      ...(config.type === 'multiple_choice' && { 
        options: ['Option A', 'Option B', 'Option C', 'Option D'] 
      }),
      ...(config.type === 'coding' && { codeSnippet: '// Votre code ici\n' })
    }
    const updatedQuestions = [...localQuestions, newQuestion]
    syncQuestions(updatedQuestions)
    setExpandedQuestion(newQuestion.id)
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const updatedQuestions = localQuestions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    )
    syncQuestions(updatedQuestions)
  }

  const deleteQuestion = (id: string) => {
    const updatedQuestions = localQuestions.filter(q => q.id !== id)
    syncQuestions(updatedQuestions)
    if (expandedQuestion === id) {
      setExpandedQuestion(null)
    }
  }

  const updateOption = (questionId: string, index: number, value: string) => {
    const question = localQuestions.find(q => q.id === questionId)
    if (question && question.options) {
      const newOptions = [...question.options]
      newOptions[index] = value
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId)
  }

  const isValidOption = (option: string) => {
    return option && option.trim() !== ''
  }

  const getValidOptions = (options: string[] = []) => {
    return options.filter(option => isValidOption(option))
  }

  const renderMultipleChoiceQuestion = (question: Question) => {
    const validOptions = getValidOptions(question.options)
    const hasValidOptions = validOptions.length > 0

    return (
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
                <Badge variant="outline" className="w-8 h-8 flex items-center justify-center shrink-0">
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
          <p className="text-xs text-slate-500">
            Toutes les options doivent être remplies pour pouvoir sélectionner une réponse correcte
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`correct-answer-${question.id}`}>Réponse correcte *</Label>
          {hasValidOptions ? (
            <Select
              value={question.correctAnswer}
              onValueChange={(value) => updateQuestion(question.id, { correctAnswer: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez la bonne réponse" />
              </SelectTrigger>
              <SelectContent>
                {validOptions.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {String.fromCharCode(65 + index)}: {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Veuillez d'abord remplir toutes les options de réponse
              </p>
            </div>
          )}
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
  }

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

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton de sauvegarde */}
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
        <div className="flex gap-2">
          <Button onClick={addQuestion} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle question
          </Button>
          {onSave && (
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Liste des questions */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {localQuestions.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600">
            <CardContent className="text-center py-12">
              <config.icon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Aucune question configurée
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Commencez par ajouter votre première question
              </p>
              <Button onClick={addQuestion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une question
              </Button>
            </CardContent>
          </Card>
        ) : (
          localQuestions.map((question, index) => (
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
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {question.question || `Question ${index + 1}`}
                      </CardTitle>
                      {question.question && (
                        <p className="text-sm text-slate-500 truncate">
                          {question.question}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
      {localQuestions.length > 0 && (
        <Card className={`bg-slate-50 dark:bg-slate-800/50 border-l-4 ${
          totalPoints 
            ? pointsDifference === 0 
              ? 'border-l-green-500' 
              : pointsDifference > 0 
              ? 'border-l-amber-500' 
              : 'border-l-red-500'
            : 'border-l-green-500'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {localQuestions.length} question{localQuestions.length > 1 ? 's' : ''} configurée{localQuestions.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {totalPoints 
                    ? `Total: ${totalQuestionsPoints}/${totalPoints} points`
                    : `Total: ${totalQuestionsPoints} points`
                  }
                </p>
                {totalPoints && pointsDifference !== 0 && (
                  <p className={`text-xs mt-1 ${
                    pointsDifference > 0 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {pointsDifference > 0 
                      ? `${pointsDifference} point${pointsDifference > 1 ? 's' : ''} manquant${pointsDifference > 1 ? 's' : ''}`
                      : `${Math.abs(pointsDifference)} point${Math.abs(pointsDifference) > 1 ? 's' : ''} en trop`
                    }
                  </p>
                )}
              </div>
              <Badge variant="secondary" className={`text-lg ${
                totalPoints && pointsDifference === 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                  : totalPoints && pointsDifference > 0
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                  : totalPoints && pointsDifference < 0
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
              }`}>
                {totalPoints ? `${totalQuestionsPoints}/${totalPoints}` : totalQuestionsPoints} pts
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}