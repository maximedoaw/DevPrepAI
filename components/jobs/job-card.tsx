import { JobPosting, WorkMode, JobType } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase, Monitor, Bookmark, Star, ChevronDown, Users, DollarSign, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface JobCardProps {
  job: JobPosting;
  onApply: (job: JobPosting) => void;
  onViewDetails: (job: JobPosting) => void;
}

export const JobCard = ({ job, onApply, onViewDetails }: JobCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const MAX_DESCRIPTION_LENGTH = 120;

  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 1000000).toFixed(1)}M - ${(job.salaryMax / 1000000).toFixed(1)}M ${job.currency || "FCFA"}`;
    }
    if (job.salaryMin) {
      return `À partir de ${(job.salaryMin / 1000000).toFixed(1)}M ${job.currency || "FCFA"}`;
    }
    return null;
  };

  const getWorkModeLabel = (mode: WorkMode) => {
    switch (mode) {
      case WorkMode.REMOTE: return "Remote";
      case WorkMode.ON_SITE: return "Présentiel";
      case WorkMode.HYBRID: return "Hybride";
      default: return "";
    }
  };

  const getJobTypeLabel = (type: JobType) => {
    switch (type) {
      case JobType.CDI: return "CDI";
      case JobType.STAGE: return "Stage";
      case JobType.MISSION: return "Mission";
      case JobType.FULL_TIME: return "Temps plein";
      case JobType.PART_TIME: return "Temps partiel";
      case JobType.INTERNSHIP: return "Internship";
      default: return type.replace('_', ' ');
    }
  };

  const getExperienceLevelLabel = (level?: string) => {
    switch (level) {
      case "JUNIOR": return "Junior";
      case "MID": return "Intermédiaire";
      case "SENIOR": return "Senior";
      default: return level;
    }
  };

  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(job.createdAt), { 
      addSuffix: true,
      locale: fr 
    });
  };

  // Calcul des jours pour le badge "Nouveau"
  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const shouldTruncate = job.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = isExpanded 
    ? job.description 
    : job.description.slice(0, MAX_DESCRIPTION_LENGTH) + (shouldTruncate ? '...' : '');

  // Gestion sécurisée des applications
  const applicationsCount = job.applications?.length || 0;

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl p-5 transition-all duration-300",
        "bg-white dark:bg-slate-800/80 backdrop-blur-sm",
        "border border-slate-200/80 dark:border-slate-700/80",
        "hover:border-blue-300 dark:hover:border-blue-600",
        "hover:shadow-lg hover:scale-[1.02] w-full",
        "shadow-sm"
      )}
    >


      {/* Header: Company + Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {/* Logo entreprise simulé */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {job.companyName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">
                {job.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {job.companyName}
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions rapides */}
        <div className="flex gap-1 ml-3">
          <button 
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isSaved 
                ? "bg-red-50 text-red-500 dark:bg-red-950/30" 
                : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
          <button 
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality
            }}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Métadonnées principales */}
      <div className="flex flex-wrap gap-3 mb-4">
        {job.location && (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>{job.location}</span>
          </div>
        )}
        {job.workMode && (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <Monitor className="h-4 w-4 text-purple-500" />
            <span>{getWorkModeLabel(job.workMode)}</span>
          </div>
        )}
        {job.type && (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <Briefcase className="h-4 w-4 text-green-500" />
            <span>{getJobTypeLabel(job.type)}</span>
          </div>
        )}
        {applicationsCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <Users className="h-4 w-4 text-orange-500" />
            <span>{applicationsCount} candidature{applicationsCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Description avec bouton pour étendre */}
      <div className="mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {displayDescription}
        </p>
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-2 h-8 px-3 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            {isExpanded ? (
              <>
                Voir moins
                <ChevronDown className="h-3 w-3 ml-1 rotate-180" />
              </>
            ) : (
              <>
                Voir plus
                <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Compétences */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 5).map((skill) => (
          <Badge 
            key={skill}
            variant="secondary"
            className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            {skill}
          </Badge>
        ))}
        {job.skills.length > 5 && (
          <Badge variant="outline" className="text-xs">
            +{job.skills.length - 5}
          </Badge>
        )}
      </div>

      {/* Footer: Salary + Time + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          {formatSalary() ? (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatSalary()}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Salaire à négocier
            </div>
          )}
          
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-500">
            <Clock className="h-4 w-4" />
            <span>{getTimeAgo()}</span>
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(job);
            }}
            size="sm"
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium px-4 rounded-lg transition-all duration-200 cursor-pointer"
          >
            Détails
          </Button>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onApply(job);
            }}
            size="sm"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-6 rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            Postuler
          </Button>
        </div>
      </div>

    </div>
  );
};