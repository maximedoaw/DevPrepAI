"use client"

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useQuery } from "@tanstack/react-query"
import { 
  getUserDashboardData, 
  getDailyMissions, 
  getUserAchievements, 
  clearUserCache,
  getFullUserData 
} from "@/actions/user.action"
import { DashboardRouter } from "./dashboard/dashboard-router"

export default function HomePage() {
  const { user: kindeUser, isLoading: isKindeLoading } = useKindeBrowserClient()

  // Fetch user data from your database using TanStack Query
  const { data: userData, isLoading: isUserLoading, error } = useQuery({
    queryKey: ["user", kindeUser?.id],
    queryFn: () => getFullUserData(kindeUser!.id),
    enabled: !!kindeUser?.id, // Only fetch when we have a user ID
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const isLoading = isKindeLoading || (!!kindeUser?.id && isUserLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!kindeUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Bienvenue</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Veuillez vous connecter pour accéder au dashboard</p>
        </div>
      </div>
    )
  }

  // If we have Kinde user but failed to load our user data
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Erreur</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Impossible de charger les données utilisateur. Veuillez réessayer.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardRouter
      userId={userData.id}
      getDashboardData={getUserDashboardData}
      getDailyMissions={getDailyMissions}
      getUserAchievements={getUserAchievements}
      clearUserCache={clearUserCache}
    />
  )
}