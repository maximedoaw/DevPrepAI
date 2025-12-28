"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { ReactNode } from "react"
import { ProgressBar } from "./progress-bar"
import type { UserRole } from "@/types/dashboard"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  firstName: string
  lastName: string
  subtitle: string
  level: number
  progress: number
  progressLabel: string
  stats: ReactNode
  onRefresh?: () => void
  isRefreshing?: boolean
  userRole?: UserRole
  imageUrl?: string
}

export function DashboardHeader({
  firstName,
  lastName,
  subtitle,
  level,
  progress,
  progressLabel,
  stats,
  onRefresh,
  isRefreshing,
  userRole,
  imageUrl
}: DashboardHeaderProps) {
  // Only display for candidates or career changers
  if (userRole && userRole !== "CANDIDATE" && userRole !== "CAREER_CHANGER") {
    return null;
  }

  return (
    <div className="border-b border-emerald-100 dark:border-emerald-900/30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

          {/* User Profile Section - Spans 12 cols on mobile, 5 on lg */}
          <div className="lg:col-span-5 flex items-center gap-5">
            <div className="relative flex-shrink-0 group cursor-pointer">
              <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-400 shadow-xl overflow-hidden">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 to-teal-600">
                      {firstName[0]}{lastName[0]}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-xs font-bold border-4 border-white dark:border-slate-950 shadow-sm z-10">
                {level}
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Bonjour, <span className="text-emerald-600 dark:text-emerald-400">{firstName}</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Stats & Actions - Spans 12 cols on mobile, 7 on lg */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center justify-start lg:justify-end gap-4 sm:gap-6 w-full overflow-x-auto pb-2 sm:pb-0">
            <div className="flex gap-3 items-center min-w-max">
              {stats}
            </div>

            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="hidden sm:flex h-10 w-10 shrink-0 rounded-full border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all"
                title="Actualiser les données"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar Row */}
        <div className="mt-8">
          <ProgressBar level={level} progress={progress} label={progressLabel} />
        </div>
      </div>
    </div>
  )
}
