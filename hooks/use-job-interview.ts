import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { 
  createJobQuiz, 
  updateJobQuiz, 
  deleteJobQuiz, 
  getJobQuizzesByJobPosting, 
  getJobQuizById, 
  getJobQuizzesByUser,
  createJobQuizResult,
  getJobQuizResults,
  getUserJobQuizResults,
  getJobQuizStats,
  duplicateJobQuiz,
  type CreateJobQuizInput,
  type UpdateJobQuizInput,
  type CreateJobQuizResultInput
} from "@/actions/jobInterview.action"
import { toast } from "sonner"

// Clés de requête pour TanStack Query
export const jobInterviewKeys = {
  all: ['job-interview'] as const,
  lists: () => [...jobInterviewKeys.all, 'list'] as const,
  list: (filters: any) => [...jobInterviewKeys.lists(), filters] as const,
  details: () => [...jobInterviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobInterviewKeys.details(), id] as const,
  results: (quizId: string) => [...jobInterviewKeys.detail(quizId), 'results'] as const,
  stats: (quizId: string) => [...jobInterviewKeys.detail(quizId), 'stats'] as const,
  userResults: (userId: string, quizId: string) => [...jobInterviewKeys.detail(quizId), 'user-results', userId] as const,
}

/**
 * Hook pour récupérer tous les JobQuizzes d'un job posting
 * Utilise le cache de TanStack Query pour des performances optimales
 */
export function useJobQuizzesByJobPosting(jobPostingId: string) {
  const query = useQuery({
    queryKey: jobInterviewKeys.list({ jobPostingId, type: 'job-posting' }),
    queryFn: () => getJobQuizzesByJobPosting(jobPostingId),
    enabled: !!jobPostingId, // Ne s'exécute que si jobPostingId est défini
    staleTime: 1000 * 60 * 5, // Les données sont considérées comme fraîches pendant 5 minutes
    gcTime: 1000 * 60 * 30, // Garde les données en cache pendant 30 minutes
    notifyOnChangeProps: "tracked",
  })

  const stableData = useMemo(() => query.data, [query.data])
  return { ...query, data: stableData }
}

/**
 * Hook pour récupérer un JobQuiz spécifique par son ID
 * Parfait pour les pages de détail des quizzes
 */
export function useJobQuiz(id: string) {
  return useQuery({
    queryKey: jobInterviewKeys.detail(id),
    queryFn: () => getJobQuizById(id),
    enabled: !!id, // Ne s'exécute que si l'ID est défini
    staleTime: 1000 * 60 * 10, // Données fraîches pendant 10 minutes pour les détails
    notifyOnChangeProps: "tracked",
  })
}

/**
 * Hook pour récupérer tous les JobQuizzes d'un utilisateur
 * Idéal pour les tableaux de bord entreprise
 */
export function useUserJobQuizzes(userId: string) {
  return useQuery({
    queryKey: jobInterviewKeys.list({ userId, type: 'user' }),
    queryFn: () => getJobQuizzesByUser(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // Rafraîchissement plus fréquent pour les listes utilisateur
    notifyOnChangeProps: "tracked",
  })
}

/**
 * Hook pour récupérer les résultats d'un JobQuiz spécifique
 * Utilisé pour afficher les performances des candidats
 */
export function useJobQuizResults(jobQuizId: string) {
  return useQuery({
    queryKey: jobInterviewKeys.results(jobQuizId),
    queryFn: () => getJobQuizResults(jobQuizId),
    enabled: !!jobQuizId,
    staleTime: 1000 * 60 * 2, // Résultats mis à jour fréquemment
    notifyOnChangeProps: "tracked",
  })
}

/**
 * Hook pour récupérer les résultats d'un utilisateur spécifique pour un quiz
 * Parfait pour les pages de profil candidat
 */
export function useUserJobQuizResults(userId: string, jobQuizId: string) {
  return useQuery({
    queryKey: jobInterviewKeys.userResults(userId, jobQuizId),
    queryFn: () => getUserJobQuizResults(userId, jobQuizId),
    enabled: !!userId && !!jobQuizId,
    notifyOnChangeProps: "tracked",
  })
}

/**
 * Hook pour récupérer les statistiques d'un JobQuiz
 * Affichage des métriques de performance globales
 */
export function useJobQuizStats(jobQuizId: string) {
  return useQuery({
    queryKey: jobInterviewKeys.stats(jobQuizId),
    queryFn: () => getJobQuizStats(jobQuizId),
    enabled: !!jobQuizId,
    staleTime: 1000 * 60 * 5, // Statistiques mises à jour toutes les 5 minutes
    notifyOnChangeProps: "tracked",
  })
}

/**
 * Hook pour les mutations des JobQuizzes
 * Gère la création, mise à jour, suppression avec optimisation du cache
 */
export function useJobInterviewMutations() {
  const queryClient = useQueryClient()

  /**
   * Mutation pour créer un nouveau JobQuiz
   * Invalide automatiquement les caches concernés après succès
   */
  const createJobQuizMutation = useMutation({
    mutationFn: createJobQuiz,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        
        // Invalider les caches concernés pour forcer le rafraîchissement
        queryClient.invalidateQueries({ 
          queryKey: jobInterviewKeys.lists() 
        })
        
        // Si on connaît le jobPostingId, on invalide aussi sa liste spécifique
        if (result.data?.jobPostingId) {
          queryClient.invalidateQueries({
            queryKey: jobInterviewKeys.list({ 
              jobPostingId: result.data.jobPostingId, 
              type: 'job-posting' 
            })
          })
        }
      } else {
        toast.error(result.message)
      }
    },
    onError: (error) => {
      toast.error("Erreur lors de la création du quiz")
      console.error("Create job quiz error:", error)
    }
  })

  /**
   * Mutation pour mettre à jour un JobQuiz existant
   * Met à jour le cache optimistiquement pour une UX fluide
   */
  const updateJobQuizMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobQuizInput }) => 
      updateJobQuiz(id, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        
        // Invalider toutes les listes et le détail spécifique
        queryClient.invalidateQueries({ queryKey: jobInterviewKeys.lists() })
        if (result.data) {
          queryClient.invalidateQueries({ 
            queryKey: jobInterviewKeys.detail(result.data.id) 
          })
        }
      } else {
        toast.error(result.message)
      }
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du quiz")
      console.error("Update job quiz error:", error)
    }
  })

  /**
   * Mutation pour supprimer un JobQuiz
   * Suppression optimiste pour une UX réactive
   */
  const deleteJobQuizMutation = useMutation({
    mutationFn: deleteJobQuiz,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        
        // Invalider toutes les listes
        queryClient.invalidateQueries({ queryKey: jobInterviewKeys.lists() })
      } else {
        toast.error(result.message)
      }
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du quiz")
      console.error("Delete job quiz error:", error)
    }
  })

  /**
   * Mutation pour créer un résultat de JobQuiz
   * Met à jour les caches de résultats et statistiques
   */
  const createJobQuizResultMutation = useMutation({
    mutationFn: createJobQuizResult,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        
        // Invalider les caches de résultats et statistiques
        if (result.data) {
          queryClient.invalidateQueries({
            queryKey: jobInterviewKeys.results(result.data.jobQuizId)
          })
          queryClient.invalidateQueries({
            queryKey: jobInterviewKeys.stats(result.data.jobQuizId)
          })
        }
      } else {
        toast.error(result.message)
      }
    },
    onError: (error) => {
      toast.error("Erreur lors de l'enregistrement du résultat")
      console.error("Create job quiz result error:", error)
    }
  })

  /**
   * Mutation pour dupliquer un JobQuiz
   * Crée une copie avec invalidation des caches
   */
  const duplicateJobQuizMutation = useMutation({
    mutationFn: ({ id, newJobPostingId }: { id: string; newJobPostingId?: string }) =>
      duplicateJobQuiz(id, newJobPostingId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        
        // Invalider toutes les listes
        queryClient.invalidateQueries({ queryKey: jobInterviewKeys.lists() })
      } else {
        toast.error(result.message)
      }
    },
    onError: (error) => {
      toast.error("Erreur lors de la duplication du quiz")
      console.error("Duplicate job quiz error:", error)
    }
  })

  return {
    createJobQuiz: createJobQuizMutation,
    updateJobQuiz: updateJobQuizMutation,
    deleteJobQuiz: deleteJobQuizMutation,
    createJobQuizResult: createJobQuizResultMutation,
    duplicateJobQuiz: duplicateJobQuizMutation,
    
    // États combinés pour faciliter le loading global
    isCreating: createJobQuizMutation.isPending,
    isUpdating: updateJobQuizMutation.isPending,
    isDeleting: deleteJobQuizMutation.isPending,
    isCreatingResult: createJobQuizResultMutation.isPending,
    isDuplicating: duplicateJobQuizMutation.isPending,
  }
}

/**
 * Hook combiné pour une utilisation simplifiée
 * Fournit à la fois les queries et les mutations
 */
export function useJobInterview(jobPostingId?: string) {
  const queries = useJobQuizzesByJobPosting(jobPostingId || "")
  const mutations = useJobInterviewMutations()

  return {
    // Données des queries
    quizzes: queries.data?.data || [],
    isLoading: queries.isLoading,
    isError: queries.isError,
    error: queries.error,
    refetch: queries.refetch,
    
    // Mutations
    ...mutations,
    
    // États combinés
    isAnyLoading: queries.isLoading || 
                  mutations.isCreating || 
                  mutations.isUpdating || 
                  mutations.isDeleting,
  }
}

/**
 * Hook spécialisé pour la gestion des résultats de quiz
 * Combine résultats, statistiques et mutations
 */
export function useJobQuizManagement(quizId: string) {
  const quizQuery = useJobQuiz(quizId)
  const resultsQuery = useJobQuizResults(quizId)
  const statsQuery = useJobQuizStats(quizId)
  const mutations = useJobInterviewMutations()

  return {
    // Données du quiz
    quiz: quizQuery.data?.data,
    isLoadingQuiz: quizQuery.isLoading,
    
    // Données des résultats
    results: resultsQuery.data?.data || [],
    isLoadingResults: resultsQuery.isLoading,
    
    // Statistiques
    stats: statsQuery.data?.data,
    isLoadingStats: statsQuery.isLoading,
    
    // Mutations
    ...mutations,
    
    // États combinés
    isAnyLoading: quizQuery.isLoading || 
                  resultsQuery.isLoading || 
                  statsQuery.isLoading ||
                  mutations.isCreatingResult,
  }
}