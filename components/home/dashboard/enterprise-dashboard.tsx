"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Users, Briefcase, Clock, TrendingUp, FileText, GraduationCap, Sparkles, Target, ExternalLink } from "lucide-react"
import { getEnterpriseDashboardData } from "@/actions/enterprise-dashboard.action"
import { CandidateDetailModal } from "@/components/enterprise/talent-matching/CandidateDetailModal"
import { Skeleton } from "@/components/ui/skeleton"

export function EnterpriseDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const result = await getEnterpriseDashboardData()
      if (result.success && result.data) {
        setDashboardData(result.data)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const formatDomain = (domain: string) => {
    return domain.replace(/_/g, " ").toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleTalentClick = (talent: any) => {
    // Transform to MatchedCandidate format for modal
    setSelectedCandidate({
      id: talent.id,
      matchScore: talent.matchScore,
      skillsMatch: talent.skillsMatch,
      domainMatch: talent.domainMatch,
      aiReason: talent.aiReason,
      candidate: {
        id: talent.candidateId,
        firstName: talent.name.split(" ")[0],
        lastName: talent.name.split(" ")[1] || "",
        email: talent.email,
        skills: talent.skills,
        domains: talent.domains,
        portfolio: talent.portfolioId ? {
          id: talent.portfolioId,
          avatarUrl: talent.avatarUrl,
          headline: talent.headline,
          bio: null
        } : null
      }
    })
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">Erreur lors du chargement des données</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { stats, pipeline, topMatches } = dashboardData

  // HR Analytics mock data (keep for chart)
  const hrAnalytics = [
    { month: "Jan", hires: 4, avgTime: 28 },
    { month: "Fév", hires: 6, avgTime: 25 },
    { month: "Mar", hires: 5, avgTime: 30 },
    { month: "Avr", hires: 8, avgTime: 22 },
    { month: "Mai", hires: stats.hires || 0, avgTime: stats.avgTimeToHire },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recruitment Pipeline */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-slate-900 dark:text-white">Pipeline de Recrutement</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Suivi des candidatures en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-lg">{pipeline.received}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Candidatures reçues</h4>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-lg">{pipeline.interview}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Entretiens</h4>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-lg">{pipeline.tested}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Tests complétés</h4>
                </div>

                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border-2 border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-lg">{pipeline.hired}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Embauches</h4>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HR Analytics */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
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
                  <Line type="monotone" dataKey="hires" stroke="#10b981" name="Embauches" strokeWidth={2} />
                  <Line type="monotone" dataKey="avgTime" stroke="#14b8a6" name="Temps moyen (jours)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-50">Postes Actifs</p>
                    <p className="text-2xl font-bold text-white">{stats.activeJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-500 to-emerald-500 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-teal-50">Candidatures</p>
                    <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Talents */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="text-slate-900 dark:text-white">Talents Matchés</CardTitle>
                </div>
                <Link href="/talent-matching">
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription className="dark:text-slate-400">
                Top {topMatches.length} profils recommandés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMatches.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p className="text-sm">Aucun talent match\u00e9 pour le moment</p>
                    <Link href="/talent-matching">
                      <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                        Lancer le matching
                      </Button>
                    </Link>
                  </div>
                ) : (
                  topMatches.slice(0, 5).map((talent: any) => (
                    <div
                      key={talent.id}
                      onClick={() => handleTalentClick(talent)}
                      className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="border-2 border-emerald-300 dark:border-emerald-700">
                          <AvatarImage src={talent.avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
                            {talent.name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{talent.name}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{talent.headline || talent.jobTitle}</p>
                        </div>
                        <Badge className="bg-emerald-600 text-white border-0 text-xs">{talent.matchScore}%</Badge>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {talent.skills.slice(0, 3).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                            {skill}
                          </Badge>
                        ))}
                        {talent.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs border-emerald-300 dark:border-emerald-700">
                            +{talent.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Link href="/talent-matching">
                  <Button className="w-full bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg font-semibold">
                    <Users className="w-4 h-4 mr-2" />
                    Rechercher des Talents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        formatDomain={formatDomain}
      />
    </div>
  )
}
