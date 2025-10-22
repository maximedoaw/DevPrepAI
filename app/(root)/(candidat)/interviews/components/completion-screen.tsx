"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatTimeDetailed } from "@/lib/time-utils"
import { Trophy, ArrowLeft, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

interface CompletionScreenProps {
  interview: {
    title: string
    company: string
    questions: any[]
    duration: number
  }
  score: number
  timeLeft: number
  formatTime: (seconds: number) => string
}

export function CompletionScreen({ interview, score, timeLeft, formatTime }: CompletionScreenProps) {
  const router = useRouter()

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "🎉 Excellent ! Vous maîtrisez parfaitement le sujet !"
    if (score >= 80) return "🚀 Très bien ! Quelques points à améliorer."
    if (score >= 60) return "👍 Bon travail ! Continuez à vous entraîner."
    return "💪 Continuez vos efforts, vous progressez !"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50 -m-6 mb-6 p-6 rounded-t-lg">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-fit">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Interview Terminée !
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            "{interview.title}" - {interview.company}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {score}%
            </div>
            <Progress value={score} className="h-4 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">{getScoreMessage(score)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200/50 dark:border-slate-600/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{interview.questions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTimeDetailed(interview.duration * 60 - timeLeft)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Temps utilisé</div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => router.push("/")} variant="outline" className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Refaire
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
