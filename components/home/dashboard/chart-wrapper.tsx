import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface ChartWrapperProps {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}

export function ChartWrapper({ icon: Icon, title, description, children }: ChartWrapperProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="w-6 h-6 text-green-500" />
          <CardTitle className="text-slate-900 dark:text-white">{title}</CardTitle>
        </div>
        <CardDescription className="dark:text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
