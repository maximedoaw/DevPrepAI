"use client"

import React from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart as LineChartIcon, BarChart3, TrendingUp } from 'lucide-react'

interface WeeklyProgressChartProps {
  data: Array<{
    day: string
    score: number
    quizzes: number
    xp: number
  }>
  title?: string
  type?: 'area' | 'line' | 'bar'
  height?: number
  showIcon?: boolean
}

export default function WeeklyProgressChart({ 
  data, 
  title = "Progression hebdomadaire",
  type = 'area',
  height = 256,
  showIcon = true
}: WeeklyProgressChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
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
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        )
      
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
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
            <Bar 
              dataKey="score" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="Score"
            />
            <Bar 
              dataKey="quizzes" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
              name="Quiz"
            />
          </BarChart>
        )
      
      default: // area
        return (
          <AreaChart
            data={data}
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
        )
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'line':
        return <LineChartIcon className="h-5 w-5" />
      case 'bar':
        return <BarChart3 className="h-5 w-5" />
      default:
        return <TrendingUp className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {showIcon && getIcon()}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant pour générer des données de progression hebdomadaire
export function generateWeeklyData(quizResults: any[]) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const today = new Date()
  
  return days.map((day, index) => {
    // Simuler des données basées sur les résultats réels
    const dayResults = quizResults.filter(result => {
      const resultDate = new Date(result.completedAt)
      const dayDiff = Math.floor((today.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24))
      return dayDiff === index
    })
    
    const score = dayResults.length > 0 
      ? Math.round(dayResults.reduce((sum, r) => sum + r.score, 0) / dayResults.length)
      : Math.floor(Math.random() * 30) + 50 // Valeur aléatoire entre 50-80 si pas de données
    
    const quizzes = dayResults.length
    const xp = score * 10
    
    return {
      day,
      score,
      quizzes,
      xp
    }
  })
} 