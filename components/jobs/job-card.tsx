import { JobPosting, WorkMode, JobType } from "@/types/job"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Briefcase, Monitor, Building2, DollarSign, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface JobCardProps {
  job: JobPosting
  onApply: (job: JobPosting) => void
  onViewDetails: (job: JobPosting) => void
  viewMode?: "grid" | "list"
}

export const JobCard = ({ job, onApply, onViewDetails, viewMode = "grid" }: JobCardProps) => {
  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 1000000).toFixed(1)}M - ${(job.salaryMax / 1000000).toFixed(1)}M`
    }
    if (job.salaryMin) {
      return `> ${(job.salaryMin / 1000000).toFixed(1)}M`
    }
    return "N/A"
  }

  const getWorkModeLabel = (mode: WorkMode) => {
    switch (mode) {
      case WorkMode.REMOTE: return "Remote"
      case WorkMode.ON_SITE: return "Présentiel"
      case WorkMode.HYBRID: return "Hybride"
      default: return ""
    }
  }

  const getJobTypeLabel = (type: JobType) => {
    switch (type) {
      case JobType.CDI: return "CDI"
      case JobType.STAGE: return "Stage"
      case JobType.MISSION: return "Mission"
      case JobType.FULL_TIME: return "Temps plein"
      case JobType.PART_TIME: return "Temps partiel"
      default: return type.replace('_', ' ')
    }
  }

  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(job.createdAt), {
      addSuffix: true,
      locale: fr
    })
  }

  const hoursAgo = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60))
  const isNew = hoursAgo <= 48 && job.isActive

  // --- LIST VIEW (Improved Table-like) ---
  if (viewMode === "list") {
    return (
      <div
        onClick={() => job.isActive && onViewDetails(job)}
        className={cn(
          "group relative flex items-center gap-6 p-4 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
          "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800",
          job.isActive ? "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800" : "opacity-60 grayscale"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-14 w-14 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0 text-white",
          job.isActive ? "bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800" : "bg-slate-300"
        )}>
          {job.companyName.charAt(0)}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
          {/* Title & Company (Col 1-5) */}
          <div className="col-span-12 md:col-span-5">
            <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span className="font-medium">{job.companyName}</span>
              {isNew && <Badge className="h-4 px-1 text-[10px] bg-emerald-500 text-white border-0">NEW</Badge>}
            </div>
          </div>

          {/* Meta Tags (Col 6-9) */}
          <div className="col-span-12 md:col-span-4 hidden md:flex items-center gap-2 flex-wrap">
            {job.type && (
              <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                {getJobTypeLabel(job.type)}
              </Badge>
            )}
            {job.workMode && (
              <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                {getWorkModeLabel(job.workMode)}
              </Badge>
            )}
            {job.location && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
            )}
          </div>

          {/* Salary & Date (Col 10-12) */}
          <div className="col-span-12 md:col-span-3 hidden md:block text-right">
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {formatSalary()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {getTimeAgo()}
            </div>
          </div>
        </div>

        {/* Hover Arrow Action */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
          <Button size="icon" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full">
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    )
  }

  // --- GRID VIEW (YouTube Style - Borderless & Immersive) ---
  return (
    <div
      onClick={() => job.isActive && onViewDetails(job)}
      className={cn(
        "group flex flex-col gap-3 cursor-pointer",
        !job.isActive && "opacity-60 grayscale"
      )}
    >
      {/* Visual Thumbnail Area */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all duration-300">
        {/* Background Pattern/Gradient */}
        <div className={cn(
          "absolute inset-0 opacity-10 dark:opacity-20 transition-transform duration-500 group-hover:scale-110",
          "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-slate-200 to-slate-100 dark:from-emerald-900 dark:via-slate-900 dark:to-black"
        )} />

        {/* Centered Logo (Big) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900/80 shadow-lg flex items-center justify-center text-3xl font-black text-slate-800 dark:text-emerald-500 backdrop-blur-sm">
            {job.companyName.charAt(0)}
          </div>
        </div>

        {/* Badges Overlay */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {isNew && <Badge className="bg-red-500 text-white border-0 shadow-sm text-[10px] px-1.5 h-5">NOUVEAU</Badge>}
          <Badge className="bg-slate-900/80 text-white backdrop-blur-md border-0 text-[10px] px-1.5 h-5">
            {formatSalary()}
          </Badge>
        </div>

        {/* Type Badge Top Left */}
        {job.type && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 dark:bg-black/50 backdrop-blur text-slate-800 dark:text-slate-200 text-[10px] border-0 h-5 font-medium shadow-sm">
              {getJobTypeLabel(job.type)}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Info (YouTube Style) */}
      <div className="flex gap-3 items-start px-1">
        {/* Minimal Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5">
          {job.companyName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 text-sm md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {job.title}
          </h3>

          {/* Metadata Line */}
          <div className="flex items-center flex-wrap gap-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">{job.companyName}</span>
            {job.workMode && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                <span>{getWorkModeLabel(job.workMode)}</span>
              </>
            )}
            <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
            <span>{getTimeAgo()}</span>
          </div>
        </div>

        {/* Action Menu (Vertical Dots) or simple interaction hint could go here, but we keep it clean */}
      </div>
    </div>
  )
}