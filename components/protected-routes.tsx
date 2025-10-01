"use client"

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { usePathname, useRouter } from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getUserRoleAndDomains } from '@/actions/user.action'

interface ProtectedPageProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

interface ProtectedSectionProps {
  children: ReactNode
  fallback?: ReactNode
  showLoginPrompt?: boolean
}

// Hook personnalisé pour optimiser l'authentification
const useAuthStatus = () => {
  const { getUser } = useKindeBrowserClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      console.log('Vérification de l\'authentification...')
      
      // Attendre un peu que Kinde soit initialisé
      await new Promise(resolve => setTimeout(resolve, 100))
      
      try {
        // Récupérer directement l'utilisateur
        const currentUser = await getUser()
        console.log('Utilisateur récupéré:', currentUser ? 'Oui' : 'Non')
        
        if (isMounted) {
          setUser(currentUser)
          setIsAuthorized(!!currentUser)
          setIsLoading(false)
          console.log('État mis à jour - Autorisé:', !!currentUser, 'Loading:', false)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error)
        if (isMounted) {
          setIsAuthorized(false)
          setUser(null)
          setIsLoading(false)
          console.log('État mis à jour - Autorisé: false, Loading: false')
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [getUser])

  return { isLoading, isAuthorized, user }
}

const ProtectedPage = ({ children, fallback }: ProtectedPageProps) => {
  const { isLoading, isAuthorized } = useAuthStatus()
  const router = useRouter()

  useEffect(() => {
    // Attendre que le chargement soit terminé ET qu'on ne soit pas autorisé
    if (!isLoading && !isAuthorized) {
      console.log('Redirection vers la page principale...')
      // Ajouter un petit délai pour éviter les redirections trop rapides
      const timer = setTimeout(() => {
        router.push('/')
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isLoading, isAuthorized, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return fallback || null
  }

  return <>{children}</>
}

const ProtectedRoute = ({ children, redirectTo = '/' }: ProtectedRouteProps) => {
  const { isLoading, isAuthorized } = useAuthStatus()
  const router = useRouter()

  useEffect(() => {
    // Attendre que le chargement soit terminé ET qu'on ne soit pas autorisé
    if (!isLoading && !isAuthorized) {
      console.log('Redirection vers:', redirectTo)
      // Ajouter un petit délai pour éviter les redirections trop rapides
      const timer = setTimeout(() => {
        router.push(redirectTo)
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [isLoading, isAuthorized, router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

const ProtectedSection = ({ children, fallback, showLoginPrompt = true }: ProtectedSectionProps) => {
  const { isLoading, isAuthorized } = useAuthStatus()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (showLoginPrompt) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Connectez-vous pour voir cette section</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      )
    }
    
    return null
  }

  return <>{children}</>
}

export { ProtectedRoute, ProtectedSection }
export default ProtectedPage

// --------- RouteGuard basé sur les rôles ---------

type AppRole = 'CANDIDATE' | 'CAREER_CHANGER' | 'RECRUITER' | 'ENTERPRISE' | 'BOOTCAMP' | 'SCHOOL' | 'admin'

// Table simple de permissions par préfixe d'URL
const ROUTE_PERMISSIONS: Array<{ prefix: string; roles: AppRole[] }> = [
  // Routes publiques/communes
  { prefix: '/', roles: ['CANDIDATE','CAREER_CHANGER','RECRUITER','ENTERPRISE','BOOTCAMP','SCHOOL','admin'] },
  
  // CANDIDATE & CAREER_CHANGER
  { prefix: '/ai-interviews', roles: ['CANDIDATE','CAREER_CHANGER','admin'] },
  { prefix: '/assessment', roles: ['CANDIDATE','CAREER_CHANGER','admin'] },
  { prefix: '/learning', roles: ['CANDIDATE','CAREER_CHANGER','admin'] },
  { prefix: '/job-matching', roles: ['CANDIDATE','admin'] },
  { prefix: '/my-interviews', roles: ['CANDIDATE','CAREER_CHANGER','admin'] },
  
  // CAREER_CHANGER spécifique
  { prefix: '/transition', roles: ['CAREER_CHANGER','admin'] },
  { prefix: '/skills-bridge', roles: ['CAREER_CHANGER','admin'] },
  { prefix: '/reskilling', roles: ['CAREER_CHANGER','admin'] },
  
  // RECRUITER
  { prefix: '/recruiter', roles: ['RECRUITER','admin'] },
  { prefix: '/talent-marketplace', roles: ['RECRUITER','admin'] },
  { prefix: '/interview-planning', roles: ['RECRUITER','ENTERPRISE','admin'] },
  { prefix: '/job-postings', roles: ['RECRUITER','admin'] },
  { prefix: '/candidate-matching', roles: ['RECRUITER','admin'] },
  { prefix: '/hr-analytics', roles: ['RECRUITER','ENTERPRISE','admin'] },
  
  // ENTERPRISE
  { prefix: '/enterprise', roles: ['ENTERPRISE','admin'] },
  { prefix: '/enterprise-interviews', roles: ['ENTERPRISE','admin'] },
  { prefix: '/talent-matching', roles: ['ENTERPRISE','admin'] },
  { prefix: '/workforce-planning', roles: ['ENTERPRISE','admin'] },
  { prefix: '/bulk-hiring', roles: ['ENTERPRISE','admin'] },
  { prefix: '/training-programs', roles: ['ENTERPRISE','admin'] },
  
  // BOOTCAMP
  { prefix: '/bootcamp', roles: ['BOOTCAMP','admin'] },
  { prefix: '/student-management', roles: ['BOOTCAMP','admin'] },
  { prefix: '/curriculum', roles: ['BOOTCAMP','admin'] },
  { prefix: '/job-placement', roles: ['BOOTCAMP','admin'] },
  { prefix: '/enterprise-matching', roles: ['BOOTCAMP','admin'] },
  { prefix: '/performance-tracking', roles: ['BOOTCAMP','admin'] },
  
  // SCHOOL
  { prefix: '/school', roles: ['SCHOOL','admin'] },
  { prefix: '/pedagogical-space', roles: ['SCHOOL','admin'] },
  { prefix: '/session-planning', roles: ['SCHOOL','admin'] },
  { prefix: '/student-progress', roles: ['SCHOOL','admin'] },
  { prefix: '/teacher-tracking', roles: ['SCHOOL','admin'] },
  { prefix: '/career-services', roles: ['SCHOOL','BOOTCAMP','admin'] },
  
  // Routes communes
  { prefix: '/profile', roles: ['CANDIDATE','CAREER_CHANGER','RECRUITER','ENTERPRISE','BOOTCAMP','SCHOOL','admin'] },
  { prefix: '/settings', roles: ['CANDIDATE','CAREER_CHANGER','RECRUITER','ENTERPRISE','BOOTCAMP','SCHOOL','admin'] },
  { prefix: '/messages', roles: ['CANDIDATE','CAREER_CHANGER','RECRUITER','ENTERPRISE','BOOTCAMP','SCHOOL','admin'] },
  { prefix: '/notifications', roles: ['CANDIDATE','CAREER_CHANGER','admin'] },
  
  // Admin
  { prefix: '/admin', roles: ['admin'] },
]

function findRequiredRoles(pathname: string): AppRole[] | null {
  // Prend le match le plus spécifique (préfixe le plus long)
  const matches = ROUTE_PERMISSIONS
    .filter((r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/'))
    .sort((a, b) => b.prefix.length - a.prefix.length)
  return matches.length ? matches[0].roles : null
}

export function RouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient()

  // Calculer AVANT tous les hooks - toujours dans le même ordre
  const requiredRoles = findRequiredRoles(pathname)
  const shouldProtect = !!requiredRoles
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  // Hook useQuery TOUJOURS appelé (respect des règles des Hooks)
  const { data: userData, isLoading: roleLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      return await getUserRoleAndDomains(user.id)
    },
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    retry: 2,
  })

  // Effet pour la redirection - après tous les hooks
  useEffect(() => {
    // Si pas de protection requise, ne rien faire
    if (!shouldProtect) return

    // Si pas authentifié et route protégée
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/')
      return
    }

    // Si chargement terminé et pas les bonnes permissions
    if (isAuthenticated && !roleLoading && !isAdmin) {
      const currentRole = (userData?.role as AppRole | undefined) || 'CANDIDATE'
      const allowed = requiredRoles?.includes(currentRole) ?? false

      if (!allowed && typeof window !== 'undefined') {
        console.log(`Accès refusé pour ${currentRole} sur ${pathname}`)
        router.push('/')
      }
    }
  }, [shouldProtect, isAuthenticated, roleLoading, isAdmin, userData, requiredRoles, pathname, router])

  // Afficher un loader pendant init Kinde
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de la session...</p>
        </div>
      </div>
    )
  }

  // Si authentification requise pour cette route
  if (shouldProtect && !isAuthenticated) {
    return null
  }

  // Attendre le chargement du rôle pour les routes protégées (sauf admin)
  if (shouldProtect && isAuthenticated && !isAdmin && roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  // Vérification finale des permissions
  if (shouldProtect && isAuthenticated) {
    if (isAdmin) {
      return <>{children}</>
    }

    const currentRole = (userData?.role as AppRole | undefined) || 'CANDIDATE'
    const allowed = requiredRoles?.includes(currentRole) ?? false

    if (!allowed) {
      return null
    }
  }

  return <>{children}</>
}