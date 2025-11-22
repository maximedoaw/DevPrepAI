"use client"

import { useState, useEffect, useMemo } from "react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { TalentMatchingHeader } from "@/components/enterprise/talent-matching/TalentMatchingHeader"
import { TalentMatchingFilters } from "@/components/enterprise/talent-matching/TalentMatchingFilters"
import { TalentMatchingList } from "@/components/enterprise/talent-matching/TalentMatchingList"
import type { MatchedCandidate } from "@/components/enterprise/talent-matching/types"
import { useUserJobQueries } from "@/hooks/useJobQueries"
import { useMatchingQueries } from "@/hooks/useMatchingQueries"

export default function TalentMatchingPage() {
  const { user } = useKindeBrowserClient()
  const { jobs, loadingJobs } = useUserJobQueries(user?.id)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL")
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  
  // Utiliser le hook TanStack Query pour récupérer les matchings depuis le cache
  const {
    matchings: allMatchings,
    isLoading: isLoadingMatchings,
    regenerateMatchings,
    isRegenerating,
    fromCache,
  } = useMatchingQueries(selectedJobId)

  // Filtrer les matchings selon les critères
  const matchings = useMemo(() => {
    let filtered = [...(allMatchings || [])]

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
  }, [allMatchings, searchQuery, selectedDomain])

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/10 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <TalentMatchingHeader totalCandidates={matchings.length} />

        {/* Sélection du job posting */}
        {activeJobs.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Sélectionner un poste à pourvoir
            </label>
            <select
              value={selectedJobId || ""}
              onChange={(e) => {
                setSelectedJobId(e.target.value)
              }}
              className="w-full md:w-auto px-4 py-2 border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900/50 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
            >
              {activeJobs.map((job: any) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.companyName}
                </option>
              ))}
            </select>
            {selectedJobId && (
              <button
                onClick={() => regenerateMatchings()}
                disabled={isRegenerating}
                className="ml-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
                title={fromCache ? "Recalculer les matchings" : "Générer les matchings"}
              >
                {isRegenerating ? "Génération..." : fromCache ? "Recalculer" : "Générer les matchings"}
              </button>
            )}
            {fromCache && selectedJobId && (
              <span className="ml-2 text-sm text-emerald-600 dark:text-emerald-400">
                (Depuis le cache)
              </span>
            )}
          </div>
        )}

        {activeJobs.length === 0 && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Aucun poste actif trouvé. Créez un poste actif pour générer des matchings de candidats.
            </p>
          </div>
        )}

        <TalentMatchingFilters
          searchQuery={searchQuery}
          selectedDomain={selectedDomain}
          onSearchChange={setSearchQuery}
          onDomainChange={setSelectedDomain}
          onReset={handleReset}
        />

        <TalentMatchingList
          isLoading={isLoadingMatchings || loadingJobs}
          matchings={matchings}
          formatDomain={formatDomain}
          onResetFilters={handleReset}
        />
      </div>
    </div>
  )
}