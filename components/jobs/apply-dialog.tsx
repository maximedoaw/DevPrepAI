// apply-dialog.tsx
import { JobPosting } from "@/types/job";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Zap, User, Briefcase, FileCheck, Rocket, Wand2, Brain, Ban } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useApplicationMutations, useApplicationQueries } from "@/hooks/use-application-mutations";

interface ApplyDialogProps {
  job: JobPosting | null;
  open: boolean;
  onClose: () => void;
}

const steps = [
  { id: 1, name: "Profil", icon: User, description: "Vérification de votre profil" },
  { id: 2, name: "CV & Motivation", icon: Briefcase, description: "Optimisation des documents" },
  { id: 3, name: "Pré-screening", icon: FileCheck, description: "Validation automatique" },
  { id: 4, name: "Candidature", icon: Rocket, description: "Envoi final" },
];

export const ApplyDialog = ({ job, open, onClose }: ApplyDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [coverLetter, setCoverLetter] = useState("");

  const { applyMutation, generateCoverLetterMutation } = useApplicationMutations();
  const { 
    hasApplied, 
    userSkills, 
    testResults, 
    skillAnalysis,
    isLoading 
  } = useApplicationQueries(job?.id || "");

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
      // Bloquer directement à l'étape 4 pour afficher le statut
      setCurrentStep(4);
    }
  }, [hasApplied, job, open]);

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
    
    try {
      await applyMutation.mutateAsync({
        jobId: job.id,
        coverLetter: coverLetter,
        portfolioUrl: "https://portfolio.plateforme.com/user-123", // À remplacer par les vraies données
        resumeUrl: "https://resume.plateforme.com/user-123", // À remplacer par les vraies données
        score: calculateFinalScore(),
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
        "bg-gradient-to-br from-white via-white to-blue-50/90",
        "dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/95",
        "border border-blue-200/70 dark:border-slate-700/70"
      )}>
        {/* Header fixe */}
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {hasApplied ? (
              <Ban className="h-5 w-5 text-orange-500" />
            ) : (
              <Zap className="h-5 w-5 text-yellow-500" />
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

        {/* Stepper fixe - désactivé si déjà postulé */}
        <div className="flex-shrink-0 mb-6 px-1">
          <Progress 
            value={progress} 
            className={cn(
              "h-2 mb-4 transition-all",
              hasApplied && "opacity-50"
            )} 
          />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                  hasApplied 
                    ? "bg-gray-300 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-400"
                    : currentStep > step.id 
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === step.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500"
                )}>
                  {hasApplied ? (
                    <Ban className="h-4 w-4" />
                  ) : currentStep > step.id ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium transition-colors text-center",
                  hasApplied 
                    ? "text-gray-400 dark:text-gray-500"
                    : currentStep >= step.id 
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                )}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 px-1 mb-4">
          {/* Étape 1: Profil */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Vérification du profil
              </h3>
              <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/60 dark:to-purple-950/60 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Profil complété</span>
                    <Badge className="bg-green-500 text-white">100%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Email vérifié</span>
                    <Badge className="bg-green-500 text-white">Oui</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Téléphone vérifié</span>
                    <Badge className="bg-green-500 text-white">Oui</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Statut candidature</span>
                    <Badge className={hasApplied ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}>
                      {hasApplied ? "Déjà postulé" : "Prêt à postuler"}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {hasApplied 
                  ? "Vous avez déjà postulé à cette offre. Vous ne pouvez pas postuler à nouveau."
                  : "Votre profil est complet et prêt pour la candidature."
                }
              </p>
            </div>
          )}

          {/* Étape 2: CV & Motivation */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Optimisation des documents
              </h3>
              
              {/* Analyse du matching CV */}
              <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/60 dark:to-cyan-950/60 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">Analyse de compatibilité CV</p>
                    <p className="text-sm text-muted-foreground">
                      {skillAnalysis.matchPercent >= 70 ? "Excellent matching !" : 
                       skillAnalysis.matchPercent >= 50 ? "Bon matching" : 
                       "Matching à améliorer"}
                    </p>
                  </div>
                  <Badge className={cn(
                    "text-lg px-3 py-1",
                    skillAnalysis.matchPercent >= 70 ? "bg-green-500" :
                    skillAnalysis.matchPercent >= 50 ? "bg-orange-500" : "bg-red-500"
                  )}>
                    {isLoading ? "..." : `${skillAnalysis.matchPercent}%`}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Compétences correspondantes:</span>
                    <span className="font-medium">
                      {skillAnalysis.matchedSkills.length} / {job.skills.length}
                    </span>
                  </div>
                  
                  {skillAnalysis.matchPercent < 70 && skillAnalysis.missingSkills.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">Compétences recommandées:</p>
                      <div className="flex flex-wrap gap-1">
                        {skillAnalysis.missingSkills.slice(0, 5).map(skill => (
                          <Badge key={skill} variant="outline" className="text-orange-600 dark:text-orange-400">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Optimisation lettre de motivation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Lettre de motivation
                  </h4>
                  {!hasApplied && (
                    <Button 
                      onClick={handleGenerateCoverLetter}
                      disabled={generateCoverLetterMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400"
                    >
                      {generateCoverLetterMutation.isPending ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <>
                          <Wand2 className="h-3 w-3 mr-1" />
                          Générer avec IA
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <Textarea
                  value={coverLetter}
                  onChange={(e) => !hasApplied && setCoverLetter(e.target.value)}
                  placeholder={
                    hasApplied 
                      ? "Vous avez déjà postulé à cette offre. Votre lettre de motivation a été enregistrée."
                      : "Rédigez votre lettre de motivation ou utilisez l'IA pour en générer une optimisée..."
                  }
                  disabled={hasApplied}
                  className={cn(
                    "min-h-[250px] resize-none border-2 bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg text-sm leading-relaxed",
                    hasApplied
                      ? "border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
                      : "border-blue-200/70 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  )}
                />
                
                {!coverLetter && !hasApplied && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Utilisez le bouton "Générer avec IA" pour créer une lettre de motivation<br />
                      personnalisée adaptée à ce poste spécifique.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Étape 3: Pré-screening */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-500" />
                Résultats du pré-screening
              </h3>
              
              <div className="space-y-4">
                {/* Interviews validées */}
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Tests validés</h4>
                  <div className="space-y-2">
                    {testResults.validated.map(interview => (
                      <div key={interview.id} className="flex items-center justify-between p-3 bg-green-50/80 dark:bg-green-950/40 rounded-lg border border-green-200/50 dark:border-green-800/50">
                        <span className="font-medium">{interview.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500 text-white">{interview.score}%</Badge>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interviews non validées */}
                {testResults.invalid.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2">Tests à repasser</h4>
                    <div className="space-y-2">
                      {testResults.invalid.map(interview => (
                        <div key={interview.id} className="flex items-center justify-between p-3 bg-orange-50/80 dark:bg-orange-950/40 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                          <span className="font-medium">{interview.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-300">
                              {interview.score}%
                            </Badge>
                            <span className="text-xs text-orange-600 dark:text-orange-400">Échoué</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/60 dark:to-cyan-950/60 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Score global</p>
                      <p className="text-sm text-muted-foreground">Basé sur les tests validés</p>
                    </div>
                    <Badge className="bg-blue-500 text-white text-lg px-3 py-1">
                      {calculateFinalScore()}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {hasApplied ? (
                  <Ban className="h-5 w-5 text-orange-500" />
                ) : (
                  <Rocket className="h-5 w-5 text-blue-500" />
                )}
                {hasApplied ? "Candidature existante" : "Confirmation de candidature"}
              </h3>
              
              <div className={cn(
                "p-6 rounded-xl border text-center",
                hasApplied
                  ? "bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/60 dark:to-amber-950/60 border-orange-200/50 dark:border-orange-800/50"
                  : "bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/60 dark:to-emerald-950/60 border-green-200/50 dark:border-green-800/50"
              )}>
                {hasApplied ? (
                  <>
                    <Ban className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold mb-2">Candidature déjà soumise</h4>
                    <p className="text-muted-foreground mb-4">
                      Vous avez déjà postulé à <strong>{job.title}</strong> chez <strong>{job.companyName}</strong>.
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
                      Vous ne pouvez pas postuler à nouveau à cette offre.
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold mb-2">Prêt à postuler !</h4>
                    <p className="text-muted-foreground mb-4">
                      Votre candidature pour <strong>{job.title}</strong> chez <strong>{job.companyName}</strong> est prête à être envoyée.
                    </p>
                  </>
                )}
                
                <div className="space-y-2 text-sm text-left bg-white/50 dark:bg-slate-800/30 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Score de matching:</span>
                    <strong>{calculateFinalScore()}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Compatibilité CV:</span>
                    <strong className={cn(
                      skillAnalysis.matchPercent >= 70 ? "text-green-600" :
                      skillAnalysis.matchPercent >= 50 ? "text-orange-600" : "text-red-600"
                    )}>
                      {skillAnalysis.matchPercent}%
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lettre de motivation:</span>
                    <strong>{coverLetter ? "Personnalisée ✓" : "Non incluse"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tests techniques:</span>
                    <strong>{testResults.validated.length}/{testResults.validated.length + testResults.invalid.length} validés</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation fixe */}
        <div className="flex-shrink-0 flex gap-3 pt-4 border-t border-blue-100/50 dark:border-slate-700/50">
          {currentStep > 1 && !hasApplied && (
            <Button 
              variant="outline" 
              onClick={handlePreviousStep}
              className="flex-1 border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              Précédent
            </Button>
          )}
          
          {hasApplied ? (
            <Button 
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Ban className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          ) : currentStep < steps.length ? (
            <Button 
              onClick={handleNextStep}
              className={cn(
                "flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              )}
            >
              Continuer
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitApplication}
              disabled={applyMutation.isPending}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {applyMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Soumettre ma candidature
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};