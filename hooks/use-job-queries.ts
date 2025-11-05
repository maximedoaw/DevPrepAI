// hooks/use-job-queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  getJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob, 
  seedJobs,
  getJobStats,
  getJobFilters,
  type JobFilters, 
  getJobsByUser,
  // Nouvelles fonctions pour les JobQuiz
  getJobQuizById,
  getJobQuizzesByJobId,
  createJobQuiz,
  submitJobQuiz,
  getUserJobQuizResult,
  getUserJobQuizResults,
  getJobQuizStats,
  type JobQuizSubmission,
  getApplicationStats,
  getAllApplications,
  getJobApplications
} from "@/actions/job.action"
import { toast } from "sonner"
import { Domain, JobType, WorkMode, QuizType, Difficulty } from "@prisma/client"
import { redis } from "@/lib/upstash/redis"

// Interface pour les filtres de job
interface JobFiltersWithDefaults extends JobFilters {
  domains?: Domain[]
  skills?: string[]
  locations?: string[]
  experienceLevels?: string[]
  search?: string
  jobTypes?: string[]
  workModes?: string[]
}

// Clés de cache Redis
const CACHE_KEYS = {
  JOBS: (filters: JobFilters = {}) => `jobs:${JSON.stringify(filters)}`,
  JOB_DETAILS: (id: string) => `job:${id}`,
  JOB_STATS: 'job:stats',
  JOB_FILTERS: 'job:filters',
  JOB_QUIZ: (id: string) => `job-quiz:${id}`,
  JOB_QUIZZES: (jobId: string) => `job-quizzes:${jobId}`,
  USER_QUIZ_RESULTS: (userId: string) => `user-quiz-results:${userId}`,
  QUIZ_RESULT: (userId: string, quizId: string) => `quiz-result:${userId}:${quizId}`,
  QUIZ_STATS: (quizId: string) => `quiz-stats:${quizId}`,
  SEARCH_SUGGESTIONS: 'search:suggestions'
} as const

// Durées de cache en secondes
const CACHE_TTL = {
  JOBS_LIST: 2 * 60, // 2 minutes (réduit pour plus de fraîcheur)
  JOB_DETAILS: 5 * 60, // 5 minutes
  JOB_STATS: 10 * 60, // 10 minutes
  JOB_FILTERS: 30 * 60, // 30 minutes
  JOB_QUIZ: 10 * 60, // 10 minutes
  JOB_QUIZZES: 5 * 60, // 5 minutes
  USER_QUIZ_RESULTS: 2 * 60, // 2 minutes
  QUIZ_RESULT: 5 * 60, // 5 minutes
  QUIZ_STATS: 2 * 60, // 2 minutes
  SEARCH_SUGGESTIONS: 60 * 60 // 1 heure
} as const

// Configuration realtime améliorée
const REALTIME_CONFIG = {
  // Polling plus fréquent pour les données critiques
  POLLING_INTERVAL: {
    JOBS_LIST: 1000 * 15, // 15 secondes
    JOB_DETAILS: 1000 * 10, // 10 secondes
    USER_JOBS: 1000 * 10, // 10 secondes
    QUIZ_RESULTS: 1000 * 5, // 5 secondes (très fréquent pour les résultats)
    QUIZ_STATS: 1000 * 10, // 10 secondes
  },
  // Recharger quand la fenêtre redevient active
  REFETCH_ON_WINDOW_FOCUS: true,
  // Recharger quand la connexion revient
  REFETCH_ON_RECONNECT: true,
  // Temps avant que les données soient considérées comme périmées (réduit)
  STALE_TIME: {
    JOBS: 1000 * 30, // 30 secondes
    QUIZ_RESULTS: 1000 * 10, // 10 secondes
    QUIZ_STATS: 1000 * 15, // 15 secondes
  },
  // Temps avant que les données soient supprimées du cache
  GC_TIME: 1000 * 60 * 5, // 5 minutes
} as const

// Service de cache Redis avec invalidation intelligente
const cacheService = {
  // Récupérer depuis le cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached as string) : null
    } catch (error) {
      console.warn('Cache get error:', error)
      return null
    }
  },

  // Stocker dans le cache
  async set(key: string, data: any, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(data))
      } else {
        await redis.set(key, JSON.stringify(data))
      }
    } catch (error) {
      console.warn('Cache set error:', error)
    }
  },

  // Invalider le cache
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.log('Cache invalidation error:', error)
    }
  },

  // Invalider plusieurs patterns
  async invalidateMultiple(patterns: string[]): Promise<void> {
    await Promise.all(patterns.map(pattern => this.invalidate(pattern)))
  }
}

// Fonctions de données avec cache pour les JobQuiz
const cachedDataFetchers = {
  
  // Récupérer les jobs avec cache
  async getJobsWithCache(filters?: JobFilters) {
    const safeFilters: JobFilters = filters || {}
    const cacheKey = CACHE_KEYS.JOBS(safeFilters)
    
    const cached = await cacheService.get<any[]>(cacheKey)
    if (cached) {
      console.log('📦 Jobs served from cache')
      return cached
    }

    console.log('🔄 Jobs fetched from database')
    const jobs = await getJobs(safeFilters)
    
    await cacheService.set(cacheKey, jobs, CACHE_TTL.JOBS_LIST)
    
    return jobs
  },

  // Récupérer un job spécifique avec cache
  async getJobByIdWithCache(id: string) {
    const cacheKey = CACHE_KEYS.JOB_DETAILS(id)
    
    const cached = await cacheService.get<any>(cacheKey)
    if (cached) {
      console.log('📦 Job details served from cache')
      return cached
    }

    console.log('🔄 Job details fetched from database')
    const job = await getJobById(id)
    
    if (job) {
      await cacheService.set(cacheKey, job, CACHE_TTL.JOB_DETAILS)
    }
    
    return job
  },

  // Récupérer les stats avec cache
  async getJobStatsWithCache() {
    const cacheKey = CACHE_KEYS.JOB_STATS
    
    const cached = await cacheService.get<any>(cacheKey)
    if (cached) {
      console.log('📦 Stats served from cache')
      return cached
    }

    console.log('🔄 Stats fetched from database')
    const stats = await getJobStats()
    
    await cacheService.set(cacheKey, stats, CACHE_TTL.JOB_STATS)
    
    return stats
  },

  // Récupérer les filtres avec cache
  async getJobFiltersWithCache() {
    const cacheKey = CACHE_KEYS.JOB_FILTERS
    
    const cached = await cacheService.get<any>(cacheKey)
    if (cached) {
      console.log('📦 Filters served from cache')
      return cached
    }

    console.log('🔄 Filters fetched from database')
    const filters = await getJobFilters()
    
    await cacheService.set(cacheKey, filters, CACHE_TTL.JOB_FILTERS)
    
    return filters
  },

  // Récupérer les jobs d'un utilisateur avec cache
  async getJobsByUserWithCache(userId: string) {
    const cacheKey = `jobs:user:${userId}`
    
    const cached = await cacheService.get<any[]>(cacheKey)
    if (cached) {
      console.log('📦 User jobs served from cache')
      return cached
    }

    console.log('🔄 User jobs fetched from database')
    const jobs = await getJobsByUser(userId)
    
    await cacheService.set(cacheKey, jobs, CACHE_TTL.JOBS_LIST)
    
    return jobs
  },

  // NOUVEAU: Récupérer un quiz par ID avec cache
  async getJobQuizByIdWithCache(id: string) {
    const cacheKey = CACHE_KEYS.JOB_QUIZ(id)
    
    const cached = await cacheService.get<any>(cacheKey)
    if (cached) {
      console.log('📦 Job quiz served from cache')
      return cached
    }

    console.log('🔄 Job quiz fetched from database')
    const quiz = await getJobQuizById(id)
    
    if (quiz) {
      await cacheService.set(cacheKey, quiz, CACHE_TTL.JOB_QUIZ)
    }
    
    return quiz
  },

  // NOUVEAU: Récupérer les quizzes d'un job avec cache
async getJobQuizzesByJobIdWithCache(jobId: string) {
  const cacheKey = CACHE_KEYS.JOB_QUIZZES(jobId)
  
  const cached = await cacheService.get<any[]>(cacheKey)
  if (cached) {
    console.log('📦 Job quizzes served from cache')
    return cached
  }

  console.log('🔄 Job quizzes fetched from database')
  const quizzes = await getJobQuizzesByJobId(jobId)
  
  // S'assurer que nous retournons toujours un tableau
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : []
  
  await cacheService.set(cacheKey, safeQuizzes, CACHE_TTL.JOB_QUIZZES)
  
  return safeQuizzes
},

  // NOUVEAU: Récupérer les résultats d'un utilisateur avec cache
  async getUserJobQuizResultsWithCache(userId: string) {
    const cacheKey = CACHE_KEYS.USER_QUIZ_RESULTS(userId)
    
    const cached = await cacheService.get<any[]>(cacheKey)
    if (cached) {
      console.log('📦 User quiz results served from cache')
      return cached
    }

    console.log('🔄 User quiz results fetched from database')
    const results = await getUserJobQuizResults(userId)
    
    await cacheService.set(cacheKey, results, CACHE_TTL.USER_QUIZ_RESULTS)
    
    return results
  },

  // NOUVEAU: Récupérer un résultat spécifique avec cache
  async getUserJobQuizResultWithCache(userId: string, jobQuizId: string) {
    const cacheKey = CACHE_KEYS.QUIZ_RESULT(userId, jobQuizId)
    
    const cached = await cacheService.get<any>(cacheKey)
    if (cached) {
      console.log('📦 Quiz result served from cache')
      return cached
    }

    console.log('🔄 Quiz result fetched from database')
    const result = await getUserJobQuizResult(userId, jobQuizId)
    
    if (result) {
      await cacheService.set(cacheKey, result, CACHE_TTL.QUIZ_RESULT)
    }
    
    return result
  },

  // NOUVEAU: Récupérer les statistiques d'un quiz avec cache
  async getJobQuizStatsWithCache(jobQuizId: string) {
    const cacheKey = CACHE_KEYS.QUIZ_STATS(jobQuizId)
    
    const cached = await cacheService.get<any>(cacheKey)
    if (cached) {
      console.log('📦 Quiz stats served from cache')
      return cached
    }

    console.log('🔄 Quiz stats fetched from database')
    const stats = await getJobQuizStats(jobQuizId)
    
    await cacheService.set(cacheKey, stats, CACHE_TTL.QUIZ_STATS)
    
    return stats
  },
  async getApplicationStatsWithCache() {
  const cacheKey = 'application:stats'
  
  const cached = await cacheService.get<any>(cacheKey)
  if (cached) {
    console.log('📦 Application stats served from cache')
    return cached
  }

  console.log('🔄 Application stats fetched from database')
  const stats = await getApplicationStats()
  
  await cacheService.set(cacheKey, stats, CACHE_TTL.JOB_STATS)
  
  return stats
},

// Récupérer les applications avec cache
async getApplicationsWithCache(filters?: { search?: string; status?: string; jobId?: string }) {
  const cacheKey = `applications:${JSON.stringify(filters || {})}`
  
  const cached = await cacheService.get<any[]>(cacheKey)
  if (cached) {
    console.log('📦 Applications served from cache')
    return cached
  }

  console.log('🔄 Applications fetched from database')
  const applications = await getAllApplications(filters)
  
  await cacheService.set(cacheKey, applications, CACHE_TTL.JOBS_LIST)
  
  return applications
},

// Récupérer les applications d'un job avec cache
async getJobApplicationsWithCache(jobId: string) {
  const cacheKey = `job-applications:${jobId}`
  
  const cached = await cacheService.get<any[]>(cacheKey)
  if (cached) {
    console.log('📦 Job applications served from cache')
    return cached
  }

  console.log('🔄 Job applications fetched from database')
  const applications = await getJobApplications(jobId)
  
  await cacheService.set(cacheKey, applications, CACHE_TTL.JOBS_LIST)
  
  return applications
}
}

// Hook pour les mutations avec realtime amélioré
export function useJobMutations() {
  const queryClient = useQueryClient()

  // Fonction d'invalidation intelligente pour toutes les données
  const invalidateAllCaches = async (options?: { immediate?: boolean }) => {
    const patterns = [
      'jobs:*',
      'job:*',
      'job:stats',
      'job:filters',
      'job-quiz:*',
      'job-quizzes:*',
      'user-quiz-results:*',
      'quiz-result:*',
      'quiz-stats:*'
    ]

    await cacheService.invalidateMultiple(patterns)
    
    // Invalider aussi le cache de React Query
    queryClient.invalidateQueries({ queryKey: ["jobs"] })
    queryClient.invalidateQueries({ queryKey: ["job"] })
    queryClient.invalidateQueries({ queryKey: ["job-stats"] })
    queryClient.invalidateQueries({ queryKey: ["job-filters"] })
    queryClient.invalidateQueries({ queryKey: ["user-jobs"] })
    queryClient.invalidateQueries({ queryKey: ["job-quiz"] })
    queryClient.invalidateQueries({ queryKey: ["job-quizzes"] })
    queryClient.invalidateQueries({ queryKey: ["quiz-results"] })
    queryClient.invalidateQueries({ queryKey: ["quiz-stats"] })

    // Forcer un rechargement immédiat si demandé
    if (options?.immediate) {
      queryClient.refetchQueries()
    }
  }

  // Mutation pour créer un job
  const createJobMutation = useMutation({
    mutationFn: createJob,
    onMutate: async (newJob) => {
      await queryClient.cancelQueries({ queryKey: ["user-jobs"] })
      
      const previousJobs = queryClient.getQueryData(["user-jobs", newJob.userId])
      
      // Optimistic update
      queryClient.setQueryData(["user-jobs", newJob.userId], (old: any[]) => 
        old ? [...old, { ...newJob, id: 'temp-id', isOptimistic: true }] : [newJob]
      )
      
      return { previousJobs }
    },
    onSuccess: async (createdJob, variables) => {
      toast.success("Poste créé avec succès")
      
      // Mise à jour optimiste
      queryClient.setQueryData(["user-jobs", variables.userId], (old: any[]) =>
        old ? old.map(job => 
          job.isOptimistic ? createdJob : job
        ) : [createdJob]
      )
      
      await invalidateAllCaches({ immediate: true })
    },
    onError: (error, variables, context) => {
      toast.error("Erreur lors de la création du poste")
      console.error("Create poste error:", error)
      
      if (context?.previousJobs) {
        queryClient.setQueryData(["user-jobs", variables.userId], context.previousJobs)
      }
    }
  })

  // Mutation pour mettre à jour un job
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateJob(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["user-jobs"] })
      
      const previousJobs = queryClient.getQueryData(["user-jobs"])
      
      // Optimistic update
      queryClient.setQueryData(["user-jobs"], (old: any[]) =>
        old ? old.map(job => 
          job.id === id ? { ...job, ...data, isOptimistic: true } : job
        ) : old
      )
      
      return { previousJobs }
    },
    onSuccess: async (updatedJob, variables) => {
      toast.success("Poste mis à jour avec succès")
      
      queryClient.setQueryData(["user-jobs"], (old: any[]) =>
        old ? old.map(job => 
          job.id === variables.id ? updatedJob : job
        ) : old
      )
      
      await cacheService.invalidate(CACHE_KEYS.JOB_DETAILS(variables.id))
      await invalidateAllCaches({ immediate: true })
    },
    onError: (error, variables, context) => {
      toast.error("Erreur lors de la mise à jour du job")
      console.error("Update job error:", error)
      
      if (context?.previousJobs) {
        queryClient.setQueryData(["user-jobs"], context.previousJobs)
      }
    }
  })

  // Mutation pour supprimer un job
  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: ["user-jobs"] })
      
      const previousJobs = queryClient.getQueryData(["user-jobs"])
      
      // Optimistic update
      queryClient.setQueryData(["user-jobs"], (old: any[]) =>
        old ? old.filter(job => job.id !== jobId) : old
      )
      
      return { previousJobs }
    },
    onSuccess: async (_, jobId) => {
      toast.success("Job supprimé avec succès")
      
      await cacheService.invalidate(CACHE_KEYS.JOB_DETAILS(jobId as string))
      await invalidateAllCaches({ immediate: true })
    },
    onError: (error, jobId, context) => {
      toast.error("Erreur lors de la suppression du job")
      console.error("Delete job error:", error)
      
      if (context?.previousJobs) {
        queryClient.setQueryData(["user-jobs"], context.previousJobs)
      }
    }
  })

  // NOUVEAU: Mutation pour créer un quiz
  const createJobQuizMutation = useMutation({
    mutationFn: createJobQuiz,
    onSuccess: async (createdQuiz, variables) => {
      toast.success("Quiz créé avec succès")
      
      // Invalider les caches concernés
      await cacheService.invalidate(CACHE_KEYS.JOB_QUIZZES(variables.jobPostingId))
      await cacheService.invalidate(CACHE_KEYS.JOB_DETAILS(variables.jobPostingId))
      
      queryClient.invalidateQueries({ queryKey: ["job-quizzes", variables.jobPostingId] })
      queryClient.invalidateQueries({ queryKey: ["job", variables.jobPostingId] })
    },
    onError: (error) => {
      toast.error("Erreur lors de la création du quiz")
      console.error("Create quiz error:", error)
    }
  })

  // NOUVEAU: Mutation pour soumettre un quiz (CRITIQUE pour le realtime)
  const submitJobQuizMutation = useMutation({
    mutationFn: submitJobQuiz,
    onMutate: async (submission) => {
      await queryClient.cancelQueries({ queryKey: ["quiz-results", submission.userId] })
      
      const previousResults = queryClient.getQueryData(["quiz-results", submission.userId])
      
      // Optimistic update immédiat
      const optimisticResult = {
        ...submission,
        id: 'temp-result',
        completedAt: new Date(),
        isOptimistic: true
      }
      
      queryClient.setQueryData(["quiz-results", submission.userId], (old: any[]) =>
        old ? [optimisticResult, ...old] : [optimisticResult]
      )
      
      return { previousResults }
    },
    onSuccess: async (result, variables) => {
      toast.success("Quiz soumis avec succès")
      
      // Remplacer le résultat optimiste par le vrai résultat
      queryClient.setQueryData(["quiz-results", variables.userId], (old: any[]) =>
        old ? old.map(item => 
          item.isOptimistic ? result : item
        ) : [result]
      )
      
      // Invalidation IMMÉDIATE pour realtime
      await cacheService.invalidateMultiple([
        CACHE_KEYS.USER_QUIZ_RESULTS(variables.userId),
        CACHE_KEYS.QUIZ_RESULT(variables.userId, variables.jobQuizId),
        CACHE_KEYS.QUIZ_STATS(variables.jobQuizId),
        CACHE_KEYS.JOB_QUIZ(variables.jobQuizId)
      ])
      
      // Rechargement immédiat des données affectées
      queryClient.refetchQueries({ queryKey: ["quiz-stats", variables.jobQuizId] })
      queryClient.refetchQueries({ queryKey: ["job-quiz", variables.jobQuizId] })
    },
    onError: (error, variables, context) => {
      toast.error("Erreur lors de la soumission du quiz")
      console.error("Submit quiz error:", error)
      
      if (context?.previousResults) {
        queryClient.setQueryData(["quiz-results", variables.userId], context.previousResults)
      }
    }
  })

  // Mutation pour peupler la base
  const seedJobsMutation = useMutation({
    mutationFn: seedJobs,
    onSuccess: async (data) => {
      toast.success(`${data.count} jobs créés avec succès`)
      await invalidateAllCaches({ immediate: true })
    },
    onError: (error) => {
      toast.error("Erreur lors du peuplement de la base")
      console.error("Seed jobs error:", error)
    }
  })

  return {
    createJobMutation,
    updateJobMutation,
    deleteJobMutation,
    createJobQuizMutation,
    submitJobQuizMutation,
    seedJobsMutation
  }
}

// Hook pour les requêtes de jobs avec realtime amélioré
export function useJobQueries(filters?: JobFilters) {
  const { 
    data: jobs, 
    isLoading: loadingJobs, 
    error: jobsError,
    refetch: refetchJobs,
    isFetching: isFetchingJobs
  } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => cachedDataFetchers.getJobsWithCache(filters),
    
    // CONFIGURATION REALTIME AMÉLIORÉE
    refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.JOBS_LIST,
    refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
    refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
    staleTime: REALTIME_CONFIG.STALE_TIME.JOBS,
    gcTime: REALTIME_CONFIG.GC_TIME,
  })

  const { 
    data: jobStats, 
    isLoading: loadingStats,
    isFetching: isFetchingStats
  } = useQuery({
    queryKey: ["job-stats"],
    queryFn: cachedDataFetchers.getJobStatsWithCache,
    
    refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.JOBS_LIST,
    refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
    refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
    staleTime: REALTIME_CONFIG.STALE_TIME.JOBS,
    gcTime: REALTIME_CONFIG.GC_TIME,
  })

  const { 
    data: jobFilters, 
    isLoading: loadingFilters 
  } = useQuery({
    queryKey: ["job-filters"],
    queryFn: cachedDataFetchers.getJobFiltersWithCache,
    staleTime: 1000 * 60 * 10,
  })

  return {
    jobs: jobs || [],
    jobStats,
    jobFilters: jobFilters || { 
      domains: [], 
      skills: [], 
      locations: [], 
      experienceLevels: [] 
    },
    loadingJobs,
    loadingStats,
    loadingFilters,
    jobsError,
    refetchJobs,
    isFetchingJobs,
    isFetchingStats
  }
}

// Hook pour une requête de job spécifique avec realtime
export function useJobQuery(id: string) {
  const { 
    data: job, 
    isLoading: loadingJob, 
    error: jobError,
    refetch: refetchJob,
    isFetching: isFetchingJob
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => cachedDataFetchers.getJobByIdWithCache(id),
    enabled: !!id,
    
    // CONFIGURATION REALTIME FRÉQUENTE
    refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.JOB_DETAILS,
    refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
    refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
    staleTime: REALTIME_CONFIG.STALE_TIME.JOBS,
    gcTime: REALTIME_CONFIG.GC_TIME,
  })

  return {
    job,
    loadingJob,
    jobError,
    refetchJob,
    isFetchingJob
  }
}

// NOUVEAU: Hook pour les JobQuiz avec realtime
export function useJobQuizQueries() {
  // Récupérer un quiz spécifique
  const useJobQuiz = (id: string) => {
    return useQuery({
      queryKey: ["job-quiz", id],
      queryFn: () => cachedDataFetchers.getJobQuizByIdWithCache(id),
      enabled: !!id,
      
      // Realtime très fréquent pour les quizzes
      refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.QUIZ_RESULTS,
      refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
      staleTime: REALTIME_CONFIG.STALE_TIME.QUIZ_RESULTS,
      gcTime: REALTIME_CONFIG.GC_TIME,
    })
  }

  // Récupérer les quizzes d'un job
  const useJobQuizzes = (jobId: string) => {
    return useQuery({
      queryKey: ["job-quizzes", jobId],
      queryFn: () => cachedDataFetchers.getJobQuizzesByJobIdWithCache(jobId),
      enabled: !!jobId,
      
      refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.JOBS_LIST,
      refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
      staleTime: REALTIME_CONFIG.STALE_TIME.JOBS,
      gcTime: REALTIME_CONFIG.GC_TIME,
    })
  }

  // Récupérer les résultats d'un utilisateur
  const useUserQuizResults = (userId: string) => {
    return useQuery({
      queryKey: ["quiz-results", userId],
      queryFn: () => cachedDataFetchers.getUserJobQuizResultsWithCache(userId),
      enabled: !!userId,
      
      // Realtime très fréquent pour les résultats
      refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.QUIZ_RESULTS,
      refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
      staleTime: REALTIME_CONFIG.STALE_TIME.QUIZ_RESULTS,
      gcTime: REALTIME_CONFIG.GC_TIME,
    })
  }

  // Récupérer un résultat spécifique
  const useUserQuizResult = (userId: string, jobQuizId: string) => {
    return useQuery({
      queryKey: ["quiz-result", userId, jobQuizId],
      queryFn: () => cachedDataFetchers.getUserJobQuizResultWithCache(userId, jobQuizId),
      enabled: !!userId && !!jobQuizId,
      
      refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.QUIZ_RESULTS,
      refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
      staleTime: REALTIME_CONFIG.STALE_TIME.QUIZ_RESULTS,
      gcTime: REALTIME_CONFIG.GC_TIME,
    })
  }

  // Récupérer les statistiques d'un quiz
  const useQuizStats = (jobQuizId: string) => {
    return useQuery({
      queryKey: ["quiz-stats", jobQuizId],
      queryFn: () => cachedDataFetchers.getJobQuizStatsWithCache(jobQuizId),
      enabled: !!jobQuizId,
      
      // Realtime fréquent pour les stats
      refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.QUIZ_STATS,
      refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
      staleTime: REALTIME_CONFIG.STALE_TIME.QUIZ_STATS,
      gcTime: REALTIME_CONFIG.GC_TIME,
    })
  }

  return {
    useJobQuiz,
    useJobQuizzes,
    useUserQuizResults,
    useUserQuizResult,
    useQuizStats
  }
}

// Hook pour les jobs de l'utilisateur avec realtime amélioré
export function useUserJobQueries(userId?: string) {
  // Fonction de retry avec 3 tentatives à intervalle de 15 secondes
  const fetchWithRetry = async (retryCount = 0): Promise<any[]> => {
    if (!userId) return Promise.resolve([]);
    
    try {
      const result = await cachedDataFetchers.getJobsByUserWithCache(userId);
      
      // Vérifier si le résultat est valide (tableau non vide ou tableau vide mais pas d'erreur)
      if (Array.isArray(result)) {
        return result;
      }
      
      // Si le résultat n'est pas un tableau valide et qu'on a encore des tentatives
      if (retryCount < 3) {
        console.warn(`Tentative ${retryCount + 1} échouée pour récupérer les jobs. Nouvelle tentative dans 15 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 15000)); // Attendre 15 secondes
        return fetchWithRetry(retryCount + 1);
      }
      
      // Si toutes les tentatives ont échoué, retourner un tableau vide
      console.error("Impossible de récupérer les jobs après 3 tentatives");
      return [];
    } catch (error) {
      // Si une erreur se produit et qu'on a encore des tentatives
      if (retryCount < 3) {
        console.warn(`Erreur lors de la récupération des jobs (tentative ${retryCount + 1}/3):`, error);
        await new Promise(resolve => setTimeout(resolve, 15000)); // Attendre 15 secondes
        return fetchWithRetry(retryCount + 1);
      }
      
      // Si toutes les tentatives ont échoué, logger l'erreur et retourner un tableau vide
      console.error("Erreur lors de la récupération des jobs après 3 tentatives:", error);
      return [];
    }
  };

  const { 
    data: jobs, 
    isLoading: loadingJobs, 
    error: jobsError,
    refetch: refetchJobs,
    isFetching: isFetchingJobs
  } = useQuery({
    queryKey: ["user-jobs", userId],
    queryFn: () => fetchWithRetry(0),
    enabled: !!userId,
    
    // Configuration de retry pour React Query (tentatives automatiques)
    retry: 3, // 3 tentatives automatiques
    retryDelay: (attemptIndex) => Math.min(15000 * (attemptIndex + 1), 45000), // Délai progressif jusqu'à 45 secondes
    
    // CONFIGURATION REALTIME FRÉQUENTE
    refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.USER_JOBS,
    refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
    refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
    staleTime: REALTIME_CONFIG.STALE_TIME.JOBS,
    gcTime: REALTIME_CONFIG.GC_TIME,
    
    // Vérifier que les données sont valides
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn("Les données récupérées ne sont pas un tableau:", data);
        return [];
      }
      return data;
    }
  })

  return {
    jobs: jobs || [],
    loadingJobs,
    jobsError,
    refetchJobs,
    isFetchingJobs
  }
}

// Hook pour les types et enumérations
export function useJobEnums() {
  const jobTypes = Object.values(JobType)
  const workModes = Object.values(WorkMode)
  const quizTypes = Object.values(QuizType)
  const difficulties = Object.values(Difficulty)
  const experienceLevels = ["JUNIOR", "MID", "SENIOR"]

  return {
    jobTypes,
    workModes,
    quizTypes,
    difficulties,
    experienceLevels
  }
}

// Hook utilitaire pour le statut realtime amélioré
export function useRealtimeStatus() {
  const queryClient = useQueryClient()
  
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const isFetching = queryClient.isFetching() > 0
  const fetchingQueries = queryClient.isFetching()
  
  return {
    isOnline,
    isFetching,
    fetchingQueries,
    lastUpdated: new Date().toISOString(),
    // Indicateur de fraîcheur des données
    dataFreshness: isFetching ? 'updating' : isOnline ? 'fresh' : 'cached'
  }
}

// Hook pour forcer une synchronisation immédiate
export function useForceRefresh() {
  const queryClient = useQueryClient()
  
  const forceRefresh = async () => {
    await cacheService.invalidateMultiple(['jobs:*', 'job:*', 'job-quiz:*', 'quiz-*'])
    queryClient.refetchQueries()
    toast.info("Données actualisées")
  }
  
  return { forceRefresh }
}

export function useApplicationQueries() {
  // Récupérer les statistiques d'applications
  const useApplicationStats = () => {
    return useQuery({
      queryKey: ["application-stats"],
      queryFn: cachedDataFetchers.getApplicationStatsWithCache,
      
      refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.JOBS_LIST,
      refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
      staleTime: REALTIME_CONFIG.STALE_TIME.JOBS,
      gcTime: REALTIME_CONFIG.GC_TIME,
    })
  }

  // Récupérer les applications avec filtres
  const useApplications = (filters?: { search?: string; status?: string; jobId?: string }) => {
    return useQuery({
      queryKey: ["applications", filters],
      queryFn: () => cachedDataFetchers.getApplicationsWithCache(filters),
      
      refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.JOBS_LIST,
      refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
      staleTime: REALTIME_CONFIG.STALE_TIME.JOBS,
      gcTime: REALTIME_CONFIG.GC_TIME,
    })
  }

  // Récupérer les applications d'un job spécifique
  const useJobApplications = (jobId: string) => {
    return useQuery({
      queryKey: ["job-applications", jobId],
      queryFn: () => cachedDataFetchers.getJobApplicationsWithCache(jobId),
      enabled: !!jobId,
      
      refetchInterval: REALTIME_CONFIG.POLLING_INTERVAL.JOBS_LIST,
      refetchOnWindowFocus: REALTIME_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: REALTIME_CONFIG.REFETCH_ON_RECONNECT,
      staleTime: REALTIME_CONFIG.STALE_TIME.JOBS,
      gcTime: REALTIME_CONFIG.GC_TIME,
    })
  }

  return {
    useApplicationStats,
    useApplications,
    useJobApplications
  }
}