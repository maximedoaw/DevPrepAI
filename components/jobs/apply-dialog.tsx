// apply-stepper-dialog.tsx
import { JobPosting } from "@/types/job";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Zap, User, Briefcase, FileCheck, Rocket, Wand2, Brain } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface ApplyStepperDialogProps {
  job: JobPosting | null;
  open: boolean;
  onClose: () => void;
}

interface ApplicationData {
  userId: string;
  jobId: string;
  coverLetter: string;
  portfolioUrl: string;
  resumeUrl: string;
  status: "applied";
  score: number;
  reportUrl: string;
}

const steps = [
  { id: 1, name: "Profil", icon: User, description: "Vérification de votre profil" },
  { id: 2, name: "CV & Motivation", icon: Briefcase, description: "Optimisation des documents" },
  { id: 3, name: "Pré-screening", icon: FileCheck, description: "Validation automatique" },
  { id: 4, name: "Candidature", icon: Rocket, description: "Envoi final" },
];

export const ApplyDialog = ({ job, open, onClose }: ApplyStepperDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizingCV, setIsOptimizingCV] = useState(false);
  const [isOptimizingLetter, setIsOptimizingLetter] = useState(false);
  const [applicationData, setApplicationData] = useState<Partial<ApplicationData>>({
    coverLetter: "",
    portfolioUrl: "",
    resumeUrl: "",
    status: "applied",
    score: 0,
  });

  // Données simulées pour les interviews
  const [validatedInterviews] = useState([
    { id: 1, name: "Entretien technique", score: 85, validated: true },
    { id: 2, name: "Test de compétences", score: 92, validated: true },
  ]);

  const [invalidInterviews] = useState([
    { id: 3, name: "Quiz culture d'entreprise", score: 45, validated: false },
  ]);

  // Simulation des compétences du CV utilisateur
  const [userCVSkills] = useState([
    "React", "TypeScript", "Node.js", "Python", "MongoDB", "AWS"
  ]);

  // Calcul du matching des compétences
  const calculateSkillMatch = () => {
    if (!job) return 0;
    const matchedSkills = userCVSkills.filter(skill => 
      job.skills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    return Math.round((matchedSkills.length / job.skills.length) * 100);
  };

  const skillMatchPercent = calculateSkillMatch();

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOptimizeCV = async () => {
    setIsOptimizingCV(true);
    
    // Simulation de l'optimisation IA du CV
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    toast("CV optimisé avec l'IA", {
      description: "Votre CV a été renforcé avec les mots-clés du poste"
    });
    setIsOptimizingCV(false);
  };

  const handleOptimizeCoverLetter = async () => {
    if (!job) return;
    
    setIsOptimizingLetter(true);
    
    // Simulation de la génération IA de lettre de motivation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const optimizedLetter = `Madame, Monsieur,

Je me permets de vous soumettre ma candidature pour le poste de ${job.title} au sein de ${job.companyName}.

Fort(e) de mon expérience en ${job.skills.slice(0, 3).join(', ')} et de ma passion pour ${job.domains[0] || "votre secteur d'activité"}, je suis convaincu(e) que mon profil correspond parfaitement à vos attentes.

Mes compétences en ${job.skills.slice(0, 2).join(' et ')} me permettront de contribuer efficacement à vos projets. J'ai particulièrement été attiré(e) par ${job.domains.length > 1 ? `vos domaines d'expertise en ${job.domains.join(', ')}` : "votre approche innovante"}.

Je suis impatient(e) de pouvoir discuter de la manière dont mon expertise pourrait bénéficier à ${job.companyName} et contribuer à votre succès.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`;

    setApplicationData(prev => ({
      ...prev,
      coverLetter: optimizedLetter
    }));

    toast("Lettre de motivation générée", {
      description: "Votre lettre a été optimisée avec l'IA"
    });
    setIsOptimizingLetter(false);
  };

  const handleSubmitApplication = async () => {
    if (!job) return;
    
    setIsSubmitting(true);
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalData: ApplicationData = {
      userId: "user-123",
      jobId: job.id,
      coverLetter: applicationData.coverLetter || "",
      portfolioUrl: "https://portfolio.plateforme.com/user-123",
      resumeUrl: "https://resume.plateforme.com/user-123",
      status: "applied",
      score: calculateFinalScore(),
      reportUrl: "https://reports.plateforme.com/application-123",
    };
    
    console.log("Données de candidature:", finalData);
    
    setIsSubmitting(false);
    toast("Candidature soumise avec succès", { 
      description: "Votre candidature a été envoyée et le pré-screening est en cours" 
    });
    
    setTimeout(() => {
      onClose();
      setCurrentStep(1);
      setApplicationData({
        coverLetter: "",
        portfolioUrl: "",
        resumeUrl: "",
        status: "applied",
        score: 0,
      });
    }, 1500);
  };

  const calculateFinalScore = () => {
    const validScores = validatedInterviews.map(i => i.score);
    const average = validScores.reduce((a, b) => a + b, 0) / validScores.length;
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
            <Zap className="h-5 w-5 text-yellow-500" />
            Candidature - {job.title}
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            {job.companyName} • Postulez en quelques étapes
          </DialogDescription>
        </DialogHeader>

        {/* Stepper fixe */}
        <div className="flex-shrink-0 mb-6 px-1">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                  currentStep > step.id 
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === step.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500"
                )}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium transition-colors text-center",
                  currentStep >= step.id 
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
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Votre profil est complet et prêt pour la candidature.
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
                      {skillMatchPercent >= 70 ? "Excellent matching !" : 
                       skillMatchPercent >= 50 ? "Bon matching" : 
                       "Matching à améliorer"}
                    </p>
                  </div>
                  <Badge className={cn(
                    "text-lg px-3 py-1",
                    skillMatchPercent >= 70 ? "bg-green-500" :
                    skillMatchPercent >= 50 ? "bg-orange-500" : "bg-red-500"
                  )}>
                    {skillMatchPercent}%
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Compétences correspondantes:</span>
                    <span className="font-medium">
                      {userCVSkills.filter(skill => 
                        job.skills.some(jobSkill => 
                          jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
                          skill.toLowerCase().includes(jobSkill.toLowerCase())
                        )
                      ).length} / {job.skills.length}
                    </span>
                  </div>
                  
                  {skillMatchPercent < 70 && (
                    <Button 
                      onClick={handleOptimizeCV}
                      disabled={isOptimizingCV}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-0"
                    >
                      {isOptimizingCV ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Optimisation en cours...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Optimiser le CV avec l'IA
                        </>
                      )}
                    </Button>
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
                  <Button 
                    onClick={handleOptimizeCoverLetter}
                    disabled={isOptimizingLetter}
                    size="sm"
                    variant="outline"
                    className="border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400"
                  >
                    {isOptimizingLetter ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3 mr-1" />
                        Générer avec IA
                      </>
                    )}
                  </Button>
                </div>

                <Textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                  placeholder="Rédigez votre lettre de motivation ou utilisez l'IA pour en générer une optimisée..."
                  className="min-h-[250px] resize-none border-2 border-blue-200/70 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg text-sm leading-relaxed"
                />
                
                {!applicationData.coverLetter && (
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
                    {validatedInterviews.map(interview => (
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
                {invalidInterviews.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2">Tests à repasser</h4>
                    <div className="space-y-2">
                      {invalidInterviews.map(interview => (
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
                <Rocket className="h-5 w-5 text-blue-500" />
                Confirmation de candidature
              </h3>
              
              <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/60 dark:to-emerald-950/60 p-6 rounded-xl border border-green-200/50 dark:border-green-800/50 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Prêt à postuler !</h4>
                <p className="text-muted-foreground mb-4">
                  Votre candidature pour <strong>{job.title}</strong> chez <strong>{job.companyName}</strong> est prête à être envoyée.
                </p>
                
                <div className="space-y-2 text-sm text-left bg-white/50 dark:bg-slate-800/30 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Score de matching:</span>
                    <strong>{calculateFinalScore()}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Compatibilité CV:</span>
                    <strong className={cn(
                      skillMatchPercent >= 70 ? "text-green-600" :
                      skillMatchPercent >= 50 ? "text-orange-600" : "text-red-600"
                    )}>
                      {skillMatchPercent}%
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CV optimisé:</span>
                    <strong>{skillMatchPercent >= 70 ? "Excellent ✓" : "Optimisé ✓"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lettre de motivation:</span>
                    <strong>{applicationData.coverLetter ? "Personnalisée ✓" : "Non incluse"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tests techniques:</span>
                    <strong>{validatedInterviews.length}/{validatedInterviews.length + invalidInterviews.length} validés</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation fixe */}
        <div className="flex-shrink-0 flex gap-3 pt-4 border-t border-blue-100/50 dark:border-slate-700/50">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={handlePreviousStep}
              className="flex-1 border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              Précédent
            </Button>
          )}
          
          {currentStep < steps.length ? (
            <Button 
              onClick={handleNextStep}
              className={cn(
                "flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300",
                currentStep === 1 ? "flex-1" : "flex-1"
              )}
            >
              Continuer
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitApplication}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
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