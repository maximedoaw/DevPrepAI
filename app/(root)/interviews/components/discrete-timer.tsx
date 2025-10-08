"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTimeDisplayProps } from "@/lib/time-utils"

interface DiscreteTimerProps {
  timeLeft: number
  isRunning: boolean
  onStartTimer?: () => void
  onPauseTimer?: () => void
}

export function DiscreteTimer({ timeLeft, isRunning, onStartTimer, onPauseTimer }: DiscreteTimerProps) {
  const timeDisplay = getTimeDisplayProps(timeLeft)

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
      <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-200 ${
        timeDisplay.isCritical 
          ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700" 
          : timeDisplay.isUrgent 
            ? "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
            : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700"
      }`}>
        <Clock className={`h-3 w-3 sm:h-4 sm:w-4 ${
          timeDisplay.isCritical 
            ? "text-red-600 dark:text-red-400" 
            : timeDisplay.isUrgent 
              ? "text-orange-600 dark:text-orange-400"
              : "text-slate-600 dark:text-slate-400"
        }`} />
        
        <span className={`font-mono text-xs sm:text-sm font-semibold ${timeDisplay.colorClass}`}>
          {timeDisplay.formatted}
        </span>

        {onStartTimer && onPauseTimer && (
          <Button
            size="sm"
            variant="ghost"
            onClick={isRunning ? onPauseTimer : onStartTimer}
            disabled={timeLeft === 0}
            className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 hidden sm:flex"
          >
            {isRunning ? (
              <Pause className="h-2 w-2 sm:h-3 sm:w-3" />
            ) : (
              <Play className="h-2 w-2 sm:h-3 sm:w-3" />
            )}
          </Button>
        )}

        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
          isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        }`} />
      </div>
    </div>
  )
}
