// job-details.tsx
import { JobPosting } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Clock, Briefcase, Building2, Users, DollarSign, ChevronRight, Share2, Info, CheckCircle2, FileText, Zap, User, FileCheck, Rocket, Wand2, Brain, Ban, ClipboardCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

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
          "w-full sm:max-w-2xl p-0 overflow-hidden border-0",
          "bg-white dark:bg-slate-950",
          "shadow-[-10px_0_30px_-10px_rgba(16,185,129,0.1)]"
        )}
      >
        <div className="h-full flex flex-col relative">
          <SheetHeader className="sr-only">
            <SheetTitle>{job.title}</SheetTitle>
            <SheetDescription>Détails du poste chez {job.companyName}</SheetDescription>
          </SheetHeader>

          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

          {/* Header section with human touch */}
          <div className="flex-shrink-0 p-8 pt-10 relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent">
            <div className="flex gap-6 items-start relative z-10">
              {/* Company Logo or Initial */}
              {job.companyLogo ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative flex-shrink-0 group"
                >
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-xl transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-800 shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-white dark:border-slate-800 shadow-xl"
                >
                  {job.companyName.charAt(0)}
                </motion.div>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  {job.type && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 font-semibold px-3 py-0.5">
                      {job.type.replace('_', ' ')}
                    </Badge>
                  )}
                  {daysAgo < 7 && (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0 font-semibold px-3 py-0.5">
                      Nouveau
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group cursor-default">
                  <Building2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium group-hover:text-emerald-600 transition-colors uppercase tracking-wider text-xs">
                    {job.companyName}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats buttons/pills */}
            <div className="flex flex-wrap gap-3 mt-8 relative z-10">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all hover:border-emerald-500/30">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{job.location || "Remote"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all hover:border-emerald-500/30">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Il y a {daysAgo}j</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all hover:border-emerald-500/30">
                <Users className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{applicationsCount} candidats</span>
              </div>
            </div>
          </div>

          {/* Main content scroll area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-8 space-y-10">
              {/* Salary Section - Human friendly */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rémunération</h3>
                </div>
                <div className="bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] p-6 rounded-3xl border border-emerald-500/10 transition-all hover:shadow-md">
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatSalary() || "Salaire à négocier"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    Estimation basée sur le marché et l'expérience
                  </p>
                </div>
              </section>

              {/* Job Description */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">À propos du rôle</h3>
                </div>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-base space-y-4 whitespace-pre-line">
                  {job.description}
                </div>
              </section>

              {/* Skills Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Compétences attendues</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0 px-4 py-2 rounded-full font-medium transition-all hover:bg-emerald-500 hover:text-white"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Share section */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl flex items-center justify-between border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50">
                    <Share2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-900 dark:text-white">Partager l'offre</p>
                    <p className="text-slate-500">Aidez un ami dans sa carrière</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action bar - Fixed bottom */}
          <div className="flex-shrink-0 p-8 border-t border-slate-100 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  onApply(job);
                  onClose();
                }}
                size="lg"
                className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-500/20 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Postuler maintenant
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onClose}
                className="h-14 w-14 p-0 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};