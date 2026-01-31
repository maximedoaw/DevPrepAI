"use client"

import { useState, useTransition, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"
import { Target, Brain, MessageCircle, CheckCircle2, Clock, Sparkles, ArrowRight, Heart, Loader2, Play, Layout, PenTool, XCircle, Building, Star, Wallet, Mic, MicOff, TrendingUp, Video } from "lucide-react"
import { RecommendationCard } from "./recommendation-card"
import { SkillProgress } from "./skill-progress"
import { CareerChangerTestModal } from "./career-changer-test-modal"
import { CareerPlanModal } from "./career-plan-modal"
import { getCareerProfile, startCareerTest, submitCareerTest } from "@/actions/career-profile.action"
import { getTypeIcon, getActivityBgColor } from "@/lib/dashboard-utils"
import { ActivityItem } from "./activity-item"
import { toast } from "sonner"
import type { DashboardData } from "@/types/dashboard"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface CareerChangerDashboardProps {
  data: DashboardData
}

export function CareerChangerDashboard({ data }: CareerChangerDashboardProps) {
  const queryClient = useQueryClient()
  const [showCareerModal, setShowCareerModal] = useState(false)
  const [showCareerPlanModal, setShowCareerPlanModal] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [showPortfolioSpotlight, setShowPortfolioSpotlight] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Query for career profile with cache
  const { data: careerProfileResult } = useQuery({
    queryKey: ["career-profile", data.user.id],
    queryFn: async () => {
      const res = await getCareerProfile()
      return res.success ? res.data : null
    },
    staleTime: Infinity,
  })

  const careerProfile = careerProfileResult?.careerProfile as any
  const dbTestStatus = careerProfileResult?.careerProfileTestStatus || "IDLE"
  const testStatus = dbTestStatus.toLowerCase()

  // Timeline data for career transition
  const timelineSteps = [
    { id: 1, title: "Bilan de compétences", status: testStatus === "DONE" ? "completed" : "in-progress", icon: CheckCircle2 },
    { id: 2, title: "Plan de Reconversion", status: testStatus === "DONE" ? "completed" : "pending", icon: CheckCircle2 },
    { id: 3, title: "Apprentissage & Projets", status: "pending", icon: Clock },
    { id: 4, title: "Préparation Entretiens", status: "pending", icon: Target },
  ]

  // Emotional progress data (simulated from Hume AI)
  const emotionalData = [
    { metric: "Confiance", value: testStatus === "DONE" ? 85 : 65 },
    { metric: "Engagement", value: testStatus === "DONE" ? 90 : 75 },
    { metric: "Motivation", value: testStatus === "DONE" ? 95 : 80 },
    { metric: "Stress", value: testStatus === "DONE" ? 25 : 45 },
  ]

  // Weekly objectives
  const weeklyObjectives = testStatus === "DONE"
    ? [
      { id: 1, title: "Suivre l'étape 1 de ma roadmap", completed: true },
      { id: 2, title: "Coder le premier projet suggéré", completed: false },
      { id: 3, title: "Contacter 2 mentors dans le domaine", completed: false },
    ]
    : [
      { id: 1, title: "Compléter mon profil de carrière", completed: false },
      { id: 2, title: "Identifier mes freins principaux", completed: false },
      { id: 3, title: "Définir mon temps d'apprentissage", completed: false },
    ]

  const handleRunCareerTest = () => {
    setShowCareerModal(true)
  }

  const handleSubmitCareerTest = async () => {
    // Transform answers for the action
    const formattedAnswers = Object.entries(answers).map(([id, answer]) => ({
      questionId: id,
      answer: Array.isArray(answer) ? answer.join(", ") : answer
    }))

    if (formattedAnswers.length < 3) {
      toast.error("Veuillez répondre à toutes les questions pour générer un plan précis.")
      return
    }

    setIsSubmitting(true)
    startTransition(async () => {
      try {
        const result = await submitCareerTest(formattedAnswers, {
          role: data.user.role,
          domains: data.user.domains,
          onboardingDetails: (data as any)?.user?.onboardingDetails,
          onboardingGoals: (data as any)?.user?.onboardingGoals,
        })

        if (result.success) {
          toast.success("Votre plan de carrière a été généré avec succès !")
          queryClient.invalidateQueries({ queryKey: ["career-profile", data.user.id] })
          setShowCareerModal(false)
          setShowCareerPlanModal(true)
        } else {
          toast.error(result.error || "Erreur lors de la génération")
        }
      } catch (error) {
        toast.error("Une erreur imprévue est survenue.")
      } finally {
        setIsSubmitting(false)
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Career Plan Premium Card */}
      {showPortfolioSpotlight && testStatus === "done" && careerProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-all duration-700 animate-in fade-in" onClick={() => setShowPortfolioSpotlight(false)} />
      )}
      <div className={cn(
        "mb-12 relative overflow-hidden rounded-[2rem] border transition-all duration-1000 group",
        showPortfolioSpotlight && testStatus === "done" && careerProfile
          ? "z-50 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 scale-[1.01] bg-white dark:bg-slate-930"
          : "border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm"
      )}>

        {/* Decorative Background Elements */}
        {!showPortfolioSpotlight && (
          <>
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
          </>
        )}

        <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Left Content */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            {!testStatus || testStatus === "idle" || testStatus === "refused" ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
                  <Sparkles className="w-3 h-3" />
                  Nouveau
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase">
                  Ta Nouvelle <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Carrière</span> Commence Ici
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mx-auto md:mx-0 font-medium">
                  Obtenez une feuille de route de reconversion ultra-personnalisée : analyse de compétences transférables, objectifs ciblés et opportunités IA.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
                  <Button
                    size="lg"
                    onClick={() => {
                      startTransition(async () => {
                        setShowCareerModal(true)
                        await startCareerTest()
                      })
                    }}
                    disabled={isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 h-12 text-sm font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all hover:-translate-y-0.5 uppercase tracking-widest"
                  >
                    {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
                    Générer mon plan
                  </Button>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Gratuit & IA-Powered
                  </p>
                </div>
              </>
            ) : isGeneratingPlan ? (
              <div className="w-full max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">L'IA prépare ta reconversion...</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  </div>
                </div>
              </div>
            ) : testStatus === "done" && careerProfile ? (
              <>
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 transition-colors",
                  showPortfolioSpotlight
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                )}>
                  <CheckCircle2 className="w-3 h-3" />
                  Plan Prêt
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase leading-none">
                  Ton Plan de <br /> Reconversion
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mb-6 leading-relaxed font-medium">
                  {careerProfile.summary ? (
                    <span className="line-clamp-2">{careerProfile.summary}</span>
                  ) : "Ta stratégie personnalisée est prête à être déployée."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={() => router.push('/portfolio')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 h-12 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-widest"
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Éditer portfolio
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowCareerPlanModal(true)}
                    className="rounded-2xl px-6 h-12 text-xs font-black transition-all border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 uppercase tracking-widest"
                  >
                    Voir le plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : null}
          </div>

          {/* Right Visual / Illustration */}
          <div className="hidden md:flex flex-1 justify-end relative">
            <div className={cn(
              "relative z-10 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/5 max-w-xs rotate-2 hover:rotate-0 transition-transform duration-700",
              showPortfolioSpotlight && "rotate-0 scale-105"
            )}>
              <div className="flex items-center gap-3 mb-6 border-b border-slate-50 dark:border-white/5 pb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Target className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  <div className="h-1 w-10 bg-slate-100 dark:bg-slate-800/50 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                <div className="h-1 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                <div className="h-1 w-4/6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              </div>
              <div className="mt-8 flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10"></div>
                <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-500/10"></div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10"></div>
              </div>
            </div>

            {/* Abstract Shapes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-emerald-500/5 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 border border-teal-500/10 border-dashed rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Career Timeline */}
          <Card className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight uppercase leading-none">Reconversion</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="space-y-4">
                {timelineSteps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step.status === "completed"
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                          : step.status === "in-progress"
                            ? "bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/20"
                            : "bg-slate-200 dark:bg-slate-800"
                          }`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight">{step.title}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {step.status === "completed"
                            ? "Terminé"
                            : step.status === "in-progress"
                              ? "En cours"
                              : "À venir"}
                        </p>
                      </div>
                      {index < timelineSteps.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-slate-300 hidden sm:block" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Emotional Progress */}
          <Card className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Heart className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight uppercase">Mentalité</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={emotionalData}>
                  <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar name="État actuel" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Objectives */}
          <Card className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight uppercase">Objectifs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyObjectives.map((objective) => (
                  <div
                    key={objective.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${objective.completed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                    >
                      {objective.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span
                      className={`flex-1 text-xs font-bold uppercase tracking-tight ${objective.completed
                        ? "line-through text-slate-400"
                        : "text-slate-700 dark:text-slate-200"
                        }`}
                    >
                      {objective.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <ActivitySection activity={data.recentQuizzes || []} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills Progress */}
          <Card className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Brain className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight uppercase leading-none">Compétences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.skills.length > 0 ? (
                data.skills.slice(0, 5).map((skill) => (
                  <SkillProgress key={skill.id} skill={skill.skill} current={skill.current} />
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500">Génère ton plan pour voir tes compétences cibles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Profile Summary (only if DONE) */}
          {testStatus === "DONE" && careerProfile && (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <CardTitle className="text-base font-bold dark:text-white">Profil IA</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowCareerPlanModal(true)} className="text-emerald-600 h-7 px-2">
                    Voir détails
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl mb-3">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                    {careerProfile.persona?.type || "Reconverti Tech"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                    {careerProfile.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {careerProfile.persona?.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800 text-slate-600 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Coach */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-inner">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Alexis</h3>
                  <p className="text-xs text-emerald-50 font-medium">Coach Reconversion & IA</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20">
                <p className="text-white text-sm leading-relaxed">
                  {testStatus === "DONE"
                    ? "Ton plan est prêt ! On commence par ton premier projet aujourd'hui ?"
                    : "Pour une reconversion réussie, la clarté est essentielle. On identifie tes freins ensemble ?"}
                </p>
              </div>

              {testStatus === "DONE" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setShowCareerPlanModal(true)}
                    className="w-full bg-white text-emerald-900 hover:bg-slate-100 shadow-xl font-bold border-0 h-11"
                  >
                    Mon Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-white border-white/40 hover:bg-white/10 h-11"
                    onClick={() => setShowCareerModal(true)}
                  >
                    Réajuster
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleRunCareerTest}
                  disabled={isPending || isSubmitting}
                  className="w-full bg-white text-emerald-900 hover:bg-slate-100 shadow-xl font-bold border-0 h-12 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Lancer le test (2 min)
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CareerChangerTestModal
        open={showCareerModal}
        onClose={() => setShowCareerModal(false)}
        answers={answers}
        setAnswers={setAnswers}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        onSubmit={handleSubmitCareerTest}
        isSubmitting={isSubmitting}
      />

      <CareerPlanModal
        open={showCareerPlanModal}
        onClose={() => setShowCareerPlanModal(false)}
        careerPlan={careerProfile}
        onEditAnswers={() => {
          setShowCareerPlanModal(false);
          // Hydrate answers from saved careerProfileAnswers
          if (careerProfileResult?.careerProfileAnswers) {
            const savedAnswers = careerProfileResult.careerProfileAnswers as any[];
            const answersMap: Record<string, string | string[]> = {};
            savedAnswers.forEach((ans: any) => {
              answersMap[ans.questionId] = ans.answer || "";
            });
            setAnswers(answersMap);
          }
          setShowCareerModal(true);
          setCurrentQuestion(0);
        }}
      />
    </div>
  );
}

function ActivitySection({ activity }: { activity: any[] }) {
  const [itemsToShow, setItemsToShow] = useState(5);
  const hasMore = activity.length > itemsToShow;

  return (
    <Card className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-black tracking-tight uppercase">Activité</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activity.length > 0 ? (
            <>
              {activity.slice(0, itemsToShow).map((item: any) => (
                <ActivityItem
                  key={item.id}
                  icon={getTypeIcon(item.type)}
                  title={item.title}
                  score={item.score}
                  xp={item.xp}
                  time={item.time || item.completedAt}
                  bgColor={getActivityBgColor(item.type)}
                />
              ))}

              <div className="pt-4 flex justify-center">
                {hasMore ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setItemsToShow(prev => prev + 5)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-xl"
                  >
                    Voir plus d'activités
                  </Button>
                ) : activity.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setItemsToShow(5)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-xl"
                  >
                    Réduire la liste
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Aucune activité</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
