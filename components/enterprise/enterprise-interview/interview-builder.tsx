"use client"

import { useState, useEffect } from "react"
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
  type: 'multiple_choice' | 'coding' | 'scenario' | 'practical'
  points: number
  question: string
  title?: string // Titre optionnel pour les exercices pratiques
  explanation?: string
  correctAnswer: string
  options?: string[]
  codeSnippet?: string // Optionnel pour les exercices pratiques
  examples?: Array<{ input?: string; output?: string; [key: string]: any }> // Exemples pour les exercices pratiques
  competencies?: string[]
}

interface InterviewBuilderProps {
  quizType: 'QCM' | 'TECHNICAL' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS'
  domain?: string // Domaine du quiz (pour adapter l'interface TECHNICAL)
  questions: Question[]
  onQuestionsChange: (questions: Question[]) => void
  totalPoints?: number // Total de points attendu pour le test
}

export function InterviewBuilder({ quizType, domain, questions, onQuestionsChange, totalPoints }: InterviewBuilderProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  
  // Calculer la somme des points
  const totalQuestionsPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)
  const pointsDifference = totalPoints ? totalPoints - totalQuestionsPoints : 0

  // Déterminer si le domaine nécessite un éditeur de code
  const isTechnicalDomain = (domain?: string): boolean => {
    if (!domain) return true; // Par défaut, considérer comme technique
    const technicalDomains = [
      'DEVELOPMENT', 'WEB', 'MOBILE', 'DEVOPS', 'CYBERSECURITY', 
      'MACHINE_LEARNING', 'DATA_SCIENCE', 'ARCHITECTURE'
    ];
    return technicalDomains.includes(domain);
  };

  const requiresCodeEditor = quizType === 'TECHNICAL' && isTechnicalDomain(domain);

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
        if (requiresCodeEditor) {
          return {
            type: 'coding' as const,
            title: 'Exercices de Programmation',
            icon: Code,
            description: 'Créez des exercices de programmation avec éditeur de code'
          }
        } else {
          return {
            type: 'practical' as const,
            title: 'Exercices Pratiques',
            icon: FileText,
            description: 'Créez des exercices pratiques ou des mini-projets adaptés au domaine'
          }
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
      ...(config.type === 'multiple_choice' && { 
        options: ['Option A', 'Option B', 'Option C', 'Option D'] 
      }),
      ...(config.type === 'coding' && { codeSnippet: '// Votre code ici\n' }),
      ...(config.type === 'practical' && { 
        title: '',
        examples: [{ input: '', output: '' }]
      }),
      ...(config.type === 'scenario' && { competencies: [] }),
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

  // Fonction pour vérifier si une option est valide (non vide)
  const isValidOption = (option: string) => {
    return option && option.trim() !== ''
  }

  // Fonction pour obtenir les options valides pour le Select
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
            className="resize-none"
            maxLength={500}
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
                  className="truncate"
                  maxLength={200}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
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
                  <SelectItem key={index} value={option} className="truncate max-w-[300px]">
                    <span className="truncate">{String.fromCharCode(65 + index)}: {option}</span>
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
            className="resize-none"
            maxLength={500}
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
          className="resize-none"
          maxLength={500}
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
          className="resize-none"
          maxLength={500}
        />
      </div>
    </div>
  )

  const renderPracticalQuestion = (question: Question) => {
    const examples = question.examples || [{ input: '', output: '' }];

    const updateExample = (index: number, field: 'input' | 'output', value: string) => {
      const newExamples = [...examples];
      if (!newExamples[index]) {
        newExamples[index] = { input: '', output: '' };
      }
      newExamples[index][field] = value;
      updateQuestion(question.id, { examples: newExamples });
    };

    const addExample = () => {
      updateQuestion(question.id, { examples: [...examples, { input: '', output: '' }] });
    };

    const removeExample = (index: number) => {
      const newExamples = examples.filter((_, i) => i !== index);
      updateQuestion(question.id, { examples: newExamples.length > 0 ? newExamples : [{ input: '', output: '' }] });
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`title-${question.id}`}>Titre de l'exercice (optionnel)</Label>
          <Input
            id={`title-${question.id}`}
            placeholder="Ex: Créer une maquette de landing page"
            value={question.title || ''}
            onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`}>Énoncé de l'exercice / Projet *</Label>
          <Textarea
            id={`question-${question.id}`}
            placeholder="Décrivez l'exercice pratique, le projet ou la tâche à réaliser..."
            value={question.question}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            rows={4}
            className="resize-none"
            maxLength={1000}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`code-snippet-${question.id}`}>Contexte / Template (optionnel)</Label>
          <Textarea
            id={`code-snippet-${question.id}`}
            placeholder="Fournissez un contexte, un template, des données de départ, ou laissez vide si non applicable..."
            value={question.codeSnippet || ''}
            onChange={(e) => updateQuestion(question.id, { codeSnippet: e.target.value })}
            rows={3}
            className="resize-none font-mono text-sm"
            maxLength={500}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Peut contenir du code, des données, un template, ou tout autre contexte nécessaire
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Exemples / Cas d'usage (optionnel)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExample}
            >
              <Plus className="w-3 h-3 mr-1" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Contexte / Input / Données d'entrée"
                    value={example.input || ''}
                    onChange={(e) => updateExample(index, 'input', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Résultat attendu / Output / Livrable"
                    value={example.output || ''}
                    onChange={(e) => updateExample(index, 'output', e.target.value)}
                    className="text-sm"
                  />
                </div>
                {examples.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExample(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`correct-answer-${question.id}`}>Solution attendue / Critères d'évaluation *</Label>
          <Textarea
            id={`correct-answer-${question.id}`}
            placeholder="Décrivez la solution attendue, les critères d'évaluation, ou le livrable attendu..."
            value={question.correctAnswer}
            onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
            rows={4}
            className="resize-none"
            maxLength={1000}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`explanation-${question.id}`}>Explication / Critères de réussite</Label>
          <Textarea
            id={`explanation-${question.id}`}
            placeholder="Expliquez la solution, les critères de réussite, ou les points clés à évaluer..."
            value={question.explanation || ''}
            onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
            rows={3}
            className="resize-none"
            maxLength={500}
          />
        </div>
      </div>
    );
  };

  const renderScenarioQuestion = (question: Question) => {
    const competencies = question.competencies || []

    const updateCompetency = (index: number, value: string) => {
      const updated = [...competencies]
      updated[index] = value
      updateQuestion(question.id, { competencies: updated })
    }

    const addCompetency = () => {
      updateQuestion(question.id, { competencies: [...competencies, ''] })
    }

    const removeCompetency = (index: number) => {
      const updated = competencies.filter((_, i) => i !== index)
      updateQuestion(question.id, { competencies: updated })
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`}>Scénario *</Label>
          <Textarea
            id={`question-${question.id}`}
            placeholder="Décrivez la situation professionnelle..."
            value={question.question}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            rows={3}
            className="resize-none"
            maxLength={500}
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
            className="resize-none"
            maxLength={1000}
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
            className="resize-none"
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Compétences ciblées</Label>
            <Button type="button" variant="outline" size="sm" onClick={addCompetency}>
              <Plus className="w-3 h-3 mr-1" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {competencies.length > 0 ? (
              competencies.map((competency, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Ex: Leadership, Architecture logicielle"
                    value={competency}
                    onChange={(e) => updateCompetency(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCompetency(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajoutez les compétences ou thématiques clés à explorer pendant l'entretien.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderQuestionContent = (question: Question) => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoiceQuestion(question)
      case 'coding':
        return renderCodingQuestion(question)
      case 'practical':
        return renderPracticalQuestion(question)
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

      {/* Affichage du total des points si totalPoints est fourni */}
      {totalPoints && (
        <div className={`p-3 rounded-lg border text-sm ${
          pointsDifference === 0 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
            : pointsDifference > 0
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Points: {totalQuestionsPoints}/{totalPoints}
            </span>
            {pointsDifference === 0 ? (
              <span className="text-xs">✓ Équilibré</span>
            ) : pointsDifference > 0 ? (
              <span className="text-xs">{pointsDifference} point{pointsDifference > 1 ? 's' : ''} manquant{pointsDifference > 1 ? 's' : ''}</span>
            ) : (
              <span className="text-xs">{Math.abs(pointsDifference)} point{Math.abs(pointsDifference) > 1 ? 's' : ''} en trop</span>
            )}
          </div>
        </div>
      )}

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
            <Card key={question.id} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
              <CardHeader 
                className="pb-3 cursor-pointer" 
                onClick={() => toggleQuestion(question.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center shrink-0">
                      {index + 1}
                    </Badge>
                    <CardTitle className="text-base line-clamp-2 min-w-0">
                      {question.question || `Question ${index + 1}`}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      {question.points} pts
                    </Badge>
                    {expandedQuestion === question.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
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
        <Card className={`bg-slate-50 dark:bg-slate-800/50 ${
          totalPoints && pointsDifference === 0 ? 'border-l-4 border-l-green-500' : ''
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {questions.length} question{questions.length > 1 ? 's' : ''} ajoutée{questions.length > 1 ? 's' : ''}
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
                  : ''
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