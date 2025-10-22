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
  type JobFilters 
} from "@/actions/job.action"
import { toast } from "sonner"
import { Domain, JobType, WorkMode } from "@prisma/client"
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
  SEARCH_SUGGESTIONS: 'search:suggestions'
} as const

// Durées de cache en secondes
const CACHE_TTL = {
  JOBS_LIST: 5 * 60, // 5 minutes
  JOB_DETAILS: 10 * 60, // 10 minutes
  JOB_STATS: 15 * 60, // 15 minutes
  JOB_FILTERS: 30 * 60, // 30 minutes
  SEARCH_SUGGESTIONS: 60 * 60 // 1 heure
} as const

// Service de cache Redis
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
  }
}

// Fonctions de données avec cache
const cachedDataFetchers = {
  // Récupérer les jobs avec cache
  async getJobsWithCache(filters?: JobFilters) {
    const safeFilters: JobFilters = filters || {}
    const cacheKey = CACHE_KEYS.JOBS(safeFilters)
    
    // Essayer le cache d'abord
    const cached = await cacheService.get<any[]>(cacheKey)
    if (cached) {
      console.log('📦 Jobs served from cache')
      return cached
    }

    // Sinon, fetch depuis la base
    console.log('🔄 Jobs fetched from database')
    const jobs = await getJobs(safeFilters)
    
    // Mettre en cache
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
 //     console.log('📦 Stats served from cache')
      return cached
    }

//    console.log('🔄 Stats fetched from database')
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
  }
}

export function useJobMutations() {
  const queryClient = useQueryClient()

  // Fonction d'invalidation intelligente
  const invalidateJobCaches = async () => {
    await Promise.all([
      cacheService.invalidate('jobs:*'),
      cacheService.invalidate('job:*'),
      cacheService.invalidate('job:stats'),
      cacheService.invalidate('job:filters')
    ])
    
    // Invalider aussi le cache de React Query
    queryClient.invalidateQueries({ queryKey: ["jobs"] })
    queryClient.invalidateQueries({ queryKey: ["job"] })
    queryClient.invalidateQueries({ queryKey: ["job-stats"] })
    queryClient.invalidateQueries({ queryKey: ["job-filters"] })
  }

  // Mutation pour créer un job
  const createJobMutation = useMutation({
    mutationFn: createJob,
    onSuccess: async () => {
      toast.success("Poste créé avec succès")
      await invalidateJobCaches()
    },
    onError: (error) => {
      toast.error("Erreur lors de la création du poste")
      console.error("Create job error:", error)
    }
  })

  // Mutation pour mettre à jour un job
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateJob(id, data),
    onSuccess: async (_, variables) => {
      toast.success("Job mis à jour avec succès")
      
      // Invalider le cache spécifique à ce job
      await cacheService.invalidate(CACHE_KEYS.JOB_DETAILS(variables.id))
      await invalidateJobCaches()
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du job")
      console.error("Update job error:", error)
    }
  })

  // Mutation pour supprimer un job
  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: async (_, jobId) => {
      toast.success("Job supprimé avec succès")
      
      // Invalider le cache spécifique à ce job
      await cacheService.invalidate(CACHE_KEYS.JOB_DETAILS(jobId as string))
      await invalidateJobCaches()
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du job")
      console.error("Delete job error:", error)
    }
  })

  // Mutation pour peupler la base
  const seedJobsMutation = useMutation({
    mutationFn: seedJobs,
    onSuccess: async (data) => {
      toast.success(`${data.count} jobs créés avec succès`)
      await invalidateJobCaches()
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
    seedJobsMutation
  }
}

export function useJobQueries(filters?: JobFilters) {
  // Récupérer tous les jobs avec cache
  const { 
    data: jobs, 
    isLoading: loadingJobs, 
    error: jobsError,
    refetch: refetchJobs 
  } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => cachedDataFetchers.getJobsWithCache(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes (plus agressif car cache Redis)
  })

  // Récupérer les statistiques avec cache
  const { data: jobStats, isLoading: loadingStats } = useQuery({
    queryKey: ["job-stats"],
    queryFn: cachedDataFetchers.getJobStatsWithCache,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Récupérer les filtres avec cache
  const { data: jobFilters, isLoading: loadingFilters } = useQuery({
    queryKey: ["job-filters"],
    queryFn: cachedDataFetchers.getJobFiltersWithCache,
    staleTime: 1000 * 60 * 10, // 10 minutes
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
    refetchJobs
  }
}

export function useJobQuery(id: string) {
  // Récupérer un job spécifique avec cache
  const { 
    data: job, 
    isLoading: loadingJob, 
    error: jobError,
    refetch: refetchJob 
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => cachedDataFetchers.getJobByIdWithCache(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    job,
    loadingJob,
    jobError,
    refetchJob
  }
}

// Hook pour les types et enumérations
export function useJobEnums() {
  const jobTypes = Object.values(JobType)
  const workModes = Object.values(WorkMode)
  const experienceLevels = ["Junior", "Mid-level", "Senior", "Lead", "Principal"]

  return {
    jobTypes,
    workModes,
    experienceLevels
  }
}

// Hook supplémentaire pour les métriques de performance
export function useCacheMetrics() {
  const trackCacheHit = async (key: string) => {
    await redis.zincrby('cache:hits', 1, key)
  }

  const trackCacheMiss = async (key: string) => {
    await redis.zincrby('cache:misses', 1, key)
  }

  const getCachePerformance = async () => {
    // Correction: Utiliser la syntaxe correcte pour ZRANGE avec WITHSCORES
    const hits = await redis.zrange('cache:hits', 0, -1, { withScores: true })
    const misses = await redis.zrange('cache:misses', 0, -1, { withScores: true })
    
    return { hits, misses }
  }

  return {
    trackCacheHit,
    trackCacheMiss,
    getCachePerformance
  }
}