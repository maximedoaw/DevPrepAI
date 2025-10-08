"use client";

import { useState, useMemo } from "react";
import { JobPosting, JobFilters as JobFiltersType } from "@/types/job";
import { mockJobs } from "@/data/mockJobs";
import { JobCard } from "@/components/jobs/job-card";
import { JobDetails } from "@/components/jobs/job-details";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { Briefcase, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ApplyDialog } from "@/components/jobs/apply-dialog";

const JOBS_PER_PAGE = 6;

const JobsPage = () => {
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      if (filters.domains?.length && !filters.domains.some(d => job.domains.includes(d))) {
        return false;
      }
      
      if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      if (filters.jobTypes?.length && job.type && !filters.jobTypes.includes(job.type)) {
        return false;
      }

      if (filters.workModes?.length && job.workMode && !filters.workModes.includes(job.workMode)) {
        return false;
      }
      
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
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [filters]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Chercher un job"
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>{filteredJobs.length} offres disponibles</span>
          </div>
        </div>

        {/* Filters - Mobile First */}
        <div className="mb-6 lg:hidden">
          <JobFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-3 space-y-6">
            {paginatedJobs.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedJobs.map((job) => (
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
                  Essayez d'ajuster vos filtres pour voir plus de résultats
                </p>
              </div>
            )}
          </div>

          {/* Filters Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <JobFilters filters={filters} onFiltersChange={setFilters} />
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