// apply-dialog.tsx
import { JobPosting } from "@/types/job";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Zap, User, Briefcase, FileCheck, Rocket, Wand2, Brain, Ban, ClipboardCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useApplicationMutations, useApplicationQueries } from "@/hooks/use-application-mutations";
import { useRouter } from "next/navigation";

interface ApplyDialogProps {
  job: JobPosting | null;
  open: boolean;
  onClose: () => void;
}

// Fonction pour générer les steps dynamiquement selon si des tests sont liés
const getSteps = (hasJobQuizzes: boolean) => {
  const baseSteps = [
    { id: 1, name: "Profil", icon: User, description: "Vérification de votre profil" },
    { id: 2, name: "CV & Motivation", icon: Briefcase, description: "Optimisation des documents" },
  ];

  // Ajouter la step des tests seulement si des tests sont liés au job
  if (hasJobQuizzes) {
    baseSteps.push({ id: 3, name: "Tests Techniques", icon: ClipboardCheck, description: "Validation des compétences" });
  }

  baseSteps.push(
    { id: hasJobQuizzes ? 4 : 3, name: "Pré-screening", icon: FileCheck, description: "Validation automatique" },
    { id: hasJobQuizzes ? 5 : 4, name: "Candidature", icon: Rocket, description: "Envoi final" }
  );

  return baseSteps;
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

  // Générer les steps dynamiquement selon si des tests sont liés
  const steps = getSteps(hasJobQuizzes || false);

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

  // Realtime : Détecter automatiquement quand tous les tests sont complétés et passer à l'étape suivante
  useEffect(() => {
    if (
      !hasApplied && 
      hasJobQuizzes && 
      quizCompletion.allCompleted && 
      currentStep === 3 && // Étape des tests techniques
      open
    ) {
      // Attendre 1 seconde pour laisser le temps à l'utilisateur de voir le résultat
      const timer = setTimeout(() => {
        setCurrentStep(4); // Passer automatiquement à l'étape suivante (Pré-screening)
        toast.success("Tous les tests sont complétés !", {
          description: "Passage automatique à l'étape suivante"
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [quizCompletion.allCompleted, currentStep, hasJobQuizzes, hasApplied, open]);

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

  const handleTakeTechnicalTests = () => {
    if (!job) return;
    // Ouvrir dans un nouvel onglet
    window.open(`/jobs/${job.id}`, '_blank');
    // Passer à l'étape suivante après un délai
    setTimeout(() => {
      handleNextStep();
    }, 1000);
  };

  const handleSubmitApplication = async () => {
    if (!job || hasApplied) return;
    
    // Calculer le score final basé sur les tests réels
    const finalScore = quizCompletion.allCompleted && quizCompletion.completedQuizzes.length > 0
      ? Math.round(
          quizCompletion.completedQuizzes.reduce((sum: number, q: any) => sum + (q.score / q.totalPoints) * 100, 0) / 
          quizCompletion.completedQuizzes.length
        )
      : calculateFinalScore();
    
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

        {/* Stepper amélioré */}
        <div className="flex-shrink-0 mb-6 px-1">
          <div className="flex justify-between relative">
            {/* Ligne de connexion */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
            <div 
              className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500 -z-10"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 relative z-10",
                  hasApplied 
                    ? "bg-gray-300 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-400"
                    : currentStep > step.id 
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : currentStep === step.id
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                    : "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"
                )}>
                  {hasApplied ? (
                    <Ban className="h-4 w-4" />
                  ) : currentStep > step.id ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <div className="text-center mt-2">
                  <span className={cn(
                    "text-xs font-medium transition-colors block",
                    hasApplied 
                      ? "text-gray-400 dark:text-gray-500"
                      : currentStep >= step.id 
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-slate-400 dark:text-slate-500"
                  )}>
                    {step.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                    {step.description}
                  </span>
                </div>
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
                <User className="h-5 w-5 text-emerald-500" />
                Vérification du profil
              </h3>
              <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/60 dark:to-green-950/60 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Profil complété</span>
                    <Badge className="bg-emerald-500 text-white">100%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Email vérifié</span>
                    <Badge className="bg-emerald-500 text-white">Oui</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Téléphone vérifié</span>
                    <Badge className="bg-emerald-500 text-white">Oui</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Statut candidature</span>
                    <Badge className={hasApplied ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"}>
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
                <Briefcase className="h-5 w-5 text-emerald-500" />
                Optimisation des documents
              </h3>
              
              {/* Analyse du matching CV */}
              <div className="bg-gradient-to-br from-emerald-50/80 to-cyan-50/80 dark:from-emerald-950/60 dark:to-cyan-950/60 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
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
                    skillAnalysis.matchPercent >= 70 ? "bg-emerald-500" :
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
                      : "border-emerald-200/70 dark:border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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

          {/* Étape 3: Tests Techniques - Seulement si des tests sont liés */}
          {currentStep === 3 && hasJobQuizzes && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-emerald-500" />
                Tests Techniques
              </h3>

              <div className="bg-gradient-to-br from-blue-50/80 to-emerald-50/80 dark:from-blue-950/60 dark:to-emerald-950/60 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-bold mb-2">Tests Techniques Requis</h4>
                    <p className="text-muted-foreground text-sm">
                      {quizCompletion.allCompleted 
                        ? "✅ Tous les tests sont complétés !"
                        : `${quizCompletion.completedQuizzes.length} / ${quizCompletion.totalQuizzes} tests complétés`
                      }
                    </p>
                  </div>
                  <Badge className={cn(
                    "text-lg px-3 py-1",
                    quizCompletion.allCompleted 
                      ? "bg-emerald-500 text-white"
                      : "bg-orange-500 text-white"
                  )}>
                    {quizCompletion.completedQuizzes.length}/{quizCompletion.totalQuizzes}
                  </Badge>
                </div>

                {/* Liste des tests */}
                <div className="space-y-4 mb-6">
                  {jobQuizzes.map((quiz: any) => {
                    const isCompleted = quizCompletion.completedQuizzes.some((cq: any) => cq.id === quiz.id);
                    const completedQuiz = quizCompletion.completedQuizzes.find((cq: any) => cq.id === quiz.id);
                    const questionsCount = Array.isArray(quiz.questions) 
                      ? quiz.questions.length 
                      : (typeof quiz.questions === 'object' && quiz.questions !== null ? Object.keys(quiz.questions).length : 0);

                    return (
                      <div
                        key={quiz.id}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          isCompleted
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700"
                            : "bg-white/50 dark:bg-slate-800/30 border-blue-200 dark:border-blue-800"
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-semibold text-slate-900 dark:text-white">
                                {quiz.title}
                              </h5>
                              {isCompleted && (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {quiz.description || "Test technique pour évaluer vos compétences"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {questionsCount} question{questionsCount !== 1 ? 's' : ''}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {quiz.duration} min
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {quiz.totalPoints} points
                              </Badge>
                              {quiz.technology && quiz.technology.length > 0 && (
                                <>
                                  {quiz.technology.slice(0, 3).map((tech: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                      {tech}
                                    </Badge>
                                  ))}
                                  {quiz.technology.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{quiz.technology.length - 3}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {isCompleted && completedQuiz && (
                          <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Score obtenu:</span>
                              <Badge className="bg-emerald-500 text-white">
                                {Math.round((completedQuiz.score / completedQuiz.totalPoints) * 100)}%
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!quizCompletion.allCompleted && (
                  <>
                    <Button 
                      onClick={handleTakeTechnicalTests}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-lg"
                      size="lg"
                    >
                      <ClipboardCheck className="h-5 w-5 mr-2" />
                      {quizCompletion.pendingQuizzes.length === 1 
                        ? `Commencer le test restant`
                        : `Commencer les ${quizCompletion.pendingQuizzes.length} tests restants`
                      }
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Les tests s'ouvriront dans un nouvel onglet. Vous pourrez reprendre 
                      votre candidature une fois tous les tests terminés.
                    </p>
                  </>
                )}

                {quizCompletion.allCompleted && (
                  <div className="text-center p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                      Tous les tests sont complétés !
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                      Vous pouvez maintenant passer à l'étape suivante.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Étape 4: Pré-screening (ou 3 si pas de tests) */}
          {((hasJobQuizzes && currentStep === 4) || (!hasJobQuizzes && currentStep === 3)) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-500" />
                Résultats du pré-screening
              </h3>
              
              <div className="space-y-4">
                {/* Interviews validées */}
                <div>
                  <h4 className="font-medium text-emerald-600 dark:text-emerald-400 mb-2">Tests validés</h4>
                  <div className="space-y-2">
                    {testResults.validated.map(interview => (
                      <div key={interview.id} className="flex items-center justify-between p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                        <span className="font-medium">{interview.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500 text-white">{interview.score}%</Badge>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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

                <div className="bg-gradient-to-br from-emerald-50/80 to-cyan-50/80 dark:from-emerald-950/60 dark:to-cyan-950/60 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Score global</p>
                      <p className="text-sm text-muted-foreground">Basé sur les tests validés</p>
                    </div>
                    <Badge className="bg-emerald-500 text-white text-lg px-3 py-1">
                      {calculateFinalScore()}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 5: Confirmation (ou 4 si pas de tests) */}
          {((hasJobQuizzes && currentStep === 5) || (!hasJobQuizzes && currentStep === 4)) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {hasApplied ? (
                  <Ban className="h-5 w-5 text-orange-500" />
                ) : (
                  <Rocket className="h-5 w-5 text-emerald-500" />
                )}
                {hasApplied ? "Candidature existante" : "Confirmation de candidature"}
              </h3>
              
              <div className={cn(
                "p-6 rounded-xl border text-center",
                hasApplied
                  ? "bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/60 dark:to-amber-950/60 border-orange-200/50 dark:border-orange-800/50"
                  : "bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/60 dark:to-green-950/60 border-emerald-200/50 dark:border-emerald-800/50"
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
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
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
                      skillAnalysis.matchPercent >= 70 ? "text-emerald-600" :
                      skillAnalysis.matchPercent >= 50 ? "text-orange-600" : "text-red-600"
                    )}>
                      {skillAnalysis.matchPercent}%
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lettre de motivation:</span>
                    <strong>{coverLetter ? "Personnalisée ✓" : "Non incluse"}</strong>
                  </div>
                  {hasJobQuizzes && (
                    <div className="flex justify-between">
                      <span>Tests techniques:</span>
                      <strong>
                        {quizCompletion.allCompleted 
                          ? `${quizCompletion.completedQuizzes.length}/${quizCompletion.totalQuizzes} complétés ✓`
                          : `${quizCompletion.completedQuizzes.length}/${quizCompletion.totalQuizzes} complétés`
                        }
                      </strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Portfolio:</span>
                    <strong>{portfolio?.url || portfolioUrl ? "Disponible ✓" : "Non disponible"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CV:</span>
                    <strong>{resumeUrl ? "Disponible ✓" : "Non disponible"}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation fixe */}
        <div className="flex-shrink-0 flex gap-3 pt-4 border-t border-emerald-100/50 dark:border-slate-700/50">
          {currentStep > 1 && !hasApplied && (
            <Button 
              variant="outline" 
              onClick={handlePreviousStep}
              className="flex-1 border-emerald-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
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
                "flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              )}
            >
              Continuer
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitApplication}
              disabled={applyMutation.isPending}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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