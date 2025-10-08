// job-details.tsx
import { JobPosting } from "@/types/job";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Clock, Briefcase, Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface JobDetailsProps {
  job: JobPosting | null;
  open: boolean;
  onClose: () => void;
  onApply: (job: JobPosting) => void;
}

export const JobDetails = ({ job, open, onClose, onApply }: JobDetailsProps) => {
  if (!job) return null;

  const daysAgo = Math.floor((Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl backdrop-blur-sm",
        "bg-gradient-to-br from-white via-white to-blue-50/80",
        "dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/95",
        "border border-blue-100/70 dark:border-slate-700/70"
      )}>
        <DialogHeader>
          <div className="flex items-start gap-4 mb-4">
            {job.companyLogo && (
              <div className="relative">
                <img 
                  src={job.companyLogo} 
                  alt={job.companyName}
                  className="w-16 h-16 rounded-xl object-cover border border-blue-200 dark:border-slate-600"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-400/10 dark:to-purple-400/10" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2 font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {job.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{job.companyName}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {job.location && (
              <div className="flex items-center gap-2 bg-blue-100/80 dark:bg-blue-900/60 px-3 py-1.5 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">{job.location}</span>
              </div>
            )}
            {job.type && (
              <div className="flex items-center gap-2 bg-green-100/80 dark:bg-green-900/60 px-3 py-1.5 rounded-lg">
                <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">{job.type.replace('_', ' ')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-orange-100/80 dark:bg-orange-900/60 px-3 py-1.5 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium">Publié il y a {daysAgo} jour{daysAgo > 1 ? 's' : ''}</span>
            </div>
          </div>

          {job.salary && (
            <div className="bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/60 dark:to-purple-900/60 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <p className="text-sm text-muted-foreground mb-1">Salaire estimé</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
              </p>
            </div>
          )}

          <Separator className="bg-blue-200/50 dark:bg-slate-600/50" />

          <div>
            <h3 className="font-bold text-lg mb-3 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Description du poste
            </h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line bg-white/50 dark:bg-slate-800/30 p-4 rounded-lg border border-blue-100/50 dark:border-slate-700/50">
              {job.description}
            </p>
          </div>

          <Separator className="bg-blue-200/50 dark:bg-slate-600/50" />

          <div>
            <h3 className="font-bold text-lg mb-3 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Compétences requises
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge 
                  key={skill} 
                  className="bg-blue-100/80 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-0 px-3 py-1.5"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="bg-blue-200/50 dark:bg-slate-600/50" />

          <div>
            <h3 className="font-bold text-lg mb-3 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Domaines
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.domains.map((domain) => (
                <Badge 
                  key={domain} 
                  className="bg-purple-100/80 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-0 px-3 py-1.5"
                >
                  {domain}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => {
                onApply(job);
                onClose();
              }}
              size="lg"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Postuler en 1 clic
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onClose}
              className="border-blue-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};