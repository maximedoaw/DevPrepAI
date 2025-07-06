"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Users,
  Award,
  Target
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ReputationNavProps {
  userId: string
  level?: number
  experience?: number
  badgesCount?: number
  rank?: number
  className?: string
}

export default function ReputationNav({ 
  userId, 
  level = 1, 
  experience = 0, 
  badgesCount = 0,
  rank,
  className = '' 
}: ReputationNavProps) {
  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-purple-600'
    if (level >= 10) return 'text-blue-600'
    if (level >= 5) return 'text-green-600'
    return 'text-gray-600'
  }

  const getLevelIcon = (level: number) => {
    if (level >= 20) return <Trophy className="h-4 w-4" />
    if (level >= 10) return <Star className="h-4 w-4" />
    return <Star className="h-4 w-4" />
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Badge de niveau */}
      <Link href={`/reputation?id=${userId}`}>
        <Button variant="outline" size="sm" className="gap-2">
          {getLevelIcon(level)}
          <span className={getLevelColor(level)}>Niveau {level}</span>
        </Button>
      </Link>

      {/* Badge de rang si disponible */}
      {rank && rank > 0 && (
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          #{rank}
        </Badge>
      )}

      {/* Compteur de badges */}
      {badgesCount > 0 && (
        <Badge variant="outline" className="gap-1">
          <Award className="h-3 w-3" />
          {badgesCount}
        </Badge>
      )}

      {/* Lien vers le profil complet */}
      <Link href={`/reputation?id=${userId}`}>
        <Button variant="ghost" size="sm" className="gap-2">
          <Target className="h-4 w-4" />
          Voir profil
        </Button>
      </Link>
    </div>
  )
}

// Composant pour afficher un résumé rapide de la réputation
export function ReputationSummary({ 
  userId, 
  level, 
  experience, 
  badgesCount, 
  rank 
}: ReputationNavProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Votre Progression</h3>
        <Link href={`/reputation?id=${userId}`}>
          <Button variant="outline" size="sm">
            Voir détails
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-bold">Niveau {level}</span>
          </div>
          <div className="text-sm text-gray-600">{experience} XP</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="h-4 w-4 text-purple-500" />
            <span className="font-bold">{badgesCount}</span>
          </div>
          <div className="text-sm text-gray-600">Badges</div>
        </div>
      </div>
      
      {rank && rank > 0 && (
        <div className="mt-3 pt-3 border-t text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Rang #{rank}</span>
          </div>
        </div>
      )}
    </div>
  )
} 