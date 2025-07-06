"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Zap,
  Crown,
  Gem,
  Medal,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowLeft,
  Users,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Minus,
  FileText,
  Code,
  Mic,
  Handshake,
  User,
  ChevronRight,
  Sparkles,
  Heart,
  Shield,
  Sword,
  BookOpen,
  Lightbulb,
  Rocket,
  Gift,
  Bell,
  Settings,
  Home,
  Activity,
  PieChart,
  LineChart,
  Target as TargetIcon,
  Award as AwardIcon,
  Clock as ClockIcon
} from 'lucide-react'

interface ReputationClientProps {
  data: any
  leaderboardData?: any[]
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-700 border-gray-300',
  uncommon: 'bg-green-100 text-green-700 border-green-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300'
}

const rarityIcons = {
  common: <Star className="h-4 w-4" />,
  uncommon: <Award className="h-4 w-4" />,
  rare: <Gem className="h-4 w-4" />,
  epic: <Crown className="h-4 w-4" />,
  legendary: <Trophy className="h-4 w-4" />
}

const typeIcons = {
  QCM: <FileText className="h-5 w-5" />,
  CODING: <Code className="h-5 w-5" />,
  MOCK_INTERVIEW: <Mic className="h-5 w-5" />,
  SOFT_SKILLS: <Handshake className="h-5 w-5" />
}

const difficultyColors = {
  JUNIOR: 'bg-green-100 text-green-700',
  MID: 'bg-yellow-100 text-yellow-700',
  SENIOR: 'bg-red-100 text-red-700'
}

// Données de classement simulées en temps réel
const mockLeaderboard = [
  { id: '1', name: 'Alex Chen', level: 25, experience: 24500, avatar: 'AC', streak: 45, rank: 1, trend: 'up' },
  { id: '2', name: 'Sarah Johnson', level: 22, experience: 22100, avatar: 'SJ', streak: 38, rank: 2, trend: 'up' },
  { id: '3', name: 'Marcus Rodriguez', level: 20, experience: 20100, avatar: 'MR', streak: 32, rank: 3, trend: 'down' },
  { id: '4', name: 'Emma Wilson', level: 18, experience: 18500, avatar: 'EW', streak: 28, rank: 4, trend: 'up' },
  { id: '5', name: 'David Kim', level: 17, experience: 17200, avatar: 'DK', streak: 25, rank: 5, trend: 'stable' },
  { id: '6', name: 'Lisa Thompson', level: 16, experience: 16100, avatar: 'LT', streak: 22, rank: 6, trend: 'up' },
  { id: '7', name: 'James Brown', level: 15, experience: 15400, avatar: 'JB', streak: 19, rank: 7, trend: 'down' },
  { id: '8', name: 'Maria Garcia', level: 14, experience: 14300, avatar: 'MG', streak: 16, rank: 8, trend: 'stable' },
  { id: '9', name: 'Tom Anderson', level: 13, experience: 13200, avatar: 'TA', streak: 14, rank: 9, trend: 'up' },
  { id: '10', name: 'Anna Lee', level: 12, experience: 12100, avatar: 'AL', streak: 12, rank: 10, trend: 'down' }
]

export default function ReputationClient({ data, leaderboardData }: ReputationClientProps) {
  const router = useRouter()
  const { user, stats, badges, recentActivity, achievements, statsByType } = data
  const [leaderboard, setLeaderboard] = useState(leaderboardData || mockLeaderboard)
  const [currentUserRank, setCurrentUserRank] = useState(0)

  // Simuler des mises à jour en temps réel du classement
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard(prev => {
        const updated = prev.map(user => ({
          ...user,
          experience: user.experience + Math.floor(Math.random() * 10),
          level: Math.floor((user.experience + Math.floor(Math.random() * 10)) / 1000) + 1
        }))
        
        // Trier par niveau et expérience
        updated.sort((a, b) => {
          if (a.level !== b.level) return b.level - a.level
          return b.experience - a.experience
        })
        
        // Mettre à jour les rangs
        updated.forEach((user, index) => {
          user.rank = index + 1
        })
        
        return updated
      })
    }, 5000) // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval)
  }, [])

  // Trouver le rang de l'utilisateur actuel
  useEffect(() => {
    const userRank = leaderboard.findIndex(u => u.id === user?.id) + 1
    setCurrentUserRank(userRank || 0)
  }, [leaderboard, user?.id])

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLevelProgress = () => {
    const progress = ((stats.experience % 1000) / 1000) * 100
    return Math.round(progress)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-gray-600">#{rank}</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header avec profil utilisateur */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'Utilisateur'
                }
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Membre depuis {user?.createdAt ? formatDate(user.createdAt).split(' ')[0] : 'récemment'}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  {user?.credits || 0} crédits
                </div>
                {currentUserRank > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Rang #{currentUserRank}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">Niveau {stats.level}</div>
              <div className="text-sm text-gray-600">{stats.experience} XP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Classement
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activité
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Colonne de gauche - Statistiques principales */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Barre de progression du niveau */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5" />
                      Progression du niveau
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Niveau {stats.level}</span>
                        <span>Niveau {stats.level + 1}</span>
                      </div>
                      <Progress value={getLevelProgress()} className="h-3 bg-white/20" />
                      <div className="text-center text-sm">
                        {stats.experienceToNextLevel} XP pour le niveau suivant
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistiques générales */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Statistiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalQuizzes}</div>
                        <div className="text-sm text-gray-600">Quiz complétés</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
                        <div className="text-sm text-gray-600">Score moyen</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
                        <div className="text-sm text-gray-600">Jours consécutifs</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.totalScore}</div>
                        <div className="text-sm text-gray-600">Score total</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistiques par type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TargetIcon className="h-5 w-5" />
                      Par catégorie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(statsByType).map(([type, typeStats]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="text-blue-600">
                            {typeIcons[type as keyof typeof typeIcons] || <TargetIcon className="h-5 w-5" />}
                          </div>
                          <span className="font-medium">{type.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{typeStats.count}</div>
                          <div className="text-sm text-gray-600">{typeStats.averageScore}%</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Colonne centrale - Réalisations */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Réalisations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AwardIcon className="h-5 w-5" />
                      Réalisations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {achievements.map((achievement: any) => (
                          <div key={achievement.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`text-blue-600 ${achievement.unlocked ? 'opacity-100' : 'opacity-30'}`}>
                                {achievement.icon === '🎯' && <TargetIcon className="h-6 w-6" />}
                                {achievement.icon === '🔥' && <Flame className="h-6 w-6" />}
                                {achievement.icon === '⭐' && <Star className="h-6 w-6" />}
                                {achievement.icon === '💻' && <Code className="h-6 w-6" />}
                                {achievement.icon === '📋' && <FileText className="h-6 w-6" />}
                                {achievement.icon === '🎤' && <Mic className="h-6 w-6" />}
                                {achievement.icon === '🤝' && <Handshake className="h-6 w-6" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-sm">{achievement.name}</div>
                                <div className="text-xs text-gray-600 mb-2">{achievement.description}</div>
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={(achievement.progress / achievement.target) * 100} 
                                    className="flex-1 h-2" 
                                  />
                                  <span className="text-xs text-gray-500">
                                    {achievement.progress}/{achievement.target}
                                  </span>
                                </div>
                              </div>
                              {achievement.unlocked && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Série de jours consécutifs */}
                {stats.streak > 0 && (
                  <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5" />
                        Série en cours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{stats.streak}</div>
                        <div className="text-sm opacity-90">
                          {stats.streak === 1 ? 'jour consécutif' : 'jours consécutifs'}
                        </div>
                        <div className="text-xs opacity-75 mt-2">
                          Continuez pour maintenir votre série !
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Colonne de droite - Activité récente */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Activité récente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {recentActivity.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>Aucune activité récente</p>
                          <p className="text-sm">Commencez par compléter votre premier quiz !</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentActivity.map((activity: any) => (
                            <div key={activity.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-blue-600">
                                    {typeIcons[activity.type as keyof typeof typeIcons] || <TargetIcon className="h-5 w-5" />}
                                  </div>
                                  <span className="font-medium text-sm truncate">{activity.title}</span>
                                </div>
                                <Badge className={difficultyColors[activity.difficulty as keyof typeof difficultyColors]}>
                                  {activity.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{activity.company}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-green-600">{activity.score}%</span>
                                  <span>{formatDate(activity.date)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Collection de badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Badges ({badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {badges.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Aucun badge débloqué pour le moment</p>
                    <p className="text-sm">Continuez à progresser pour débloquer des badges !</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((badge: any) => (
                      <div
                        key={badge.id}
                        className={`p-6 rounded-xl border-2 ${rarityColors[badge.rarity as keyof typeof rarityColors]} transition-all hover:scale-105 hover:shadow-lg`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-3xl">
                            {badge.icon === '🌟' && <Star className="h-8 w-8 text-yellow-500" />}
                            {badge.icon === '⭐' && <Star className="h-8 w-8 text-yellow-400" />}
                            {badge.icon === '💎' && <Gem className="h-8 w-8 text-blue-500" />}
                            {badge.icon === '👑' && <Crown className="h-8 w-8 text-purple-500" />}
                            {badge.icon === '🔥' && <Flame className="h-8 w-8 text-orange-500" />}
                            {badge.icon === '📝' && <FileText className="h-8 w-8 text-blue-600" />}
                            {badge.icon === '🏆' && <Trophy className="h-8 w-8 text-yellow-600" />}
                            {badge.icon === '💯' && <Target className="h-8 w-8 text-green-600" />}
                            {badge.icon === '✨' && <Sparkles className="h-8 w-8 text-purple-400" />}
                            {badge.icon === '🎯' && <Target className="h-8 w-8 text-red-600" />}
                            {badge.icon === '🏅' && <Award className="h-8 w-8 text-yellow-700" />}
                          </div>
                          {rarityIcons[badge.rarity as keyof typeof rarityIcons]}
                        </div>
                        <div className="font-semibold text-lg mb-2">{badge.name}</div>
                        <div className="text-sm opacity-75">{badge.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Graphique de répartition des badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Répartition par rareté
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Common', value: badges.filter((b: any) => b.rarity === 'common').length, color: '#6b7280' },
                          { name: 'Uncommon', value: badges.filter((b: any) => b.rarity === 'uncommon').length, color: '#10b981' },
                          { name: 'Rare', value: badges.filter((b: any) => b.rarity === 'rare').length, color: '#3b82f6' },
                          { name: 'Epic', value: badges.filter((b: any) => b.rarity === 'epic').length, color: '#8b5cf6' },
                          { name: 'Legendary', value: badges.filter((b: any) => b.rarity === 'legendary').length, color: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Common', value: badges.filter((b: any) => b.rarity === 'common').length, color: '#6b7280' },
                          { name: 'Uncommon', value: badges.filter((b: any) => b.rarity === 'uncommon').length, color: '#10b981' },
                          { name: 'Rare', value: badges.filter((b: any) => b.rarity === 'rare').length, color: '#3b82f6' },
                          { name: 'Epic', value: badges.filter((b: any) => b.rarity === 'epic').length, color: '#8b5cf6' },
                          { name: 'Legendary', value: badges.filter((b: any) => b.rarity === 'legendary').length, color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [value, name]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

          {/* Classement */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Classement en temps réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {leaderboard.map((user, index) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          user.id === data.user?.id 
                            ? 'bg-blue-50 border-blue-200 shadow-md' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getRankBadge(user.rank)}
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-600">
                            Niveau {user.level} • {user.experience} XP
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{user.streak} jours</div>
                            <div className="text-xs text-gray-500">série</div>
                          </div>
                          {getTrendIcon(user.trend)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activité détaillée */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Graphique d'activité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Progression hebdomadaire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { day: 'Lun', score: 65, quizzes: 2, xp: 650 },
                          { day: 'Mar', score: 78, quizzes: 3, xp: 780 },
                          { day: 'Mer', score: 82, quizzes: 4, xp: 820 },
                          { day: 'Jeu', score: 75, quizzes: 2, xp: 750 },
                          { day: 'Ven', score: 88, quizzes: 5, xp: 880 },
                          { day: 'Sam', score: 92, quizzes: 6, xp: 920 },
                          { day: 'Dim', score: 85, quizzes: 3, xp: 850 }
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="day" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => [
                            name === 'score' ? `${value}%` : value,
                            name === 'score' ? 'Score' : name === 'quizzes' ? 'Quiz' : 'XP'
                          ]}
                          labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorScore)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques avancées */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Répartition par type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(statsByType).map(([type, typeStats]: [string, any]) => ({
                          type: type.replace('_', ' '),
                          count: typeStats.count,
                          averageScore: typeStats.averageScore,
                          icon: type
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="type" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => [
                            name === 'count' ? value : `${value}%`,
                            name === 'count' ? 'Quiz' : 'Score moyen'
                          ]}
                          labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]}
                          name="Quiz"
                        />
                        <Bar 
                          dataKey="averageScore" 
                          fill="#8b5cf6" 
                          radius={[4, 4, 0, 0]}
                          name="Score moyen"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 