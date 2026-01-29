"use client"

import { useState, useEffect, useMemo, useTransition } from "react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { PageBanner } from "@/components/shared/Banner"
import { Building, Sparkles, Target, Users, Briefcase } from "lucide-react"
import { TalentMatchingFilters } from "@/components/enterprise/talent-matching/TalentMatchingFilters"
import { TalentMatchingList } from "@/components/enterprise/talent-matching/TalentMatchingList"
import { CandidateDetailModal } from "@/components/enterprise/talent-matching/CandidateDetailModal"
import { MatchingProgress } from "@/components/enterprise/talent-matching/MatchingProgress"
import type { MatchedCandidate } from "@/components/enterprise/talent-matching/types"
import { useUserJobQueries } from "@/hooks/useJobQueries"
import { useMatchingQueries } from "@/hooks/useMatchingQueries"
import { saveAiMatchedTalents } from "@/actions/talent.action"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TalentMatchingPage() {
  const { user } = useKindeBrowserClient()
  const { jobs, loadingJobs } = useUserJobQueries(user?.id)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL")
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [aiResults, setAiResults] = useState<MatchedCandidate[] | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedCandidate, setSelectedCandidate] = useState<MatchedCandidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [matchingProgress, setMatchingProgress] = useState(0)
  const [isMatching, setIsMatching] = useState(false)

  // Utiliser le hook TanStack Query pour récupérer les matchings depuis le cache (fallback)
  const {
    matchings: cachedMatchings,
    isLoading: isLoadingCache,
    fromCache,
  } = useMatchingQueries(selectedJobId)

  // Lancer le matching IA via Server Action avec progression
  const handleRunMatching = () => {
    if (!selectedJobId || !user?.id) return

    setIsMatching(true)
    setMatchingProgress(0)

    // Simuler une progression réaliste
    const progressInterval = setInterval(() => {
      setMatchingProgress((prev) => {
        if (prev >= 95) return prev // Stop at 95%, wait for actual completion
        return prev + Math.random() * 8 + 2 // Increment by 2-10%
      })
    }, 400)

    startTransition(async () => {
      try {
        const result = await saveAiMatchedTalents(selectedJobId)

        clearInterval(progressInterval)

        if (result.success) {
          setMatchingProgress(100)

          // Wait a bit to show 100% before reloading data
          setTimeout(() => {
            setIsMatching(false)
            setMatchingProgress(0)
            // Force reload from cache
            window.location.reload()
          }, 1000)

          toast.success("Matching terminé", {
            description: `${result.count} profils analysés et sauvegardés.`
          })
        } else {
          clearInterval(progressInterval)
          setIsMatching(false)
          setMatchingProgress(0)
          toast.error("Erreur lors de l'analyse")
        }
      } catch (error) {
        clearInterval(progressInterval)
        setIsMatching(false)
        setMatchingProgress(0)
        console.error(error)
        toast.error("Erreur lors de l'analyse IA")
      }
    })
  }

  // Filtrer les matchings : utilise les résultats IA en priorité, sinon le cache
  const activeMatchings = aiResults || cachedMatchings || []

  // Filtrer selon les critères UI (recherche locale)
  const matchings = useMemo(() => {
    let filtered = [...activeMatchings]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((m: MatchedCandidate) => {
        const candidate = m.candidate
        const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase()
        const email = candidate.email.toLowerCase()
        const skills = candidate.skills.join(" ").toLowerCase()
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          skills.includes(query)
        )
      })
    }

    if (selectedDomain !== "ALL") {
      filtered = filtered.filter((m: MatchedCandidate) =>
        m.candidate.domains.includes(selectedDomain)
      )
    }

    return filtered
  }, [activeMatchings, searchQuery, selectedDomain])

  // Confirmer si on affiche les résultats du cache ou live
  const isLiveResults = !!aiResults

  // Récupérer les jobs actifs
  const activeJobs = useMemo(() => {
    if (!jobs) return []
    return jobs.filter((job: any) => job.isActive === true)
  }, [jobs])

  // Sélectionner le premier job actif par défaut
  useEffect(() => {
    if (activeJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(activeJobs[0].id)
    }
  }, [activeJobs, selectedJobId])

  const formatDomain = (domain: string) => {
    return domain.replace(/_/g, " ").toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleReset = () => {
    setSearchQuery("")
    setSelectedDomain("ALL")
    setAiResults(null) // Reset pour revenir au cache si besoin ? Ou garder.
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Banner - More Professional Design */}
        <PageBanner
          badge={{ text: "Enterprise - Matching", icon: Building }}
          title="Talents Matchés"
          description="Découvrez les profils les plus pertinents pour vos offres d'emploi grâce à notre système de matching intelligent."
          stats={[
            { value: matchings.length, label: "Profils" },
            { value: activeJobs.length, label: "Postes" }
          ]}
          image={
            <div className="relative w-56 h-56">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-600/20 dark:to-teal-600/20 rounded-2xl rotate-6" />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-teal-500/30 dark:from-emerald-500/30 dark:to-teal-500/30 rounded-2xl -rotate-6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="w-24 h-24 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          }
        />

        {/* Job Selector Section */}
        {activeJobs.length > 0 && (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                <div className="flex-1 w-full space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Sélectionnez le poste à analyser
                  </label>
                  <Select
                    value={selectedJobId || ""}
                    onValueChange={(value) => {
                      setSelectedJobId(value)
                      setAiResults(null)
                    }}
                  >
                    <SelectTrigger className="w-full border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900/50 rounded-lg focus:ring-2 focus:ring-emerald-500/20">
                      <SelectValue placeholder="Choisissez un poste..." />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-lg bg-white/95 dark:bg-slate-900/95">
                      {activeJobs.map((job: any) => (
                        <SelectItem key={job.id} value={job.id}>
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium text-slate-900 dark:text-white">{job.title}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{job.companyName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedJobId && (
                  <Button
                    onClick={handleRunMatching}
                    disabled={isPending}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 px-6 disabled:opacity-70 whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isPending ? "Analyse en cours..." : isLiveResults ? "Relancer" : "Lancer le matching"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeJobs.length === 0 && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 text-center">
              <Building className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Commencez par créer une offre</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Pour trouver les meilleurs candidats, nous avons besoin de connaître vos besoins.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters & Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Résultats de l'analyse
            </h2>
          </div>

          <TalentMatchingFilters
            searchQuery={searchQuery}
            selectedDomain={selectedDomain}
            onSearchChange={setSearchQuery}
            onDomainChange={setSelectedDomain}
            onReset={handleReset}
          />

          {/* Show Progress Bar when matching */}
          {isMatching ? (
            <MatchingProgress
              progress={matchingProgress}
              isComplete={matchingProgress === 100}
            />
          ) : (
            <TalentMatchingList
              isLoading={isLoadingCache || loadingJobs}
              matchings={matchings}
              formatDomain={formatDomain}
              onResetFilters={handleReset}
              onCardClick={(matching) => {
                setSelectedCandidate(matching)
                setIsModalOpen(true)
              }}
            />
          )}
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