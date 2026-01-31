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
    <div className="border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

          {/* User Profile Section */}
          <div className="lg:col-span-6 flex items-center gap-6">
            <div className="relative flex-shrink-0 group">
              <div className="relative w-20 h-20 rounded-2xl p-0.5 bg-gradient-to-tr from-emerald-500/40 to-teal-400/40 shadow-sm overflow-hidden group-hover:rotate-2 transition-transform duration-500">
                <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center justify-center overflow-hidden relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 to-teal-500">
                      {firstName[0]}{lastName[0]}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 flex items-center justify-center min-w-[32px] h-8 px-2 rounded-xl bg-emerald-600 text-white text-[10px] font-black border-4 border-white dark:border-slate-950 shadow-md z-10 uppercase tracking-tighter">
                LVL {level}
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                Hello, <span className="text-emerald-600 dark:text-emerald-400">{firstName}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-sm opacity-80">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-center justify-start lg:justify-end gap-3 sm:gap-4 w-full">
            <div className="flex gap-2.5 items-center w-full sm:w-auto">
              {stats}
            </div>

            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="hidden sm:flex h-11 w-11 shrink-0 rounded-2xl border-slate-200 dark:border-white/10 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all hover:rotate-180 duration-500"
                title="Actualiser"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar Row */}
        <div className="mt-8 max-w-2xl">
          <ProgressBar level={level} progress={progress} label={progressLabel} />
        </div>
      </div>
    </div>
  )
}
