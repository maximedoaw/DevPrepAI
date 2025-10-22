import { Crown } from "lucide-react"

interface ProgressBarProps {
  level: number
  progress: number
  label: string
}

export function ProgressBar({ level, progress, label }: ProgressBarProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Niveau {level}</span>
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <div className="relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
