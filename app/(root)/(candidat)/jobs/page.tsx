"use client";

import { useState, useMemo, useEffect } from "react";
import { JobPosting, JobFilters as JobFiltersType } from "@/types/job";
import { useJobQueries } from "@/hooks/useJobQueries";
import { JobCard } from "@/components/jobs/job-card";
import { JobDetails } from "@/components/jobs/job-details";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { Briefcase, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ApplyDialog } from "@/components/jobs/apply-dialog";
import { JobCardSkeleton } from "@/components/jobs/job-card-skeleton";
import { cn } from "@/lib/utils";
import { SeedJobs } from "@/components/seed-jobs";

const JOBS_PER_PAGE = 6;

const JobsPage = () => {
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Récupération des données depuis la base de données
  const { 
    jobs, 
    jobFilters, 
    loadingJobs, 
    loadingFilters 
  } = useJobQueries(filters);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    const filtered = jobs.filter((job: JobPosting) => {
      // Filtre par domaines
      if (filters.domains?.length && !filters.domains.some(d => job.domains.includes(d))) {
        return false;
      }
      
      // Filtre par localisation
      if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Filtre par types de job
      if (filters.jobTypes?.length && job.type && !filters.jobTypes.includes(job.type as any)) {
        return false;
      }

      // Filtre par modes de travail
      if (filters.workModes?.length && job.workMode && !filters.workModes.includes(job.workMode as any)) {
        return false;
      }
      
      // Filtre par recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.skills.some(s => s.toLowerCase().includes(searchLower)) ||
          job.companyName.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Tri: jobs actifs d'abord, puis par date (les plus récents en premier)
    return filtered.sort((a, b) => {
      // Priorité aux jobs actifs
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      
      // Ensuite par date (plus récent en premier)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs, filters]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  // Compteurs pour les statistiques
  const activeJobsCount = filteredJobs.filter(job => job.isActive).length;
  const inactiveJobsCount = filteredJobs.filter(job => !job.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
      {/* Header avec statistiques améliorées */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-6">
            {/* Barre de recherche - pleine largeur */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Chercher un job par titre, compétence ou entreprise..."
                  value={filters.search || ""}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-12 text-base bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 w-full"
                />
              </div>
            </div>

            {/* Ligne avec statistiques et filtre mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Statistiques améliorées */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{activeJobsCount} offres actives</span>
                  </div>
                  {inactiveJobsCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-orange-500" />
                      <span className="text-muted-foreground">{inactiveJobsCount} inactives</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Filtre mobile - bouton seulement */}
              <div className="lg:hidden">
                <JobFilters 
                  filters={filters} 
                  onFiltersChange={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-3">
            {loadingJobs ? (
              // Skeleton loaders
              <div className="space-y-4">
                {Array.from({ length: JOBS_PER_PAGE }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            ) : paginatedJobs.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedJobs.map((job: JobPosting) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onApply={setApplyingJob}
                      onViewDetails={setSelectedJob}
                    />
                  ))}
                </div>

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
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune offre trouvée</h3>
                <p className="text-muted-foreground">
                  {jobs.length === 0 
                    ? "Aucun job n'a été trouvé dans la base de données. Essayez de peupler la base avec des données de démonstration."
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
                  setFilters(newFilters);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
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
  );
};

export default JobsPage;