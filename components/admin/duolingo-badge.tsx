"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'

interface DuolingoBadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "premium"
  className?: string
}

export function DuolingoBadge({ children, variant = "default", className = "" }: DuolingoBadgeProps) {
  const variants = {
    default: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg",
    premium: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
  }

  return (
    <Badge className={`${variants[variant]} ${className} font-semibold px-3 py-1 rounded-full`}>
      {children}
    </Badge>
  )
} 