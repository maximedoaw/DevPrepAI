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
    onError: (error) => {
      toast.error("Erreur lors de l'envoi de la candidature");
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

  return {
    hasApplied,
    applicationDetails,
    userSkills: userSkills || [],
    testResults: testResults || { validated: [], invalid: [] },
    skillAnalysis: skillAnalysis || { matchPercent: 0, matchedSkills: [], missingSkills: [] },
    isLoading: loadingApplied || loadingDetails || loadingSkills || loadingTests || loadingAnalysis,
  };
}