"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { GraduationCap, Users, TrendingUp, Award, Download, UserPlus, Building2 } from "lucide-react"
import type { DashboardData } from "@/types/dashboard"

interface SchoolDashboardProps {
  data: DashboardData
}

export function SchoolDashboard({ data }: SchoolDashboardProps) {
  // Mock data for school analytics
  const cohortData = [
    { name: "Promo 2024", placement: 85, students: 45 },
    { name: "Promo 2023", placement: 78, students: 52 },
    { name: "Promo 2022", placement: 92, students: 38 },
  ]

  const domainData = [
    { name: "Frontend", value: 35, color: "#3b82f6" },
    { name: "Backend", value: 28, color: "#8b5cf6" },
    { name: "DevOps", value: 18, color: "#10b981" },
    { name: "Data", value: 19, color: "#f59e0b" },
  ]

  const topStudents = [
    { id: 1, name: "Marie Dubois", score: 95, badges: 12 },
    { id: 2, name: "Thomas Martin", score: 92, badges: 10 },
    { id: 3, name: "Sophie Bernard", score: 90, badges: 11 },
    { id: 4, name: "Lucas Petit", score: 88, badges: 9 },
  ]

  const partnerCompanies = [
    { id: 1, name: "TechCorp", hires: 15, satisfaction: 4.8 },
    { id: 2, name: "InnovateLab", hires: 12, satisfaction: 4.6 },
    { id: 3, name: "DataFlow", hires: 10, satisfaction: 4.9 },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Étudiants Actifs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">135</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Taux de Placement</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">85%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Score Moyen</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">82.5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cohort Performance */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <CardTitle className="text-slate-900 dark:text-white">Performance des Cohortes</CardTitle>
                </div>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter PDF
                </Button>
              </div>
              <CardDescription className="dark:text-slate-400">Taux de placement par promotion</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cohortData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="placement" fill="#3b82f6" name="Taux de placement (%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Domain Distribution */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-slate-900 dark:text-white">Répartition par Domaine</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={domainData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {domainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Students */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                <CardTitle className="text-slate-900 dark:text-white">Meilleurs Étudiants</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{student.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{student.badges} badges</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white border-0">{student.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Partner Companies */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-slate-900 dark:text-white">Entreprises Partenaires</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partnerCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{company.name}</h4>
                      <Badge className="bg-blue-500 text-white border-0">{company.hires} recrutés</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>Satisfaction :</span>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-500">
                        {company.satisfaction}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-semibold">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter un Étudiant
                </Button>
                <Button className="w-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xl border border-white/30 font-semibold">
                  <Download className="w-4 h-4 mr-2" />
                  Rapport Mensuel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
