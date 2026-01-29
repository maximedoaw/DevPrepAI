"use client"

import { useState, useTransition, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"
import { Target, Brain, MessageCircle, CheckCircle2, Clock, Sparkles, ArrowRight, Heart, Loader2 } from "lucide-react"
import { RecommendationCard } from "./recommendation-card"
import { SkillProgress } from "./skill-progress"
import { CareerChangerTestModal } from "./career-changer-test-modal"
import { CareerPlanModal } from "./career-plan-modal"
import { getCareerProfile, submitCareerTest } from "@/actions/career-profile.action"
import { toast } from "sonner"
import type { DashboardData } from "@/types/dashboard"

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
  const [isPending, startTransition] = useTransition()

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
  const testStatus = careerProfileResult?.careerProfileTestStatus || "IDLE"

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Career Timeline */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-emerald-500" />
                <CardTitle className="text-slate-900 dark:text-white">Mon Parcours de Reconversion</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">
                Suivez votre progression étape par étape
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        <h4 className="font-semibold text-slate-900 dark:text-white">{step.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
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
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-emerald-500" />
                <CardTitle className="text-slate-900 dark:text-white">Progression Émotionnelle</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Analyse de ton état d'esprit actuel</CardDescription>
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
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-emerald-500" />
                <CardTitle className="text-slate-900 dark:text-white">Objectifs de la Semaine</CardTitle>
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
                      className={`flex-1 ${objective.completed
                        ? "line-through text-slate-500"
                        : "text-slate-900 dark:text-white font-medium"
                        }`}
                    >
                      {objective.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills Progress */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-emerald-500" />
                <CardTitle className="text-slate-900 dark:text-white">Compétences cibles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
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
  )
}

