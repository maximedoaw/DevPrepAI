"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Users, Briefcase, Clock, TrendingUp, FileText, GraduationCap, Sparkles } from "lucide-react"
import type { DashboardData } from "@/types/dashboard"

interface EnterpriseDashboardProps {
  data: DashboardData
}

export function EnterpriseDashboard({ data }: EnterpriseDashboardProps) {
  // Recruitment pipeline stages
  const pipelineStages = [
    { id: 1, name: "Candidats reçus", count: 45, color: "bg-slate-500" },
    { id: 2, name: "Entretien", count: 28, color: "bg-blue-500" },
    { id: 3, name: "Test technique", count: 15, color: "bg-purple-500" },
    { id: 4, name: "Embauche", count: 8, color: "bg-green-500" },
  ]

  // Recommended talents
  const recommendedTalents = [
    { id: 1, name: "Alice Moreau", score: 95, match: "Excellent", skills: ["React", "Node.js"] },
    { id: 2, name: "Pierre Leroy", score: 88, match: "Très bon", skills: ["Python", "Django"] },
    { id: 3, name: "Emma Rousseau", score: 92, match: "Excellent", skills: ["Vue.js", "TypeScript"] },
  ]

  // HR Analytics
  const hrAnalytics = [
    { month: "Jan", hires: 4, avgTime: 28 },
    { month: "Fév", hires: 6, avgTime: 25 },
    { month: "Mar", hires: 5, avgTime: 30 },
    { month: "Avr", hires: 8, avgTime: 22 },
    { month: "Mai", hires: 7, avgTime: 24 },
  ]

  // Internal training courses
  const trainingCourses = [
    { id: 1, title: "Leadership Avancé", enrolled: 12, completion: 75 },
    { id: 2, title: "Gestion de Projet Agile", enrolled: 18, completion: 60 },
    { id: 3, title: "Communication Efficace", enrolled: 15, completion: 85 },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recruitment Pipeline */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-slate-900 dark:text-white">Pipeline de Recrutement</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Suivi des candidatures en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {pipelineStages.map((stage) => (
                  <div
                    key={stage.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg ${stage.color} flex items-center justify-center mb-3`}>
                      <span className="text-white font-bold text-lg">{stage.count}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{stage.name}</h4>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* HR Analytics */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <CardTitle className="text-slate-900 dark:text-white">Analytics RH</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">
                Temps moyen d'embauche et nombre de recrutements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hrAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="hires" stroke="#3b82f6" name="Embauches" strokeWidth={2} />
                  <Line type="monotone" dataKey="avgTime" stroke="#10b981" name="Temps moyen (jours)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Internal Training */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-slate-900 dark:text-white">Formation Interne</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{course.title}</h4>
                      <Badge className="bg-blue-500 text-white border-0">{course.enrolled} inscrits</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>Complétion :</span>
                      <span className="font-semibold">{course.completion}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${course.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Candidats Actifs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">45</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Temps Moyen</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">24j</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Talents */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <CardTitle className="text-slate-900 dark:text-white">Talents Recommandés</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedTalents.map((talent) => (
                  <div
                    key={talent.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {talent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{talent.name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{talent.match}</p>
                      </div>
                      <Badge className="bg-green-500 text-white border-0">{talent.score}%</Badge>
                    </div>
                    <div className="flex gap-2">
                      {talent.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-semibold">
                  <FileText className="w-4 h-4 mr-2" />
                  Rapport Automatique
                </Button>
                <Button className="w-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xl border border-white/30 font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  Rechercher Talents
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
