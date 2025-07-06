"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Activity, 
  LineChart, 
  Users, 
  Sparkles, 
  Trophy, 
  TrendingUp,
  Crown,
  Medal,
  Award
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts'
import { DuolingoCard } from './duolingo-card'
import { DuolingoBadge } from './duolingo-badge'

interface AdminStats {
  totalUsers: number
  totalQuizzes: number
  totalQuizResults: number
  totalSubscriptions: number
  recentUsers: any[]
  recentQuizResults: any[]
  subscriptionStats: any[]
  quizTypeStats: any[]
}

interface OverviewTabProps {
  stats: AdminStats
}

export function OverviewTab({ stats }: OverviewTabProps) {
  const weeklyData = [
    { day: 'Lun', users: 12, quizzes: 8, results: 45 },
    { day: 'Mar', users: 19, quizzes: 12, results: 67 },
    { day: 'Mer', users: 15, quizzes: 10, results: 52 },
    { day: 'Jeu', users: 22, quizzes: 15, results: 78 },
    { day: 'Ven', users: 18, quizzes: 11, results: 63 },
    { day: 'Sam', users: 25, quizzes: 18, results: 89 },
    { day: 'Dim', users: 20, quizzes: 14, results: 71 }
  ]

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente avec style Duolingo */}
        <DuolingoCard gradient="from-green-500 to-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Activity className="h-6 w-6 text-green-600" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Nouveaux utilisateurs</span>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-bold text-green-600">{stats.recentUsers.length} cette semaine</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Quiz complétés</span>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-bold text-purple-600">{stats.recentQuizResults.length} récents</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Taux de conversion</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600">+12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </DuolingoCard>

        {/* Graphique d'activité hebdomadaire */}
        <DuolingoCard gradient="from-purple-500 to-pink-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <LineChart className="h-6 w-6 text-purple-600" />
              Activité hebdomadaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="quizzes" stroke="#8b5cf6" fill="url(#colorQuizzes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </DuolingoCard>
      </div>

      {/* Utilisateurs récents avec style Duolingo */}
      <DuolingoCard gradient="from-yellow-500 to-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Users className="h-6 w-6 text-yellow-600" />
            Utilisateurs récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentUsers.slice(0, 5).map((user: any, index: number) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-yellow-300">
                      <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1">
                        {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                        {index === 2 && <Award className="h-5 w-5 text-orange-500" />}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.subscription && (
                    <DuolingoBadge 
                      variant={user.subscription.tier === 'EXPERT' ? 'premium' : user.subscription.tier === 'PREMIUM' ? 'success' : 'default'}
                    >
                      {user.subscription.tier}
                    </DuolingoBadge>
                  )}
                  <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </DuolingoCard>
    </div>
  )
} 