import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  gradient: string
  iconColor?: string
}

export function StatCard({ icon: Icon, label, value, gradient, iconColor = "text-white" }: StatCardProps) {
  return (
    <Card className={`flex-1 sm:flex-none ${gradient} border-0 shadow-lg`}>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`w-8 h-8 ${iconColor}`} />
        <div>
          <p className="text-white/80 text-xs font-medium">{label}</p>
          <p className="text-white text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
