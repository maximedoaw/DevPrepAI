"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getInterviewById } from "@/actions/interview.action"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Target, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import DevLoader from "@/components/dev-loader"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function TechnicalInterviewPage() {
  const params = useParams()
  const interviewId = params.id as string

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const { data: interview, isLoading } = useQuery({
    queryKey: ["interview", interviewId],
    queryFn: async () => {
      const result = await getInterviewById(interviewId)
      if (result && typeof result.questions === "string") {
        return {
          ...result,
          questions: JSON.parse(result.questions),
        }
      }
      return result
    },
  })

  // Initialize timer
  useEffect(() => {
    if (interview && !hasStarted) {
      setTimeLeft(interview.duration * 60)
      setTimeout(() => {
        setIsRunning(true)
        setHasStarted(true)
        toast.success("Interview démarrée ! Timer activé.")
      }, 1500)
    }
  }, [interview, hasStarted])

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false)
            toast.error("Temps écoulé !")
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleNext = () => {
    if (interview && currentExerciseIndex < interview.questions.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1)
      toast.success("Exercice suivant !")
    }
  }

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1)
    }
  }

  const handleComplete = () => {
    setIsRunning(false)
    toast.success("Interview terminée ! 🎉")
    // TODO: Save results
  }

  if (isLoading) {
    return <DevLoader />
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">Interview non trouvée</p>
            <Link href="/interviews">
              <Button className="mt-4">Retour aux interviews</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if it's a technical interview
  const isTechnical = interview.type === "TECHNICAL"

  if (!isTechnical) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Cette page est réservée aux interviews techniques
            </p>
            <Link href="/interviews">
              <Button className="mt-4">Retour aux interviews</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = interview.questions[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / interview.questions.length) * 100

  // Timer color based on time left
  const getTimerColor = () => {
    const percentage = (timeLeft / (interview.duration * 60)) * 100
    if (percentage <= 10) return "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
    if (percentage <= 30) return "text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
    return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-emerald-500/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/interviews">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline font-bold text-xs uppercase tracking-tight">Quitter</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {interview.title}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 text-[9px] font-black uppercase tracking-widest px-1.5 py-0 h-4">
                    Technique
                  </Badge>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {interview.company}
                  </p>
                </div>
              </div>
            </div>

            {/* Timer - Prominent Display */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 ${getTimerColor()}`}>
                <Clock className={`h-5 w-5 ${isRunning ? 'animate-pulse' : ''}`} />
                <span className="text-lg font-black font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Button
                onClick={handleComplete}
                className="bg-slate-900 dark:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest px-5 h-10 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-emerald-500/10"
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Terminer
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Exercice {currentExerciseIndex + 1} sur {interview.questions.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {Math.round(progress)}% complété
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content - Single Exercise */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden border-emerald-100 dark:border-emerald-900/30 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/20 dark:to-transparent border-b border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">
                  Exercice {currentExerciseIndex + 1}
                </p>
                <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentQuestion.question || currentQuestion.text || `Exercice ${currentExerciseIndex + 1}`}
                </CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg font-black text-[10px] px-2 py-1 uppercase tracking-widest border-none">
                  {interview.difficulty || "MEDIUM"}
                </Badge>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                  <Target className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {currentQuestion.points || 0} pts
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Énoncé */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Énoncé
              </label>
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {currentQuestion.question || currentQuestion.text || "Aucun énoncé disponible"}
                  </p>
                </div>
              </div>
            </div>

            {/* Résultat Attendu */}
            {(currentQuestion.expectedOutput || currentQuestion.correctAnswer) && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Résultat Attendu
                </label>
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
                  <pre className="text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                    {currentQuestion.expectedOutput || currentQuestion.correctAnswer}
                  </pre>
                </div>
              </div>
            )}

            {/* Code Template (if available) */}
            {(currentQuestion.codeTemplate || currentQuestion.codeSnippet) && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Template de Code
                </label>
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
                  <pre className="text-sm font-mono text-blue-400 overflow-x-auto whitespace-pre-wrap">
                    {currentQuestion.codeTemplate || currentQuestion.codeSnippet}
                  </pre>
                </div>
              </div>
            )}

            {/* Explanation (if available) */}
            {currentQuestion.explanation && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Explication
                </label>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
                  <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentExerciseIndex === 0}
            className="gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {currentExerciseIndex + 1} / {interview.questions.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentExerciseIndex === interview.questions.length - 1}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:bg-slate-300"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
