import type { LucideIcon } from "lucide-react"

interface ActivityItemProps {
  icon: LucideIcon
  title: string
  score: number
  xp: number
  time: string
  bgColor: string
}

export function ActivityItem({ icon: Icon, title, score, xp, time, bgColor }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shadow-lg text-white`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{title}</h4>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <span>Score : {score}%</span>
          <span>•</span>
          <span className="text-yellow-600 dark:text-yellow-500 font-semibold">+{xp} XP</span>
        </div>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-500">{time}</span>
    </div>
  )
}
