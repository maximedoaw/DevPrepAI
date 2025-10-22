interface RecommendationCardProps {
  title: string
  description: string
  priority: "LOW" | "MEDIUM" | "HIGH"
}

export function RecommendationCard({ title, description, priority }: RecommendationCardProps) {
  const getPriorityColor = (priority: string): string => {
    const colors = {
      HIGH: "bg-red-500",
      MEDIUM: "bg-yellow-500",
      LOW: "bg-green-500",
    }
    return colors[priority as keyof typeof colors] || "bg-slate-500"
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
      <div className={`w-3 h-3 rounded-full mt-1.5 ${getPriorityColor(priority)}`}></div>
      <div className="flex-1">
        <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">{title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{description}</p>
      </div>
    </div>
  )
}
