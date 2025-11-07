"use client"

import { useState, useEffect } from "react"
import { FileText, Clock, Star, Plus, Search, Filter, Briefcase, ChevronRight, ChevronLeft, Settings, FileQuestion, Users, Target, Loader2, Check, Edit, Trash2, Table, Grid, Sparkles, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useUserJobQueries } from "@/hooks/use-job-queries"
import { useUserJobQuizzes } from "@/hooks/use-job-interview"

import { InterviewBuilder } from "./interview-builder"
import { InterviewQuestionsEditor } from "./interview-questions-editor"
import { Domain } from "@prisma/client"

interface Quiz {
  id: string
  title: string
  description: string
  type: 'QCM' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS' | 'TECHNICAL'
  domain: Domain
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR'
  technology: string[]
  skills?: string[]
  duration: number
  totalPoints: number
  company: string
  image?: string
  createdAt: string
  jobPostingId: string
  questions: Question[]
  settings: QuizSettings
}

interface Question {
  id: string
  text: string
  type: 'multiple_choice' | 'open_ended' | 'coding' | 'system_design'
  points: number
  options?: string[]
  correctAnswer?: string
  timeLimit?: number
  competencies?: string[]
}

interface QuizSettings {
  shuffleQuestions: boolean
  showResults: boolean
  allowRetry: boolean
  timeLimit: number
  passingScore: number
}

interface Position {
  id: string
  title: string
  department: string
  level: string
  status: 'OPEN' | 'CLOSED' | 'DRAFT'
}

interface QuizzesTabProps {
  quizzes: Quiz[]
  onCreateQuiz?: (quizData: any) => Promise<void>
  onUpdateQuiz?: (quizId: string, quizData: any) => Promise<void>
  onDeleteQuiz?: (quizId: string) => Promise<void>
  isLoading?: boolean
  isCreating?: boolean
}


// Composant Stepper pour la création de test
function QuizCreationStepper({ currentStep, onStepChange, isEdit = false }: { currentStep: number; onStepChange: (step: number) => void; isEdit?: boolean }) {
  const steps = [
    { number: 1, title: 'Général', icon: Settings },
    { number: 2, title: 'Questions', icon: FileQuestion },
    { number: 3, title: 'Paramètres', icon: Target },
    { number: 4, title: 'Poste', icon: Users }
  ]

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon
        const isActive = step.number === currentStep
        const isCompleted = step.number < currentStep
        
        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                ${isActive ? 'bg-green-600 border-green-600 text-white' : ''}
                ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                ${!isActive && !isCompleted ? 'border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400' : ''}
              `}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <span className={`
                text-xs mt-2 font-medium transition-colors
                ${isActive || isCompleted ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}
              `}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-4 transition-colors
                ${isCompleted ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Fonction utilitaire pour convertir les questions avant sauvegarde
const convertQuestionsBack = (questions: any[]): any[] => {
  return questions.map(q => {
    const baseQuestion = {
      id: q.id,
      text: q.question, // "question" redevient "text"
      type: q.type === 'scenario' ? 'open_ended' : (q.type === 'practical' ? 'technical' : q.type), // Reconvertir le type
      points: q.points,
      correctAnswer: q.correctAnswer,
      options: q.options,
      timeLimit: q.timeLimit
    };

    // Ajouter les champs spécifiques selon le type
    if (q.type === 'coding') {
      return {
        ...baseQuestion,
        codeSnippet: q.codeSnippet || ''
      };
    }

    if (q.type === 'practical') {
      return {
        ...baseQuestion,
        codeSnippet: q.codeSnippet || '',
        title: q.title || '',
        examples: q.examples || []
      };
    }

    return baseQuestion;
  })
}

// Composant Modal de création
function CreateQuizModal({ 
  open, 
  onOpenChange, 
  onCreateQuiz, 
  isCreating,
  availablePositions 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateQuiz: (quizData: any) => Promise<void>
  isCreating: boolean
  availablePositions: Position[]
}) {
  const [creationStep, setCreationStep] = useState(1)
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    type: 'QCM' as const,
    domain: 'DEVELOPMENT' as const,
    difficulty: 'JUNIOR' as const,
    technology: [] as string[],
    skills: [] as string[],
    duration: 30,
    totalPoints: 100,
    company: '',
    questions: [] as any[],
    settings: {
      shuffleQuestions: false,
      showResults: true,
      allowRetry: false,
      timeLimit: 0,
      passingScore: 70
    },
    jobPostingId: ''
  })

  // États pour la génération IA intégrée
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStep, setGenerationStep] = useState<string>('')
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [technologyInput, setTechnologyInput] = useState("")
  const [skillInput, setSkillInput] = useState("")

  const addTechnologyTag = () => {
    const value = technologyInput.trim()
    if (!value) return
    setNewQuiz((prev) => ({
      ...prev,
      technology: prev.technology.includes(value) ? prev.technology : [...prev.technology, value],
    }))
    setTechnologyInput("")
  }

  const removeTechnologyTag = (index: number) => {
    setNewQuiz((prev) => ({
      ...prev,
      technology: prev.technology.filter((_, i) => i !== index),
    }))
  }

  const addSkillTag = () => {
    const value = skillInput.trim()
    if (!value) return
    setNewQuiz((prev) => ({
      ...prev,
      skills: prev.skills?.includes(value) ? prev.skills : [...(prev.skills || []), value],
    }))
    setSkillInput("")
  }

  const removeSkillTag = (index: number) => {
    setNewQuiz((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index),
    }))
  }

  // Fonction pour générer avec l'IA
  const handleAIGenerate = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStep('Initialisation de la génération...')

    try {
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      setGenerationStep(`Génération du test ${newQuiz.type}...`)
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'generate-interview',
          quizType: newQuiz.type,
          domain: newQuiz.domain,
          difficulty: newQuiz.difficulty,
          numberOfQuestions,
          technology: newQuiz.technology,
          totalPoints: newQuiz.totalPoints,
          description: newQuiz.description || ''
        })
      })

      clearInterval(progressInterval)
      setGenerationProgress(95)
      setGenerationStep('Traitement de la réponse...')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la génération')
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error('Format de réponse invalide')
      }

      setGenerationProgress(100)
      setGenerationStep('Génération terminée !')

      // Convertir les questions au format attendu par InterviewBuilder
      // IMPORTANT: Pour QCM, convertir l'index de correctAnswer vers l'option elle-même
      
      // Déterminer si le domaine nécessite un éditeur de code
      const isTechnicalDomain = (domain?: string): boolean => {
        if (!domain) return true;
        const technicalDomains = [
          'DEVELOPMENT', 'WEB', 'MOBILE', 'DEVOPS', 'CYBERSECURITY', 
          'MACHINE_LEARNING', 'DATA_SCIENCE', 'ARCHITECTURE'
        ];
        return technicalDomains.includes(domain);
      };

      const requiresCodeEditor = (newQuiz.type as string) === 'TECHNICAL' && isTechnicalDomain(newQuiz.domain);

      const formattedQuestions = result.data.questions.map((q: any, index: number) => {
        const baseQuestion = {
          id: q.id || `q${index + 1}`,
          question: q.text || q.question,
          points: q.points || Math.floor(newQuiz.totalPoints / numberOfQuestions),
          explanation: q.explanation || ''
        }

        // Pour QCM : convertir l'index en option correspondante
        if ((newQuiz.type as string) === 'QCM' && q.options && Array.isArray(q.options)) {
          const correctAnswerIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(q.correctAnswer) || 0
          const correctOption = q.options[correctAnswerIndex] || q.options[0] || ''
          return { 
            ...baseQuestion,
            type: 'multiple_choice' as const,
            options: q.options,
            correctAnswer: correctOption // Utiliser l'option elle-même comme correctAnswer
          }
        }

        // Pour TECHNICAL : adapter selon le domaine
        const quizTypeStr = newQuiz.type as string;
        if (quizTypeStr === 'TECHNICAL') {
          if (requiresCodeEditor) {
            return { 
              ...baseQuestion,
              type: 'coding' as const,
              codeSnippet: q.codeSnippet || '',
              correctAnswer: q.correctAnswer || ''
            }
          } else {
            return {
              ...baseQuestion,
              type: 'practical' as const,
              title: q.title || '',
              codeSnippet: q.codeSnippet || '',
              examples: q.examples || [],
              correctAnswer: q.correctAnswer || ''
            }
          }
        }

        // Pour MOCK_INTERVIEW et SOFT_SKILLS
        return {
          ...baseQuestion,
          type: 'scenario' as const,
          correctAnswer: q.correctAnswer || '',
          competencies: Array.isArray(q.competencies) ? q.competencies : []
        }
      })

      // Mettre à jour le quiz avec les données générées
      setTimeout(() => {
        setNewQuiz(prev => ({
          ...prev,
          title: result.data.title || prev.title,
          description: result.data.description || prev.description,
          questions: formattedQuestions,
          totalPoints: formattedQuestions.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || prev.totalPoints
        }))
        setIsGenerating(false)
        setGenerationProgress(0)
        setGenerationStep('')
        toast.success(`Test généré avec succès: ${formattedQuestions.length} questions créées`)
      }, 500)

    } catch (error: any) {
      console.error("Erreur génération IA:", error)
      setIsGenerating(false)
      setGenerationProgress(0)
      setGenerationStep('')
      toast.error(error.message || 'Erreur lors de la génération du test')
    }
  }

  const handleCreate = async () => {
    try {
      if (!newQuiz.title || !newQuiz.company || !newQuiz.jobPostingId) {
        toast.error("Le titre, l'entreprise et le poste sont requis")
        return
      }

      // Vérifier que la somme des points correspond au total
      const totalQuestionsPoints = (newQuiz.questions || []).reduce((sum, q) => sum + (q.points || 0), 0);
      if (totalQuestionsPoints !== newQuiz.totalPoints) {
        toast.error(`La somme des points des questions (${totalQuestionsPoints}) doit correspondre au total (${newQuiz.totalPoints})`)
        return
      }

      if (newQuiz.questions.length === 0) {
        toast.error("Veuillez ajouter au moins une question")
        return
      }

      // Convertir les questions avant la sauvegarde
      const quizDataToSave = {
        ...newQuiz,
        questions: convertQuestionsBack(newQuiz.questions)
      }

      await onCreateQuiz(quizDataToSave)
      onOpenChange(false)
      setCreationStep(1)
      setNewQuiz({
        title: '',
        description: '',
        type: 'QCM',
        domain: 'DEVELOPMENT',
        difficulty: 'JUNIOR',
        technology: [],
        skills: [],
        duration: 30,
        totalPoints: 100,
        company: '',
        questions: [],
        settings: {
          shuffleQuestions: false,
          showResults: true,
          allowRetry: false,
          timeLimit: 0,
          passingScore: 70
        },
        jobPostingId: ''
      })
    } catch (error) {
      console.error("Erreur création:", error)
    }
  }

  const renderStep = () => {
    switch (creationStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-title">Titre du test *</Label>
                <Input
                  id="create-title"
                  placeholder="Ex: Test technique React Senior"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                  className="truncate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-company">Entreprise *</Label>
                <Input
                  id="create-company"
                  placeholder="Nom de l'entreprise"
                  value={newQuiz.company}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, company: e.target.value }))}
                  className="truncate"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                placeholder="Décrivez l'objectif et le contenu de ce test..."
                value={newQuiz.description}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-type">Type de test *</Label>
                <Select value={newQuiz.type} onValueChange={(value: any) => setNewQuiz(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QCM">QCM</SelectItem>
                    <SelectItem value="TECHNICAL">Test Technique</SelectItem>
                    <SelectItem value="MOCK_INTERVIEW">Simulation d'entretien</SelectItem>
                    <SelectItem value="SOFT_SKILLS">Compétences comportementales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-domain">Domaine *</Label>
                <Select value={newQuiz.domain} onValueChange={(value: any) => setNewQuiz(prev => ({ ...prev, domain: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MACHINE_LEARNING">Machine Learning</SelectItem>
                    <SelectItem value="DEVELOPMENT">Développement</SelectItem>
                    <SelectItem value="DATA_SCIENCE">Data Science</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="ENGINEERING">Ingénierie</SelectItem>
                    <SelectItem value="DESIGN">Design</SelectItem>
                    <SelectItem value="DEVOPS">DevOps</SelectItem>
                    <SelectItem value="CYBERSECURITY">Cybersécurité</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="PRODUCT">Produit</SelectItem>
                    <SelectItem value="ARCHITECTURE">Architecture</SelectItem>
                    <SelectItem value="MOBILE">Mobile</SelectItem>
                    <SelectItem value="WEB">Web</SelectItem>
                    <SelectItem value="COMMUNICATION">Communication</SelectItem>
                    <SelectItem value="MANAGEMENT">Management</SelectItem>
                    <SelectItem value="EDUCATION">Éducation</SelectItem>
                    <SelectItem value="HEALTH">Santé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-difficulty">Difficulté *</Label>
                <Select value={newQuiz.difficulty} onValueChange={(value: any) => setNewQuiz(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="MID">Intermédiaire</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Technologies ciblées</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Ajouter une technologie (ex: React, Figma...)"
                    value={technologyInput}
                    onChange={(e) => setTechnologyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnologyTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTechnologyTag}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newQuiz.technology.length > 0 ? (
                    newQuiz.technology.map((tech, index) => (
                      <Badge key={`${tech}-${index}`} variant="secondary" className="flex items-center gap-2">
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => removeTechnologyTag(index)}
                          className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 h-5 w-5 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ajoutez les technologies, outils ou frameworks sur lesquels portera le test.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compétences à évaluer</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Ajouter une compétence (ex: Communication, Architecture...)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkillTag}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newQuiz.skills && newQuiz.skills.length > 0 ? (
                    newQuiz.skills.map((skill, index) => (
                      <Badge key={`${skill}-${index}`} variant="outline" className="flex items-center gap-2">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkillTag(index)}
                          className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 h-5 w-5 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ajoutez les compétences comportementales ou techniques à explorer (ex: Leadership, Résolution de problème).
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-duration">Durée (minutes) *</Label>
                <Input
                  id="create-duration"
                  type="number"
                  min="5"
                  max="180"
                  value={newQuiz.duration}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-totalPoints">Points totaux *</Label>
                <Input
                  id="create-totalPoints"
                  type="number"
                  min="10"
                  max="1000"
                  value={newQuiz.totalPoints}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, totalPoints: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        // Calculer la somme des points des questions
        const totalQuestionsPoints = (newQuiz.questions || []).reduce((sum, q) => sum + (q.points || 0), 0);
        const pointsDifference = newQuiz.totalPoints - totalQuestionsPoints;
        
        return (
          <div className="space-y-4">
            {/* Section Génération IA intégrée */}
            {!isGenerating ? (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-950 dark:via-green-950/10 dark:to-blue-950/10 rounded-lg border border-blue-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Génération automatique avec l'IA
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      L'IA créera un test complet basé sur vos paramètres
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={handleAIGenerate}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-number-questions" className="text-sm">Nombre de questions</Label>
                    <Input
                      id="ai-number-questions"
                      type="number"
                      min={3}
                      max={20}
                      value={numberOfQuestions}
                      onChange={(e) => setNumberOfQuestions(Math.max(3, Math.min(20, parseInt(e.target.value) || 5)))}
                      className="bg-white dark:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Points par question: {Math.floor(newQuiz.totalPoints / numberOfQuestions)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Paramètres:</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <li className="truncate">• {newQuiz.type}</li>
                      <li className="truncate">• {newQuiz.domain}</li>
                      <li className="truncate">• {newQuiz.difficulty}</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-950 dark:via-green-950/10 dark:to-blue-950/10 rounded-lg border border-blue-200 dark:border-slate-700">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{generationStep}</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Génération de {numberOfQuestions} questions en cours...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Affichage du total des points */}
            <div className={`p-4 rounded-lg border ${
              pointsDifference === 0 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : pointsDifference > 0
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    Total des points du test: {newQuiz.totalPoints}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    Points des questions: {totalQuestionsPoints}/{newQuiz.totalPoints}
                  </p>
                </div>
                {pointsDifference === 0 ? (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white shrink-0">
                    ✓ Équilibré
                  </Badge>
                ) : pointsDifference > 0 ? (
                  <Badge className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                    {pointsDifference} points manquants
                  </Badge>
                ) : (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white shrink-0">
                    {Math.abs(pointsDifference)} points en trop
                  </Badge>
                )}
              </div>
              {pointsDifference !== 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  {pointsDifference > 0 
                    ? `Il manque ${pointsDifference} point${pointsDifference > 1 ? 's' : ''} pour atteindre le total. Ajustez les points des questions.`
                    : `Vous avez ${Math.abs(pointsDifference)} point${Math.abs(pointsDifference) > 1 ? 's' : ''} en trop. Réduisez les points des questions.`}
                </p>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:via-green-950/10 dark:to-blue-950/10 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <InterviewBuilder
                quizType={newQuiz.type}
                domain={newQuiz.domain}
                questions={newQuiz.questions || []}
                onQuestionsChange={(questions) => setNewQuiz(prev => ({ ...prev, questions }))}
                totalPoints={newQuiz.totalPoints}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white">Paramètres du test</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="create-shuffle">Mélanger les questions</Label>
                    <p className="text-sm text-slate-500">Les questions apparaîtront dans un ordre aléatoire</p>
                  </div>
                  <Switch
                    id="create-shuffle"
                    checked={newQuiz.settings.shuffleQuestions}
                    onCheckedChange={(checked) => setNewQuiz(prev => ({
                      ...prev,
                      settings: { ...prev.settings, shuffleQuestions: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="create-showResults">Afficher les résultats</Label>
                    <p className="text-sm text-slate-500">Les candidats verront leur score à la fin</p>
                  </div>
                  <Switch
                    id="create-showResults"
                    checked={newQuiz.settings.showResults}
                    onCheckedChange={(checked) => setNewQuiz(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showResults: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="create-allowRetry">Autoriser les nouvelles tentatives</Label>
                    <p className="text-sm text-slate-500">Les candidats pourront repasser le test</p>
                  </div>
                  <Switch
                    id="create-allowRetry"
                    checked={newQuiz.settings.allowRetry}
                    onCheckedChange={(checked) => setNewQuiz(prev => ({
                      ...prev,
                      settings: { ...prev.settings, allowRetry: checked }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-timeLimit">Limite de temps (minutes)</Label>
                <Input
                  id="create-timeLimit"
                  type="number"
                  min="0"
                  value={newQuiz.settings.timeLimit}
                  onChange={(e) => setNewQuiz(prev => ({
                    ...prev,
                    settings: { ...prev.settings, timeLimit: parseInt(e.target.value) }
                  }))}
                />
                <p className="text-xs text-slate-500">0 = pas de limite</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-passingScore">Score de réussite (%)</Label>
                <Input
                  id="create-passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={newQuiz.settings.passingScore}
                  onChange={(e) => setNewQuiz(prev => ({
                    ...prev,
                    settings: { ...prev.settings, passingScore: parseInt(e.target.value) }
                  }))}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-white">Lier à un poste</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Sélectionnez le poste auquel ce test sera associé
            </p>
            
            {availablePositions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Aucune offre d'emploi</h4>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Vous devez d'abord créer des offres d'emploi pour pouvoir les associer à des tests.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {availablePositions.map(position => {
                  const isSelected = newQuiz.jobPostingId === position.id
                  
                  return (
                    <div 
                      key={position.id} 
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                      onClick={() => setNewQuiz(prev => ({ ...prev, jobPostingId: position.id }))}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-5 h-5 border rounded transition-colors ${
                          isSelected 
                            ? 'bg-green-600 border-green-600 text-white' 
                            : 'border-slate-300 dark:border-slate-500'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{position.title}</p>
                          <p className="text-sm text-slate-500 truncate dark:text-slate-400">
                            {position.department} • {position.level}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`shrink-0 ${
                          position.status === 'OPEN' 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300' 
                            : position.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300'
                        }`}
                      >
                        {position.status === 'OPEN' ? 'Ouvert' : position.status === 'DRAFT' ? 'Brouillon' : 'Fermé'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
            
            {newQuiz.jobPostingId && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center line-clamp-2">
                  <Check className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Poste sélectionné: {availablePositions.find(p => p.id === newQuiz.jobPostingId)?.title}</span>
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Créer un nouveau test</DialogTitle>
          <DialogDescription>
            Configurez un nouveau test d&apos;entretien pour vos candidats.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-shrink-0">
          <QuizCreationStepper currentStep={creationStep} onStepChange={setCreationStep} />
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          {renderStep()}
        </div>
        
        <div className="flex justify-between pt-6 flex-shrink-0 border-t border-slate-200 dark:border-slate-700 mt-4">
          <Button
            variant="outline"
            onClick={() => setCreationStep(prev => Math.max(1, prev - 1))}
            disabled={creationStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
          
          {creationStep < 4 ? (
            <Button
              onClick={() => setCreationStep(prev => Math.min(4, prev + 1))}
              className="bg-green-600 hover:bg-green-700"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              className="bg-green-600 hover:bg-green-700"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le test"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Composant Modal d'édition
function EditQuizModal({ 
  open, 
  onOpenChange, 
  onUpdateQuiz, 
  isCreating,
  availablePositions,
  quiz 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateQuiz: (quizId: string, quizData: any) => Promise<void>
  isCreating: boolean
  availablePositions: Position[]
  quiz: Quiz | null
}) {
  const [editStep, setEditStep] = useState(1)
  const [editedQuiz, setEditedQuiz] = useState({
    title: '',
    description: '',
    type: 'QCM' as const,
    domain: 'DEVELOPMENT' as const,
    difficulty: 'JUNIOR' as const,
    technology: [] as string[],
    skills: [] as string[],
    duration: 30,
    totalPoints: 100,
    company: '',
    questions: [] as any[],
    settings: {
      shuffleQuestions: false,
      showResults: true,
      allowRetry: false,
      timeLimit: 0,
      passingScore: 70
    },
    jobPostingId: ''
  })
  const [technologyInput, setTechnologyInput] = useState("")
  const [skillInput, setSkillInput] = useState("")

  const addTechnologyTag = () => {
    const value = technologyInput.trim()
    if (!value) return
    setEditedQuiz((prev) => ({
      ...prev,
      technology: prev.technology.includes(value) ? prev.technology : [...prev.technology, value],
    }))
    setTechnologyInput("")
  }

  const removeTechnologyTag = (index: number) => {
    setEditedQuiz((prev) => ({
      ...prev,
      technology: prev.technology.filter((_, i) => i !== index),
    }))
  }

  const addSkillTag = () => {
    const value = skillInput.trim()
    if (!value) return
    setEditedQuiz((prev) => ({
      ...prev,
      skills: prev.skills?.includes(value) ? prev.skills : [...(prev.skills || []), value],
    }))
    setSkillInput("")
  }

  const removeSkillTag = (index: number) => {
    setEditedQuiz((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index),
    }))
  }

  const handleUpdate = async () => {
    if (!quiz) return

    try {
      if (!editedQuiz.title || !editedQuiz.company || !editedQuiz.jobPostingId) {
        toast.error("Le titre, l'entreprise et le poste sont requis")
        return
      }

      // CORRECTION : Convertir les questions avant la sauvegarde
      const quizDataToSave = {
        ...editedQuiz,
        questions: convertQuestionsBack(editedQuiz.questions)
      }

      console.log("Saving quiz data:", quizDataToSave)
      
      await onUpdateQuiz(quiz.id, quizDataToSave)
      onOpenChange(false)
      setEditStep(1)
    } catch (error) {
      console.error("Erreur mise à jour:", error)
      toast.error("Erreur lors de la mise à jour du quiz")
    }
  }

  const renderStep = () => {
    switch (editStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre du test *</Label>
                <Input
                  id="edit-title"
                  placeholder="Ex: Test technique React Senior"
                  value={editedQuiz.title}
                  onChange={(e) => setEditedQuiz(prev => ({ ...prev, title: e.target.value }))}
                  className="truncate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Entreprise *</Label>
                <Input
                  id="edit-company"
                  placeholder="Nom de l'entreprise"
                  value={editedQuiz.company}
                  onChange={(e) => setEditedQuiz(prev => ({ ...prev, company: e.target.value }))}
                  className="truncate"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Décrivez l'objectif et le contenu de ce test..."
                value={editedQuiz.description}
                onChange={(e) => setEditedQuiz(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type de test *</Label>
                <Select value={editedQuiz.type} onValueChange={(value: any) => setEditedQuiz(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QCM">QCM</SelectItem>
                    <SelectItem value="TECHNICAL">Test Technique</SelectItem>
                    <SelectItem value="MOCK_INTERVIEW">Simulation d'entretien</SelectItem>
                    <SelectItem value="SOFT_SKILLS">Compétences comportementales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-domain">Domaine *</Label>
                <Select value={editedQuiz.domain} onValueChange={(value: any) => setEditedQuiz(prev => ({ ...prev, domain: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MACHINE_LEARNING">Machine Learning</SelectItem>
                    <SelectItem value="DEVELOPMENT">Développement</SelectItem>
                    <SelectItem value="DATA_SCIENCE">Data Science</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="ENGINEERING">Ingénierie</SelectItem>
                    <SelectItem value="DESIGN">Design</SelectItem>
                    <SelectItem value="DEVOPS">DevOps</SelectItem>
                    <SelectItem value="CYBERSECURITY">Cybersécurité</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="PRODUCT">Produit</SelectItem>
                    <SelectItem value="ARCHITECTURE">Architecture</SelectItem>
                    <SelectItem value="MOBILE">Mobile</SelectItem>
                    <SelectItem value="WEB">Web</SelectItem>
                    <SelectItem value="COMMUNICATION">Communication</SelectItem>
                    <SelectItem value="MANAGEMENT">Management</SelectItem>
                    <SelectItem value="EDUCATION">Éducation</SelectItem>
                    <SelectItem value="HEALTH">Santé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">Difficulté *</Label>
                <Select value={editedQuiz.difficulty} onValueChange={(value: any) => setEditedQuiz(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="MID">Intermédiaire</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Technologies ciblées</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Ajouter une technologie (ex: React, Figma...)"
                    value={technologyInput}
                    onChange={(e) => setTechnologyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnologyTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTechnologyTag}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editedQuiz.technology.length > 0 ? (
                    editedQuiz.technology.map((tech, index) => (
                      <Badge key={`${tech}-${index}`} variant="secondary" className="flex items-center gap-2">
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => removeTechnologyTag(index)}
                          className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 h-5 w-5 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ajoutez les technologies, outils ou frameworks sur lesquels portera le test.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compétences à évaluer</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Ajouter une compétence (ex: Communication, Architecture...)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkillTag}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editedQuiz.skills && editedQuiz.skills.length > 0 ? (
                    editedQuiz.skills.map((skill, index) => (
                      <Badge key={`${skill}-${index}`} variant="outline" className="flex items-center gap-2">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkillTag(index)}
                          className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 h-5 w-5 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ajoutez les compétences comportementales ou techniques à explorer (ex: Leadership, Résolution de problème).
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Durée (minutes) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="5"
                  max="180"
                  value={editedQuiz.duration}
                  onChange={(e) => setEditedQuiz(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalPoints">Points totaux *</Label>
                <Input
                  id="edit-totalPoints"
                  type="number"
                  min="10"
                  max="1000"
                  value={editedQuiz.totalPoints}
                  onChange={(e) => setEditedQuiz(prev => ({ ...prev, totalPoints: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        // Calculer la somme des points des questions pour l'édition
        const totalEditedQuestionsPoints = (editedQuiz.questions || []).reduce((sum, q) => sum + (q.points || 0), 0);
        const editedPointsDifference = editedQuiz.totalPoints - totalEditedQuestionsPoints;
        
        return (
          <div className="space-y-4">
            {/* Affichage du total des points */}
            <div className={`p-4 rounded-lg border ${
              editedPointsDifference === 0 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : editedPointsDifference > 0
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    Total des points du test: {editedQuiz.totalPoints}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    Points des questions: {totalEditedQuestionsPoints}/{editedQuiz.totalPoints}
                  </p>
                </div>
                {editedPointsDifference === 0 ? (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    ✓ Équilibré
                  </Badge>
                ) : editedPointsDifference > 0 ? (
                  <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                    {editedPointsDifference} points manquants
                  </Badge>
                ) : (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white">
                    {Math.abs(editedPointsDifference)} points en trop
                  </Badge>
                )}
              </div>
              {editedPointsDifference !== 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  {editedPointsDifference > 0 
                    ? `Il manque ${editedPointsDifference} point${editedPointsDifference > 1 ? 's' : ''} pour atteindre le total. Ajustez les points des questions.`
                    : `Vous avez ${Math.abs(editedPointsDifference)} point${Math.abs(editedPointsDifference) > 1 ? 's' : ''} en trop. Réduisez les points des questions.`}
                </p>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:via-green-950/10 dark:to-blue-950/10 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <InterviewQuestionsEditor
              quizType={editedQuiz.type}
              questions={editedQuiz.questions || []}
              onQuestionsChange={(questions) => {
                console.log("Questions updated in editor:", questions)
                setEditedQuiz(prev => ({ ...prev, questions }))
              }}
              onSave={handleUpdate}
              isSaving={isCreating}
                totalPoints={editedQuiz.totalPoints}
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white">Paramètres du test</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="edit-shuffle">Mélanger les questions</Label>
                    <p className="text-sm text-slate-500">Les questions apparaîtront dans un ordre aléatoire</p>
                  </div>
                  <Switch
                    id="edit-shuffle"
                    checked={editedQuiz.settings.shuffleQuestions}
                    onCheckedChange={(checked) => setEditedQuiz(prev => ({
                      ...prev,
                      settings: { ...prev.settings, shuffleQuestions: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="edit-showResults">Afficher les résultats</Label>
                    <p className="text-sm text-slate-500">Les candidats verront leur score à la fin</p>
                  </div>
                  <Switch
                    id="edit-showResults"
                    checked={editedQuiz.settings.showResults}
                    onCheckedChange={(checked) => setEditedQuiz(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showResults: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="edit-allowRetry">Autoriser les nouvelles tentatives</Label>
                    <p className="text-sm text-slate-500">Les candidats pourront repasser le test</p>
                  </div>
                  <Switch
                    id="edit-allowRetry"
                    checked={editedQuiz.settings.allowRetry}
                    onCheckedChange={(checked) => setEditedQuiz(prev => ({
                      ...prev,
                      settings: { ...prev.settings, allowRetry: checked }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-timeLimit">Limite de temps (minutes)</Label>
                <Input
                  id="edit-timeLimit"
                  type="number"
                  min="0"
                  value={editedQuiz.settings.timeLimit}
                  onChange={(e) => setEditedQuiz(prev => ({
                    ...prev,
                    settings: { ...prev.settings, timeLimit: parseInt(e.target.value) }
                  }))}
                />
                <p className="text-xs text-slate-500">0 = pas de limite</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-passingScore">Score de réussite (%)</Label>
                <Input
                  id="edit-passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={editedQuiz.settings.passingScore}
                  onChange={(e) => setEditedQuiz(prev => ({
                    ...prev,
                    settings: { ...prev.settings, passingScore: parseInt(e.target.value) }
                  }))}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-white">Lier à un poste</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Sélectionnez le poste auquel ce test sera associé
            </p>
            
            {availablePositions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Aucune offre d'emploi</h4>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Vous devez d'abord créer des offres d'emploi pour pouvoir les associer à des tests.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {availablePositions.map(position => {
                  const isSelected = editedQuiz.jobPostingId === position.id
                  
                  return (
                    <div 
                      key={position.id} 
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                      onClick={() => setEditedQuiz(prev => ({ ...prev, jobPostingId: position.id }))}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-5 h-5 border rounded transition-colors ${
                          isSelected 
                            ? 'bg-green-600 border-green-600 text-white' 
                            : 'border-slate-300 dark:border-slate-500'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{position.title}</p>
                          <p className="text-sm text-slate-500 truncate dark:text-slate-400">
                            {position.department} • {position.level}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`shrink-0 ${
                          position.status === 'OPEN' 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300' 
                            : position.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300'
                        }`}
                      >
                        {position.status === 'OPEN' ? 'Ouvert' : position.status === 'DRAFT' ? 'Brouillon' : 'Fermé'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
            
            {editedQuiz.jobPostingId && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center line-clamp-2">
                  <Check className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Poste sélectionné: {availablePositions.find(p => p.id === editedQuiz.jobPostingId)?.title}</span>
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  useEffect(() => {
    if (quiz?.id) {
      const convertedQuestions = convertQuestionsBack(quiz.questions)
      const parsedSettings = {
        shuffleQuestions: quiz.settings.shuffleQuestions,
        showResults: quiz.settings.showResults,
        allowRetry: quiz.settings.allowRetry,
        timeLimit: quiz.settings.timeLimit,
        passingScore: quiz.settings.passingScore
      }

      setEditedQuiz({
        title: quiz.title || '',
        description: quiz.description || '',
        type: quiz.type as any,
        domain: quiz.domain as any,
        difficulty: quiz.difficulty as any,
        technology: quiz.technology || [],
        skills: Array.isArray(quiz.skills) ? quiz.skills : [],
        duration: quiz.duration || 30,
        totalPoints: quiz.totalPoints || 100,
        company: quiz.company || '',
        questions: convertedQuestions, // Utiliser les questions converties
        settings: parsedSettings,
        jobPostingId: quiz.jobPostingId || ''
      })
      setTechnologyInput("")
      setSkillInput("")
    }
  }, [quiz?.id, open]) // Utiliser quiz.id au lieu de quiz pour éviter les re-renders inutiles

  if (!quiz) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Modifier le test</DialogTitle>
          <DialogDescription>
            Modifiez les informations de ce test d&apos;entretien.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-shrink-0">
          <QuizCreationStepper currentStep={editStep} onStepChange={setEditStep} isEdit={true} />
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          {renderStep()}
        </div>
        
        <div className="flex justify-between pt-6 flex-shrink-0 border-t border-slate-200 dark:border-slate-700 mt-4">
          <Button
            variant="outline"
            onClick={() => setEditStep(prev => Math.max(1, prev - 1))}
            disabled={editStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
          
          {editStep < 4 ? (
            <Button
              onClick={() => setEditStep(prev => Math.min(4, prev + 1))}
              className="bg-green-600 hover:bg-green-700"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleUpdate}
              className="bg-green-600 hover:bg-green-700"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
 
export function QuizzesTab({ 
  quizzes: initialQuizzes, 
  onCreateQuiz, 
  onUpdateQuiz, 
  onDeleteQuiz, 
  isLoading = false,
  isCreating = false 
}: QuizzesTabProps) {
  const { user } = useKindeBrowserClient()
  const { jobs, loadingJobs } = useUserJobQueries(user?.id)
  
  // Utiliser le hook pour récupérer les quizzes en temps réel
  const { data: quizzesResponse, isLoading: isLoadingQuizzesFromHook, refetch: refetchQuizzes } = useUserJobQuizzes(user?.id || "")
  
  // Combiner les quizzes des props et du hook (le hook prend la priorité pour le realtime)
  const quizzesFromHook = quizzesResponse?.data || []
  const quizzesToUse = quizzesFromHook.length > 0 ? quizzesFromHook : (initialQuizzes || [])
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null)

  // Transformez les jobs en positions disponibles
  const availablePositions = jobs?.map(job => ({
    id: job.id,
    title: job.title,
    department: job.domain || 'DEVELOPMENT',
    level: job.experienceLevel || 'MID',
    status: job.status as 'OPEN' | 'CLOSED' | 'DRAFT'
  })) || []

  // Rafraîchir après les mutations - avec une condition pour éviter les boucles infinies
  useEffect(() => {
    // Ne rafraîchir que lorsqu'on vient de terminer une mutation
    // Utiliser un flag pour éviter les rafraîchissements inutiles
    if (!isCreating && !isLoading) {
      const timer = setTimeout(() => {
        refetchQuizzes()
      }, 2000) // Délai de 2 secondes pour laisser le temps à Prisma de finaliser
      return () => clearTimeout(timer)
    }
  }, [isCreating, isLoading]) // Ne dépendre que de isCreating et isLoading

  // Conversion des données API vers le format Quiz attendu
  const quizzes: Quiz[] = quizzesToUse.map((apiQuiz: any) => {
    // Parser les questions et settings correctement
    let parsedQuestions = []
    try {
      parsedQuestions = typeof apiQuiz.questions === 'string' 
        ? JSON.parse(apiQuiz.questions) 
        : (apiQuiz.questions || [])
    } catch (e) {
      console.error("Erreur parsing questions:", e)
      parsedQuestions = []
    }

    let parsedSettings = {
      shuffleQuestions: false,
      showResults: true,
      allowRetry: false,
      timeLimit: 0,
      passingScore: 70
    }
    try {
      if (apiQuiz.settings) {
        parsedSettings = typeof apiQuiz.settings === 'string' 
          ? JSON.parse(apiQuiz.settings) 
          : apiQuiz.settings
        // S'assurer que tous les champs sont présents
        parsedSettings = {
          shuffleQuestions: parsedSettings.shuffleQuestions ?? false,
          showResults: parsedSettings.showResults ?? true,
          allowRetry: parsedSettings.allowRetry ?? false,
          timeLimit: parsedSettings.timeLimit ?? 0,
          passingScore: parsedSettings.passingScore ?? 70
        }
      }
    } catch (e) {
      console.error("Erreur parsing settings:", e)
    }

    return {
      id: apiQuiz.id,
      title: apiQuiz.title,
      description: apiQuiz.description || '',
      type: apiQuiz.type as 'QCM' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS' | 'TECHNICAL',
      domain: apiQuiz.domain as Domain,
      difficulty: apiQuiz.difficulty as 'JUNIOR' | 'MID' | 'SENIOR',
      technology: apiQuiz.technology || [],
      skills: Array.isArray(apiQuiz.skills) ? apiQuiz.skills : [],
      duration: apiQuiz.duration || 30,
      totalPoints: apiQuiz.totalPoints || 100,
      company: apiQuiz.company || '',
      image: apiQuiz.image,
      createdAt: apiQuiz.createdAt || new Date().toISOString(),
      jobPostingId: apiQuiz.jobPostingId || '',
      questions: parsedQuestions,
      settings: parsedSettings
    }
  })

  // Protection contre les données undefined
  const safeQuizzes = quizzes || []

  const filteredQuizzes = safeQuizzes.filter(quiz => {
    if (!quiz) return false
    
    const safeTitle = quiz.title || ""
    const safeDescription = quiz.description || ""
    const safeTechnology = quiz.technology || []
    const safeSkills = quiz.skills || []
    
    const matchesSearch = safeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         safeDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         safeTechnology.some(tech => tech?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         safeSkills.some(skill => skill?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === "all" || quiz.type === selectedType
    const matchesDomain = selectedDomain === "all" || quiz.domain === selectedDomain
    const matchesDifficulty = selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty
    
    return matchesSearch && matchesType && matchesDomain && matchesDifficulty
  })

  const getTypeColor = (type: string) => {
    if (!type) return 'bg-green-600 hover:bg-green-700'
    
    switch (type) {
      case 'TECHNICAL': return 'bg-green-600 hover:bg-green-700'
      case 'MOCK_INTERVIEW': return 'bg-green-700 hover:bg-green-800'
      case 'SOFT_SKILLS': return 'bg-green-500 hover:bg-green-600'
      case 'QCM': return 'bg-green-400 hover:bg-green-500'
      default: return 'bg-green-600 hover:bg-green-700'
    }
  }

  const getTypeDisplayName = (type: string) => {
    if (!type) return 'N/A'
    return type.replace(/_/g, ' ')
  }

  const getDomainColor = (domain: string) => {
    if (!domain) return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
    
    const colors = {
      MACHINE_LEARNING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      DEVELOPMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      DATA_SCIENCE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      FINANCE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      BUSINESS: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      ENGINEERING: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      DESIGN: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      DEVOPS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      CYBERSECURITY: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
      MARKETING: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
      PRODUCT: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
      ARCHITECTURE: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
      MOBILE: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      WEB: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      COMMUNICATION: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
      MANAGEMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      EDUCATION: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
      HEALTH: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return colors[domain as keyof typeof colors] || 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
  }

  const getDomainDisplayName = (domain: string) => {
    if (!domain) return 'N/A'
    return domain.replace(/_/g, ' ')
  }

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    
    switch (difficulty) {
      case 'JUNIOR': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800'
      case 'MID': return 'bg-green-200 text-green-900 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-700'
      case 'SENIOR': return 'bg-green-300 text-green-950 border-green-400 dark:bg-green-700 dark:text-green-100 dark:border-green-600'
      default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }
  }

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (quizId: string) => {
    setQuizToDelete(quizId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (quizToDelete && onDeleteQuiz) {
      try {
        await onDeleteQuiz(quizToDelete)
        setIsDeleteDialogOpen(false)
        setQuizToDelete(null)
        // Le rafraîchissement sera géré par le useEffect qui surveille isDeleting
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  const handleCreateQuizWithRefresh = async (quizData: any) => {
    if (onCreateQuiz) {
      try {
        await onCreateQuiz(quizData)
        // Le rafraîchissement sera géré par le useEffect qui surveille isCreating
      } catch (error) {
        console.error("Erreur lors de la création:", error)
      }
    }
  }

  const handleUpdateQuizWithRefresh = async (quizId: string, quizData: any) => {
    if (onUpdateQuiz) {
      try {
        await onUpdateQuiz(quizId, quizData)
        // Le rafraîchissement sera géré par le useEffect qui surveille isUpdating
        // Fermer le modal après la mise à jour
        setIsEditModalOpen(false)
        setSelectedQuiz(null)
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error)
      }
    }
  }

  if (isLoading || isLoadingQuizzesFromHook) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Tests</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Créez et gérez vos tests d&apos;entretien
            </p>
          </div>
          <Button disabled className="bg-green-600 hover:bg-green-700">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Chargement...
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Tests</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Créez et gérez vos tests d&apos;entretien
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={`${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Table className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Test
          </Button>
          {isLoadingQuizzesFromHook && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => refetchQuizzes()}
              className="text-slate-600 dark:text-slate-400"
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Actualiser
            </Button>
          )}
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un test..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="QCM">QCM</SelectItem>
                  <SelectItem value="TECHNICAL">Technique</SelectItem>
                  <SelectItem value="MOCK_INTERVIEW">Simulation</SelectItem>
                  <SelectItem value="SOFT_SKILLS">Soft Skills</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Domaine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les domaines</SelectItem>
                  <SelectItem value="MACHINE_LEARNING">Machine Learning</SelectItem>
                  <SelectItem value="DEVELOPMENT">Développement</SelectItem>
                  <SelectItem value="DATA_SCIENCE">Data Science</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="ENGINEERING">Ingénierie</SelectItem>
                  <SelectItem value="DESIGN">Design</SelectItem>
                  <SelectItem value="DEVOPS">DevOps</SelectItem>
                  <SelectItem value="CYBERSECURITY">Cybersécurité</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="PRODUCT">Produit</SelectItem>
                  <SelectItem value="ARCHITECTURE">Architecture</SelectItem>
                  <SelectItem value="MOBILE">Mobile</SelectItem>
                  <SelectItem value="WEB">Web</SelectItem>
                  <SelectItem value="COMMUNICATION">Communication</SelectItem>
                  <SelectItem value="MANAGEMENT">Management</SelectItem>
                  <SelectItem value="EDUCATION">Éducation</SelectItem>
                  <SelectItem value="HEALTH">Santé</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="JUNIOR">Junior</SelectItem>
                  <SelectItem value="MID">Intermédiaire</SelectItem>
                  <SelectItem value="SENIOR">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affichage tableau */}
      {viewMode === 'table' && (
        <Card className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70">
          <CardContent className="p-0">
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Difficulté</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Poste lié</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz) => {
                  const linkedPosition = availablePositions.find(p => p.id === quiz.jobPostingId)
                  
                  return (
                    <TableRow key={quiz.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{quiz.title}</p>
                          <p className="text-sm text-slate-500 line-clamp-1">{quiz.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(quiz.type)}>
                          {getTypeDisplayName(quiz.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getDomainColor(quiz.domain)}>
                          {getDomainDisplayName(quiz.domain)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          {quiz.duration} min
                        </div>
                      </TableCell>
                      <TableCell>
                        {linkedPosition ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {linkedPosition.title}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">Non lié</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Star className="w-4 h-4" />
                          {quiz.totalPoints} pts
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuiz(quiz)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(quiz.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </UITable>
          </CardContent>
        </Card>
      )}

      {/* Affichage grille */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => {
            const linkedPosition = availablePositions.find(p => p.id === quiz.jobPostingId)
            const safeTechnology = quiz.technology || []
            const safeSkills = quiz.skills || []
            const mockCompetencies = Array.isArray(quiz.questions)
              ? Array.from(
                  new Set(
                    (quiz.questions as any[])
                      .flatMap((question: any) => (question?.competencies || []))
                      .filter(Boolean)
                  )
                ).slice(0, 8)
              : []
            
            return (
              <Card key={quiz.id} className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70 hover:shadow-xl transition-all durée-300 hover:border-green-300/50 dark:hover:border-green-600/50 group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-2 text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                      {quiz.title}
                    </CardTitle>
                    <Badge className={getTypeColor(quiz.type)}>
                      {getTypeDisplayName(quiz.type)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getDomainColor(quiz.domain)}>
                        {getDomainDisplayName(quiz.domain)}
                      </Badge>
                      <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      {quiz.duration} min
                    </div>
                  </div>
                  
                  {quiz.type === 'MOCK_INTERVIEW' ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                          Technologies clés
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {safeTechnology.length > 0 ? (
                            safeTechnology.map((tech, index) => (
                              <Badge
                                key={`${quiz.id}-tech-${index}`}
                                variant="outline"
                                className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              >
                                {tech}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400">Aucune technologie précisée</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">Compétences</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {safeSkills.length > 0 ? (
                            safeSkills.map((skill, index) => (
                              <Badge
                                key={`${quiz.id}-skill-${index}`}
                                variant="secondary"
                                className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400">Ajoutez des compétences dans le builder</span>
                          )}
                        </div>
                      </div>

                      {mockCompetencies.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800">Thématiques</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {mockCompetencies.map((competency, index) => (
                              <Badge
                                key={`${quiz.id}-competency-${index}`}
                                variant="outline"
                                className="text-xs bg-white dark:bg-slate-800"
                              >
                                {competency}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {safeTechnology.slice(0, 3).map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                          {tech}
                        </Badge>
                      ))}
                      {safeTechnology.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{safeTechnology.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Poste lié */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        Poste lié
                      </span>
                    </div>
                    {linkedPosition ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        {linkedPosition.title}
                      </Badge>
                    ) : (
                      <p className="text-xs text-slate-500">Aucun poste lié</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {quiz.totalPoints} points
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-slate-200 dark:border-slate-700"
                        onClick={() => handleEditQuiz(quiz)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm" 
                        onClick={() => handleDeleteClick(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* État vide */}
      {filteredQuizzes.length === 0 && (
        <Card className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70 text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Aucun test trouvé
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {safeQuizzes.length === 0 
                ? "Commencez par créer votre premier test d'entretien."
                : "Aucun test ne correspond à votre recherche."}
            </p>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un premier test
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CreateQuizModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateQuiz={handleCreateQuizWithRefresh}
        isCreating={isCreating}
        availablePositions={availablePositions}
      />

      <EditQuizModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdateQuiz={handleUpdateQuizWithRefresh}
        isCreating={isCreating}
        availablePositions={availablePositions}
        quiz={selectedQuiz}
      />

      {/* Modal de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce test ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le test sera définitivement supprimé et ne pourra pas être récupéré.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}