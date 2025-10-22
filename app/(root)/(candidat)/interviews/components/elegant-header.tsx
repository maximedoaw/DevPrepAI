"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Play, Pause, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { getTimeDisplayProps } from "@/lib/time-utils"

interface ElegantHeaderProps {
  interview: {
    id: string
    title: string
    company: string
    difficulty: string
    type: string
    duration: number
  }
  timeLeft: number
  isRunning: boolean
  formatTime: (seconds: number) => string
  onStartTimer?: () => void
  onPauseTimer?: () => void
  currentQuestionIndex: number
  totalQuestions: number
}

export function ElegantHeader({ 
  interview, 
  timeLeft, 
  isRunning, 
  formatTime, 
  onStartTimer, 
  onPauseTimer,
  currentQuestionIndex,
  totalQuestions
}: ElegantHeaderProps) {
  const router = useRouter()
  const timeDisplay = getTimeDisplayProps(timeLeft)
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Navigation & Title */}
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/")} 
              className="hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <span className="text-lg text-white">💼</span>
              </div>
              <div>
                <h1 className="font-semibold text-lg text-gray-900 dark:text-white">{interview.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{interview.company}</span>
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

          {/* Center Section - Progress */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question {currentQuestionIndex + 1} sur {totalQuestions}
              </div>
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Section - Timer & Controls */}
          <div className="flex items-center gap-4">
            {/* Timer Display */}
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${timeDisplay.isCritical ? 'bg-red-100 dark:bg-red-900/30' : timeDisplay.isUrgent ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                <Clock className={`h-4 w-4 ${timeDisplay.isCritical ? 'text-red-600 dark:text-red-400' : timeDisplay.isUrgent ? 'text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`} />
              </div>
              <div className="text-right">
                <div className={`font-mono text-lg font-semibold ${timeDisplay.colorClass}`}>
                  {timeDisplay.formatted}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {timeDisplay.isCritical ? 'Temps critique' : timeDisplay.isUrgent ? 'Temps limité' : 'Temps restant'}
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            {onStartTimer && onPauseTimer && (
              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <Button 
                    size="sm" 
                    onClick={onStartTimer} 
                    disabled={timeLeft === 0}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Démarrer
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onPauseTimer}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
              </div>
            )}

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {isRunning ? "En cours" : "Arrêté"}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Question {currentQuestionIndex + 1} sur {totalQuestions}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
