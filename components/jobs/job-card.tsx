// job-card.tsx
import { JobPosting, WorkMode, JobType } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase, Monitor, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: JobPosting;
  onApply: (job: JobPosting) => void;
  onViewDetails: (job: JobPosting) => void;
}

export const JobCard = ({ job, onApply, onViewDetails }: JobCardProps) => {
  const formatSalary = () => {
    if (!job.salary) return null;
    return `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} ${job.salary.currency}`;
  };

  const getWorkModeLabel = (mode: WorkMode) => {
    switch (mode) {
      case WorkMode.REMOTE: return "Remote";
      case WorkMode.ON_SITE: return "Présentiel";
      case WorkMode.HYBRID: return "Hybride";
      default: return "";
    }
  };

  const daysAgo = Math.floor((Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6  transition-all duration-500 animate-fade-in",
        "bg-gradient-to-br from-white via-blue-50/50 to-slate-100",
        "dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900",
        "shadow-sm hover:shadow-2xl hover:scale-[1.02]",
        "border border-blue-100/50 dark:border-slate-700/50",
        "hover:border-blue-200/70 dark:hover:border-slate-600/70"
      )}
    >
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          {job.companyLogo && (
            <div className="relative">
              <img 
                src={job.companyLogo} 
                alt={job.companyName}
                className="w-14 h-14 rounded-xl object-cover border border-blue-100 dark:border-slate-700"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/5 dark:to-purple-400/5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-xl mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {job.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{job.companyName}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill) => (
            <Badge 
              key={skill} 
              variant="secondary" 
              className="text-xs bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0"
            >
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0">
              +{job.skills.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
          {job.location && (
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-lg">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{job.location}</span>
            </div>
          )}
          {job.workMode && (
            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded-lg">
              <Monitor className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{getWorkModeLabel(job.workMode)}</span>
            </div>
          )}
          {job.type && (
            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-lg">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {job.type === JobType.CDI ? "CDI" : job.type === JobType.STAGE ? "Stage" : job.type === JobType.MISSION ? "Mission" : job.type.replace('_', ' ')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-lg">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{daysAgo} jour{daysAgo > 1 ? 's' : ''}</span>
          </div>
        </div>

        {job.salary && (
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            {formatSalary()}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onApply(job);
              
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            Postuler
          </Button>
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(job);
            }}
            className="border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer"
          >
            Voir détails
          </Button>
        </div>
      </div>
    </div>
  );
};