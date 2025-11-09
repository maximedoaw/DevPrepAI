"use client"

import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { Target, Trophy, Brain, Sparkles, Play, Video, TrendingUp, Briefcase, Building, CheckCircle2, XCircle, Clock, Star } from "lucide-react"
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
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalDetails, setFeedbackModalDetails] = useState<FeedbackModalDetails | null>(null);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Missions */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
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
            <CardContent className="space-y-4">
              {isLoadingMissions ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : missions.length > 0 ? (
                missions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    icon={getTypeIcon(mission.type)}
                    title={mission.title}
                    xp={mission.xp}
                    progress={mission.progress}
                    total={mission.total}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">Aucun objectif pour aujourd'hui</div>
              )}
            </CardContent>
          </Card>


            <div className="h-[300px] mb-30">
              <WeeklyChart />
            </div>

          {/* Mes Candidatures - Nouvelle section */}
          {userApplications && userApplications.length > 0 && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
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
                                <Badge className={`text-xs font-bold ${
                                  application.score >= 80 
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
                                        <span className={`font-medium ${
                                          result.percentage >= 80 
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
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
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
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
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
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
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
    </div>
  )
}
