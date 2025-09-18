"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, TrendingUp, Clock, Target, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUserStats } from "@/actions/interview.action"
import Link from "next/link"
import { useState } from "react"

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

// --- SIMULATION IA façon Tensorflow ---
function simulateTensorflowRecommendations(stats: any): Recommendation[] {
  // Ici, on simule un modèle Tensorflow qui classerait les recommandations selon le profil utilisateur
  // En réalité, on applique une logique de tri avancée sur les mockRecommendations
  let recommendations = [...mockRecommendations]
  
  // Simule une "prédiction" IA :
  if (stats.averageScore < 60) {
    recommendations = recommendations.filter(rec => rec.difficulty === 'JUNIOR')
    recommendations.sort((a, b) => (a.type === 'QCM' ? -1 : 1))
  } else if (stats.averageScore < 75) {
    recommendations = recommendations.filter(rec => rec.difficulty !== 'SENIOR')
    recommendations.sort((a, b) => (a.type === 'CODING' ? -1 : 1))
  } else {
    recommendations = recommendations.filter(rec => rec.difficulty !== 'JUNIOR')
    recommendations.sort((a, b) => (b.confidence - a.confidence))
  }
  
  // Simule un score de confiance IA
  recommendations = recommendations.map((rec, i) => ({
      ...rec,
    confidence: Math.max(60, Math.min(95, rec.confidence + (Math.random() * 10 - 5)))
  }))
  
  // On retourne les 4 premiers comme "top picks" IA
  return recommendations.slice(0, 4)
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

  // --- Utilisation de la simulation Tensorflow ---
  const recommendations = simulateTensorflowRecommendations(stats)

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
          <h2 className="text-xl font-bold text-gray-900">Recommandations IA (simulation Tensorflow)</h2>
          <p className="text-sm text-gray-600">
            Basé sur vos {stats.totalInterviews} interviews et votre score moyen de {stats.averageScore}%<br/>
            <span className="text-xs text-blue-500">Simulation IA (Tensorflow-like)</span>
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

// Nouveau composant carousel compact pour le homescreen
export function AIRecommendationsCarousel({ recommendations }: { recommendations: Recommendation[] }) {
  const [index, setIndex] = useState(0)
  const visible = recommendations.slice(index, index + 1)

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Recommandations IA</h3>
          <p className="text-gray-500">Aucune recommandation disponible</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-700 font-semibold">Recommandation IA personnalisée</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIndex((i) => (i === 0 ? recommendations.length - 1 : i - 1))} aria-label="Précédent">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIndex((i) => (i === recommendations.length - 1 ? 0 : i + 1))} aria-label="Suivant">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {visible.map((rec) => (
        <Card key={rec.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {rec.title}
                </h3>
                <p className="text-sm text-gray-500">{rec.company}</p>
              </div>
              <Badge className={`text-xs ${rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' : rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{rec.priority}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge className={`text-xs ${rec.type === 'CODING' ? 'bg-blue-100 text-blue-700' : rec.type === 'QCM' ? 'bg-purple-100 text-purple-700' : rec.type === 'MOCK_INTERVIEW' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{rec.type.replace('_', ' ')}</Badge>
              <Badge className={`text-xs ${rec.difficulty === 'JUNIOR' ? 'bg-green-100 text-green-700' : rec.difficulty === 'MID' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{rec.difficulty}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {rec.technology.slice(0, 3).map((tech, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tech}</span>
              ))}
              {rec.technology.length > 3 && (
                <span className="text-xs text-gray-500">+{rec.technology.length - 3}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{rec.reason}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {rec.duration}min
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {typeof rec.confidence === 'number' ? rec.confidence : 0}% confiance
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">{typeof rec.score === 'number' ? rec.score : 0}%</span>
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
      <div className="flex justify-center mt-2 gap-1">
        {recommendations.slice(0, 4).map((_, i) => (
          <span key={i} className={`inline-block w-2 h-2 rounded-full ${i === index ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
        ))}
      </div>
    </div>
  )
} 