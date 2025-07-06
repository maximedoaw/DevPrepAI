"use client"

import React from 'react'
import { Card } from '@/components/ui/card'

interface DuolingoCardProps {
  children: React.ReactNode
  className?: string
  gradient?: string
}

export function DuolingoCard({ children, className = "", gradient = "from-blue-500 to-purple-600" }: DuolingoCardProps) {
  return (
    <Card className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      <div className="relative z-10">
        {children}
      </div>
    </Card>
  )
} 