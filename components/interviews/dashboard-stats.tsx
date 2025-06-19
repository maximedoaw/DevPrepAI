"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, TrendingUp, Clock, Zap, Calendar } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUserStats } from "@/actions/interview.action"

// Composant Skeleton pour les statistiques du dashboard
function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {[...Array(5)].map((_, index) => (
        <Card
          key={index}
          className="border-0 shadow-xl bg-white/80 backdrop-blur-sm animate-pulse"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-28 bg-gray-300" />
                <Skeleton className="h-8 w-20 bg-gray-400" />
                <Skeleton className="h-4 w-16 bg-gray-300" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl bg-gray-400" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  })

  if (isLoading) {
    return <DashboardStatsSkeleton />
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card
            key={index}
            className="border-0 shadow-xl bg-white/80 backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Erreur</p>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                  <p className="text-sm text-red-600 font-medium mt-1">Données indisponibles</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const statCards = [
    {
      title: "Interviews Complétées",
      value: stats.totalInterviews,
      icon: Trophy,
      gradient: "from-blue-500 to-cyan-500",
      change: stats.totalInterviews > 0 ? "+" + stats.totalInterviews : "0",
      changeColor: "text-blue-600"
    },
    {
      title: "Score Moyen",
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      change: stats.averageScore > 0 ? `${stats.averageScore}%` : "0%",
      changeColor: "text-green-600"
    },
    {
      title: "Moyenne 7 jours",
      value: `${stats.weeklyAverage}%`,
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500",
      change: stats.weeklyAverage > 0 ? `${stats.weeklyAverage}%` : "0%",
      changeColor: "text-purple-600"
    },
    {
      title: "Temps Total",
      value: formatTime(stats.totalTime),
      icon: Clock,
      gradient: "from-orange-500 to-red-500",
      change: stats.totalTime > 0 ? formatTime(stats.totalTime) : "0m",
      changeColor: "text-orange-600"
    },
    {
      title: "Série Actuelle",
      value: `${stats.streak} jours`,
      icon: Zap,
      gradient: "from-yellow-500 to-orange-500",
      change: stats.streak > 0 ? "🔥" : "0",
      changeColor: "text-yellow-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${stat.changeColor}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
