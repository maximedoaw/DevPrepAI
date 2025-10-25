import { JobPosting, WorkMode, JobType } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase, Monitor, Bookmark, Star, ChevronDown, Users, DollarSign, Heart, Share2, Building2, Award, Calendar } from "lucide-react";
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

  // Calcul des heures pour le badge "Nouveau" (48h)
  const hoursAgo = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60));
  const isNew = hoursAgo <= 48 && job.isActive;

  const shouldTruncate = job.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = isExpanded 
    ? job.description 
    : job.description.slice(0, MAX_DESCRIPTION_LENGTH) + (shouldTruncate ? '...' : '');

  // Gestion sécurisée des applications
  const applicationsCount = job.applications?.length || 0;

  // Empêcher les actions pour les jobs inactifs
  const handleCardClick = (e: React.MouseEvent) => {
    if (!job.isActive) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onViewDetails(job);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.isActive) {
      onApply(job);
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.isActive) {
      onViewDetails(job);
    }
  };

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
        "bg-white dark:bg-slate-800/90 backdrop-blur-sm",
        "border-2 border-slate-200/80 dark:border-slate-700/80",
        "hover:shadow-xl hover:scale-[1.02] w-full",
        "shadow-md cursor-pointer",
        job.isActive 
          ? "hover:border-blue-300 dark:hover:border-blue-600" 
          : "hover:border-slate-300 dark:hover:border-slate-600 opacity-80"
      )}
      onClick={handleCardClick}
    >
      {/* Badge d'état - Design amélioré */}
      <div className="absolute top-4 right-4 flex gap-2">
        {!job.isActive && (
          <Badge className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30 px-3 py-1 text-xs font-semibold">
            Inactif
          </Badge>
        )}
        {isNew && (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg shadow-green-200/50 dark:shadow-emerald-900/30 px-3 py-1 text-xs font-semibold">
             Nouveau
          </Badge>
        )}
      </div>

      {/* Header: Company + Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {/* Logo entreprise avec gradient amélioré */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300",
              job.isActive 
                ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-200 dark:shadow-blue-900 group-hover:shadow-blue-300"
                : "bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-200 dark:shadow-slate-900"
            )}>
              {job.companyName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-bold text-xl line-clamp-1 transition-colors duration-300",
                job.isActive 
                  ? "text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400" 
                  : "text-slate-500 dark:text-slate-400"
              )}>
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className={cn(
                  "h-4 w-4 transition-colors",
                  job.isActive ? "text-slate-400" : "text-slate-300"
                )} />
                <p className={cn(
                  "text-sm font-medium transition-colors",
                  job.isActive ? "text-slate-600 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"
                )}>
                  {job.companyName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métadonnées principales avec icônes colorées */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {job.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className={cn(
              "h-4 w-4 flex-shrink-0 transition-colors",
              job.isActive ? "text-blue-500" : "text-slate-300"
            )} />
            <span className={cn(
              "truncate transition-colors",
              job.isActive ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
            )}>
              {job.location}
            </span>
          </div>
        )}
        {job.workMode && (
          <div className="flex items-center gap-2 text-sm">
            <Monitor className={cn(
              "h-4 w-4 flex-shrink-0 transition-colors",
              job.isActive ? "text-purple-500" : "text-slate-300"
            )} />
            <span className={cn(
              "transition-colors",
              job.isActive ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
            )}>
              {getWorkModeLabel(job.workMode)}
            </span>
          </div>
        )}
        {job.type && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className={cn(
              "h-4 w-4 flex-shrink-0 transition-colors",
              job.isActive ? "text-green-500" : "text-slate-300"
            )} />
            <span className={cn(
              "transition-colors",
              job.isActive ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
            )}>
              {getJobTypeLabel(job.type)}
            </span>
          </div>
        )}
        {job.experienceLevel && (
          <div className="flex items-center gap-2 text-sm">
            <Award className={cn(
              "h-4 w-4 flex-shrink-0 transition-colors",
              job.isActive ? "text-amber-500" : "text-slate-300"
            )} />
            <span className={cn(
              "transition-colors",
              job.isActive ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
            )}>
              {getExperienceLevelLabel(job.experienceLevel)}
            </span>
          </div>
        )}
      </div>

      {/* Description avec bouton pour étendre */}
      <div className="mb-4">
        <p className={cn(
          "text-sm leading-relaxed transition-colors",
          job.isActive ? "text-slate-600 dark:text-slate-400" : "text-slate-400"
        )}>
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
            className={cn(
              "mt-2 h-8 px-3 text-xs transition-all duration-200",
              job.isActive 
                ? "text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30" 
                : "text-slate-400 hover:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
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
            className={cn(
              "text-xs font-medium transition-all duration-200 border",
              job.isActive
                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800 hover:scale-105"
                : "bg-slate-50 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600"
            )}
          >
            {skill}
          </Badge>
        ))}
        {job.skills.length > 5 && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs transition-colors",
              job.isActive 
                ? "text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600"
                : "text-slate-400 border-slate-200 dark:border-slate-600"
            )}
          >
            +{job.skills.length - 5}
          </Badge>
        )}
      </div>

      {/* Footer: Salary + Time + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {formatSalary() ? (
            <div className="flex items-center gap-2">
              <DollarSign className={cn(
                "h-4 w-4 transition-colors",
                job.isActive ? "text-green-500" : "text-slate-300"
              )} />
              <div className={cn(
                "text-lg font-bold transition-colors",
                job.isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
              )}>
                {formatSalary()}
              </div>
            </div>
          ) : (
            <div className={cn(
              "text-sm transition-colors",
              job.isActive ? "text-slate-500 dark:text-slate-400" : "text-slate-400"
            )}>
              Salaire à négocier
            </div>
          )}
          
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className={cn(
              "h-4 w-4 transition-colors",
              job.isActive ? "text-slate-500" : "text-slate-300"
            )} />
            <span className={cn(
              "transition-colors",
              job.isActive ? "text-slate-500 dark:text-slate-500" : "text-slate-400"
            )}>
              {getTimeAgo()}
            </span>
          </div>

          {applicationsCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <Users className={cn(
                "h-4 w-4 transition-colors",
                job.isActive ? "text-orange-500" : "text-slate-300"
              )} />
              <span className={cn(
                "transition-colors",
                job.isActive ? "text-slate-500 dark:text-slate-500" : "text-slate-400"
              )}>
                {applicationsCount} candidature{applicationsCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        {/* Boutons d'action */}
        <div className="flex gap-3">
          <div className="flex gap-1">
            <button 
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                isSaved 
                  ? "bg-red-50 text-red-500 dark:bg-red-950/30" 
                  : job.isActive
                    ? "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:scale-110"
                    : "text-slate-300 cursor-not-allowed"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (job.isActive) setIsSaved(!isSaved);
              }}
              disabled={!job.isActive}
            >
              <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
            </button>
            <button 
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                job.isActive
                  ? "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:scale-110"
                  : "text-slate-300 cursor-not-allowed"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (job.isActive) {
                  // Share functionality
                }
              }}
              disabled={!job.isActive}
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          
          <Button 
            variant="outline"
            onClick={handleDetailsClick}
            size="sm"
            className={cn(
              "font-medium px-4 rounded-lg transition-all duration-200 border-2",
              job.isActive
                ? "text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 cursor-pointer hover:scale-105"
                : "text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
            )}
            disabled={!job.isActive}
          >
            Détails
          </Button>
          
          <Button 
            onClick={handleApplyClick}
            size="sm"
            className={cn(
              "font-medium px-6 rounded-lg shadow-sm transition-all duration-200",
              job.isActive
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white cursor-pointer hover:shadow-lg hover:scale-105"
                : "bg-slate-200 dark:bg-slate-600 text-slate-400 cursor-not-allowed"
            )}
            disabled={!job.isActive}
          >
            {job.isActive ? "Postuler" : "Inactif"}
          </Button>
        </div>
      </div>
    </div>
  );
};