import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface MatchedCandidate {
  id: string
  matchScore: number
  skillsMatch: number
  domainMatch: number
  experienceMatch: number | null
  aiReason: string | null
  candidate: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    skills: string[]
    domains: string[]
    matchingJobs: number
    portfolio?: {
      id: string
      avatarUrl: string | null
      headline: string | null
      bio: string | null
      skills: string[]
    } | null
  }
}

interface MatchingResponse {
  success: boolean
  matches: MatchedCandidate[]
  total: number
  fromCache: boolean
  cachedAt?: string
}

/**
 * Hook TanStack Query pour récupérer les matchings depuis le cache
 * Les matchings sont pré-calculés par le script de background
 */
export function useMatchingQueries(jobPostingId: string | null) {
  const queryClient = useQueryClient()

  // Récupérer les matchings depuis le cache
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<MatchingResponse>({
    queryKey: ["matchings", jobPostingId],
    queryFn: async () => {
      if (!jobPostingId) {
        throw new Error("jobPostingId est requis")
      }

      const response = await fetch(`/api/matching/cache?jobPostingId=${jobPostingId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la récupération des matchings")
      }

      return response.json()
    },
    enabled: !!jobPostingId,
    // Configuration du cache
    staleTime: 1000 * 60 * 5, // 5 minutes - les matchings sont stables
    gcTime: 1000 * 60 * 30, // 30 minutes - garder en cache plus longtemps
    // Ne pas refetch automatiquement car les matchings sont pré-calculés
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  })

  // Mutation pour forcer le recalcul des matchings (si nécessaire)
  const regenerateMatchings = useMutation({
    mutationFn: async () => {
      if (!jobPostingId) {
        throw new Error("jobPostingId est requis")
      }

      const response = await fetch("/api/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la régénération des matchings")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalider le cache pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ["matchings", jobPostingId] })
    },
  })

  return {
    matchings: data?.matches || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    isFetching,
    fromCache: data?.fromCache ?? true,
    cachedAt: data?.cachedAt,
    regenerateMatchings: regenerateMatchings.mutate,
    isRegenerating: regenerateMatchings.isPending,
  }
}

