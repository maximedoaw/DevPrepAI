// job-details.tsx
import { JobPosting } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Clock, Briefcase, Building2, Users, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface JobDetailsProps {
  job: JobPosting | null;
  open: boolean;
  onClose: () => void;
  onApply: (job: JobPosting) => void;
}

export const JobDetails = ({ job, open, onClose, onApply }: JobDetailsProps) => {
  if (!job) return null;

  const daysAgo = Math.floor((Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 1000000).toFixed(1)}M - ${(job.salaryMax / 1000000).toFixed(1)}M ${job.currency || "FCFA"}`;
    }
    if (job.salaryMin) {
      return `À partir de ${(job.salaryMin / 1000000).toFixed(1)}M ${job.currency || "FCFA"}`;
    }
    return null;
  };

  const applicationsCount = job.applications?.length || 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className={cn(
          "w-full sm:max-w-2xl p-0 overflow-hidden",
          "bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50/80 to-slate-100",
          "border-l border-slate-200/60 dark:border-slate-700/60"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="flex-shrink-0 p-6 pb-0 bg-gradient-to-b from-white/95 to-white/80 dark:from-slate-900/95 dark:to-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
            <SheetTitle className="text-left">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Détails de l'offre
                </h2>
              </div>

              {/* En-tête du job */}
              <div className="flex items-start gap-4 mb-6">
                {job.companyLogo ? (
                  <div className="relative flex-shrink-0 group">
                    <img 
                      src={job.companyLogo} 
                      alt={job.companyName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-600 transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/5 dark:to-purple-400/5" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border border-slate-200 dark:border-slate-600 transition-all duration-300 hover:scale-105">
                    {job.companyName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium truncate">{job.companyName}</span>
                  </div>
                </div>
              </div>

              {/* Métadonnées principales */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.location && (
                  <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:scale-105">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">{job.location}</span>
                  </div>
                )}
                {job.type && (
                  <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:scale-105">
                    <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium">{job.type.replace('_', ' ')}</span>
                  </div>
                )}
                {applicationsCount > 0 && (
                  <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:scale-105">
                    <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-medium">{applicationsCount} candidature{applicationsCount > 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:scale-105">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium">Publié il y a {daysAgo} jour{daysAgo > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Salaire */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50 mb-6 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Salaire estimé</p>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {formatSalary() || "Salaire à négocier"}
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Description */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                  Description du poste
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line bg-white/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  {job.description}
                </p>
              </div>

              <Separator className="bg-slate-200/50 dark:bg-slate-700/50" />

              {/* Compétences */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                  Compétences requises
                </h3>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 dark:from-blue-900/40 dark:to-blue-800/30 dark:text-blue-200 border-0 px-4 py-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-200/50 dark:bg-slate-700/50" />

              {/* Domaines */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                  Domaines
                </h3>
                <div className="flex flex-wrap gap-3">
                  {job.domains.map((domain) => (
                    <Badge 
                      key={domain} 
                      className="bg-gradient-to-r from-purple-100 to-pink-50 text-purple-800 dark:from-purple-900/40 dark:to-pink-800/30 dark:text-purple-200 border-0 px-4 py-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    >
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex-shrink-0 p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-t from-white/90 to-white/70 dark:from-slate-900/90 dark:to-slate-900/70 backdrop-blur-sm">
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  onApply(job);
                  onClose();
                }}
                size="lg"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <Sparkles className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                Postuler en 1 clic
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={onClose}
                className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};