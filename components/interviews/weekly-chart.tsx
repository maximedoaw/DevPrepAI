"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { TrendingUp, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getWeeklyQuizData } from "@/actions/interview.action"
import React from "react"

interface WeeklyData {
  date: string
  day: string
  score: number
  interviewCount: number
  scoresByType: {
    CODING: { score: number; count: number }
    QCM: { score: number; count: number }
    MOCK_INTERVIEW: { score: number; count: number }
    SOFT_SKILLS: { score: number; count: number }
  }
}

// Composant Skeleton pour le graphique hebdomadaire
function WeeklyChartSkeleton() {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Progression Hebdomadaire</CardTitle>
            <CardDescription>Moyenne de vos scores par jour (7 derniers jours)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <div className="flex items-center justify-center h-full">
            <div className="space-y-4 w-full">
              {/* Skeleton pour les barres du graphique */}
              <div className="flex items-end justify-between h-48 px-4">
                {[...Array(7)].map((_, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <Skeleton 
                      className="w-8 rounded-t-md" 
                      style={{ 
                        height: `${Math.random() * 100 + 50}px`,
                        animationDelay: `${index * 100}ms`
                      }} 
                    />
                    <Skeleton className="h-3 w-6" />
                  </div>
                ))}
              </div>
              {/* Skeleton pour l'axe Y */}
              <div className="flex justify-between px-4 text-xs text-gray-400">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          💡 Survolez les barres pour voir le détail par type d'interview
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklyChart() {
  const { data, isLoading, error } = useQuery<WeeklyData[], Error>({
    queryKey: ['weeklyQuizData'],
    queryFn: async () => {
      // On suppose que getWeeklyQuizData retourne un tableau d'objets
      // dont scoresByType est un Record<string, { score: number; count: number }>
      // mais WeeklyData attend un objet scoresByType avec des clés fixes
      const raw = await getWeeklyQuizData()
      // On adapte les données pour matcher le type WeeklyData
      return raw.map((item: any) => ({
        ...item,
        scoresByType: {
          CODING: item.scoresByType.CODING ?? { score: 0, count: 0 },
          QCM: item.scoresByType.QCM ?? { score: 0, count: 0 },
          MOCK_INTERVIEW: item.scoresByType.MOCK_INTERVIEW ?? { score: 0, count: 0 },
          SOFT_SKILLS: item.scoresByType.SOFT_SKILLS ?? { score: 0, count: 0 },
        }
      }))
    }
  })

  if (isLoading) {
    return <WeeklyChartSkeleton />
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-red-500">
          Une erreur est survenue lors du chargement des données
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Progression Hebdomadaire</CardTitle>
            <CardDescription>Moyenne de vos scores par jour (7 derniers jours)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as any}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                formatter={(value: number, name: string, props: any) => {
                  const data = props.payload
                  if (data.interviewCount > 0) {
                    const typeDetails: React.JSX.Element[] = []
                    
                    // Ajouter les détails par type
                    Object.entries(data.scoresByType).forEach(([type, typeData]: [string, any]) => {
                      if (typeData.count > 0) {
                        const typeLabels: Record<string, string> = {
                          CODING: 'Coding',
                          QCM: 'QCM',
                          MOCK_INTERVIEW: 'Mock Interview',
                          SOFT_SKILLS: 'Soft Skills'
                        }
                        typeDetails.push(
                          <div key={type} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            marginBottom: '4px',
                            fontSize: '12px'
                          }}>
                            <span style={{ color: '#666' }}>{typeLabels[type] || type}:</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {typeData.score}% ({typeData.count})
                            </span>
                          </div>
                        )
                      }
                    })
                    
                    return [
                      <div key="tooltip-content">
                        <div style={{ 
                          fontWeight: 'bold', 
                          marginBottom: '8px',
                          borderBottom: '1px solid #eee',
                          paddingBottom: '4px'
                        }}>
                          Moyenne générale: {value}% ({data.interviewCount} interviews)
                        </div>
                        {typeDetails.length > 0 && (
                          <div style={{ fontSize: '11px', color: '#666' }}>
                            Détail par type:
                            {typeDetails}
                          </div>
                        )}
                      </div>,
                      'Score'
                    ]
                  }
                  return ['Aucun interview', 'Score']
                }}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="score" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-500 text-center">
            💡 Survolez les barres pour voir le détail par type d'interview
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
