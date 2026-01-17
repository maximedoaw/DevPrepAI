// apply-dialog.tsx
import { JobPosting } from "@/types/job";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Zap, User, Briefcase, FileCheck, Rocket, Wand2, Brain, Ban, ClipboardCheck, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useApplicationMutations, useApplicationQueries } from "@/hooks/useApplicationMutations";
import { useRouter } from "next/navigation";

interface ApplyDialogProps {
  job: JobPosting | null;
  open: boolean;
  onClose: () => void;
}

// Fonction pour générer les steps
const getSteps = () => {
  return [
    { id: 1, name: "Profil", icon: User, description: "Vérification de votre profil" },
    { id: 2, name: "Documents", icon: Briefcase, description: "CV & Portfolio" },
    { id: 3, name: "Confirmation", icon: Rocket, description: "Envoi final" }
  ];
};

export const ApplyDialog = ({ job, open, onClose }: ApplyDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [coverLetter, setCoverLetter] = useState("");
  const router = useRouter();

  const { applyMutation, generateCoverLetterMutation } = useApplicationMutations();
  const {
    hasApplied,
    userSkills,
    testResults,
    skillAnalysis,
    portfolio,
    resumeUrl,
    portfolioUrl,
    jobQuizzes,
    hasJobQuizzes,
    quizCompletion,
    isLoading
  } = useApplicationQueries(job?.id || "");

  // Générer les steps
  const steps = getSteps();

  // Réinitialiser le formulaire quand le dialog s'ouvre/ferme
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setCoverLetter("");
    }
  }, [open]);

  // Si l'utilisateur a déjà postulé, on peut pré-remplir les données
  useEffect(() => {
    if (hasApplied && job && open) {
      toast.info("Vous avez déjà postulé à cette offre", {
        description: "Vous ne pouvez pas postuler à nouveau à cette offre"
      });
      // Bloquer directement à la dernière étape pour afficher le statut
      setCurrentStep(steps.length);
    }
  }, [hasApplied, job, open, steps.length]);


  const handleNextStep = () => {
    if (currentStep < steps.length && !hasApplied) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1 && !hasApplied) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!job || hasApplied) return;

    try {
      const generatedLetter = await generateCoverLetterMutation.mutateAsync(job.id);
      setCoverLetter(generatedLetter);
    } catch (error) {
      console.error("Failed to generate cover letter:", error);
    }
  };


  const handleSubmitApplication = async () => {
    if (!job || hasApplied) return;

    // Calculer le score final basé sur les tests réels
    const finalScore = calculateFinalScore();

    try {
      await applyMutation.mutateAsync({
        jobId: job.id,
        coverLetter: coverLetter,
        portfolioUrl: portfolioUrl || (portfolio?.url || ""),
        resumeUrl: resumeUrl || (resumeUrl || ""),
        score: finalScore,
      });

      toast.success("Candidature soumise avec succès", {
        description: "Votre candidature a été envoyée et le pré-screening est en cours"
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Application submission failed:", error);
    }
  };

  const calculateFinalScore = () => {
    const validScores = testResults.validated.map(i => i.score);
    const average = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
    return Math.round(average);
  };

  const progress = (currentStep / steps.length) * 100;

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-2xl border-0 shadow-2xl backdrop-blur-sm max-h-[95vh] flex flex-col",
        "bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100",
        "dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
        "border border-emerald-200/70 dark:border-slate-700/70"
      )}>
        {/* Header fixe */}
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {hasApplied ? (
              <Ban className="h-5 w-5 text-orange-500" />
            ) : (
              <Zap className="h-5 w-5 text-emerald-500" />
            )}
            {hasApplied ? "Candidature existante" : "Candidature"} - {job.title}
            {hasApplied && (
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                Déjà postulé
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            {job.companyName} • {hasApplied ? "Statut de votre candidature" : "Postulez en quelques étapes"}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper Elegant - Human Centric */}
        <div className="flex-shrink-0 mb-10 px-8">
          <div className="flex justify-between items-center relative">
            {/* Ligne de base (inactive) - Connecte les centres des cercles */}
            <div className="absolute top-[18px] left-[18px] right-[18px] h-[2px] bg-slate-100 dark:bg-slate-800 -z-10" />

            {/* Ligne de progression (active) */}
            <div
              className="absolute top-[18px] left-[18px] h-[2px] bg-emerald-500 transition-all duration-700 ease-in-out -z-10 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
              style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${currentStep === 1 ? '0px' : '0px'})`, maxWidth: 'calc(100% - 36px)' }}
            />

            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={cn(
                    "w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-500 text-sm font-semibold",
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                      : isActive
                        ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-50 dark:ring-emerald-950/30"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 stroke-[2.5px]" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  <span className={cn(
                    "absolute -bottom-6 text-[11px] font-bold uppercase tracking-tight transition-colors duration-300",
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenu Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 px-1 mb-2">
          {/* Étape 1: Profil */}
          {currentStep === 1 && (
            <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-500" />
                  Vérification du profil
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Confirmez que vos informations sont à jour avant de soumettre.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: "Informations de contact", status: "À jour", icon: CheckCircle2 },
                  { label: "Portfolio professionnel", status: portfolioUrl || portfolio?.url ? "Connecté" : "Non configuré", icon: portfolioUrl || portfolio?.url ? CheckCircle2 : Ban },
                  { label: "Curriculum Vitae (PDF)", status: resumeUrl ? "Prêt" : "Manquant", icon: resumeUrl ? CheckCircle2 : Ban },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl",
                        item.icon === CheckCircle2 ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-500" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      item.icon === CheckCircle2 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                    )}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Étape 2: Documents */}
          {currentStep === 2 && (
            <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-500" />
                  Documents & Motivation
                </h3>
              </div>

              {/* Information Card - Professional & Clean */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                <div className="flex gap-4 items-start">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">Transmission automatique</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                      Votre CV et Portfolio sont déjà liés. Nous les transmettrons en haute qualité directement à l'équipe recrutement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Letter Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    Note de motivation (Optionnel)
                  </label>
                  {!hasApplied && (
                    <button
                      onClick={handleGenerateCoverLetter}
                      disabled={generateCoverLetterMutation.isPending}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 hover:underline disabled:opacity-50"
                    >
                      {generateCoverLetterMutation.isPending ? "Génération..." : (
                        <>
                          <Wand2 className="h-3.5 w-3.5" />
                          Générer avec IA
                        </>
                      )}
                    </button>
                  )}
                </div>

                <Textarea
                  value={coverLetter}
                  onChange={(e) => !hasApplied && setCoverLetter(e.target.value)}
                  placeholder="Pourquoi ce poste ? Pourquoi vous ? (Quelques lignes suffisent)"
                  className={cn(
                    "min-h-[180px] bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm focus:border-emerald-500/50 focus:ring-emerald-500/5 transition-all text-slate-700 dark:text-slate-300",
                    hasApplied && "opacity-50"
                  )}
                  disabled={hasApplied}
                />
              </div>
            </div>
          )}
          {/* Étape 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-emerald-500" />
                  Prêt pour l'envoi ?
                </h3>
              </div>

              <div className={cn(
                "p-6 rounded-2xl border-2 transition-all duration-500",
                hasApplied
                  ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  : "bg-white dark:bg-slate-900 border-emerald-500/50 shadow-sm"
              )}>
                {hasApplied ? (
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Ban className="h-8 w-8 text-slate-400" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">Candidature enregistrée</h4>
                    <p className="text-sm text-slate-500 mt-2 max-w-[280px]">
                      Vous avez déjà postulé à ce poste. L'équipe de recrutement examine votre dossier.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Récapitulatif</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Voici ce qui sera transmis à <span className="text-emerald-600 font-bold">{job.companyName}</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Votre Dossier complet</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Synchronisé</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Note de motivation</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">{coverLetter ? "Incluse" : "Non fournie"}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-center text-slate-400 font-medium leading-relaxed px-4">
                      * En cliquant sur soumettre, vous validez l'envoi sécurisé de vos données professionnelles.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation fixe */}
        <div className="flex-shrink-0 flex gap-4 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 && !hasApplied && (
            <Button
              variant="ghost"
              onClick={handlePreviousStep}
              className="px-6 h-12 rounded-xl font-bold text-slate-500"
            >
              Retour
            </Button>
          )}

          {hasApplied ? (
            <Button
              onClick={onClose}
              className="flex-1 h-12 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md active:scale-[0.98] transition-all"
            >
              Fermer la fenêtre
            </Button>
          ) : currentStep < steps.length ? (
            <Button
              onClick={handleNextStep}
              className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all"
            >
              Étape suivante
            </Button>
          ) : (
            <Button
              onClick={handleSubmitApplication}
              disabled={applyMutation.isPending}
              className="flex-1 h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
            >
              {applyMutation.isPending ? "Transmission..." : "Confirmer ma candidature"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};