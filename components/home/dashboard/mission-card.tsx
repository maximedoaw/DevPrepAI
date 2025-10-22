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
    <div className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
              {title}
            </h4>
            <Badge className="bg-yellow-400 text-yellow-900 border-0 ml-2">+{xp} XP</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Avancement</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {progress}/{total}
              </span>
            </div>
            <Progress value={(progress / total) * 100} className="h-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
