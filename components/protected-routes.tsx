"use client"

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { useRouter } from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

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
      console.log('🔍 Vérification de l\'authentification...')
      
      // Attendre un peu que Kinde soit initialisé
      await new Promise(resolve => setTimeout(resolve, 100))
      
      try {
        // Récupérer directement l'utilisateur
        const currentUser = await getUser()
        console.log('👤 Utilisateur récupéré:', currentUser ? 'Oui' : 'Non')
        
        if (isMounted) {
          setUser(currentUser)
          setIsAuthorized(!!currentUser)
          setIsLoading(false)
          console.log('✅ État mis à jour - Authorisé:', !!currentUser, 'Loading:', false)
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification d\'authentification:', error)
        if (isMounted) {
          setIsAuthorized(false)
          setUser(null)
          setIsLoading(false)
          console.log('❌ État mis à jour - Authorisé: false, Loading: false')
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
      console.log('🔄 Redirection vers la page principale...')
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
      console.log('🔄 Redirection vers:', redirectTo)
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