"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Rocket, Users, TrendingUp, Award, Briefcase, FileText, Zap, Target } from "lucide-react"
import type { DashboardData } from "@/types/dashboard"

interface BootcampDashboardProps {
  data: DashboardData
}

export function BootcampDashboard({ data }: BootcampDashboardProps) {
  // Sessions data
  const sessions = [
    { id: 1, name: "Session Printemps 2024", completion: 85, satisfaction: 4.7, students: 28 },
    { id: 2, name: "Session Été 2024", completion: 72, satisfaction: 4.5, students: 32 },
    { id: 3, name: "Session Automne 2024", completion: 90, satisfaction: 4.9, students: 25 },
  ]

  // Top performers
  const topPerformers = [
    { id: 1, name: "Marie Dubois", score: 98, projects: 5 },
    { id: 2, name: "Thomas Martin", score: 95, projects: 5 },
    { id: 3, name: "Sophie Bernard", score: 92, projects: 4 },
  ]

  // Projects progress
  const projects = [
    { name: "E-commerce App", completion: 85 },
    { name: "Social Network", completion: 70 },
    { name: "Portfolio Site", completion: 95 },
    { name: "API REST", completion: 60 },
  ]

  // Employability data
  const employabilityData = [
    { week: "S1", ready: 5 },
    { week: "S2", ready: 12 },
    { week: "S3", ready: 18 },
    { week: "S4", ready: 25 },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sessions Overview */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-slate-900 dark:text-white">Sessions en Cours</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Vue globale des sessions actives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{session.name}</h4>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-500 text-white border-0">{session.students} étudiants</Badge>
                        <Badge className="bg-yellow-500 text-white border-0">{session.satisfaction}/5</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Taux de complétion</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{session.completion}%</span>
                      </div>
                      <Progress value={session.completion} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects Progress */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-slate-900 dark:text-white">Projets en Cours</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Avancement des projets étudiants</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projects} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="completion" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Employability Trend */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-green-500" />
                <CardTitle className="text-slate-900 dark:text-white">Employabilité</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">
                Candidats prêts à être présentés aux entreprises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={employabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="week" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="ready" stroke="#10b981" strokeWidth={3} name="Candidats prêts" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Étudiants Actifs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">85</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Taux de Réussite</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">92%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                <CardTitle className="text-slate-900 dark:text-white">Top Performers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div
                    key={performer.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                          {performer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{performer.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{performer.projects} projets</p>
                    </div>
                    <Badge className="bg-green-500 text-white border-0">{performer.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Reports */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-slate-900 dark:text-white">Rapports IA</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Points Forts</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Excellente progression en React et TypeScript
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Axes d'Amélioration</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Renforcer les compétences en tests unitaires
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-semibold">
                  <FileText className="w-4 h-4 mr-2" />
                  Générer Rapport
                </Button>
                <Button className="w-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xl border border-white/30 font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  Gérer Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
