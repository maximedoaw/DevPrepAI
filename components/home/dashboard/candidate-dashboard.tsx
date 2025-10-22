"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Target, Trophy, Brain, Sparkles, Play, Video, TrendingUp, Briefcase } from "lucide-react"
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
