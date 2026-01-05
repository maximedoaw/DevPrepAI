"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Target, Clock, Trophy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { formatDuration } from "@/lib/time-utils"
import { motion } from "framer-motion"

interface InterviewInfoProps {
  interview: {
    id: string
    title: string
    company: string
    difficulty: string
    type: string
    duration: number
    questions: any[]
  }
  currentQuestionIndex: number
  totalQuestions: number
}

export function InterviewInfo({ interview, currentQuestionIndex, totalQuestions }: InterviewInfoProps) {
  const router = useRouter()
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="relative overflow-hidden rounded-3xl bg-emerald-600 dark:bg-emerald-900/40 p-6 md:p-8 text-white shadow-xl shadow-emerald-500/10">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Target className="w-48 h-48 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/interviews")}
              className="text-emerald-100 hover:text-white hover:bg-emerald-500/20 -ml-2 h-auto py-1 px-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Hub
            </Button>

            <div>
              <div className="flex items-center gap-2 text-emerald-100 font-medium text-sm mb-1">
                <Building2 className="w-4 h-4" />
                <span>{interview.company}</span>
                <span className="text-emerald-400">•</span>
                <Badge variant="outline" className="text-emerald-50 border-emerald-400/30 bg-emerald-500/20">
                  {interview.difficulty}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                {interview.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-emerald-100/80">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDuration(interview.duration)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  {interview.questions.length} questions
                </span>
              </div>
            </div>
          </div>

          {/* Progress Circle (Simplified) */}
          <div className="hidden md:flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-3xl font-bold">{currentQuestionIndex + 1}<span className="text-lg text-emerald-200/60 font-medium">/{totalQuestions}</span></span>
            <span className="text-xs text-emerald-100 font-medium uppercase tracking-wide">Question</span>
          </div>
        </div>

        {/* Linear Progress for Mobile */}
        <div className="md:hidden mt-6">
          <div className="flex justify-between text-xs text-emerald-100/80 mb-2">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-emerald-900/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
