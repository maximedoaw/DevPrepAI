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
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{title}</h4>
        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span className="text-emerald-600/80 dark:text-emerald-400/80">{score}% Réussite</span>
          <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
          <span className="text-slate-500">+{xp} XP</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-tighter whitespace-nowrap">{time}</span>
    </div>
  )
}
