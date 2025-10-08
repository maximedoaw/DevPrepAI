"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Target, Clock, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { formatDuration } from "@/lib/time-utils"

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
    <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
          {/* Left Section - Back Button & Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/interviews")} 
              className="hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg flex-shrink-0">
                <span className="text-base sm:text-lg text-white">💼</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">{interview.title}</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate">{interview.company}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <Badge className="border-0 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm">
                      {interview.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                      {interview.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Progress & Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 w-full lg:w-auto">
            {/* Progress */}
            <div className="text-center w-full sm:w-auto">
              <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question {currentQuestionIndex + 1} sur {totalQuestions}
              </div>
              <div className="w-full sm:w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-full sm:w-auto justify-center lg:justify-end">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(interview.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                <span>{interview.questions.length} questions</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
