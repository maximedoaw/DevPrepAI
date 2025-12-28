"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserApplications } from "@/actions/application.action"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,

  ResponsiveContainer,
} from "recharts"
import { Target, Trophy, Brain, Sparkles, Play, Video, TrendingUp, Briefcase, Building, CheckCircle2, XCircle, Clock, Star, ArrowRight, Wallet, Layout, PenTool } from "lucide-react"
import { useRouter } from "next/navigation"
import { MissionCard } from "./mission-card"
import { ActivityItem } from "./activity-item"
import { AchievementBadge } from "./achievement-badge"
import { SkillProgress } from "./skill-progress"
import { RecommendationCard } from "./recommendation-card"
import { ChartWrapper } from "./chart-wrapper"
import { WeeklyChart } from "@/components/interviews/weekly-chart"
import { getTypeIcon, getActivityBgColor } from "@/lib/dashboard-utils"
import type { DashboardData, Mission, Achievement } from "@/types/dashboard"
import { FeedbackModal, FeedbackModalDetails } from "@/components/feedback-modal"
import { buildSkillProgressFromFeedback, safeParseJson } from "@/lib/feedback-utils"
import { toast } from "sonner"
import { getCareerProfile, startCareerTest, refuseCareerTest, submitCareerTest, type CareerTestAnswer } from "@/actions/career-profile.action"
import { Loader2, X, Sparkles as SparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CareerPlanModal } from "./career-plan-modal"

interface CandidateDashboardProps {
  data: DashboardData
  missions: Mission[]
  achievements: Achievement[]
  isLoadingMissions: boolean
  isLoadingAchievements: boolean
}

export function CandidateDashboard({
  data,
  missions,
  achievements,
  isLoadingMissions,
  isLoadingAchievements,
}: CandidateDashboardProps) {
  // Récupérer les candidatures de l'utilisateur avec leurs résultats
  const queryClient = useQueryClient();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalDetails, setFeedbackModalDetails] = useState<FeedbackModalDetails | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "accepted" | "refused" | "done">("idle");
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showCareerPlanModal, setShowCareerPlanModal] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmittingCareer, setIsSubmittingCareer] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isPendingCareer, startTransitionCareer] = useTransition();
  const router = useRouter();

  // Query pour le profil de carrière avec cache
  const { data: careerProfileResult } = useQuery({
    queryKey: ["career-profile", data.user.id],
    queryFn: async () => {
      const res = await getCareerProfile();
      return res.success ? res.data : null;
    },
    staleTime: Infinity, // Le profil ne change pas souvent, on le garde en cache
  });

  const careerProfile = careerProfileResult?.careerProfile as any;

  /* State for the portfolio proposal spotlight */
  const [showPortfolioSpotlight, setShowPortfolioSpotlight] = useState(false);

  // Synchroniser l'état local avec les données du cache
  useEffect(() => {
    if (careerProfileResult) {
      if (careerProfileResult.careerProfileTestStatus === "DONE") {
        setTestStatus("done");
        // We do NOT set showPortfolioSpotlight here to respect "juste une seule fois après qu'on est rediger"
        // It will only be triggered by the submission action
      }
      if (careerProfileResult.careerProfileTestStatus === "REFUSED") setTestStatus("refused");
    }
  }, [careerProfileResult]);

  const careerQuestions = useMemo(() => {
    const onboardingDetails = (data as any)?.user?.onboardingDetails || {};
    const onboardingGoals = (data as any)?.user?.onboardingGoals || {};
    const domainLabel = (onboardingDetails.domain || onboardingGoals.domain || data.user?.domains?.[0] || "votre domaine").toString();
    const seniority = onboardingDetails.seniority || onboardingGoals.seniority || onboardingDetails.level || onboardingGoals.level;
    const preferedWork = onboardingDetails.workMode || onboardingGoals.workMode;
    const targetRole = onboardingGoals.roleTarget || onboardingDetails.roleTarget || data.user?.role;
    const learningFocus = onboardingGoals.learningFocus || onboardingDetails.learningFocus;
    const industries = onboardingGoals.industries || onboardingDetails.industries;

    return [
      {
        id: "role",
        label: `Parle-moi de ton rôle actuel ou ciblé (${targetRole || domainLabel}).`,
        placeholder: "Ex: Développeur front, Product designer, Data analyst..."
      },
      {
        id: "tasks",
        label: "Quelles sont tes missions quotidiennes ou celles que tu souhaites faire ?",
        placeholder: "Ex: Intégration UI, A/B tests, dashboards data, refonte archi..."
      },
      {
        id: "stack",
        label: `Quelles techno / outils utilises-tu ou veux-tu pratiquer (domaine ${domainLabel}) ?`,
        placeholder: "Ex: TypeScript, React, Next.js, SQL, Python, Figma..."
      },
      {
        id: "preferences",
        label: "Préférences de travail (remote, rythme, taille d'équipe, type de produit) ?",
        placeholder: preferedWork ? `Ex: ${preferedWork}, équipe 5-8, produit early stage...` : "Ex: full remote, équipe 5-8, produit early stage..."
      },
      {
        id: "ambition",
        label: `Objectifs à 12-18 mois (séniorité ${seniority || "souhaitée"}, roles/industries visés) ?`,
        placeholder: industries ? `Ex: viser ${industries}, passer lead, renforcer ${learningFocus || "data/archi"}` : "Ex: passer lead, renforcer data, rejoindre scale-up produit..."
      }
    ];
  }, [data]);

  const { data: userApplications, isLoading: loadingApplications } = useQuery({
    queryKey: ["user-applications", data.user.id],
    queryFn: () => getUserApplications(),
    staleTime: 60000, // 1 minute
  });

  const formatFeedbackDate = useCallback((value?: string | Date | null) => {
    if (!value) return null;
    try {
      const date = typeof value === "string" ? new Date(value) : value;
      if (Number.isNaN(date.getTime())) {
        return null;
      }
      return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, []);

  const handleOpenFeedbackModal = useCallback(
    (application: any, result: any) => {
      const parsedAnalysis =
        typeof result.analysis === "string"
          ? safeParseJson(result.analysis)
          : result.analysis;
      const feedback = parsedAnalysis || result.feedback || null;

      if (!feedback) {
        toast.error("Aucun feedback disponible pour ce test.");
        return;
      }

      const jobSkills = application.job?.skills || [];

      const convertToPercent = (value?: number | null) => {
        if (
          value === null ||
          value === undefined ||
          typeof result.totalPoints !== "number" ||
          result.totalPoints <= 0
        ) {
          return null;
        }
        return Math.round((value / result.totalPoints) * 100);
      };

      const initialScorePercent =
        convertToPercent(result.originalScore) ??
        (typeof feedback?.initialScore === "number"
          ? Math.round(feedback.initialScore)
          : null);
      const reviewScorePercent =
        convertToPercent(result.reviewScore) ??
        (typeof feedback?.reviewScore === "number"
          ? Math.round(feedback.reviewScore)
          : null);
      const finalScorePercent =
        typeof result.percentage === "number"
          ? result.percentage
          : convertToPercent(result.finalScore ?? result.score) ??
          (typeof feedback?.overallScore === "number"
            ? Math.round(feedback.overallScore)
            : null);

      const questionsPayload = Array.isArray(result.questions)
        ? result.questions
        : Array.isArray(feedback?.questions)
          ? feedback.questions.map((question: any, index: number) => ({
            id: question?.id ?? String(index + 1),
            text: question?.text || question?.question || "",
          }))
          : [];

      setFeedbackModalDetails({
        testName: result.quizTitle,
        source: "stocké",
        score: finalScorePercent,
        finalScore: finalScorePercent,
        initialScore: initialScorePercent,
        reviewScore: reviewScorePercent,
        feedback,
        skills: buildSkillProgressFromFeedback(jobSkills, feedback),
        releasedAt: result.feedbackReleasedAt ?? null,
        questions: questionsPayload,
      });
      setIsFeedbackModalOpen(true);
    },
    []
  );

  const recentActivity = useMemo(
    () =>
      data.recentQuizzes.map((quiz, index) => ({
        id: quiz.id,
        type: "quiz" as const,
        title: quiz.title,
        score: quiz.score,
        xp: quiz.xp,
        time: index === 0 ? "Aujourd'hui" : index === 1 ? "Hier" : `Il y a ${index + 1}j`,
      })),
    [data.recentQuizzes],
  )



  const handleSubmitCareer = async () => {
    console.log("🚀 Début de la génération du plan de carrière")
    setIsSubmittingCareer(true)
    setShowCareerModal(false) // Fermer le modal immédiatement
    setIsGeneratingPlan(true) // Activer le skeleton sur le dashboard

    const formatted: CareerTestAnswer[] = careerQuestions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || ""
    }))
    console.log("📝 Réponses formatées:", formatted.length, "questions")

    const onboardingContext = {
      role: data.user?.role,
      domains: data.user?.domains || [],
      onboardingDetails: (data as any)?.user?.onboardingDetails ?? null,
      onboardingGoals: (data as any)?.user?.onboardingGoals ?? null,
    }

    try {
      const res = await submitCareerTest(formatted, onboardingContext)

      if (res.success && res.data) {
        // Mise à jour du cache React Query
        queryClient.setQueryData(["career-profile", data.user.id], {
          careerProfile: res.data,
          careerProfileTestStatus: "DONE",
          careerProfileUpdatedAt: new Date()
        });

        setTestStatus("done")
        setShowPortfolioSpotlight(true) // Activate spotlight here only
        toast.success("Plan de carrière généré avec succès!")
      } else {
        console.error("❌ Erreur dans la réponse:", res.error)
        toast.error(res.error || "Une erreur est survenue lors de la génération. Veuillez réessayer.")
        setTestStatus("accepted") // Revenir à l'état accepté pour pouvoir relancer
      }
    } catch (error) {
      console.error("💥 Exception capturée:", error)
      toast.error("Erreur inattendue.")
      setTestStatus("accepted")
    } finally {
      setIsSubmittingCareer(false)
      setIsGeneratingPlan(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mini test IA : profil de carrière */}
      {/* Career Plan Premium Card */}
      {showPortfolioSpotlight && testStatus === "done" && careerProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-all duration-700 animate-in fade-in" onClick={() => setShowPortfolioSpotlight(false)} />
      )}
      <div className={cn(
        "mb-8 relative overflow-hidden rounded-3xl border transition-all duration-700 group",
        showPortfolioSpotlight && testStatus === "done" && careerProfile
          ? "z-50 border-emerald-500/50 shadow-2xl shadow-emerald-500/20 scale-[1.02] bg-white dark:bg-slate-900"
          : "border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/10 shadow-lg"
      )}>

        {/* Decorative Background Elements */}
        {!showPortfolioSpotlight && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:bg-emerald-400/20 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
          </>
        )}

        <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Left Content */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            {!testStatus || testStatus === "idle" || testStatus === "refused" ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" />
                  Nouveau
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Débloquez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Potentiel</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mx-auto md:mx-0">
                  Obtenez une feuille de route ultra-personnalisée : analyse de compétences, objectifs ciblés et opportunités sur-mesure. En 2 minutes.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
                  <Button
                    size="lg"
                    onClick={() => {
                      startTransitionCareer(async () => {
                        setTestStatus("accepted")
                        setShowCareerModal(true)
                        await startCareerTest()
                      })
                    }}
                    disabled={isPendingCareer}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all hover:-translate-y-0.5"
                  >
                    {isPendingCareer ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
                    Générer mon plan
                  </Button>
                  <p className="text-sm text-slate-500 font-medium">
                    Gratuit & Instantané
                  </p>
                </div>
              </>
            ) : testStatus === "accepted" ? (
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Initialisation...</h2>
                <p className="text-slate-600 dark:text-slate-400">Préparation de votre entretien personnalisé.</p>
              </div>
            ) : isGeneratingPlan ? (
              <div className="w-full max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">L'IA analyse votre profil...</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ) : testStatus === "done" && careerProfile ? (
              <>
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 transition-colors",
                  showPortfolioSpotlight
                    ? "bg-emerald-500 text-white border-transparent"
                    : "bg-green-100/80 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                )}>
                  <CheckCircle2 className="w-3 h-3" />
                  Terminé
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  Votre Plan est prêt !
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-6 leading-relaxed">
                  {careerProfile.summary ? (
                    <span className="line-clamp-2">{careerProfile.summary}</span>
                  ) : "Votre stratégie de carrière personnalisée vous attend."}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {showPortfolioSpotlight ? (
                    <Button
                      size="lg"
                      onClick={() => {
                        setShowPortfolioSpotlight(false);
                        router.push('/portfolio');
                      }}
                      className="relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-12 text-base font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all animate-pulse hover:animate-none scale-105"
                    >
                      <span className="relative z-10 flex items-center">
                        <PenTool className="mr-2 h-5 w-5" />
                        Rédiger mon portfolio
                      </span>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => router.push('/portfolio')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all hover:-translate-y-0.5"
                    >
                      <PenTool className="mr-2 h-5 w-5" />
                      Rédiger mon portfolio
                    </Button>
                  )}

                  <Button
                    variant={showPortfolioSpotlight ? "ghost" : "outline"}
                    size="lg"
                    onClick={() => {
                      if (showPortfolioSpotlight) {
                        setShowPortfolioSpotlight(false);
                      } else {
                        setShowCareerPlanModal(true);
                      }
                    }}
                    className={cn(
                      "rounded-full px-6 h-12 text-base font-medium transition-all",
                      showPortfolioSpotlight
                        ? "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        : "bg-transparent text-emerald-700 dark:text-emerald-400 border-2 border-emerald-600/20 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    )}
                  >
                    {showPortfolioSpotlight ? "Plus tard" : "Consulter mon plan"}
                    {!showPortfolioSpotlight && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </div>
              </>
            ) : null}
          </div>

          {/* Right Visual / Illustration */}
          <div className="hidden md:flex flex-1 justify-end relative">
            <div className={cn(
              "relative z-10 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 max-w-xs rotate-3 hover:rotate-0 transition-transform duration-500",
              showPortfolioSpotlight && "rotate-0 scale-105"
            )}>
              <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                  <div className="h-2 w-12 bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                <div className="h-2 w-5/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                <div className="h-2 w-4/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30"></div>
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30"></div>
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30"></div>
              </div>
            </div>

            {/* Abstract Shapes behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-emerald-500/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 border-2 border-dashed border-teal-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Missions */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-emerald-500" />
                  <CardTitle className="text-slate-900 dark:text-white">Objectifs du Jour</CardTitle>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
                  {missions.filter((m) => m.progress === m.total).length}/{missions.length}
                </Badge>
              </div>
              <CardDescription className="dark:text-slate-400">
                Atteignez vos objectifs quotidiens pour optimiser votre progression
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 px-4 md:px-6">
              <div className="grid grid-cols-1 gap-4">
                {isLoadingMissions ? (
                  <div className="space-y-4 w-full">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : missions.length > 0 ? (
                  missions.map((mission) => (
                    <div key={mission.id} className="w-full">
                      <MissionCard
                        icon={getTypeIcon(mission.type)}
                        title={mission.title}
                        xp={mission.xp}
                        progress={mission.progress}
                        total={mission.total}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 w-full">Aucun objectif pour aujourd'hui</div>
                )}
              </div>
            </CardContent>
          </Card>


          <div className="h-[300px] mb-30">
            <WeeklyChart />
          </div>

          {/* Mes Candidatures - Nouvelle section */}
          {userApplications && userApplications.length > 0 && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-green-500" />
                  <CardTitle className="text-slate-900 dark:text-white">Mes Candidatures</CardTitle>
                </div>
                <CardDescription className="dark:text-slate-400">
                  Suivez vos candidatures et vos scores aux tests techniques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingApplications ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    userApplications.map((application: any) => {
                      const getStatusColor = (status: string) => {
                        switch (status.toLowerCase()) {
                          case 'accepted':
                          case 'interview':
                            return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600'
                          case 'reviewed':
                            return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600'
                          case 'rejected':
                            return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600'
                          case 'pending':
                          case 'applied':
                          default:
                            return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-600'
                        }
                      }

                      const getStatusIcon = (status: string) => {
                        switch (status.toLowerCase()) {
                          case 'accepted':
                            return <CheckCircle2 className="w-4 h-4" />
                          case 'rejected':
                            return <XCircle className="w-4 h-4" />
                          case 'reviewed':
                          case 'interview':
                            return <Clock className="w-4 h-4" />
                          default:
                            return <Clock className="w-4 h-4" />
                        }
                      }

                      const getStatusText = (status: string) => {
                        switch (status.toLowerCase()) {
                          case 'accepted': return 'Acceptée'
                          case 'rejected': return 'Rejetée'
                          case 'reviewed': return 'En cours d\'examen'
                          case 'interview': return 'Entretien programmé'
                          case 'pending':
                          case 'applied':
                          default: return 'En attente'
                        }
                      }

                      const isProfileValidated = application.status &&
                        ['reviewed', 'interview', 'accepted'].includes(application.status.toLowerCase())

                      return (
                        <div key={application.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Building className="w-4 h-4 text-slate-500" />
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {application.job?.title || 'Poste inconnu'}
                                </h4>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                {application.job?.companyName || 'Entreprise'} • {application.job?.location || 'Localisation non spécifiée'}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`${getStatusColor(application.status)} border text-xs`}>
                                  {getStatusIcon(application.status)}
                                  <span className="ml-1">{getStatusText(application.status)}</span>
                                </Badge>
                                {isProfileValidated && (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-600 text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Profil validé
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Compétences demandées */}
                          {application.job?.skills && application.job.skills.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Compétences demandées :
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {application.job.skills.slice(0, 5).map((skill: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {application.job.skills.length > 5 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{application.job.skills.length - 5}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Score global de review humaine */}
                          {application.score !== null && application.score !== undefined && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Score de review humaine :
                                  </span>
                                </div>
                                <Badge className={`text-xs font-bold ${application.score >= 80
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-600'
                                  : application.score >= 60
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-600'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-600'
                                  }`}>
                                  {application.score}/100
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Résultats des tests */}
                          {application.quizResults && application.quizResults.length > 0 ? (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                  Scores aux tests techniques :
                                </p>
                                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                  Moyenne: {application.averageScore}%
                                </span>
                              </div>
                              <div className="space-y-2">
                                {application.quizResults.map((result: any) => {
                                  // Vérifier si le résultat a été révisé
                                  const isReviewed = result.answers && typeof result.answers === 'object' && result.answers.isReviewed;
                                  const feedbackReleasedLabel = formatFeedbackDate(result.feedbackReleasedAt);
                                  const feedbackAvailable = Boolean(result.feedbackVisibleToCandidate && (result.analysis || result.answers));

                                  return (
                                    <div key={result.id} className="space-y-1">
                                      <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-600 dark:text-slate-400">
                                            {result.quizTitle}
                                          </span>
                                          {isReviewed && (
                                            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                              <CheckCircle2 className="w-3 h-3 mr-1" />
                                              Révisé
                                            </Badge>
                                          )}
                                        </div>
                                        <span className={`font-medium ${result.percentage >= 80
                                          ? 'text-green-600 dark:text-green-400'
                                          : result.percentage >= 60
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                          }`}>
                                          {result.percentage}%
                                        </span>
                                      </div>
                                      <Progress
                                        value={result.percentage}
                                        className="h-1.5 bg-slate-200 dark:bg-slate-700"
                                      />
                                      {result.feedbackVisibleToCandidate && feedbackAvailable ? (
                                        <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div>
                                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                                Feedback disponible
                                              </p>
                                              {feedbackReleasedLabel && (
                                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                                  Partagé le {feedbackReleasedLabel}
                                                </p>
                                              )}
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-7 px-3 text-[11px] border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
                                              onClick={() => handleOpenFeedbackModal(application, result)}
                                            >
                                              Consulter le feedback
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                          Feedback en attente de validation
                                        </span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Aucun test technique complété pour cette candidature
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-500" />
                <CardTitle className="text-slate-900 dark:text-white">Activité Récente</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      icon={getTypeIcon(activity.type)}
                      title={activity.title}
                      score={activity.score}
                      xp={activity.xp}
                      time={activity.time}
                      bgColor={getActivityBgColor(activity.type)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">Aucune activité récente</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills Radar */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-emerald-500" />
                <CardTitle className="text-slate-900 dark:text-white">Profil de Compétences</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Analyse de vos compétences techniques</CardDescription>
            </CardHeader>
            <CardContent>
              {data.skills.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={data.skills}>
                      <PolarGrid stroke="#64748b" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                      <Radar name="Niveau actuel" dataKey="current" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {data.skills.slice(0, 3).map((skill) => (
                      <SkillProgress key={skill.id} skill={skill.skill} current={skill.current} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">Évaluation en cours</div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <CardTitle className="text-slate-900 dark:text-white">Badges et Réussites</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Jalons atteints dans votre parcours</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAchievements ? (
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : achievements.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {achievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      icon={achievement.icon}
                      title={achievement.title}
                      unlocked={achievement.unlocked}
                      rarity={achievement.rarity}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">Aucune réalisation</div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          {data.recommendations.length > 0 && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-green-500" />
                  <CardTitle className="text-slate-900 dark:text-white">Offres Recommandées</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recommendations.slice(0, 3).map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      title={rec.title}
                      description={rec.description}
                      priority={rec.priority}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-sky-400 via-blue-500 to-green-400 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Play className="w-6 h-6" />
                Démarrez Votre Session
              </h3>
              <div className="space-y-3">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-semibold">
                  <Play className="w-4 h-4 mr-2" />
                  Nouvelle Évaluation
                </Button>
                <Button className="w-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xl border border-white/30 font-semibold">
                  <Video className="w-4 h-4 mr-2" />
                  Simulation d'Entretien
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FeedbackModal
        open={isFeedbackModalOpen && !!feedbackModalDetails}
        onOpenChange={(open) => {
          setIsFeedbackModalOpen(open);
          if (!open) {
            setFeedbackModalDetails(null);
          }
        }}
        isLoading={false}
        details={feedbackModalDetails ?? undefined}
      />
      <CareerTestModal
        open={showCareerModal}
        onClose={() => setShowCareerModal(false)}
        questions={careerQuestions}
        answers={answers}
        setAnswers={setAnswers}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        onSubmit={handleSubmitCareer}
        isSubmitting={isSubmittingCareer}
      />
      <CareerPlanModal
        open={showCareerPlanModal}
        onClose={() => setShowCareerPlanModal(false)}
        careerPlan={careerProfile}
      />
    </div>
  )
}

function CareerTestModal({
  open,
  onClose,
  questions,
  answers,
  setAnswers,
  currentQuestion,
  setCurrentQuestion,
  onSubmit,
  isSubmitting
}: {
  open: boolean;
  onClose: () => void;
  questions: { id: string; label: string; placeholder?: string }[];
  answers: Record<string, string>;
  setAnswers: (v: Record<string, string>) => void;
  currentQuestion: number;
  setCurrentQuestion: (n: number) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}) {
  const q = questions[currentQuestion];
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm px-4 py-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-600 dark:bg-emerald-500 text-white">IA</Badge>
              <p className="text-sm uppercase text-emerald-600 dark:text-emerald-400 font-semibold">Mini test IA</p>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Profil de carrière</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Réponds brièvement, l'IA s'occupe du reste.</p>
          </div>
          <button
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Question {currentQuestion + 1} sur {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
            {q.label}
          </label>
          <textarea
            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all min-h-[140px] resize-none"
            placeholder={q.placeholder}
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tu peux passer ou revenir en arrière à tout moment.
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="flex-1 sm:flex-none border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Précédent
            </Button>
            {currentQuestion < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Envoi...
                  </>
                ) : (
                  "Envoyer"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
