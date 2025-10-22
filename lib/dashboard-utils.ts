import { Brain, Code, Video } from "lucide-react"

export function getTypeIcon(type: string) {
  const icons = {
    quiz: Brain,
    interview: Video,
    skill: Code,
  }
  return icons[type as keyof typeof icons] || Brain
}

export function getActivityBgColor(type: string): string {
  const colors = {
    quiz: "bg-blue-500",
    interview: "bg-purple-500",
    skill: "bg-green-500",
  }
  return colors[type as keyof typeof colors] || "bg-slate-500"
}

export function calculateStreakFromDates(completedDates: Date[]): number {
  if (!completedDates || completedDates.length === 0) return 0
  let streak = 0
  let currentDate = new Date()
  for (let i = 0; i < completedDates.length; i++) {
    const quizDate = new Date(completedDates[i])
    const diffTime = Math.abs(currentDate.getTime() - quizDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays <= 1) {
      streak++
      currentDate = quizDate
    } else {
      break
    }
  }
  return Math.min(streak, 7)
}

export function calculateUserLevel(totalQuizzes: number, averageScore: number): number {
  const baseLevel = Math.floor(totalQuizzes / 3)
  const scoreBonus = Math.floor(averageScore / 25)
  return Math.max(1, baseLevel + scoreBonus)
}
