import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: string
}

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`${color} bg-gray-100 p-3 rounded-full`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
