"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

interface JobOffer {
  id: string
  applicants: number
  status: 'active' | 'paused' | 'closed'
}

interface Quiz {
  id: string
}

interface QuickStatsProps {
  jobOffers: JobOffer[]
  quizzes: Quiz[]
}

export function QuickStats({ jobOffers, quizzes }: QuickStatsProps) {
  const activeOffers = jobOffers.filter(offer => offer.status === 'active').length
  const totalApplicants = jobOffers.reduce((acc, offer) => acc + offer.applicants, 0)

  return (
    <Card className="mt-6 border border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/80 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-white">
          <Zap className="w-5 h-5 text-green-600" />
          Statistiques
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">Offres actives</span>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            {activeOffers}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">Total candidats</span>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            {totalApplicants}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">Tests créés</span>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            {quizzes.length}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}