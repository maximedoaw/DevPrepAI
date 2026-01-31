import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  gradient: string
  iconColor?: string
}

export function StatCard({ icon: Icon, label, value, gradient, iconColor }: StatCardProps) {
  return (
    <Card className="flex-1 sm:flex-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <CardContent className="p-4 flex items-center gap-4 relative">
        <div className={cn(
          "p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-500",
          gradient === "bg-emerald-500" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
            gradient === "bg-teal-500" ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" :
              "bg-green-500/10 text-green-600 dark:text-green-400"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-slate-900 dark:text-white text-lg font-black tracking-tight">{value}</p>
        </div>

        {/* Subtle decorative dot */}
        <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-emerald-500/20" />
      </CardContent>
    </Card>
  )
}
