"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, Sparkles } from "lucide-react"
import { DashboardHeader } from "./dashboard-header"
import { StatCard } from "./stat-card"
import { CandidateDashboard } from "./candidate-dashboard"
import { CareerChangerDashboard } from "./career-changer-dashboard"
import { SchoolDashboard } from "./school-dashboard"
import { EnterpriseDashboard } from "./enterprise-dashboard"
import { RecruiterDashboard } from "./recruiter-dashboard"
import { BootcampDashboard } from "./bootcamp-dashboard"
import { Flame, Zap, Briefcase } from "lucide-react"
import type { UserRole } from "@/types/dashboard"

interface DashboardRouterProps {
  userId: string
  getDashboardData: (userId: string) => Promise<any>
  getDailyMissions: (userId: string) => Promise<any>
  getUserAchievements: (userId: string) => Promise<any>
  clearUserCache: (userId: string) => Promise<void>
}

export function DashboardRouter({
  userId,
  getDashboardData,
  getDailyMissions,
  getUserAchievements,
  clearUserCache,
}: DashboardRouterProps) {
  const queryClient = useQueryClient()

  // Fetch dashboard data
  const dashboard = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () => getDashboardData(userId),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Fetch missions
  const missions = useQuery({
    queryKey: ["missions", userId],
    queryFn: () => getDailyMissions(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Fetch achievements
  const achievements = useQuery({
    queryKey: ["achievements", userId],
    queryFn: () => getUserAchievements(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Refresh mutation
  const refreshData = useMutation({
    mutationFn: async () => {
      await clearUserCache(userId)
      return await getDashboardData(userId)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["dashboard", userId], data)
      queryClient.invalidateQueries({ queryKey: ["missions", userId] })
      queryClient.invalidateQueries({ queryKey: ["achievements", userId] })
    },
  })

  const isLoading = useMemo(() => dashboard.isLoading && !dashboard.data, [dashboard.isLoading, dashboard.data])

  const isError = useMemo(
    () => dashboard.isError || missions.isError || achievements.isError,
    [dashboard.isError, missions.isError, achievements.isError],
  )

  const data = dashboard.data

  // Render loading skeleton
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Render error state
  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Données indisponibles</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Nous rencontrons un problème pour charger vos données.
          </p>
          <Button
            onClick={() => refreshData.mutate()}
            disabled={refreshData.isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshData.isPending ? "animate-spin" : ""}`} />
            {refreshData.isPending ? "Rechargement..." : "Réessayer"}
          </Button>
        </div>
      </div>
    )
  }

  // Extract user data and stats from the dashboard response
  const { user, stats, recentQuizzes, skills, progress, recommendations } = data

  // Use the user data from dashboard response
  const userData = user
  const userRole = userData?.role as UserRole
  const levelProgress = Math.min((stats?.averageScore / 100) * 100, 100)

  // Render header stats based on role
  const renderHeaderStats = () => {
    if (!userData || !stats) return null

    const commonStats = (
      <>
        <StatCard
          icon={Flame}
          label="Engagement"
          value={`${stats.streak} Jours`}
          gradient="bg-emerald-500"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Zap}
          label="Crédits"
          value={userData.credits}
          gradient="bg-teal-500"
          iconColor="text-teal-600 dark:text-teal-400"
        />
      </>
    )

    if (userRole === "CANDIDATE" || userRole === "CAREER_CHANGER") {
      return (
        <>
          {commonStats}
          <StatCard
            icon={Briefcase}
            label="Opportunités"
            value={userData.matchingJobs}
            gradient="bg-green-500"
            iconColor="text-green-600 dark:text-green-400"
          />
        </>
      )
    }

    return commonStats
  }

  // Render appropriate dashboard based on role
  const renderDashboard = () => {
    if (!userData || !stats) return null

    const dashboardProps = {
      data: {
        user: userData,
        stats,
        recentQuizzes: recentQuizzes || [],
        skills: skills || [],
        progress: progress || [],
        recommendations: recommendations || []
      },
      missions: missions.data || [],
      achievements: achievements.data || [],
      isLoadingMissions: missions.isLoading,
      isLoadingAchievements: achievements.isLoading,
    }

    switch (userRole) {
      case "CANDIDATE":
        return <CandidateDashboard {...dashboardProps} />
      case "CAREER_CHANGER":
        return <CareerChangerDashboard {...dashboardProps} />
      case "SCHOOL":
        return <SchoolDashboard {...dashboardProps} />
      case "ENTERPRISE":
        return <EnterpriseDashboard {...dashboardProps} />
      case "RECRUITER":
        return <RecruiterDashboard {...dashboardProps} />
      case "BOOTCAMP":
        return <BootcampDashboard {...dashboardProps} />
      default:
        return <CandidateDashboard {...dashboardProps} />
    }
  }

  const getSubtitle = () => {
    if (!userData || !stats) return "Tableau de bord"

    if (userRole === "CANDIDATE" || userRole === "CAREER_CHANGER") {
      return userData.matchingJobs > 0
        ? `${userData.matchingJobs} opportunités correspondent à votre profil`
        : "Développez vos compétences pour accéder à de nouvelles opportunités"
    }
    return `Tableau de bord ${userRole?.toLowerCase() || "utilisateur"}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardHeader
        firstName={userData?.firstName || "Utilisateur"}
        lastName={userData?.lastName || ""}
        subtitle={getSubtitle()}
        level={stats?.level || 1}
        progress={levelProgress}
        progressLabel={`Moyenne : ${stats?.averageScore?.toFixed(1) || 0}%`}
        stats={renderHeaderStats()}
        onRefresh={() => refreshData.mutate()}
        isRefreshing={refreshData.isPending}
        userRole={userRole}
        imageUrl={userData?.imageUrl}
      />
      {renderDashboard()}
    </div>
  )
}

// Dashboard Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header Skeleton */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-24 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}