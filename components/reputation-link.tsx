"use client"

import React from 'react'
import Link from 'next/link'
import { Trophy, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReputationLinkProps {
  userId: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export default function ReputationLink({ 
  userId, 
  className = '', 
  variant = 'outline',
  size = 'default'
}: ReputationLinkProps) {
  return (
    <Link href={`/reputation?id=${userId}`}>
      <Button 
        variant={variant} 
        size={size}
        className={`gap-2 ${className}`}
      >
        <Trophy className="h-4 w-4" />
        Voir le profil
      </Button>
    </Link>
  )
}

// Composant pour afficher un badge de niveau rapide
export function LevelBadge({ level, experience }: { level: number; experience: number }) {
  const getLevelColor = (level: number) => {
    if (level >= 20) return 'bg-purple-100 text-purple-800 border-purple-300'
    if (level >= 10) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (level >= 5) return 'bg-green-100 text-green-800 border-green-300'
    return 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getLevelIcon = (level: number) => {
    if (level >= 20) return <Trophy className="h-3 w-3" />
    if (level >= 10) return <Star className="h-3 w-3" />
    return <Star className="h-3 w-3" />
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(level)}`}>
      {getLevelIcon(level)}
      Niveau {level}
    </div>
  )
} 