"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, TrendingUp, Clock, Zap, Target, Calendar, ArrowRight, Star, Code, Brain, Users } from 'lucide-react'
import { MOCK_INTERVIEWS, MOCK_USER_STATS, DIFFICULTY_CONFIG, TYPE_CONFIG } from "@/constants"
import { DashboardStats } from "@/components/interviews/dashboard-stats"
import { WeeklyChart } from "@/components/interviews/weekly-chart"
import { SkillsProgress } from "@/components/interviews/skills-progress"
import { RecentInterviews } from "@/components/interviews/recent-interviews"
import { toast } from "sonner"

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStartInterview = (interviewId: string) => {
    toast.success("Démarrage de l'interview...")
    router.push(`/interview/${interviewId}`)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Préparez vos Entretiens Tech 🚀
              </h1>
              <p className="text-blue-100 text-lg">
                Entraînez-vous avec des interviews réalistes et boostez vos compétences
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{MOCK_USER_STATS.streak}</div>
                  <div className="text-blue-100">jours de suite</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Dashboard Stats */}
        <DashboardStats stats={MOCK_USER_STATS} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Progress & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Progress */}
            <WeeklyChart data={MOCK_USER_STATS.weeklyProgress} />

            {/* Interview Categories */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Interviews Disponibles</CardTitle>
                    <CardDescription>Choisissez votre défi et commencez maintenant</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_INTERVIEWS.map((interview) => (
                    <InterviewCard 
                      key={interview.id} 
                      interview={interview} 
                      onStart={() => handleStartInterview(interview.id)} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Skills & Recent */}
          <div className="space-y-6">
            <SkillsProgress skills={MOCK_USER_STATS.skillsProgress} />
            <RecentInterviews interviews={MOCK_USER_STATS.recentInterviews} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InterviewCard({ interview, onStart }: { interview: any, onStart: () => void }) {
  const typeConfig = TYPE_CONFIG[interview.type as "qcm" | "mock" | "soft-skills" | "coding"] 
  const difficultyConfig = DIFFICULTY_CONFIG[interview.difficulty as "junior" | "mid" | "senior"]

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${typeConfig.color}`}>
            <span className="text-2xl">{typeConfig.icon}</span>
          </div>
          <Badge className={`${difficultyConfig.bg} ${difficultyConfig.text} border-0`}>
            {interview.difficulty}
          </Badge>
        </div>

        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
          {interview.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {interview.description}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{interview.duration} min</span>
            <span className="text-gray-400">•</span>
            <span>{interview.questions.length} questions</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {interview.technology.slice(0, 2).map((tech: string) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                  {tech}
                </Badge>
              ))}
              {interview.technology.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-gray-100">
                  +{interview.technology.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Button 
          onClick={onStart} 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
        >
          Commencer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Skeleton className="h-10 w-96 mb-2 bg-white/20" />
          <Skeleton className="h-6 w-64 bg-white/20" />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
