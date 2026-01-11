"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  Mail,
  CreditCard,
  FileText,
  Filter,
  ChevronDown,
  Users,
  LayoutDashboard,
  Zap,
  Trash2,
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  Settings2,
  Mic,
  MicOff,
  Wand2,
  Loader2,
  MinusCircle,
  PlusCircle,
  CheckCircle2,
  X,
  ChevronRight
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from 'sonner'
import {
  getAdminStats,
  getUsers,
  getQuizzes,
  getSubscriptions,
  getQuizResults,
  updateSubscription,
  createQuiz,
  deleteQuiz,
  deleteQuizResult,
  getMonthlySubscriptionRevenue
} from '@/actions/admin.action'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminHeader } from '@/components/admin/admin-header'
import DevLoader from '@/components/dev-loader'
import StatsCards from './components/stats-cards'
import { OverviewTab } from '@/components/admin/overview-tab'

// Constants
const DOMAINS = [
  "MACHINE_LEARNING",
  "DEVELOPMENT",
  "DATA_SCIENCE",
  "FINANCE",
  "BUSINESS",
  "ENGINEERING",
  "DESIGN",
  "DEVOPS",
  "CYBERSECURITY",
  "MARKETING",
  "PRODUCT",
  "ARCHITECTURE",
  "MOBILE",
  "WEB",
  "COMMUNICATION",
  "MANAGEMENT",
  "EDUCATION",
  "HEALTH"
]

const QUIZ_TYPES = [
  { id: "TECHNICAL", label: "Technique", icon: FileText, color: "text-blue-500" },
  { id: "QCM", label: "QCM", icon: Target, color: "text-emerald-500" },
  { id: "SOFT_SKILLS", label: "Soft Skills", icon: Users, color: "text-amber-500" },
  { id: "MOCK_INTERVIEW", label: "Entretien Vocal", icon: Sparkles, color: "text-purple-500" },
]

// Types
interface AdminStats {
  totalUsers: number
  totalQuizzes: number
  totalQuizResults: number
  totalSubscriptions: number
  recentUsers: any[]
  recentQuizResults: any[]
  subscriptionStats: any[]
  quizTypeStats: any[]
  monthlyRevenue?: any
}

// --- Dynamic Form Components ---

const DictaphoneControl = ({ onTranscript, className }: { onTranscript: (t: string) => void, className?: string }) => {
  const [isListening, setIsListening] = useState(false)

  const toggleListen = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Dictée vocale non supportée")
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
    }
    recognition.start()
  }, [isListening, onTranscript])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleListen}
      className={cn("h-8 w-8 rounded-full", isListening ? "bg-red-50 text-red-500 animate-pulse" : "text-slate-400 hover:text-emerald-500", className)}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  )
}

// --- Page Component ---

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])

  // Quiz Form State
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    type: 'QCM',
    difficulty: 'JUNIOR',
    company: '',
    technology: [] as string[],
    domain: 'DEVELOPMENT',
    duration: '30',
    totalPoints: '100',
    questions: [] as any[]
  })
  const [techInput, setTechInput] = useState('')
  const [numAIQuestions, setNumAIQuestions] = useState('5')

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [statsData, usersData, quizzesData, resultsData, monthlyRevenue] = await Promise.all([
          getAdminStats(),
          getUsers(1, 100),
          getQuizzes(1, 100),
          getQuizResults(1, 100),
          getMonthlySubscriptionRevenue(),
        ])
        setStats({ ...statsData, monthlyRevenue })
        setUsers(usersData.users)
        setQuizzes(quizzesData.quizzes)
      } catch (error) {
        console.error('Data loading error:', error)
        toast.error('Erreur de chargement des données')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (quizForm.questions.length === 0) {
      toast.error("Veuillez ajouter au moins une question")
      return
    }

    setCreatingQuiz(true)
    try {
      await createQuiz({
        title: quizForm.title,
        description: quizForm.description,
        type: quizForm.type,
        questions: quizForm.questions,
        difficulty: quizForm.difficulty,
        company: quizForm.company,
        technology: quizForm.technology,
        domain: quizForm.domain,
        duration: Number(quizForm.duration),
        totalPoints: Number(quizForm.totalPoints)
      })

      toast.success('Quiz créé avec succès')
      setShowQuizForm(false)
      const updated = await getQuizzes(1, 100)
      setQuizzes(updated.quizzes)
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la création')
    } finally {
      setCreatingQuiz(false)
    }
  }

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm("Supprimer ce quiz définitivement ?")) return
    try {
      await deleteQuiz(id)
      toast.success("Quiz supprimé")
      setQuizzes(prev => prev.filter(q => q.id !== id))
    } catch (e) {
      toast.error("Erreur de suppression")
    }
  }

  // --- AI Logic ---
  const generateWithAI = async () => {
    if (!quizForm.domain || quizForm.technology.length === 0) {
      toast.error("Veuillez remplir le domaine et au moins une technologie")
      return
    }

    setGeneratingAI(true)
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate-interview',
          quizType: quizForm.type,
          domain: quizForm.domain,
          difficulty: quizForm.difficulty,
          numberOfQuestions: Number(numAIQuestions),
          technology: quizForm.technology,
          totalPoints: Number(quizForm.totalPoints),
          description: quizForm.description
        })
      })

      const result = await response.json()
      if (result.success) {
        setQuizForm(f => ({
          ...f,
          title: result.data.title,
          description: result.data.description,
          questions: result.data.questions
        }))
        toast.success("Contenu généré par l'IA !")
      } else {
        throw new Error(result.error)
      }
    } catch (e: any) {
      toast.error("Échec de la génération IA : " + e.message)
    } finally {
      setGeneratingAI(false)
    }
  }

  // --- Dynamic Question Logic ---
  const addQuestion = () => {
    const newQuestion = quizForm.type === 'QCM'
      ? { text: '', options: ['', '', '', ''], correctAnswer: 0, type: 'multiple_choice' }
      : { text: '', correctAnswer: '', explanation: '', type: 'open_ended' }

    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const removeQuestion = (index: number) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const updateQuestion = (index: number, data: any) => {
    setQuizForm(prev => {
      const newQs = [...prev.questions]
      newQs[index] = { ...newQs[index], ...data }
      return { ...prev, questions: newQs }
    })
  }

  const handleAddTech = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter' && e.key !== ' ') return
    if (e) e.preventDefault()

    const val = techInput.trim()
    if (!val) return
    if (quizForm.technology.includes(val)) {
      setTechInput('')
      return
    }

    setQuizForm(f => ({ ...f, technology: [...f.technology, val] }))
    setTechInput('')
  }

  const handleRemoveTech = (tech: string) => {
    setQuizForm(f => ({ ...f, technology: f.technology.filter(t => t !== tech) }))
  }

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      const matchSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = selectedType === 'all' || q.type === selectedType
      return matchSearch && matchType
    })
  }, [quizzes, searchTerm, selectedType])

  if (loading) return <DevLoader />

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <AdminHeader />

        {stats && <StatsCards stats={stats} />}

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          <div className="w-full lg:w-64 space-y-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'quizzes', label: 'Entretiens & Quiz', icon: Target },
              { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
              { id: 'results', label: 'Résultats', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-bold uppercase tracking-wider",
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 dark:text-slate-400"
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 w-full space-y-6">

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <OverviewTab stats={stats!} />
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-500" />
                      Gestion Utilisateurs
                    </h2>
                    <div className="relative max-w-sm w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                          <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest pl-6">Utilisateur</TableHead>
                          <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Abonnement</TableHead>
                          <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Crédits</TableHead>
                          <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Date</TableHead>
                          <TableHead className="text-right pr-6 uppercase text-[10px] tracking-widest">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-slate-50 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-3 py-1">
                                <Avatar className="h-9 w-9 ring-2 ring-slate-100 dark:ring-slate-800">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-bold text-xs uppercase">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{user.firstName} {user.lastName}</p>
                                  <p className="text-[11px] text-slate-400 font-medium">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                                user.subscription?.tier === 'EXPERT' ? "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800" :
                                  user.subscription?.tier === 'PREMIUM' ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" :
                                    "bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                              )}>
                                {user.subscription?.tier || 'FREE'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{user.credits}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-400 font-medium">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-500">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'quizzes' && (
                <motion.div
                  key="quizzes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Target className="h-5 w-5 text-emerald-500" />
                        Banque d'Entretiens
                      </h2>
                      <Dialog open={showQuizForm} onOpenChange={setShowQuizForm}>
                        <DialogTrigger asChild>
                          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-6 font-bold shadow-lg shadow-emerald-500/20 transition-all">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer un Entretien
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0 rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <DialogHeader className="p-6 md:p-8 flex flex-row items-center justify-between border-b bg-white dark:bg-slate-900/50 backdrop-blur-xl z-20">
                            <div>
                              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Nouvel Entretien</DialogTitle>
                              <DialogDescription>Concevoir une nouvelle session d'entraînement IA.</DialogDescription>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                <Label className="text-[9px] font-black uppercase text-slate-400 px-2 leading-none cursor-default">Questions</Label>
                                <Input
                                  type="number"
                                  value={numAIQuestions}
                                  onChange={e => setNumAIQuestions(e.target.value)}
                                  className="w-12 h-8 bg-white dark:bg-slate-950 border-none text-center font-bold text-xs p-0 rounded-lg focus-visible:ring-0"
                                />
                              </div>
                              <Button
                                type="button"
                                onClick={generateWithAI}
                                disabled={generatingAI}
                                className="bg-emerald-600 dark:bg-emerald-600 text-white font-bold px-4 h-11 rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                              >
                                {generatingAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                Générer avec l'IA
                              </Button>
                            </div>
                          </DialogHeader>

                          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">
                            <form onSubmit={handleCreateQuiz} className="space-y-10 pb-8">
                              {/* Meta Info Section - GRID 1 */}
                              <div className="grid grid-cols-1 gap-8 bg-slate-50 dark:bg-slate-800/10 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                <div className="space-y-6">
                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Titre de la session</label>
                                      <div className="relative group">
                                        <Input
                                          placeholder="Entretien Fullstack React..."
                                          value={quizForm.title}
                                          onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))}
                                          className="h-12 rounded-2xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 pr-10 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                                          required
                                        />
                                        <DictaphoneControl onTranscript={(t) => setQuizForm(f => ({ ...f, title: t }))} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100" />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type de Test</label>
                                      <Select value={quizForm.type} onValueChange={v => setQuizForm(f => ({ ...f, type: v, questions: [] }))}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm font-medium">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800">
                                          {QUIZ_TYPES.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description / Contexte</label>
                                    <div className="relative group">
                                      <Textarea
                                        placeholder="Précisez le contexte du test pour guider l'IA ou le candidat..."
                                        value={quizForm.description}
                                        onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))}
                                        className="rounded-2xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-[100px] shadow-sm font-medium pr-10"
                                      />
                                      <DictaphoneControl onTranscript={(t) => setQuizForm(f => ({ ...f, description: f.description + " " + t }))} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Difficulté</label>
                                      <Select value={quizForm.difficulty} onValueChange={v => setQuizForm(f => ({ ...f, difficulty: v }))}>
                                        <SelectTrigger className="h-12 rounded-2xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="JUNIOR">Junior</SelectItem>
                                          <SelectItem value="MID">Intermédiaire</SelectItem>
                                          <SelectItem value="SENIOR">Senior</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Points Totaux</label>
                                      <Input type="number" value={quizForm.totalPoints} onChange={e => setQuizForm(f => ({ ...f, totalPoints: e.target.value }))} className="h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 font-medium" />
                                    </div>

                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Expertise (Domaine)</label>
                                      <Select value={quizForm.domain} onValueChange={v => setQuizForm(f => ({ ...f, domain: v }))}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 font-medium">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {DOMAINS.map(d => <SelectItem key={d} value={d} className="text-xs uppercase font-bold">{d.replace(/_/g, ' ')}</SelectItem>)}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Entreprise Cible</label>
                                      <Input placeholder="Google, Startup..." value={quizForm.company} onChange={e => setQuizForm(f => ({ ...f, company: e.target.value }))} className="h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 font-medium" required />
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Technologies/Outils (Entrée ou Espace pour ajouter)</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl min-h-[56px] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                                      {quizForm.technology.map(tech => (
                                        <Badge key={tech} className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50 rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-bold text-xs group/badge">
                                          {tech}
                                          <button type="button" onClick={() => handleRemoveTech(tech)} className="hover:text-red-500">
                                            <X className="h-3 w-3" />
                                          </button>
                                        </Badge>
                                      ))}
                                      <input
                                        type="text"
                                        value={techInput}
                                        onChange={e => setTechInput(e.target.value)}
                                        onKeyDown={handleAddTech}
                                        placeholder={quizForm.technology.length === 0 ? "Ex: React, Next.js, Figma..." : ""}
                                        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm font-medium"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Dynamic Questions Section - ACCORDION */}
                              <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                                      <FileText className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    Structure des Questions
                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md font-black text-xs h-6">{quizForm.questions.length}</Badge>
                                  </h3>
                                  <Button type="button" onClick={addQuestion} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-5 font-bold transition-all shadow-md">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Ajouter une question
                                  </Button>
                                </div>

                                <Accordion type="multiple" defaultValue={["q-0"]} className="space-y-4">
                                  {quizForm.questions.map((q, idx) => (
                                    <AccordionItem key={idx} value={`q-${idx}`} className="border border-slate-100 dark:border-slate-800 rounded-[1.5rem] bg-white dark:bg-slate-900 overflow-hidden shadow-sm group/q">
                                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/20 group">
                                        <div className="flex items-center gap-4 text-left">
                                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-black">
                                            {idx + 1}
                                          </div>
                                          <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                                              {q.text || "Nouvelle question..."}
                                            </p>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-left">
                                              {quizForm.type} • {q.points || 0} pts
                                            </p>
                                          </div>
                                        </div>
                                      </AccordionTrigger>

                                      <AccordionContent className="px-8 pb-8 pt-2">
                                        <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-2">
                                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Énoncé de la question</label>
                                              <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(idx)} className="h-7 w-7 text-slate-300 hover:text-red-500 rounded-lg">
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </div>
                                            <div className="relative group/field">
                                              <Textarea
                                                value={q.text}
                                                onChange={e => updateQuestion(idx, { text: e.target.value })}
                                                placeholder="Ex: Quelle est la différence entre un état et une propriété en React ?"
                                                className="rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 min-h-[100px] text-sm font-medium pr-10 focus-visible:ring-0"
                                                required
                                              />
                                              <DictaphoneControl onTranscript={(t) => updateQuestion(idx, { text: q.text + " " + t })} className="absolute right-2 top-2 opacity-0 group-hover/field:opacity-100" />
                                            </div>
                                          </div>

                                          {quizForm.type === 'QCM' ? (
                                            <div className="grid grid-cols-1 gap-6 mt-2">
                                              {q.options.map((opt: string, optIdx: number) => (
                                                <div key={optIdx} className="space-y-2">
                                                  <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                      "w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all",
                                                      q.correctAnswer === optIdx ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400"
                                                    )}>
                                                      {String.fromCharCode(65 + optIdx)}
                                                    </div>
                                                    <div className="relative flex-1 group/opt">
                                                      <Input
                                                        value={opt}
                                                        onChange={e => {
                                                          const newOpts = [...q.options]
                                                          newOpts[optIdx] = e.target.value
                                                          updateQuestion(idx, { options: newOpts })
                                                        }}
                                                        placeholder={`Réponse optionnelle ${optIdx + 1}`}
                                                        className={cn(
                                                          "h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium pr-10",
                                                          q.correctAnswer === optIdx && "border-emerald-500 ring-4 ring-emerald-500/10"
                                                        )}
                                                        required
                                                      />
                                                      <DictaphoneControl onTranscript={(t) => {
                                                        const newOpts = [...q.options]
                                                        newOpts[optIdx] = t
                                                        updateQuestion(idx, { options: newOpts })
                                                      }} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover/opt:opacity-100" />
                                                    </div>
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() => updateQuestion(idx, { correctAnswer: optIdx })}
                                                      className={cn("h-9 w-9 rounded-xl transition-all", q.correctAnswer === optIdx ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "text-slate-200 hover:text-emerald-300")}
                                                    >
                                                      <CheckCircle2 className="h-5 w-5" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="grid grid-cols-1 gap-6 pt-2">
                                              <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Réponse attendue / Critères de validation</label>
                                                <div className="relative group/field">
                                                  <Textarea
                                                    value={q.correctAnswer}
                                                    onChange={e => updateQuestion(idx, { correctAnswer: e.target.value })}
                                                    className="rounded-2xl bg-emerald-50/20 dark:bg-emerald-900/10 border-emerald-100/30 dark:border-emerald-800/30 min-h-[100px] text-sm font-medium pr-10"
                                                    placeholder="Décrivez précisément ce qui est attendu du candidat..."
                                                  />
                                                  <DictaphoneControl onTranscript={(t) => updateQuestion(idx, { correctAnswer: q.correctAnswer + " " + t })} className="absolute right-2 top-2 opacity-0 group-hover/field:opacity-100" />
                                                </div>
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Explication pédagogique (Optionnelle)</label>
                                                <div className="relative group/field">
                                                  <Textarea
                                                    value={q.explanation}
                                                    onChange={e => updateQuestion(idx, { explanation: e.target.value })}
                                                    className="rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 min-h-[80px] text-xs font-medium pr-10"
                                                    placeholder="Pourquoi cette approche est la meilleure ? Donnez des détails pédagogiques."
                                                  />
                                                  <DictaphoneControl onTranscript={(t) => updateQuestion(idx, { explanation: q.explanation + " " + t })} className="absolute right-2 top-2 opacity-0 group-hover/field:opacity-100" />
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>

                                {quizForm.questions.length === 0 && (
                                  <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-800/10 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl w-fit mx-auto shadow-sm mb-4">
                                      <PlusCircle className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Structure vide</p>
                                    <p className="text-slate-500 text-sm mt-1">Générez avec l'IA ou ajoutez manuellement des questions.</p>
                                    <Button type="button" onClick={addQuestion} className="mt-6 rounded-xl bg-slate-900 text-white font-bold h-11 px-6">
                                      Ajouter la première question
                                    </Button>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" onClick={() => setShowQuizForm(false)} variant="ghost" className="rounded-2xl h-14 px-8 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50">Annuler</Button>
                                <Button type="submit" disabled={creatingQuiz} className="h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 transition-all rounded-2xl">
                                  {creatingQuiz ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                                  Publier l'Entretien
                                </Button>
                              </div>
                            </form>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Chercher par titre ou entreprise"
                          className="pl-10 rounded-2xl border-none bg-slate-100 dark:bg-slate-800/50"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-full sm:w-48 rounded-2xl border-none bg-slate-100 dark:bg-slate-800/50 text-sm font-medium">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">Tous les types</SelectItem>
                          {QUIZ_TYPES.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuizzes.map((quiz) => {
                      const typeInfo = QUIZ_TYPES.find(t => t.id === quiz.type) || QUIZ_TYPES[0]
                      return (
                        <div key={quiz.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800", typeInfo.color)}>
                              <typeInfo.icon className="h-5 w-5" />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">{quiz.company}</p>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">{quiz.title}</h3>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {quiz.technology.slice(0, 3).map((t: string) => (
                                <Badge key={t} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold border-none px-2 rounded-md">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex gap-4">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-500">{quiz.duration}m</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-500">{quiz.totalPoints}pts</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-slate-300" />
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200">{quiz._count?.results || 0}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {['subscriptions', 'results'].includes(activeTab) && (
                <motion.div
                  key="other"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800"
                >
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Section en cours d'optimisation</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </div>
  )
}