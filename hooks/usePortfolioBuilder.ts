// hooks/usePortfolioBuilder.ts
"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { createOrUpdatePortfolio, getUserPortfolio, deletePortfolio } from '@/actions/portfolio.action'
import { PortfolioTemplate } from '@prisma/client'

// Interface alignée avec les types Prisma
interface PortfolioData {
  name?: string
  headline?: string | null
  bio?: string | null
  profileImage?: string | null
  template?: string
  theme?: string | null
  isPublic?: boolean
  skills?: string[]
  languages?: string[]
  interests?: string[]
  projects?: any[] | null
  experiences?: any[] | null
  education?: any[] | null
  certifications?: any[] | null
  sections?: string[]
}

// Interface pour les données transformées depuis Prisma
interface PortfolioFromPrisma {
  id?: string
  name?: string
  headline?: string | null
  bio?: string | null
  profileImage?: string | null
  template?: PortfolioTemplate
  theme?: string | null
  isPublic?: boolean
  skills?: string[]
  languages?: string[]
  interests?: string[]
  projects?: string[]
  experiences?: string[]
  education?: string[]
  certifications?: string[]
  sections?: string[]
}

interface UsePortfolioBuilderProps {
  userId?: string
  enabled?: boolean
}

interface ApiResponse {
  success: boolean
  portfolio?: any
  message?: string
  error?: string
}

export function usePortfolioBuilder({ userId, enabled = true }: UsePortfolioBuilderProps) {
  const queryClient = useQueryClient()

  const {
    data: portfolio,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['portfolio', userId],
    queryFn: async (): Promise<PortfolioFromPrisma> => {
      if (!userId) {
        throw new Error('User ID requis')
      }
      
      const portfolioData = await getUserPortfolio(userId)
      
      if (!portfolioData) {
        return {
          id: undefined,
          name: '',
          headline: null,
          bio: null,
          profileImage: null,
          template: PortfolioTemplate.CLASSIC,
          theme: 'blue',
          // CORRECTION : Utiliser la logique basée sur publishedAt
          isPublic: false,
          skills: [],
          languages: [],
          interests: [],
          projects: [],
          experiences: [],
          education: [],
          certifications: [],
          sections: []
        }
      }

      return {
        id: portfolioData.id,
        name: portfolioData.name || '',
        headline: portfolioData.headline,
        bio: portfolioData.bio,
        profileImage: portfolioData.profileImage,
        template: portfolioData.template,
        theme: portfolioData.theme,
        // CORRECTION : Utiliser la valeur calculée depuis publishedAt
        isPublic: portfolioData.isPublic,
        skills: portfolioData.skills,
        languages: portfolioData.languages,
        interests: portfolioData.interests,
        projects: portfolioData.projects,
        experiences: portfolioData.experiences,
        education: portfolioData.education,
        certifications: portfolioData.certifications,
        sections: portfolioData.sections
      }
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  // Mutation pour créer/mettre à jour le portfolio
  const savePortfolioMutation = useMutation({
    mutationFn: async (portfolioData: PortfolioData): Promise<ApiResponse> => {
      if (!userId) {
        throw new Error('User ID requis pour sauvegarder')
      }
      
      // Nettoyer les données avant envoi
      const cleanedData: PortfolioData = {
        ...portfolioData,
        headline: portfolioData.headline === '' ? null : portfolioData.headline,
        bio: portfolioData.bio === '' ? null : portfolioData.bio,
        profileImage: portfolioData.profileImage === '' ? null : portfolioData.profileImage,
        theme: portfolioData.theme === '' ? null : portfolioData.theme,
        projects: portfolioData.projects && portfolioData.projects.length === 0 ? null : portfolioData.projects,
        experiences: portfolioData.experiences && portfolioData.experiences.length === 0 ? null : portfolioData.experiences,
        education: portfolioData.education && portfolioData.education.length === 0 ? null : portfolioData.education,
        certifications: portfolioData.certifications && portfolioData.certifications.length === 0 ? null : portfolioData.certifications,
        sections: portfolioData.sections && portfolioData.sections.length === 0 ? undefined : portfolioData.sections,
      }

      return createOrUpdatePortfolio({ userId, portfolioData: cleanedData })
    },
    onMutate: async (portfolioData: PortfolioData) => {
      // Annulation des requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ['portfolio', userId] })

      // Sauvegarde de l'ancien état pour rollback si erreur
      const previousPortfolio = queryClient.getQueryData(['portfolio', userId])

      // Optimistic update
      queryClient.setQueryData(['portfolio', userId], (old: PortfolioFromPrisma) => ({
        ...old,
        ...portfolioData
      }))

      return { previousPortfolio }
    },
    onSuccess: (result: ApiResponse) => {
      if (result.success) {
        toast.success(result.message || 'Portfolio sauvegardé avec succès')
        
        // Invalidation et refetch pour s'assurer d'avoir les données fraîches
        queryClient.invalidateQueries({ queryKey: ['portfolio', userId] })
      } else {
        toast.error(result.error || 'Erreur lors de la sauvegarde')
      }
    },
    onError: (error: Error, portfolioData: PortfolioData, context: any) => {
      // Rollback en cas d'erreur
      if (context?.previousPortfolio) {
        queryClient.setQueryData(['portfolio', userId], context.previousPortfolio)
      }
      
      toast.error(error.message || 'Erreur lors de la sauvegarde du portfolio')
    },
  })

  // Mutation pour supprimer le portfolio
  const deletePortfolioMutation = useMutation({
    mutationFn: async (): Promise<ApiResponse> => {
      if (!userId) {
        throw new Error('User ID requis pour supprimer')
      }
      return deletePortfolio(userId)
    },
    onSuccess: (result: ApiResponse) => {
      if (result.success) {
        toast.success(result.message || 'Portfolio supprimé avec succès')
        
        // Suppression des données du cache
        queryClient.removeQueries({ queryKey: ['portfolio', userId] })
        
        // Invalidation des listes qui pourraient contenir ce portfolio
        queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression du portfolio')
    },
  })

  // Mutation pour dupliquer le portfolio
  const duplicatePortfolioMutation = useMutation({
    mutationFn: async (templateData?: Partial<PortfolioData>): Promise<ApiResponse> => {
      if (!userId) {
        throw new Error('User ID requis pour dupliquer')
      }

      const currentPortfolio = portfolio || {}
      const newPortfolioData: PortfolioData = {
        ...currentPortfolio,
        ...templateData,
        name: `${currentPortfolio.name || 'Portfolio'} (Copie)`,
      }

      return createOrUpdatePortfolio({ userId, portfolioData: newPortfolioData })
    },
    onSuccess: (result: ApiResponse) => {
      if (result.success) {
        toast.success('Portfolio dupliqué avec succès')
        queryClient.invalidateQueries({ queryKey: ['portfolio', userId] })
      } else {
        toast.error(result.error || 'Erreur lors de la duplication')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la duplication du portfolio')
    },
  })

  // Mutation pour publier/dépublier le portfolio
  const togglePublishMutation = useMutation({
    mutationFn: async (isPublic: boolean): Promise<ApiResponse> => {
      if (!userId) {
        throw new Error('User ID requis')
      }
      
      return createOrUpdatePortfolio({
        userId,
        portfolioData: {
          isPublic,
          ...portfolio
        } as PortfolioData
      })
    },
    onSuccess: (result: ApiResponse, isPublic: boolean) => {
      if (result.success) {
        toast.success(isPublic ? 'Portfolio publié avec succès' : 'Portfolio retiré de la publication')
        queryClient.invalidateQueries({ queryKey: ['portfolio', userId] })
      } else {
        toast.error(result.error || 'Erreur lors de la modification')
      }
    },
    onError: (error: Error, isPublic: boolean) => {
      toast.error(`Erreur lors de la ${isPublic ? 'publication' : 'dépublication'} du portfolio`)
    },
  })

  // Fonction pour sauvegarder avec gestion manuelle
  const savePortfolio = async (portfolioData: PortfolioData, options?: {
    onSuccess?: (data: ApiResponse) => void
    onError?: (error: Error) => void
    showToast?: boolean
  }): Promise<ApiResponse> => {
    const { onSuccess, onError, showToast = true } = options || {}

    try {
      const result = await savePortfolioMutation.mutateAsync(portfolioData)
      
      if (result.success && showToast) {
        toast.success('Portfolio sauvegardé avec succès')
      }
      
      onSuccess?.(result)
      return result
    } catch (error) {
      if (showToast) {
        toast.error('Erreur lors de la sauvegarde')
      }
      onError?.(error as Error)
      throw error
    }
  }

  // Hook utilitaire pour le debounce
  const useDebouncedCallback = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    const timeoutRef = useRef<NodeJS.Timeout>(null)

    return useCallback((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }, [callback, delay])
  }

  // Fonction pour sauvegarder automatiquement (débounced)
  const autoSavePortfolio = useDebouncedCallback((portfolioData: PortfolioData) => {
    if (userId && portfolioData) {
      savePortfolio(portfolioData, { showToast: false })
    }
  }, 2000) // 2 secondes de délai

  return {
    // Données
    portfolio: portfolio || {} as PortfolioFromPrisma,
    isLoading,
    isError,
    error,
    isFetching,
    
    // Mutations
    savePortfolio,
    autoSavePortfolio,
    deletePortfolio: deletePortfolioMutation.mutate,
    duplicatePortfolio: duplicatePortfolioMutation.mutate,
    togglePublish: togglePublishMutation.mutate,
    
    // États des mutations
    isSaving: savePortfolioMutation.isPending,
    isDeleting: deletePortfolioMutation.isPending,
    isDuplicating: duplicatePortfolioMutation.isPending,
    isTogglingPublish: togglePublishMutation.isPending,
    
    // Références aux mutations complètes pour un contrôle avancé
    saveMutation: savePortfolioMutation,
    deleteMutation: deletePortfolioMutation,
    duplicateMutation: duplicatePortfolioMutation,
    togglePublishMutation,
    
    // Utilitaires
    refetch,
    hasPortfolio: !!portfolio?.name,
    isPublished: portfolio?.isPublic || false,
  }
}