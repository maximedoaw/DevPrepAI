"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Users, Briefcase, Calendar, MapPin, ExternalLink, Filter } from "lucide-react"
import type { DashboardData } from "@/types/dashboard"

interface RecruiterDashboardProps {
  data: DashboardData
}

export function RecruiterDashboard({ data }: RecruiterDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock candidates data
  const candidates = [
    {
      id: 1,
      name: "Sophie Martin",
      score: 92,
      domain: "Frontend",
      location: "Paris",
      skills: ["React", "TypeScript", "Next.js"],
      status: "available",
    },
    {
      id: 2,
      name: "Lucas Bernard",
      score: 88,
      domain: "Backend",
      location: "Lyon",
      skills: ["Node.js", "PostgreSQL", "Docker"],
      status: "interview",
    },
    {
      id: 3,
      name: "Emma Dubois",
      score: 95,
      domain: "Full Stack",
      location: "Bordeaux",
      skills: ["Vue.js", "Python", "AWS"],
      status: "available",
    },
    {
      id: 4,
      name: "Thomas Petit",
      score: 85,
      domain: "DevOps",
      location: "Toulouse",
      skills: ["Kubernetes", "CI/CD", "Terraform"],
      status: "recruited",
    },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-green-500",
      interview: "bg-blue-500",
      recruited: "bg-slate-500",
    }
    return colors[status as keyof typeof colors] || "bg-slate-500"
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      available: "Disponible",
      interview: "En entretien",
      recruited: "Recruté",
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Rechercher un talent (compétence, domaine, localisation...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-800"
                  />
                </div>
                <Button variant="outline" className="bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Candidats Trouvés</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">127</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">En Entretien</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">18</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Recrutés</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">42</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Candidates List */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-slate-900 dark:text-white">Candidats</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">Liste des talents disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{candidate.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{candidate.location}</span>
                              <span>•</span>
                              <span>{candidate.domain}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500 text-white border-0">{candidate.score}%</Badge>
                            <Badge className={`${getStatusColor(candidate.status)} text-white border-0`}>
                              {getStatusLabel(candidate.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {candidate.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Portfolio
                          </Button>
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                            <Calendar className="w-3 h-3 mr-1" />
                            Planifier Entretien
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Suggestions IA</h3>
              <p className="text-white/90 text-sm mb-4">
                Ces candidats correspondent à vos précédents recrutements réussis
              </p>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-semibold">
                Voir les Suggestions
              </Button>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-slate-900 dark:text-white">Entretiens Planifiés</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Sophie Martin</h4>
                    <Badge variant="outline" className="text-xs">
                      Aujourd'hui
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">14:00 - Entretien technique</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Lucas Bernard</h4>
                    <Badge variant="outline" className="text-xs">
                      Demain
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">10:00 - Entretien RH</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Search className="w-4 h-4 mr-2" />
                  Recherche Avancée
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Gérer le Calendrier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
