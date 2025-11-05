"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserApplications } from "@/actions/application.action"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
import { getTypeIcon, getActivityBgColor } from "@/lib/dashboard-utils"
import type { DashboardData, Mission, Achievement } from "@/types/dashboard"

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
  const { data: userApplications, isLoading: loadingApplications } = useQuery({
    queryKey: ["user-applications", data.user.id],
    queryFn: () => getUserApplications(),
    staleTime: 60000, // 1 minute
  });

  const progressData = useMemo(
    () =>
      data.progress
        .filter((p) => p.metric === "quizzes_completed" || p.metric === "xp_earned")
        .slice(-7)
        .map((p, index) => ({
          day: `J-${6 - index}`,
          quizzes: p.metric === "quizzes_completed" ? p.value : 0,
          xp: p.metric === "xp_earned" ? p.value : 0,
        })),
    [data.progress],
  )

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
                  <Target className="w-6 h-6 text-blue-500" />
                  <CardTitle className="text-slate-900 dark:text-white">Objectifs du Jour</CardTitle>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
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

          {/* Progress Chart */}
          <ChartWrapper
            icon={TrendingUp}
            title="Évolution des Performances"
            description="Votre activité sur les 7 derniers jours"
          >
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="#38bdf8"
                    fillOpacity={1}
                    fill="url(#colorXp)"
                    name="Points acquis"
                  />
                  <Area
                    type="monotone"
                    dataKey="quizzes"
                    stroke="#4ade80"
                    fillOpacity={1}
                    fill="url(#colorQuizzes)"
                    name="Évaluations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">Aucune donnée disponible</div>
            )}
          </ChartWrapper>

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
                <Sparkles className="w-6 h-6 text-purple-500" />
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
                <Brain className="w-6 h-6 text-purple-500" />
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
    </div>
  )
}
