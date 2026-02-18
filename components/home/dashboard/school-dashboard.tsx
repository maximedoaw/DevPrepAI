"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts"
import {
  GraduationCap,
  Users,
  TrendingUp,
  Award,
  Download,
  UserPlus,
  Building2,
  Target,
  Zap,
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  MapPin,
  Layout,
  Handshake,
  Heart,
  MessageCircle,
  Trophy,
  UsersRound,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { DashboardData } from "@/types/dashboard"
import Image from "next/image"
import { FormationTestModal } from "./formation-test-modal"
import { FormationPlanModal } from "./formation-plan-modal"
import { submitFormationTest, getFormationProfile, type FormationTestAnswer } from "@/actions/formation-plan.action"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Brain } from "lucide-react"

interface SchoolDashboardProps {
  data: DashboardData
}

export function SchoolDashboard({ data }: SchoolDashboardProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"performance" | "market">("performance")
  const [showProgramModal, setShowProgramModal] = useState(false)
  const [showFormationPlanModal, setShowFormationPlanModal] = useState(false)

  // Fetch formation strategy
  const { data: formationData, isLoading: loadingFormation } = useQuery({
    queryKey: ["formation-profile"],
    queryFn: () => getFormationProfile()
  })

  const createProgramMutation = useMutation({
    mutationFn: (answers: FormationTestAnswer[]) => submitFormationTest(answers, {
      role: data.user.role,
      domains: data.user.domains,
      onboardingDetails: data.user.onboardingDetails,
      onboardingGoals: data.user.onboardingGoals
    }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Stratégie pédagogique générée avec succès !")
        queryClient.invalidateQueries({ queryKey: ["formation-profile"] })
        setShowProgramModal(false)
        setShowFormationPlanModal(true)
      } else {
        toast.error(res.error || "Erreur lors de la génération")
      }
    },
    onError: () => {
      toast.error("Une erreur imprévue est survenue.")
    }
  })

  const handleCreateProgram = (answersRecord: Record<string, string>) => {
    const answers: FormationTestAnswer[] = Object.entries(answersRecord).map(([id, val]) => ({
      questionId: id,
      answer: val
    }))
    createProgramMutation.mutate(answers)
  }

  // Mock data for a more "Human" feel
  const successStories = [
    { id: 1, name: "Samuel Owona", role: "Développeur Fullstack @Camtel", avatar: "SE", text: "Grâce au plan SkillWokz, j'ai pallié mes lacunes en Cloud en 3 mois.", date: "Il y a 2 jours" },
    { id: 2, name: "Awa Ndongo", role: "Designer UI/UX @Orange", avatar: "AN", text: "Ma formation est enfin alignée sur ce que les recruteurs demandent à Douala.", date: "Il y a 5 jours" },
    { id: 3, name: "Ibrahim Bello", role: "Data Analyst @EcoBank", avatar: "IB", text: "Le radar d'alignement m'a permis de cibler les bons projets.", date: "Hier" },
  ]

  const instructorsSpotlight = [
    { name: "Dr. Fotso", expertise: "IA & Big Data", rating: 4.9, activeStudents: 45 },
    { name: "Mme. Kamga", expertise: "Design Thinking", rating: 4.8, activeStudents: 32 },
  ]

  // Mock data for school analytics - Alignment with Cameroon market context
  const alignmentData = [
    { subject: "Dev Web (Fullstack)", school: 85, market: 95 },
    { subject: "Data Science", school: 40, market: 70 },
    { subject: "Mobile (Flutter/React Native)", school: 90, market: 85 },
    { subject: "Cloud & DevOps", school: 30, market: 75 },
    { subject: "Cybersecurité", school: 20, market: 65 },
    { subject: "Soft Skills", school: 75, market: 90 },
  ]

  const employabilityHistory = [
    { month: "Sep", rate: 65 },
    { month: "Oct", rate: 68 },
    { month: "Nov", rate: 72 },
    { month: "Dec", rate: 70 },
    { month: "Jan", rate: 78 },
    { month: "Fév", rate: 85 },
  ]

  const topDemandedSkills = [
    { name: "React/Next.js", demand: 92, color: "#10b981" },
    { name: "Python / Data", demand: 78, color: "#3b82f6" },
    { name: "UI/UX Design", demand: 65, color: "#f59e0b" },
    { name: "Node.js / Go", demand: 74, color: "#8b5cf6" },
    { name: "DevOps / Docker", demand: 68, color: "#06b6d4" },
  ]

  const missingSkillsAlerts = [
    { id: 1, skill: "Cloud Native (AWS/Azure)", gap: "Très Élevé", impact: "Forte perte d'opportunités à l'international" },
    { id: 2, skill: "Intelligence Artificielle générative", gap: "Élevé", impact: "Retard technologique sur les nouveaux projets" },
    { id: 3, skill: "Gestion de projet Agile", gap: "Modéré", impact: "Difficulté d'intégration en entreprise" },
  ]

  const stats = [
    { label: "Insertion Réussie", value: "85%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Talents Actifs", value: "154", icon: UsersRound, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Score Communauté", value: "4.8/5", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Skill Gap Score", value: "72/100", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 space-y-8">

      {/* Human-Centric Hero Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Portail d'Accompagnement Académique
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              Le Cœur de Votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Académie</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
              Transformez chaque étudiant en un talent prêt pour le marché. Pilotez l'alignement pédagogique tout en cultivant une communauté de réussite.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Student of the Month / Spotlight */}
        <Card className="lg:w-80 border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
          <CardContent className="p-8 flex flex-col items-center text-center justify-center h-full space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-emerald-500/10">
                <AvatarImage src="/api/placeholder/400/400" />
                <AvatarFallback className="bg-emerald-500 text-white font-black text-2xl">JE</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 p-2 rounded-xl shadow-lg border-2 border-slate-900">
                <Trophy className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tighter text-xl leading-none">Joël Embiid</h3>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Étudiant du Mois</p>
            </div>
            <p className="text-[10px] text-slate-300 font-medium italic">
              "Mastering Cloud Architecture at record speed. Total alignment achieved."
            </p>
            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest h-10">
              Voir Profil
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Strategy & Engagement */}
        <div className="lg:col-span-2 space-y-8">

          {/* AI Strategic Vision (New Section) */}
          {formationData?.success && formationData.data?.formationProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 px-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Brain className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Vision Stratégique IA</h2>
              </div>

              <Card className="border-0 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      "{(formationData.data.formationProfile as any).summary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(formationData.data.formationProfile as any).strategicPillars?.map((pillar: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-tight text-emerald-600">{pillar.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{pillar.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Focus Institutionnel</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {(formationData.data.formationProfile as any).institutionalFocus}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFormationPlanModal(true)}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-500/10 rounded-xl"
                      >
                        Consulter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProgramModal(true)}
                        className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/10 rounded-xl"
                      >
                        Mettre à jour
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Success Wall / Community Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Mur de la Réussite</h2>
              </div>
              <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl">
                Tout voir <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {successStories.map((story) => (
                <motion.div
                  key={story.id}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4 relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between">
                    <Avatar className="w-12 h-12 border-2 border-emerald-500/20">
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">{story.avatar}</AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-emerald-500 transition-colors">{story.date}</Badge>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{story.name}</h4>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{story.role}</p>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    "{story.text}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Academic Ecosystem & Actions */}
        <div className="space-y-8">

          {/* Top Formateurs Spotlight */}
          <Card className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-tight">Formateurs Stars</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {instructorsSpotlight.map((instructor) => (
                <div key={instructor.name} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group">
                  <Avatar className="w-10 h-10 rounded-xl group-hover:scale-110 transition-transform">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black">{instructor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white">{instructor.name}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{instructor.expertise}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-[10px] font-black text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      {instructor.rating}
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{instructor.activeStudents} élèves</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-10 rounded-xl border-dashed border-2">
                Recruter un Formateur
              </Button>
            </CardContent>
          </Card>

          {/* Quick Cockpit - Academic Operations */}
          <Card className="border-slate-200/60 dark:border-white/5 bg-gradient-to-br from-emerald-600 to-teal-700 shadow-xl rounded-[2.5rem] overflow-hidden group">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">Accompagnement Pédagogique</h3>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setShowProgramModal(true)}
                  className="w-full bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest shadow-xl border-0"
                >
                  <Plus className="w-4 h-4 mr-2" /> Créer un Programme IA
                </Button>
                <Button variant="ghost" className="w-full text-white hover:bg-white/10 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest border border-white/20">
                  Inscrire une Cohorte
                </Button>
                <Button variant="ghost" className="w-full text-white hover:bg-white/10 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest border border-white/20">
                  Générer Rapports Insertion
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Partner Network Ticker */}
          <div className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Handshake className="w-4 h-4 text-blue-500" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Réseau Partenaires</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Camtel", "Orange", "EcoBank", "UBA", "Sodecoton"].map((p) => (
                <Badge key={p} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase px-3 py-1 rounded-full border-0">
                  {p}
                </Badge>
              ))}
            </div>
          </div>

        </div>
      </div>

      <FormationTestModal
        isOpen={showProgramModal}
        onClose={() => setShowProgramModal(false)}
        onSubmit={handleCreateProgram}
        isSubmitting={createProgramMutation.isPending}
      />
      <FormationPlanModal
        isOpen={showFormationPlanModal}
        onClose={() => setShowFormationPlanModal(false)}
        plan={formationData?.data?.formationProfile}
      />
    </div >
  )
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}

function Star({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
}
