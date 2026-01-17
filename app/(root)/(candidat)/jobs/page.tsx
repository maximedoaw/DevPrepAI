"use client"

import { useState, useMemo, useEffect } from "react"
import { JobPosting, JobFilters as JobFiltersType } from "@/types/job"
import { useJobQueries } from "@/hooks/useJobQueries"
import { JobCard } from "@/components/jobs/job-card"
import { JobDetails } from "@/components/jobs/job-details"
import { JobFilters } from "@/components/jobs/job-filters"
import { Pagination } from "@/components/jobs/pagination"
import { Briefcase, Search, Loader2, LayoutGrid, List, MapPin, Building2, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ApplyDialog } from "@/components/jobs/apply-dialog"
import { JobCardSkeleton } from "@/components/jobs/job-card-skeleton"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { PageBanner } from "@/components/shared/Banner"

const JOBS_PER_PAGE = 6

const JobsPage = () => {
  const [filters, setFilters] = useState<JobFiltersType>({})
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Persistence for ViewMode
  useEffect(() => {
    const savedMode = localStorage.getItem("jobs_view_mode")
    if (savedMode === "grid" || savedMode === "list") {
      setViewMode(savedMode as "grid" | "list")
    }
  }, [])

  const handleSetViewMode = (mode: "grid" | "list") => {
    setViewMode(mode)
    localStorage.setItem("jobs_view_mode", mode)
  }

  // Récupération des données depuis la base de données
  const {
    jobs,
    jobFilters,
    loadingJobs,
    loadingFilters
  } = useJobQueries(filters)

  const filteredJobs = useMemo(() => {
    if (!jobs) return []

    const filtered = jobs.filter((job: JobPosting) => {
      // Filtre par domaines
      if (filters.domains?.length && !filters.domains.some(d => job.domains.includes(d))) {
        return false
      }

      // Filtre par localisation
      if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      // Filtre par types de job
      if (filters.jobTypes?.length && job.type && !filters.jobTypes.includes(job.type as any)) {
        return false
      }

      // Filtre par modes de travail
      if (filters.workModes?.length && job.workMode && !filters.workModes.includes(job.workMode as any)) {
        return false
      }

      // Filtre par recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.skills.some(s => s.toLowerCase().includes(searchLower)) ||
          job.companyName.toLowerCase().includes(searchLower)
        )
      }

      return true
    })

    // Tri: jobs actifs d'abord, puis par date (les plus récents en premier)
    return filtered.sort((a, b) => {
      // Priorité aux jobs actifs
      if (a.isActive && !b.isActive) return -1
      if (!a.isActive && b.isActive) return 1

      // Ensuite par date (plus récent en premier)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [jobs, filters])

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  )

  // Compteurs pour les statistiques
  const activeJobsCount = filteredJobs.filter(job => job.isActive).length
  const totalJobsCount = filteredJobs.length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <PageBanner
          badge={{ text: "Carrière & Opportunités" }}
          title={
            <>
              Trouvez votre <br />
              <span className="text-emerald-100">prochain job idéal</span>
            </>
          }
          description="Explorez des milliers d'offres d'emploi adaptées à votre profil et boostez votre carrière."
          stats={[
            { value: activeJobsCount, label: "Offres Actives" },
            { value: totalJobsCount, label: "Total Postes" }
          ]}
          image={<Briefcase className="w-32 h-32 text-emerald-100 drop-shadow-lg" />}
        />
      </div>

      {/* View Mode Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {totalJobsCount} {totalJobsCount > 1 ? "résultats" : "résultat"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSetViewMode("grid")}
              className={cn(
                viewMode === "grid" && "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSetViewMode("list")}
              className={cn(
                viewMode === "list" && "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-3">
            {loadingJobs ? (
              // Skeleton loaders
              <div className={cn(
                viewMode === "grid" ? "grid sm:grid-cols-2 gap-4" : "space-y-4"
              )}>
                {Array.from({ length: JOBS_PER_PAGE }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            ) : paginatedJobs.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      viewMode === "grid" ? "grid sm:grid-cols-2 gap-4" : "space-y-4"
                    )}
                  >
                    {paginatedJobs.map((job: JobPosting) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onApply={setApplyingJob}
                        onViewDetails={setSelectedJob}
                        viewMode={viewMode}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <Briefcase className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Aucune offre trouvée
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {jobs.length === 0
                    ? "Aucun job n'a été trouvé dans la base de données."
                    : "Essayez d'ajuster vos filtres pour voir plus de résultats"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Filters Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <JobFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters)
                  setCurrentPage(1)
                }}
                searchTerm={filters.search}
                onSearchChange={(term) => {
                  setFilters({ ...filters, search: term })
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full h-14 w-14 shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white p-0">
              <Filter className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>Filtres de recherche</SheetTitle>
              <SheetDescription>Ajustez vos critères pour trouver le job idéal</SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <JobFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters)
                  setCurrentPage(1)
                }}
                searchTerm={filters.search}
                onSearchChange={(term) => {
                  setFilters({ ...filters, search: term })
                  setCurrentPage(1)
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Dialogs */}
      <JobDetails
        job={selectedJob}
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={setApplyingJob}
      />

      <ApplyDialog
        job={applyingJob}
        open={!!applyingJob}
        onClose={() => setApplyingJob(null)}
      />
    </div>
  )
}

export default JobsPage