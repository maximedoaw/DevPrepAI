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
          <Crown className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Niveau {level}</span>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 opacity-80 uppercase tracking-wider">{label}</span>
      </div>
      <div className="relative h-2 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  )
}
