"use client"

import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'

interface TypeDistributionChartProps {
  data: Array<{
    type: string
    count: number
    averageScore: number
    icon?: string
  }>
  title?: string
  type?: 'bar' | 'pie'
  height?: number
  showIcon?: boolean
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

export default function TypeDistributionChart({ 
  data, 
  title = "Répartition par type",
  type = 'bar',
  height = 256,
  showIcon = true
}: TypeDistributionChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          </PieChart>
        )
      
      default: // bar
        return (
          <BarChart
            data={data}
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
        )
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'pie':
        return <PieChartIcon className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
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

// Fonction utilitaire pour transformer les données de stats par type
export function transformStatsByType(statsByType: Record<string, any>) {
  return Object.entries(statsByType).map(([type, typeStats]: [string, any]) => ({
    type: type.replace('_', ' '),
    count: typeStats.count,
    averageScore: typeStats.averageScore,
    icon: type
  }))
} 