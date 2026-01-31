"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Rocket, Users, TrendingUp, Award, Briefcase, FileText, Zap, Target, Sparkles, ArrowRight, Play, Layout, PenTool, Loader2 } from "lucide-react"
import type { DashboardData } from "@/types/dashboard"
import { cn } from "@/lib/utils"

interface BootcampDashboardProps {
  data: DashboardData
}

export function BootcampDashboard({ data }: BootcampDashboardProps) {
  // Sessions data (Cameroonian themed)
  const sessions = [
    { id: 1, name: "Promo Mboa Tech", completion: 85, satisfaction: 4.8, students: 28 },
    { id: 2, name: "Ndaka Digital Academy", completion: 72, satisfaction: 4.5, students: 32 },
    { id: 3, name: "Kwat Code Bootcamp", completion: 90, satisfaction: 4.9, students: 25 },
  ]

  // Top performers (Cameroonian names)
  const topPerformers = [
    { id: 1, name: "Moussa Yerima", score: 98, projects: 5 },
    { id: 2, name: "Ngo Belibi", score: 95, projects: 5 },
    { id: 3, name: "Ekalle Etonde", score: 92, projects: 4 },
  ]

  // Projects progress
  const projects = [
    { name: "Kwat Market", completion: 85 },
    { name: "Ndolè App", completion: 70 },
    { name: "Sawa Portfolio", completion: 95 },
    { name: "Benskine Tracker", completion: 60 },
  ]

  // Employability data
  const employabilityData = [
    { week: "S1", ready: 5 },
    { week: "S2", ready: 12 },
    { week: "S3", ready: 18 },
    { week: "S4", ready: 25 },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* Premium Banner (Same as others) */}
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm group p-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Pilotage Bootcamp
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">
              Gérez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Talents</span> du Mboa
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl font-medium">
              Suivez la progression de vos sessions, analysez les performances de vos étudiants et optimisez leur employabilité avec l'IA.
            </p>
          </div>
          <div className="hidden md:flex flex-1 justify-end">
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5 rotate-2 group-hover:rotate-0 transition-transform duration-700">
              <TrendingUp className="w-20 h-20 text-emerald-500 opacity-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sessions Overview */}
          <Card className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Rocket className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight uppercase">Sessions Actives</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight">{session.name}</h4>
                    <div className="flex gap-2">
                      <Badge className="bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-lg border-0 uppercase tracking-widest">{session.students} Étudiants</Badge>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-black text-[10px] px-2 py-0.5 rounded-lg border-0 uppercase tracking-widest">{session.satisfaction} / 5</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-400">Progression Moyenne</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{session.completion}%</span>
                    </div>
                    <Progress value={session.completion} className="h-1.5" indicatorClassName="bg-emerald-500" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Projects Progress */}
          <Card className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight uppercase">Projets en Cours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projects} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.1} />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} tick={{ fontWeight: 'bold' }} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} fontSize={10} tick={{ fontWeight: 'bold', textTransform: 'uppercase' }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar dataKey="completion" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm rounded-3xl">
              <CardContent className="p-4 py-6 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actifs</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">85</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm rounded-3xl">
              <CardContent className="p-4 py-6 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Réussite</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">92%</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card className="border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Award className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight uppercase leading-none">Performers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div
                    key={performer.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10 rounded-xl border-2 border-slate-100 dark:border-white/5">
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-black text-xs">
                          {performer.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-950">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11px] uppercase tracking-tight truncate">{performer.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{performer.projects} Projets</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0 font-black text-[10px]">{performer.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card (Green style from candidate/career) */}
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/20 rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
            <CardContent className="p-6 relative">
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">Actions Rapides</h3>
              <div className="space-y-3">
                <Button className="w-full bg-white text-emerald-900 hover:bg-slate-100 shadow-xl font-black rounded-2xl h-11 border-0 uppercase tracking-widest text-[10px]">
                  <FileText className="w-4 h-4 mr-2" />
                  Exporter Rapport
                </Button>
                <Button className="w-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xl border border-white/30 font-black rounded-2xl h-11 uppercase tracking-widest text-[10px]">
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
