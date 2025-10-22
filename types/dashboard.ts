export interface DashboardData {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    domains: string[]
    credits: number
    matchingJobs: number
    createdAt: string
  }
  stats: {
    totalQuizzes: number
    averageScore: number
    bestScore: number
    streak: number
    level: number
  }
  recentQuizzes: Array<{
    id: string
    title: string
    technology: string[]
    type: string
    score: number
    duration?: number
    completedAt: string
    xp: number
  }>
  skills: Array<{
    id: string
    skill: string
    current: number
    target: number
  }>
  progress: Array<{
    date: string
    metric: string
    value: number
  }>
  recommendations: Array<{
    id: string
    title: string
    type: string
    priority: "LOW" | "MEDIUM" | "HIGH"
    description: string
    createdAt: string
  }>
}

export interface Mission {
  id: number
  title: string
  xp: number
  progress: number
  total: number
  type: "quiz" | "interview" | "skill"
}

export interface Achievement {
  id: number
  title: string
  icon: string
  unlocked: boolean
  rarity: "common" | "rare" | "epic" | "legendary"
}

export type UserRole = "ENTERPRISE" | "BOOTCAMP" | "SCHOOL" | "CANDIDATE" | "RECRUITER" | "CAREER_CHANGER"
