import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { LucideIcon } from "lucide-react"

interface MissionCardProps {
  icon: LucideIcon
  title: string
  xp: number
  progress: number
  total: number
}

export function MissionCard({ icon: Icon, title, xp, progress, total }: MissionCardProps) {
  return (
    <div className="group p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors uppercase tracking-tight text-sm">
              {title}
            </h4>
            <Badge className="bg-emerald-500 text-white border-0 ml-2 rounded-lg text-[10px] font-black tracking-widest px-2 py-0.5">+{xp} XP</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">Progression</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {progress} / {total}
              </span>
            </div>
            <Progress value={(progress / total) * 100} className="h-1" indicatorClassName="bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
