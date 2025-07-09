"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, TrendingUp, Users, FileText, Trophy, DollarSign } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalQuizzes: number
  totalQuizResults: number
  totalSubscriptions: number
  recentUsers: any[]
  recentQuizResults: any[]
  subscriptionStats: any[]
  quizTypeStats: any[]
  monthlyRevenue?: {
    total: number
    premium: number
    expert: number
    premiumAmount: number
    expertAmount: number
  }
}

interface StatsCardsProps {
  stats: AdminStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  // Calcul du revenu total cumulé (tous mois)
  const totalAllTime = (stats.subscriptionStats || []).reduce((acc, sub) => {
    if (sub.tier === 'PREMIUM') return acc + 5000 * sub._count.tier;
    if (sub.tier === 'EXPERT') return acc + 9000 * sub._count.tier;
    return acc;
  }, 0);

  const statsData = [
    {
      title: "Utilisateurs totaux",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+12%",
      trendColor: "text-green-600"
    },
    {
      title: "Quiz disponibles",
      value: stats.totalQuizzes,
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: "+5",
      trendColor: "text-purple-600"
    },
    {
      title: "Résultats de quiz",
      value: stats.totalQuizResults,
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      trend: "+23%",
      trendColor: "text-orange-600"
    },
    {
      title: "Abonnements actifs",
      value: stats.totalSubscriptions,
      icon: CreditCard,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      trend: "+8%",
      trendColor: "text-green-600"
    },
    {
      title: "Revenus abonnements (30j)",
      value: stats.monthlyRevenue?.total || 0,
      icon: DollarSign,
      color: "from-green-500 to-green-700",
      bgColor: "bg-green-50",
      iconColor: "text-green-700",
      trend: `Pro: +${stats.monthlyRevenue?.premiumAmount || 0}fr, Expert: +${stats.monthlyRevenue?.expertAmount || 0}fr`,
      trendColor: "text-green-700"
    },
    {
      title: "Revenus abonnements (total)",
      value: totalAllTime,
      icon: DollarSign,
      color: "from-amber-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-700",
      trend: "Cumulé depuis le lancement",
      trendColor: "text-yellow-700"
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()} <span className="text-base font-normal text-gray-500">fr</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className={`text-sm font-medium ${stat.trendColor}`}>{stat.trend}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 