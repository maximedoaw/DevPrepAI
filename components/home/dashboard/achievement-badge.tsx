import { Award } from "lucide-react"

interface AchievementBadgeProps {
  icon: string
  title: string
  unlocked: boolean
  rarity: "common" | "rare" | "epic" | "legendary"
}

export function AchievementBadge({ icon, title, unlocked, rarity }: AchievementBadgeProps) {
  const getRarityColor = (rarity: AchievementBadgeProps["rarity"]): string => {
    const colors = {
      common: "bg-slate-500",
      rare: "bg-blue-500",
      epic: "bg-purple-500",
      legendary: "bg-yellow-500",
    }
    return colors[rarity]
  }

  return (
    <div
      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-3 transition-all cursor-pointer
        ${
          unlocked
            ? `${getRarityColor(rarity)} shadow-lg hover:scale-105`
            : "bg-slate-200 dark:bg-slate-800 opacity-50 grayscale"
        }`}
    >
      {unlocked && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <Award className="w-3 h-3 text-white" />
        </div>
      )}
      <span className="text-3xl mb-1">{icon}</span>
      <span
        className={`text-[10px] text-center font-medium leading-tight
        ${unlocked ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
      >
        {title}
      </span>
    </div>
  )
}
