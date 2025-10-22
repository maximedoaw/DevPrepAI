"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { ReactNode } from "react"
import { ProgressBar } from "./progress-bar"

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
}: DashboardHeaderProps) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {firstName[0]}
                {lastName[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                <span className="text-xs font-bold text-white">{level}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bienvenue, {firstName}</h1>
              <p className="text-slate-600 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="hidden sm:flex bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            )}
            <div className="flex gap-3">{stats}</div>
          </div>
        </div>

        <ProgressBar level={level} progress={progress} label={progressLabel} />
      </div>
    </div>
  )
}
