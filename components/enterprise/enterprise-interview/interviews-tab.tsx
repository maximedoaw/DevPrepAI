"use client"

import { Video, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface InterviewsTabProps {
  onScheduleInterview?: () => void
}

export function InterviewsTab({ onScheduleInterview }: InterviewsTabProps) {
  return (
    <Card className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70 text-center py-12">
      <CardContent>
        <Video className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Gestion des entretiens
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Planifiez et gérez vos entretiens avec les candidats.
        </p>
        <Button className="bg-green-600 hover:bg-green-700" onClick={onScheduleInterview}>
          <Calendar className="w-4 h-4 mr-2" />
          Planifier un entretien
        </Button>
      </CardContent>
    </Card>
  )
}