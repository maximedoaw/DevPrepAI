"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Search,
  BookOpen,
  Code,
  Mic,
  Trophy,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  History,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import { getInterviews, getUserStats } from "@/actions/interview.action"
import { getUserRecommendations } from "../../../../actions/recommendation.action"
import { getUserHistory } from "@/actions/ai.action"
import {
  getSearchTemplates,
  createSearchTemplate,
  deleteSearchTemplate,
  getUserFavorites,
  toggleFavorite
} from "@/actions/preferences.action"

import { cn } from "@/lib/utils"
import Link from "next/link"
import DevLoader from "@/components/dev-loader"
import { motion, AnimatePresence } from "framer-motion"
import { InterviewFilters } from "@/components/interviews/interview-filters"
import { toast } from "sonner"
import { PageBanner } from "@/components/shared/Banner"

const INTERVIEW_TYPES = [
  { id: "ALL", label: "Tout", icon: Sparkles },
  { id: "QCM", label: "Quiz QCM", icon: BookOpen },
  { id: "TECHNICAL", label: "Technique", icon: Code },
  { id: "MOCK_INTERVIEW", label: "Vocal", icon: Mic },
  { id: "HISTORY", label: "Historique", icon: History },
] as const;

// Types for Interview Filter

type InterviewType = typeof INTERVIEW_TYPES[number]["id"];

export default function InterviewsHubPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const urlPage = parseInt(searchParams?.get("page") || "1")
  const urlTab = (searchParams?.get("tab") as InterviewType) || "ALL"
  const urlDifficulty = searchParams?.get("difficulty") || "all"

  const [activeTab, setActiveTab] = useState<string>(urlTab)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(urlPage)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [activeToggle, setActiveToggle] = useState<"filters" | "templates">("filters")

  // Filters State
  const [filters, setFilters] = useState({
    difficulty: urlDifficulty,
    domain: "",
    dateSort: "newest"
  })

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set("tab", activeTab)
    params.set("page", currentPage.toString())
    if (filters.difficulty && filters.difficulty !== "all") params.set("difficulty", filters.difficulty)
    else params.delete("difficulty")

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [activeTab, currentPage, filters.difficulty, router, searchParams])

  // --- QUERIES ---
  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: getInterviews,
  })

  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["userRecommendations"],
    queryFn: getUserRecommendations,
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["userHistory"],
    queryFn: getUserHistory,
  })

  const { data: userStats } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
  })

  const { data: templatesData } = useQuery({
    queryKey: ["searchTemplates"],
    queryFn: getSearchTemplates,
  })

  const { data: favoritesData } = useQuery({
    queryKey: ["favorites"],
    queryFn: getUserFavorites,
  })

  const isLoading = interviewsLoading || (activeTab === "HISTORY" && historyLoading)

  // --- MUTATIONS ---
  const toggleFavMutation = useMutation({
    mutationFn: ({ id, type }: { id: string, type: "QUIZ" | "VOICE" }) => toggleFavorite(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    }
  })

  const createTemplateMutation = useMutation({
    mutationFn: ({ name, filters }: { name: string, filters: any }) => createSearchTemplate(name, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchTemplates"] })
      toast.success("Modèle enregistré")
    }
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => deleteSearchTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchTemplates"] })
      toast.success("Modèle supprimé")
    }
  })

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters({
      difficulty: "all",
      domain: "",
      dateSort: "newest"
    })
    setSearchTerm("")
    setShowFavoritesOnly(false)
  }

  const handleToggleFavorite = (id: string, isVoice: boolean) => {
    toggleFavMutation.mutate({ id, type: isVoice ? "VOICE" : "QUIZ" })
  }

  const isFavorite = (id: string) => {
    return favoritesData?.favorites?.some((f: any) => f.quizId === id || f.voiceInterviewId === id)
  }

  // Filter Logic
  const filteredInterviews = useMemo(() => {
    let items: any[] = []

    if (activeTab === "HISTORY") {
      if (!historyData?.history) return [];
      items = [...historyData.history];
    } else {
      items = Array.isArray(interviewsData) ? [...interviewsData] : [];
      if (activeTab !== "ALL") {
        items = items.filter((it: any) => it.type === activeTab);
      }
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      items = items.filter((it: any) =>
        (it.title || "").toLowerCase().includes(lowerTerm) ||
        (it.context || "").toLowerCase().includes(lowerTerm)
      );
    }

    if (filters.difficulty && filters.difficulty !== "all") {
      items = items.filter((it: any) => it.difficulty === filters.difficulty);
    }

    if (filters.domain) {
      items = items.filter((it: any) => it.domain === filters.domain);
    }

    if (showFavoritesOnly) {
      items = items.filter((it: any) => isFavorite(it.id));
    }

    items.sort((a: any, b: any) => {
      const dateA = new Date(a.date || a.createdAt || a.updatedAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || b.updatedAt || 0).getTime();
      return filters.dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    if (activeTab === "HISTORY") {
      return items.map((it: any) => ({
        ...it,
        isHistory: true,
        description: it.context || it.description || "Session terminée",
        difficulty: it.difficulty || "MID"
      }));
    }

    return items;
  }, [interviewsData, historyData, activeTab, filters, searchTerm, showFavoritesOnly, favoritesData]);

  const itemsPerPage = 9
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage)
  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const handleOpenFeedback = (interview: any) => {
    setSelectedInterview(interview);
    setIsFeedbackOpen(true);
  }

  // Extract Recommendation Quizzes
  const recommendedQuizzes = useMemo(() => {
    if (!recommendationsData?.success || !recommendationsData?.data) return []
    // Filter only DB_MATCHING recommendations which contain quizzes
    const quizRecs = recommendationsData.data.filter((r: any) => r.source === "DB_MATCHING")
    // Flatten contents
    const allQuizzes: any[] = []
    quizRecs.forEach((r: any) => {
      try {
        const content = JSON.parse(r.content)
        if (Array.isArray(content)) allQuizzes.push(...content)
      } catch (e) { }
    })
    // Deduplicate by ID
    return Array.from(new Map(allQuizzes.map(item => [item.id, item])).values()).slice(0, 3)
  }, [recommendationsData])

  if (isLoading) return <DevLoader />

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <PageBanner
          badge={{ text: "Hub d'Entraînement" }}
          title={
            <>
              Préparez votre <br />
              <span className="text-emerald-100">prochain succès</span>
            </>
          }
          description="Accédez à nos simulations d'entretiens et exercices techniques pour booster votre carrière."
          stats={!isLoading ? [
            { value: userStats?.totalInterviews || 0, label: "Sessions" },
            { value: `${userStats?.averageScore || 0}%`, label: "Moyenne" }
          ] : []}
          image={<Target className="w-32 h-32 text-emerald-100 drop-shadow-lg" />}
        />

        {/* --- RECOMMENDATIONS SECTION --- */}
        {recommendedQuizzes.length > 0 && !interviewsLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommandé pour vous</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedQuizzes.map((quiz: any) => (
                <motion.div
                  key={`rec-${quiz.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/interviews/${quiz.id}`}>
                    <Card className="h-full border-amber-200 dark:border-amber-900/30 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-slate-900 hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer group">
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">
                          IA Match
                        </Badge>
                      </div>
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="mb-3">
                          <div className="p-2 w-fit rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                            {quiz.type === 'MOCK_INTERVIEW' ? <Mic className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                          </div>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto pt-3">
                          <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {quiz.difficulty}</span>
                          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {quiz.domain}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Mobile: Top / Desktop: Right Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0 order-1 xl:order-2">
            <div className="sticky top-8">
              <InterviewFilters
                activeTab={activeTab}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                showFavorites={showFavoritesOnly}
                onToggleFavorites={setShowFavoritesOnly}
                templates={templatesData?.templates || []}
                onSaveTemplate={(name) => createTemplateMutation.mutate({ name, filters })}
                onDeleteTemplate={(id) => deleteTemplateMutation.mutate(id)}
                onSelectTemplate={(tpl) => setFilters(tpl.filters)}
                activeToggle={activeToggle}
                onToggleChange={setActiveToggle}
              />
            </div>
          </div>

          {/* Main Content Pane */}
          <div className="flex-1 w-full space-y-6 order-2 xl:order-1">
            {/* Nav & Display Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
                  {INTERVIEW_TYPES.map((type) => (
                    <TabsTrigger
                      key={type.id}
                      value={type.id}
                      className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all gap-2"
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="min-h-[400px]">
              {paginatedInterviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Aucun résultat</h3>
                  <p className="text-slate-500 max-w-sm text-sm">Essayez d'ajuster vos critères ou désactivez les favoris.</p>
                  <Button variant="outline" onClick={resetFilters}>Réinitialiser tout</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {paginatedInterviews.map((interview: any) => (
                      <motion.div
                        key={interview.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* --- LIST VIEW --- */}
                        <div className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all group relative",
                          activeTab === "HISTORY" ? "hover:border-emerald-500/30" : ""
                        )}>
                          <div className="flex-shrink-0 flex items-center gap-3">
                            {!interview.isHistory && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleToggleFavorite(interview.id, interview.type === "MOCK_INTERVIEW")
                                }}
                                className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Star className={cn("w-4 h-4", isFavorite(interview.id) ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                              </button>
                            )}
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                              {interview.type === "MOCK_INTERVIEW" ? <Mic className="w-5 h-5 text-emerald-600" /> :
                                interview.type === "TECHNICAL" ? <Code className="w-5 h-5 text-blue-600" /> : <BookOpen className="w-5 h-5 text-purple-600" />}
                            </div>
                          </div>

                          <Link href={activeTab !== "HISTORY" ? `/interviews/${interview.id}` : "#"} onClick={(e) => activeTab === "HISTORY" && e.preventDefault()} className="flex-1 flex items-center gap-4 min-w-0">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {interview.title}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
                                {interview.description}
                              </p>
                            </div>

                            <div className="hidden md:flex items-center gap-6">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock className="w-3.5 h-3.5" /> {interview.duration}m
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Trophy className="w-3.5 h-3.5" /> {interview.difficulty || "MID"}
                              </div>
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500">
                                {interview.technology?.[0]}
                              </Badge>
                            </div>
                          </Link>

                          <div className="flex items-center gap-4 ml-auto">
                            {interview.isHistory ? (
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "text-lg font-bold min-w-[3rem] text-right",
                                  (interview.score || 0) >= 80 ? "text-emerald-600" :
                                    (interview.score || 0) >= 50 ? "text-amber-600" : "text-red-500"
                                )}>
                                  {interview.score || 0}%
                                </div>
                                {interview.type === "MOCK_INTERVIEW" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenFeedback(interview)}
                                    className="h-8 text-xs"
                                  >
                                    Feedback
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Link href={`/interviews/${interview.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600">
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-none bg-white dark:bg-slate-950 rounded-[2rem]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  Analyse de l'entretien
                  <div className="text-xs font-normal text-slate-500 mt-1">
                    {selectedInterview?.title}
                  </div>
                </div>
                {selectedInterview?.score && (
                  <Badge className="ml-auto text-base px-3 py-1 bg-emerald-500">{selectedInterview.score}%</Badge>
                )}
              </DialogTitle>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {selectedInterview?.feedback ? (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-slate-700 dark:text-slate-300 italic text-sm">
                    "{selectedInterview.feedback.explication_note}"
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-bold text-emerald-600 text-xs uppercase tracking-widest flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 fill-emerald-600" /> Points Forts
                      </h4>
                      <ul className="space-y-2">
                        {selectedInterview.feedback.points_forts?.map((p: string, i: number) => (
                          <li key={i} className="text-sm flex gap-2 text-slate-600 dark:text-slate-400">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-amber-600 text-xs uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" /> À améliorer
                      </h4>
                      <ul className="space-y-2">
                        {selectedInterview.feedback.points_faibles?.map((p: string, i: number) => (
                          <li key={i} className="text-sm flex gap-2 text-slate-600 dark:text-slate-400">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : <div className="text-center py-10 text-slate-400">Analyse indisponible</div>}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button onClick={() => setIsFeedbackOpen(false)} className="rounded-xl">Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

