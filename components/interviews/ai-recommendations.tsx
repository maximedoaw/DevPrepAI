"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, TrendingUp, Clock, Target, Sparkles } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUserStats } from "@/actions/interview.action"
import Link from "next/link"

// Types pour les recommandations
interface Recommendation {
  id: string
  title: string
  company: string
  type: 'CODING' | 'QCM' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS'
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR'
  technology: string[]
  duration: number
  score: number
  reason: string
  confidence: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

// Données simulées pour les recommandations
const mockRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    title: "Algorithms & Data Structures",
    company: "Google",
    type: "CODING",
    difficulty: "MID",
    technology: ["JavaScript", "Python"],
    duration: 45,
    score: 85,
    reason: "Basé sur vos performances en algorithmes, ce quiz vous aidera à renforcer vos compétences en structures de données",
    confidence: 92,
    priority: "HIGH"
  },
  {
    id: "rec-2",
    title: "System Design Interview",
    company: "Amazon",
    type: "MOCK_INTERVIEW",
    difficulty: "SENIOR",
    technology: ["System Design", "Architecture"],
    duration: 60,
    score: 78,
    reason: "Vos scores en QCM montrent une bonne compréhension théorique, passez au niveau supérieur",
    confidence: 87,
    priority: "HIGH"
  },
  {
    id: "rec-3",
    title: "React Hooks & Performance",
    company: "Meta",
    type: "CODING",
    difficulty: "MID",
    technology: ["React", "JavaScript"],
    duration: 30,
    score: 82,
    reason: "Complémente parfaitement vos connaissances React existantes",
    confidence: 85,
    priority: "MEDIUM"
  },
  {
    id: "rec-4",
    title: "Leadership & Communication",
    company: "Microsoft",
    type: "SOFT_SKILLS",
    difficulty: "MID",
    technology: ["Leadership", "Communication"],
    duration: 25,
    score: 75,
    reason: "Développez vos compétences en leadership pour les rôles seniors",
    confidence: 78,
    priority: "MEDIUM"
  },
  {
    id: "rec-5",
    title: "Database Optimization",
    company: "Netflix",
    type: "QCM",
    difficulty: "SENIOR",
    technology: ["SQL", "Database"],
    duration: 20,
    score: 88,
    reason: "Renforcez vos compétences en base de données pour les systèmes à grande échelle",
    confidence: 90,
    priority: "LOW"
  },
  {
    id: "rec-6",
    title: "TypeScript Advanced Patterns",
    company: "Spotify",
    type: "CODING",
    difficulty: "SENIOR",
    technology: ["TypeScript", "JavaScript"],
    duration: 40,
    score: 80,
    reason: "Perfectionnez vos compétences TypeScript pour des projets d'entreprise",
    confidence: 83,
    priority: "MEDIUM"
  },
  {
    id: "rec-7",
    title: "Behavioral Interview Prep",
    company: "Apple",
    type: "SOFT_SKILLS",
    difficulty: "MID",
    technology: ["Communication", "Leadership"],
    duration: 35,
    score: 72,
    reason: "Améliorez vos réponses aux questions comportementales",
    confidence: 76,
    priority: "HIGH"
  },
  {
    id: "rec-8",
    title: "Node.js Backend Development",
    company: "Uber",
    type: "CODING",
    difficulty: "MID",
    technology: ["Node.js", "JavaScript", "Express"],
    duration: 50,
    score: 79,
    reason: "Développez vos compétences backend avec Node.js",
    confidence: 81,
    priority: "MEDIUM"
  },
  {
    id: "rec-9",
    title: "Machine Learning Basics",
    company: "OpenAI",
    type: "QCM",
    difficulty: "JUNIOR",
    technology: ["Python", "Machine Learning"],
    duration: 25,
    score: 85,
    reason: "Introduction aux concepts de machine learning",
    confidence: 88,
    priority: "LOW"
  },
  {
    id: "rec-10",
    title: "Frontend Architecture",
    company: "Airbnb",
    type: "MOCK_INTERVIEW",
    difficulty: "SENIOR",
    technology: ["React", "Architecture", "Design Patterns"],
    duration: 55,
    score: 76,
    reason: "Maîtrisez l'architecture frontend pour des applications complexes",
    confidence: 79,
    priority: "HIGH"
  }
]

// Fonction pour générer des recommandations basées sur les stats utilisateur
function generateRecommendations(stats: any): Recommendation[] {
  // Logique de recommandation basée sur les statistiques
  let recommendations = [...mockRecommendations]
  
  // Ajuster les recommandations selon les performances globales
  if (stats.averageScore < 60) {
    // Si score très faible, recommander principalement des quiz JUNIOR
    recommendations = recommendations.filter(rec => rec.difficulty === 'JUNIOR')
    recommendations.sort((a, b) => {
      if (a.type === 'QCM' && b.type !== 'QCM') return -1
      if (b.type === 'QCM' && a.type !== 'QCM') return 1
      return 0
    })
  } else if (stats.averageScore < 75) {
    // Si score moyen, recommander un mélange JUNIOR/MID
    recommendations.sort((a, b) => {
      if (a.difficulty === 'JUNIOR' && b.difficulty === 'SENIOR') return -1
      if (b.difficulty === 'JUNIOR' && a.difficulty === 'SENIOR') return 1
      return 0
    })
  } else if (stats.averageScore > 85) {
    // Si score élevé, recommander plus de quiz SENIOR
    recommendations.sort((a, b) => {
      if (a.difficulty === 'SENIOR' && b.difficulty !== 'SENIOR') return -1
      if (b.difficulty === 'SENIOR' && a.difficulty !== 'SENIOR') return 1
      return 0
    })
  }
  
  // Ajuster selon les types les moins performants
  if (stats.statsByType && Object.keys(stats.statsByType).length > 0) {
    const typeStats = Object.entries(stats.statsByType)
    const weakestType = typeStats.reduce((weakest, [type, data]: [string, any]) => {
      return data.averageScore < weakest.score ? { type, score: data.averageScore } : weakest
    }, { type: 'CODING', score: 100 })
    
    // Prioriser les quiz du type le plus faible
    recommendations.sort((a, b) => {
      if (a.type === weakestType.type && b.type !== weakestType.type) return -1
      if (b.type === weakestType.type && a.type !== weakestType.type) return 1
      return 0
    })
  }
  
  // Ajuster selon la série actuelle
  if (stats.streak > 7) {
    // Si série longue, recommander des défis plus difficiles
    recommendations.sort((a, b) => {
      if (a.difficulty === 'SENIOR' && b.difficulty !== 'SENIOR') return -1
      if (b.difficulty === 'SENIOR' && a.difficulty !== 'SENIOR') return 1
      return 0
    })
  } else if (stats.streak === 0) {
    // Si pas de série, recommander des quiz motivants
    recommendations.sort((a, b) => {
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1
      if (b.priority === 'HIGH' && a.priority !== 'HIGH') return 1
      return 0
    })
  }
  
  // Ajuster selon le nombre total d'interviews
  if (stats.totalInterviews < 5) {
    // Nouveau utilisateur, recommander des quiz de base
    recommendations = recommendations.filter(rec => 
      rec.difficulty === 'JUNIOR' || rec.type === 'QCM'
    )
  } else if (stats.totalInterviews > 20) {
    // Utilisateur expérimenté, recommander des quiz avancés
    recommendations.sort((a, b) => {
      if (a.difficulty === 'SENIOR' && b.difficulty !== 'SENIOR') return -1
      if (b.difficulty === 'SENIOR' && a.difficulty !== 'SENIOR') return 1
      return 0
    })
  }
  
  // Ajuster les scores de confiance basés sur les données utilisateur
  recommendations = recommendations.map(rec => {
    let confidence = rec.confidence
    
    // Augmenter la confiance si le type correspond aux forces de l'utilisateur
    if (stats.statsByType && stats.statsByType[rec.type] && stats.statsByType[rec.type].averageScore > 80) {
      confidence += 5
    }
    
    // Diminuer la confiance si le type correspond aux faiblesses
    if (stats.statsByType && stats.statsByType[rec.type] && stats.statsByType[rec.type].averageScore < 60) {
      confidence -= 10
    }
    
    // Ajuster selon la difficulté
    if (rec.difficulty === 'JUNIOR' && stats.averageScore > 80) {
      confidence -= 15
    } else if (rec.difficulty === 'SENIOR' && stats.averageScore < 70) {
      confidence -= 20
    }
    
    return {
      ...rec,
      confidence: Math.max(50, Math.min(95, confidence))
    }
  })
  
  // Trier par confiance et priorité
  recommendations.sort((a, b) => {
    if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1
    if (b.priority === 'HIGH' && a.priority !== 'HIGH') return 1
    return b.confidence - a.confidence
  })
  
  return recommendations.slice(0, 6)
}

// Composant Skeleton pour les recommandations
function RecommendationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-8 w-8 rounded-lg bg-blue-200" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-gray-300" />
          <Skeleton className="h-4 w-64 bg-gray-200" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32 bg-gray-300" />
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full bg-gray-300" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full bg-gray-200" />
                <Skeleton className="h-5 w-20 rounded-full bg-gray-200" />
              </div>
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-3/4 bg-gray-200" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-8 w-20 bg-gray-300" />
                <Skeleton className="h-8 w-24 bg-blue-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function AIRecommendations() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  })

  if (isLoading) {
    return <RecommendationsSkeleton />
  }

  if (error || !stats) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Recommandations IA</h3>
          <p className="text-gray-500">Impossible de charger les recommandations personnalisées</p>
        </CardContent>
      </Card>
    )
  }

  const recommendations = generateRecommendations(stats)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CODING': return 'bg-blue-100 text-blue-700'
      case 'QCM': return 'bg-purple-100 text-purple-700'
      case 'MOCK_INTERVIEW': return 'bg-orange-100 text-orange-700'
      case 'SOFT_SKILLS': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'JUNIOR': return 'bg-green-100 text-green-700'
      case 'MID': return 'bg-yellow-100 text-yellow-700'
      case 'SENIOR': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec analyse IA */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recommandations IA</h2>
          <p className="text-sm text-gray-600">
            Basé sur vos {stats.totalInterviews} interviews et votre score moyen de {stats.averageScore}%
          </p>
        </div>
      </div>

      {/* Grille de recommandations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-gray-500">{rec.company}</p>
                </div>
                <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                  {rec.priority}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`text-xs ${getTypeColor(rec.type)}`}>
                  {rec.type.replace('_', ' ')}
                </Badge>
                <Badge className={`text-xs ${getDifficultyColor(rec.difficulty)}`}>
                  {rec.difficulty}
                </Badge>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1">
                {rec.technology.slice(0, 3).map((tech, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
                {rec.technology.length > 3 && (
                  <span className="text-xs text-gray-500">+{rec.technology.length - 3}</span>
                )}
              </div>

              {/* Raison de la recommandation */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {rec.reason}
              </p>

              {/* Métriques */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {rec.duration}min
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {rec.confidence}% confiance
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">{rec.score}%</span>
                </div>
                <Button asChild size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Link href={`/interview/${rec.id}`}>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Commencer
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer avec insights */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Insights IA</span>
        </div>
        <p className="text-sm text-blue-700">
          {stats.averageScore > 80 
            ? "Excellent travail ! L'IA recommande de vous concentrer sur des défis plus avancés pour continuer votre progression."
            : stats.averageScore > 60
            ? "Bonne progression ! L'IA suggère de renforcer vos bases avant de passer aux niveaux supérieurs."
            : "L'IA recommande de commencer par des quiz de niveau junior pour construire une base solide."
          }
        </p>
      </div>
    </div>
  )
} 