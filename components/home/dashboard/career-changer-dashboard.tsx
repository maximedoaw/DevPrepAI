"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"
import { Target, Brain, MessageCircle, CheckCircle2, Clock, Sparkles, ArrowRight, Heart } from "lucide-react"
import { RecommendationCard } from "./recommendation-card"
import { SkillProgress } from "./skill-progress"
import type { DashboardData } from "@/types/dashboard"

interface CareerChangerDashboardProps {
  data: DashboardData
}

export function CareerChangerDashboard({ data }: CareerChangerDashboardProps) {
  // Timeline data for career transition
  const timelineSteps = [
    { id: 1, title: "Bilan de compétences", status: "completed", icon: CheckCircle2 },
    { id: 2, title: "Tests IA", status: "completed", icon: CheckCircle2 },
    { id: 3, title: "Entretiens", status: "in-progress", icon: Clock },
    { id: 4, title: "Offres ciblées", status: "pending", icon: Target },
  ]

  // Emotional progress data (simulated from Hume AI)
  const emotionalData = [
    { metric: "Confiance", value: 75 },
    { metric: "Engagement", value: 85 },
    { metric: "Motivation", value: 80 },
    { metric: "Stress", value: 35 },
  ]

  // Weekly objectives
  const weeklyObjectives = [
    { id: 1, title: "Faire 1 test soft skills", completed: true },
    { id: 2, title: "Mettre à jour ton CV", completed: false },
    { id: 3, title: "Explorer 3 métiers compatibles", completed: false },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Career Timeline */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
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
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          step.status === "completed"
                            ? "bg-green-500"
                            : step.status === "in-progress"
                              ? "bg-blue-500 animate-pulse"
                              : "bg-slate-300 dark:bg-slate-700"
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
                        <ArrowRight className="w-5 h-5 text-slate-400 hidden sm:block" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Emotional Progress */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500" />
                <CardTitle className="text-slate-900 dark:text-white">Progression Émotionnelle</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Analyse basée sur Hume AI</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={emotionalData}>
                  <PolarGrid stroke="#64748b" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar name="État actuel" dataKey="value" stroke="#4ade80" fill="#4ade80" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Objectives */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-green-500" />
                <CardTitle className="text-slate-900 dark:text-white">Objectifs de la Semaine</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyObjectives.map((objective) => (
                  <div
                    key={objective.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        objective.completed ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      {objective.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span
                      className={`flex-1 ${
                        objective.completed
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
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-slate-900 dark:text-white">Compétences en Développement</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.skills.slice(0, 5).map((skill) => (
                <SkillProgress key={skill.id} skill={skill.skill} current={skill.current} />
              ))}
            </CardContent>
          </Card>

          {/* Recommended Careers */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <CardTitle className="text-slate-900 dark:text-white">Métiers Compatibles</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Recommandations personnalisées</CardDescription>
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

          {/* AI Coach */}
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Alexis</h3>
                  <p className="text-sm text-white/80">Ton coach de carrière</p>
                </div>
              </div>
              <p className="text-white/90 text-sm mb-4">
                Besoin de conseils pour ta reconversion ? Je suis là pour t'accompagner à chaque étape.
              </p>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-semibold">
                <MessageCircle className="w-4 h-4 mr-2" />
                Discuter avec Alexis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
