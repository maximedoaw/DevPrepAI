import { Card, CardContent } from "@/components/ui/card"
import { UserStats } from "@/constants"
import { Trophy, TrendingUp, Clock, Zap } from "lucide-react"

interface DashboardStatsProps {
  stats: UserStats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Interviews Complétées",
      value: stats.completedInterviews,
      icon: Trophy,
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      change: "+12%",
    },
    {
      title: "Score Moyen",
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      change: "+5%",
    },
    {
      title: "Temps Total",
      value: `${Math.floor(stats.totalTime / 60)}h ${stats.totalTime % 60}m`,
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
      change: "+2h",
    },
    {
      title: "Série Actuelle",
      value: `${stats.streak} jours`,
      icon: Zap,
      gradient: "from-orange-500 to-red-500",
      bg: "bg-orange-50",
      change: "🔥",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
