"use client"

import { useState, useEffect } from "react"
import { FileText, Clock, Star, Plus, Search, Filter, Briefcase, ChevronRight, ChevronLeft, Settings, FileQuestion, Users, Target, Loader2, Check, Edit, Trash2, Table, Grid } from "lucide-react"
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
import { toast } from "sonner"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useUserJobQueries } from "@/hooks/use-job-queries"
import { Domain } from "@prisma/client"
import { any } from "zod"
import { InterviewBuilder } from "./interview-builder"

interface Quiz {
  id: string
  title: string
  description: string
  type: 'QCM' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS' | 'TECHNICAL'
  domain: 'MACHINE_LEARNING' | 'DEVELOPMENT' | 'DATA_SCIENCE' | 'FINANCE' | 'BUSINESS' | 'ENGINEERING' | 'DESIGN' | 'DEVOPS' | 'CYBERSECURITY' | 'MARKETING' | 'PRODUCT' | 'ARCHITECTURE' | 'MOBILE' | 'WEB' | 'COMMUNICATION' | 'MANAGEMENT' | 'EDUCATION' | 'HEALTH'
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR'
  technology: string[]
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

  const handleCreate = async () => {
    try {
      if (!newQuiz.title || !newQuiz.company || !newQuiz.jobPostingId) {
        toast.error("Le titre, l'entreprise et le poste sont requis")
        return
      }

      await onCreateQuiz(newQuiz)
      onOpenChange(false)
      setCreationStep(1)
      setNewQuiz({
        title: '',
        description: '',
        type: 'QCM',
        domain: 'DEVELOPMENT',
        difficulty: 'JUNIOR',
        technology: [],
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-company">Entreprise *</Label>
                <Input
                  id="create-company"
                  placeholder="Nom de l'entreprise"
                  value={newQuiz.company}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, company: e.target.value }))}
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
        return (
          <div className="space-y-4">
            <InterviewBuilder
              quizType={newQuiz.type}
              questions={newQuiz.questions || []}
              onQuestionsChange={(questions) => setNewQuiz(prev => ({ ...prev, questions }))}
            />
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
                        <div>
                          <p className="font-medium">{position.title}</p>
                          <p className="text-sm text-slate-500">
                            {position.department} • {position.level}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          position.status === 'OPEN' 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300' 
                            : position.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300'
                        }
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
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Poste sélectionné: {availablePositions.find(p => p.id === newQuiz.jobPostingId)?.title}
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
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle>Créer un nouveau test</DialogTitle>
          <DialogDescription>
            Configurez un nouveau test d&apos;entretien pour vos candidats.
          </DialogDescription>
        </DialogHeader>
        
        <QuizCreationStepper currentStep={creationStep} onStepChange={setCreationStep} />
        
        {renderStep()}
        
        <div className="flex justify-between pt-6">
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

  // Initialiser les données quand le quiz change
  useEffect(() => {
    if (quiz) {
      setEditedQuiz({
        title: quiz.title,
        description: quiz.description || '',
        type: quiz.type as any,
        domain: quiz.domain as any,
        difficulty: quiz.difficulty as any,
        technology: quiz.technology || [],
        duration: quiz.duration,
        totalPoints: quiz.totalPoints,
        company: quiz.company,
        questions: quiz.questions || [],
        settings: quiz.settings || {
          shuffleQuestions: false,
          showResults: true,
          allowRetry: false,
          timeLimit: 0,
          passingScore: 70
        },
        jobPostingId: quiz.jobPostingId
      })
    }
  }, [quiz])

  const handleUpdate = async () => {
    if (!quiz) return

    try {
      if (!editedQuiz.title || !editedQuiz.company || !editedQuiz.jobPostingId) {
        toast.error("Le titre, l'entreprise et le poste sont requis")
        return
      }

      await onUpdateQuiz(quiz.id, editedQuiz)
      onOpenChange(false)
      setEditStep(1)
    } catch (error) {
      console.error("Erreur mise à jour:", error)
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Entreprise *</Label>
                <Input
                  id="edit-company"
                  placeholder="Nom de l'entreprise"
                  value={editedQuiz.company}
                  onChange={(e) => setEditedQuiz(prev => ({ ...prev, company: e.target.value }))}
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
        return (
          <div className="space-y-4">
            <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
              <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Configuration des questions</h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Modifiez les questions de votre test
              </p>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une question
              </Button>
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
                        <div>
                          <p className="font-medium">{position.title}</p>
                          <p className="text-sm text-slate-500">
                            {position.department} • {position.level}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          position.status === 'OPEN' 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300' 
                            : position.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300'
                        }
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
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Poste sélectionné: {availablePositions.find(p => p.id === editedQuiz.jobPostingId)?.title}
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (!quiz) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle>Modifier le test</DialogTitle>
          <DialogDescription>
            Modifiez les informations de ce test d&apos;entretien.
          </DialogDescription>
        </DialogHeader>
        
        <QuizCreationStepper currentStep={editStep} onStepChange={setEditStep} isEdit={true} />
        
        {renderStep()}
        
        <div className="flex justify-between pt-6">
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
  
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes || [])
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

  // Mise à jour des quizzes quand les props changent
  useEffect(() => {
    if (initialQuizzes) {
      setQuizzes(initialQuizzes)
    }
  }, [initialQuizzes])

  // Protection contre les données undefined
  const safeQuizzes = quizzes || []

  const filteredQuizzes = safeQuizzes.filter(quiz => {
    if (!quiz) return false
    
    const safeTitle = quiz.title || ""
    const safeDescription = quiz.description || ""
    const safeTechnology = quiz.technology || []
    
    const matchesSearch = safeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         safeDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         safeTechnology.some(tech => tech?.toLowerCase().includes(searchTerm.toLowerCase()))
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
      await onDeleteQuiz(quizToDelete)
      setIsDeleteDialogOpen(false)
      setQuizToDelete(null)
    }
  }

  if (isLoading) {
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
            
            return (
              <Card key={quiz.id} className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70 hover:shadow-xl transition-all duration-300 hover:border-green-300/50 dark:hover:border-green-600/50 group">
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
        onCreateQuiz={onCreateQuiz!}
        isCreating={isCreating}
        availablePositions={availablePositions}
      />

      <EditQuizModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdateQuiz={onUpdateQuiz!}
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