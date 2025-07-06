"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  FileText, 
  Trophy, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Calendar,
  Star
} from 'lucide-react'

interface StatsCardsProps {
  stats: any
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR')
  }

  const formatPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getSubscriptionStats = () => {
    const totalActive = stats.subscriptionStats.reduce((acc: number, item: any) => acc + item._count.tier, 0)
    const premiumCount = stats.subscriptionStats.find((item: any) => item.tier === 'PREMIUM')?._count.tier || 0
    const expertCount = stats.subscriptionStats.find((item: any) => item.tier === 'EXPERT')?._count.tier || 0
    
    return {
      totalActive,
      premiumCount,
      expertCount,
      premiumPercentage: totalActive > 0 ? formatPercentage(premiumCount, totalActive) : '0',
      expertPercentage: totalActive > 0 ? formatPercentage(expertCount, totalActive) : '0'
    }
  }

  const subscriptionStats = getSubscriptionStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Utilisateurs totaux */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
          <div className="flex items-center gap-2 mt-2">
            {getTrendIcon('up')}
            <p className="text-xs text-muted-foreground">
              +{stats.recentUsers.length} nouveaux cette semaine
            </p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Nouveaux utilisateurs</span>
              <span>{stats.recentUsers.length}</span>
            </div>
            <Progress 
              value={(stats.recentUsers.length / Math.max(stats.totalUsers, 1)) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiz disponibles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quiz disponibles</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalQuizzes)}</div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              {stats.quizTypeStats.length} types différents
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {stats.quizTypeStats.slice(0, 3).map((type: any) => (
              <div key={type.type} className="flex justify-between items-center">
                <span className="text-xs">{type.type}</span>
                <Badge variant="outline" className="text-xs">
                  {type._count.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Résultats de quiz */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Résultats de quiz</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalQuizResults)}</div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              {stats.recentQuizResults.length} récents
            </p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Résultats récents</span>
              <span>{stats.recentQuizResults.length}</span>
            </div>
            <Progress 
              value={(stats.recentQuizResults.length / Math.max(stats.totalQuizResults, 1)) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Abonnements actifs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(subscriptionStats.totalActive)}</div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              {subscriptionStats.totalActive} actifs sur {stats.totalSubscriptions}
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Premium</span>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {subscriptionStats.premiumCount}
                </Badge>
                <span className="text-xs text-gray-500">({subscriptionStats.premiumPercentage}%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Expert</span>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                  {subscriptionStats.expertCount}
                </Badge>
                <span className="text-xs text-gray-500">({subscriptionStats.expertPercentage}%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant pour les métriques détaillées
export function DetailedMetrics({ stats }: { stats: any }) {
  const calculateAverageScore = () => {
    if (stats.recentQuizResults.length === 0) return 0
    const totalScore = stats.recentQuizResults.reduce((acc: number, result: any) => acc + result.score, 0)
    return Math.round(totalScore / stats.recentQuizResults.length)
  }

  const getMostActiveUsers = () => {
    // Simuler les utilisateurs les plus actifs
    return stats.recentUsers.slice(0, 5).map((user: any, index: number) => ({
      ...user,
      activityScore: Math.floor(Math.random() * 100) + 50,
      quizzesCompleted: Math.floor(Math.random() * 20) + 1
    }))
  }

  const averageScore = calculateAverageScore()
  const mostActiveUsers = getMostActiveUsers()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Score moyen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance moyenne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{averageScore}%</div>
            <p className="text-sm text-gray-600">Score moyen des quiz récents</p>
            <div className="mt-4">
              <Progress value={averageScore} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utilisateurs les plus actifs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Utilisateurs les plus actifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mostActiveUsers.map((user: any, index: number) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-600">{user.quizzesCompleted} quiz complétés</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{user.activityScore}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 