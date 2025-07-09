"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Target, ArrowRight, Filter, Grid3X3, Table, ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import { MOCK_USER_STATS, DIFFICULTY_CONFIG, TYPE_CONFIG } from "@/constants"
import { DashboardStats } from "@/components/interviews/dashboard-stats"
import { WeeklyChart } from "@/components/interviews/weekly-chart"
import { SkillsProgress } from "@/components/interviews/skills-progress"
import { RecentInterviews } from "@/components/interviews/recent-interviews"
import { AIRecommendations } from "@/components/interviews/ai-recommendations"
//import { InterviewSidebar } from "@/components/youtube-style-sidebar"
import { toast } from "sonner"
import { useMutation, useQuery } from "@tanstack/react-query"
import { getInterviews, interviewSave } from "@/actions/interview.action"
import InterviewSkeleton from "../interview-skeleton"
import { ProtectedSection } from "@/components/protected-routes"
import InterviewSidebar from "../interviews/interview-sidebar"
import SeedDatabase from "../seed-database"
import ReputationLink from "../reputation-link"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useSubscribeStore } from '@/store/subscribe-store'
import SubscribeDialog from "@/components/subscribe-dialog"

interface SearchFilters {
  difficulty: string[]
  type: string[]
  technology: string[]
  duration: string[]
}

export default function HomeScreenContent() {
  const { user } = useKindeBrowserClient()
  const { isOpen, open, pendingAfterAuth, setPendingAfterAuth } = useSubscribeStore()
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    difficulty: [],
    type: [],
    technology: [],
    duration: [],
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [page, setPage] = useState(1)
  const interviewsPerPage = 6

  const { data: interviews, isLoading: isLoadingInterviewCard } = useQuery({
    queryKey: ["interviews"],
    queryFn: async () => await getInterviews(),
  })

  const { data: mutationSaveInterview } = useMutation({
    mutationKey: ["saveinterview"],
    mutationFn: async () => await interviewSave(),
  })

  useEffect(() => {
    toast.success("Bienvenue")
    // Ouvre le dialog d'abonnement si pendingAfterAuth est à true
    if (pendingAfterAuth) {
      open()
      setPendingAfterAuth(false)
    }
  }, [pendingAfterAuth, open, setPendingAfterAuth])
  const router = useRouter()

  const handleStartInterview = (interviewId: string) => {
    toast.success("Démarrage de l'interview...")
    router.push(`/interview/${interviewId}`)
  }

  // Fonction pour filtrer les interviews
  const filteredInterviews =
    interviews?.filter((interview) => {
      // Filtre par difficulté
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(interview.difficulty)) {
        return false
      }

      // Filtre par type
      if (filters.type.length > 0 && !filters.type.includes(interview.type)) {
        return false
      }

      // Filtre par technologie
      if (filters.technology.length > 0) {
        const hasMatchingTech = interview.technology.some((tech: string) => filters.technology.includes(tech))
        if (!hasMatchingTech) return false
      }

      // Filtre par durée
      if (filters.duration.length > 0 && !filters.duration.includes(interview.duration.toString())) {
        return false
      }

      return true
    }) || []

  const totalPages = Math.ceil(filteredInterviews.length / interviewsPerPage)
  const paginatedInterviews = filteredInterviews.slice((page - 1) * interviewsPerPage, page * interviewsPerPage)

  const clearFilters = () => {
    setFilters({
      difficulty: [],
      type: [],
      technology: [],
      duration: [],
    })
  }

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <SubscribeDialog />
      {/* Header avec gradient */}
      {/*<SeedDatabase/>*/}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl mb-8">
        <div className="px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Préparez vos Entretiens Tech 🚀</h1>
              <p className="text-blue-100 text-lg">
                Entraînez-vous avec des interviews réalistes et boostez vos compétences
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{MOCK_USER_STATS.streak}</div>
                  <div className="text-blue-100">jours de suite</div>
                </div>
              </div>
            </div>
            {user && (
              <div className="hidden lg:block ml-4">
                <ReputationLink 
                  userId={user.id} 
                  variant="default"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <ProtectedSection>
        <DashboardStats />
      </ProtectedSection>

      {/* AI Recommendations */}
      <ProtectedSection>
        <div className="mt-8">
          
        </div>
      </ProtectedSection>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column - Progress & Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Progress */}
          <ProtectedSection>
            <WeeklyChart />
          </ProtectedSection>

          {/* Interview Categories */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      Interviews Disponibles
                      <span className="text-sm font-normal text-gray-500">
                        ({viewMode === "grid" ? "Vue Grille" : "Vue Tableau"})
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {filteredInterviews.length} interview{filteredInterviews.length > 1 ? "s" : ""} trouvé
                      {filteredInterviews.length > 1 ? "s" : ""}
                      {hasActiveFilters && ` (${interviews?.length || 0} au total)`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Toggle View Mode */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`h-8 px-3 ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                      title="Vue Grille"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className={`h-8 px-3 ${viewMode === "table" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                      title="Vue Tableau"
                    >
                      <Table className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-gray-300 hover:bg-gray-50"
                    title="Filtrer les interviews"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Filtres</span>
                    {hasActiveFilters && (
                      <Badge className="ml-2 h-5 w-5 rounded-full bg-blue-500 text-white text-xs">
                        {Object.values(filters).reduce((acc, arr) => acc + arr.length, 0)}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Section des filtres */}
            {showFilters && (
              <div className="px-6 pb-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Difficulté */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-3">Difficulté</h3>
                    <div className="space-y-2">
                      {["JUNIOR", "MID", "SENIOR"].map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.difficulty.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((prev) => ({
                                  ...prev,
                                  difficulty: [...prev.difficulty, option],
                                }))
                              } else {
                                setFilters((prev) => ({
                                  ...prev,
                                  difficulty: prev.difficulty.filter((d) => d !== option),
                                }))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-3">Type</h3>
                    <div className="space-y-2">
                      {["QCM", "CODING", "MOCK_INTERVIEW", "SOFT_SKILLS"].map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.type.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((prev) => ({
                                  ...prev,
                                  type: [...prev.type, option],
                                }))
                              } else {
                                setFilters((prev) => ({
                                  ...prev,
                                  type: prev.type.filter((t) => t !== option),
                                }))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">
                            {option === "MOCK_INTERVIEW" ? "Mock Interview" : option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Technologies */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-3">Technologies</h3>
                    <div className="space-y-2">
                      {["React", "JavaScript", "TypeScript", "Node.js", "Python", "Java", "SQL"].map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.technology.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((prev) => ({
                                  ...prev,
                                  technology: [...prev.technology, option],
                                }))
                              } else {
                                setFilters((prev) => ({
                                  ...prev,
                                  technology: prev.technology.filter((t) => t !== option),
                                }))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Durée */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-3">Durée</h3>
                    <div className="space-y-2">
                      {["15", "30", "45", "60"].map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.duration.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((prev) => ({
                                  ...prev,
                                  duration: [...prev.duration, option],
                                }))
                              } else {
                                setFilters((prev) => ({
                                  ...prev,
                                  duration: prev.duration.filter((d) => d !== option),
                                }))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">{option} min</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions des filtres */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <Button variant="ghost" onClick={clearFilters} className="text-gray-600 hover:text-gray-800">
                    Effacer tous les filtres
                  </Button>
                  <Button variant="outline" onClick={() => setShowFilters(false)} className="border-gray-300">
                    Fermer
                  </Button>
                </div>
              </div>
            )}

            <CardContent>
              {isLoadingInterviewCard ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <InterviewSkeleton key={i} />
                  ))}
                </div>
              ) : filteredInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">
                    {hasActiveFilters ? "Aucune interview ne correspond à vos filtres" : "Aucune interview disponible"}
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline" className="mt-2">
                      Effacer les filtres
                    </Button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedInterviews.map((interview) => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      onStart={() => handleStartInterview(interview.id)}
                    />
                  ))}
                </div>
                  <Pagination page={page} setPage={setPage} totalPages={totalPages} />
                </>
              ) : (
                <>
                  <InterviewTableView interviews={paginatedInterviews} onStart={handleStartInterview} />
                  <Pagination page={page} setPage={setPage} totalPages={totalPages} />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Skills & Recent */}
        <div className="space-y-6">
          <ProtectedSection>
            <SkillsProgress skills={MOCK_USER_STATS.skillsProgress} isLoading={false} />
          </ProtectedSection>
          <ProtectedSection>
            <RecentInterviews />
          </ProtectedSection>
        </div>
      </div>
    </div>
  )
}



// Composant pour la vue tableau
function InterviewTableView({ interviews, onStart }: { interviews: any[]; onStart: (id: string) => void }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "CODING":
        return "bg-blue-100 text-blue-700"
      case "QCM":
        return "bg-purple-100 text-purple-700"
      case "MOCK_INTERVIEW":
        return "bg-orange-100 text-orange-700"
      case "SOFT_SKILLS":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "JUNIOR":
        return "bg-green-100 text-green-700"
      case "MID":
        return "bg-yellow-100 text-yellow-700"
      case "SENIOR":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <>
      {/* Version Desktop - Tableau */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Interview</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Difficulté</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Technologies</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Durée</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Questions</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => (
              <tr key={interview.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{interview.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{interview.description}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge className={`text-xs ${getTypeColor(interview.type)}`}>
                    {interview.type.replace("_", " ")}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <Badge className={`text-xs ${getDifficultyColor(interview.difficulty)}`}>
                    {interview.difficulty}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {interview.technology.slice(0, 2).map((tech: string) => (
                      <span key={tech} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {interview.technology.length > 2 && (
                      <span className="text-xs text-gray-500">+{interview.technology.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {interview.duration} min
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-600">{interview.questions.length}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <Button
                    onClick={() => onStart(interview.id)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                  >
                    Commencer
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Version Mobile - Cartes */}
      <div className="lg:hidden space-y-4">
        {interviews.map((interview) => (
          <Card key={interview.id} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header avec titre et badges */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{interview.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{interview.description}</p>
                  </div>
                </div>

                {/* Badges Type et Difficulté */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={`text-xs ${getTypeColor(interview.type)}`}>
                    {interview.type.replace("_", " ")}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(interview.difficulty)}`}>
                    {interview.difficulty}
                  </Badge>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1">
                  {interview.technology.slice(0, 3).map((tech: string) => (
                    <span key={tech} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                  {interview.technology.length > 3 && (
                    <span className="text-xs text-gray-500">+{interview.technology.length - 3}</span>
                  )}
                </div>

                {/* Métriques et Action */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {interview.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {interview.questions.length} questions
                    </div>
                  </div>
                  <Button
                    onClick={() => onStart(interview.id)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                  >
                    Commencer
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

function InterviewCard({ interview, onStart }: { interview: any; onStart: () => void }) {
  const typeConfig = TYPE_CONFIG[interview.type as "qcm" | "mock" | "soft-skills" | "coding"]
  const difficultyConfig = DIFFICULTY_CONFIG[interview.difficulty as "junior" | "mid" | "senior"]

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r`}>
            <span className="text-2xl"></span>
          </div>
          <Badge className={`border-0`}>{interview.difficulty}</Badge>
        </div>

        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">{interview.title}</h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{interview.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{interview.duration} min</span>
            <span className="text-gray-400">•</span>
            <span>{interview.questions.length} questions</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {interview.technology.slice(0, 2).map((tech: string) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                  {tech}
                </Badge>
              ))}
              {interview.technology.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-gray-100">
                  +{interview.technology.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
        >
          Commencer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl mb-8">
        <div className="px-8 py-12">
          <Skeleton className="h-10 w-96 mb-2 bg-white/20" />
          <Skeleton className="h-6 w-64 bg-white/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function Pagination({ page, setPage, totalPages }: { page: number; setPage: (p: number) => void; totalPages: number }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="rounded-full"
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="font-mono text-lg px-4">
        Page {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        className="rounded-full"
        aria-label="Page suivante"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
