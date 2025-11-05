// hooks/use-application-mutations.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  saveApplication, 
  checkIfApplied, 
  getApplicationDetails,
  updateApplication,
  getUserSkills,
  getUserTestResults,
  analyzeSkillCompatibility,
  generateCoverLetter
} from "@/actions/application.action";
import { getUserPortfolioAndResume, checkJobQuizCompletion } from "@/actions/user-data.action";
import { getJobQuizzesByJobPosting } from "@/actions/jobInterview.action";
import { toast } from "sonner";

export function useApplicationMutations() {
  const queryClient = useQueryClient();

  // Mutation pour postuler à un job
  const applyMutation = useMutation({
    mutationFn: (data: { 
      jobId: string; 
      coverLetter?: string; 
      portfolioUrl?: string; 
      resumeUrl?: string; 
      score?: number;
    }) => saveApplication(data),
    onSuccess: (data, variables) => {
      toast.success("Candidature envoyée avec succès !");
      queryClient.invalidateQueries({ queryKey: ["applications", variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ["user-applications"] });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Erreur lors de l'envoi de la candidature";
      toast.error(errorMessage);
      console.error("Apply error:", error);
    },
  });

  // Mutation pour générer une lettre de motivation
  const generateCoverLetterMutation = useMutation({
    mutationFn: (jobId: string) => generateCoverLetter(jobId),
    onSuccess: () => {
      toast.success("Lettre de motivation générée avec l'IA");
    },
    onError: (error) => {
      toast.error("Erreur lors de la génération de la lettre");
      console.error("Cover letter generation error:", error);
    },
  });

  // Mutation pour mettre à jour une candidature
  const updateApplicationMutation = useMutation({
    mutationFn: ({ applicationId, data }: { 
      applicationId: string; 
      data: { coverLetter?: string; portfolioUrl?: string; resumeUrl?: string; score?: number } 
    }) => updateApplication(applicationId, data),
    onSuccess: () => {
      toast.success("Candidature mise à jour");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour");
      console.error("Update application error:", error);
    },
  });

  return {
    applyMutation,
    generateCoverLetterMutation,
    updateApplicationMutation,
  };
}

export function useApplicationQueries(jobId: string) {
  // Vérifier si l'utilisateur a déjà postulé
  const { data: hasApplied, isLoading: loadingApplied } = useQuery({
    queryKey: ["applications", jobId, "check"],
    queryFn: () => checkIfApplied(jobId),
    enabled: !!jobId,
  });

  // Obtenir les détails de la candidature existante
  const { data: applicationDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["applications", jobId, "details"],
    queryFn: () => getApplicationDetails(jobId),
    enabled: !!jobId && hasApplied,
  });

  // Obtenir les compétences de l'utilisateur
  const { data: userSkills, isLoading: loadingSkills } = useQuery({
    queryKey: ["user-skills"],
    queryFn: getUserSkills,
  });

  // Obtenir les résultats des tests
  const { data: testResults, isLoading: loadingTests } = useQuery({
    queryKey: ["user-test-results"],
    queryFn: getUserTestResults,
  });

  // Analyser la compatibilité des compétences
  const { data: skillAnalysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ["skill-analysis", jobId],
    queryFn: () => analyzeSkillCompatibility(jobId),
    enabled: !!jobId && !!userSkills,
  });

  // Récupérer le portfolio et CV de l'utilisateur
  const { data: portfolioData, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["user-portfolio-resume"],
    queryFn: getUserPortfolioAndResume,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Récupérer les quizzes liés au job
  const { data: jobQuizzesResponse, isLoading: loadingJobQuizzes } = useQuery({
    queryKey: ["job-quizzes", jobId],
    queryFn: () => getJobQuizzesByJobPosting(jobId),
    enabled: !!jobId,
    staleTime: 1000 * 30, // 30 secondes
    refetchInterval: 1000 * 10, // Refetch toutes les 10 secondes pour realtime
  });

  // Vérifier si tous les tests sont complétés
  const { data: quizCompletion, isLoading: loadingCompletion } = useQuery({
    queryKey: ["job-quiz-completion", jobId],
    queryFn: () => checkJobQuizCompletion(jobId),
    enabled: !!jobId && !!jobQuizzesResponse?.success && (jobQuizzesResponse?.data?.length || 0) > 0,
    staleTime: 1000 * 5, // 5 secondes - très fréquent pour realtime
    refetchInterval: 1000 * 5, // Refetch toutes les 5 secondes pour détecter la completion
  });

  return {
    hasApplied,
    applicationDetails,
    userSkills: userSkills || [],
    testResults: testResults || { validated: [], invalid: [] },
    skillAnalysis: skillAnalysis || { matchPercent: 0, matchedSkills: [], missingSkills: [] },
    portfolio: portfolioData?.portfolio || null,
    resumeUrl: portfolioData?.resumeUrl || null,
    portfolioUrl: portfolioData?.portfolioUrl || null,
    jobQuizzes: jobQuizzesResponse?.data || [],
    hasJobQuizzes: (jobQuizzesResponse?.data?.length || 0) > 0,
    quizCompletion: quizCompletion || {
      allCompleted: false,
      completedQuizzes: [],
      pendingQuizzes: [],
      totalQuizzes: 0
    },
    isLoading: loadingApplied || loadingDetails || loadingSkills || loadingTests || loadingAnalysis || loadingPortfolio || loadingJobQuizzes || loadingCompletion,
  };
}