"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatTimeDetailed } from "@/lib/time-utils"
import { Trophy, ArrowLeft, RotateCcw, CheckCircle, Clock, Calendar, BarChart3, Eye, XCircle, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Badge } from "@/components/ui/badge"

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
  answers?: Record<string, any>
}

export function CompletionScreen({ interview, score, timeLeft, formatTime, answers = {} }: CompletionScreenProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (score >= 70) {
      setShowConfetti(true)
    }
  }, [score])

  const getScoreConfig = (score: number) => {
    if (score >= 90) return {
      message: "Excellent ! Vous maîtrisez parfaitement le sujet !",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      icon: Trophy
    }
    if (score >= 70) return {
      message: "Très bien ! Quelques points à améliorer.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      icon: CheckCircle
    }
    if (score >= 50) return {
      message: "Bon début ! Continuez à vous entraîner.",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      icon: BarChart3
    }
    return {
      message: "Continuez vos efforts, vous progressez !",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      icon: RotateCcw
    }
  }

  const config = getScoreConfig(score)
  const timeSpent = interview.duration * 60 - timeLeft

  // Replicate robust validation logic for display
  const isAnswerCorrect = (question: any, answer: any) => {
    if (question.type === 'multiple-choice' || question.type === 'multiple_choice') {
      const normalize = (val: any) => String(val).trim().toLowerCase()

      let expectedIndex: number | null = null
      let expectedText: string | null = null

      if (typeof question.correctAnswer === "number") {
        expectedIndex = question.correctAnswer
        expectedText = question.options && question.correctAnswer >= 0 && question.correctAnswer < question.options.length
          ? question.options[question.correctAnswer]
          : null
      } else if (typeof question.correctAnswer === "string") {
        expectedText = question.correctAnswer
        if (Array.isArray(question.options)) {
          const idx = question.options.findIndex((opt: string) => normalize(opt) === normalize(question.correctAnswer))
          if (idx >= 0) expectedIndex = idx
        }
        if (expectedIndex === null && !isNaN(Number(question.correctAnswer))) {
          const parsed = parseInt(question.correctAnswer, 10)
          if (question.options && parsed >= 0 && parsed < question.options.length) expectedIndex = parsed
        }
      }

      let userIndex: number | null = null
      let userText: string | null = null

      if (typeof answer === "number") {
        userIndex = answer
        userText = question.options?.[answer]
      } else if (typeof answer === "string") {
        userText = answer
        if (!isNaN(Number(answer))) userIndex = parseInt(answer, 10)
        if (Array.isArray(question.options)) {
          const idx = question.options.findIndex((opt: string) => normalize(opt) === normalize(answer))
          if (idx >= 0) userIndex = idx
        }
      }

      if (expectedIndex !== null && userIndex !== null) return expectedIndex === userIndex
      if (expectedText && userText) return normalize(expectedText) === normalize(userText)
      return normalize(answer) === normalize(question.correctAnswer)
    }
    return false
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="relative h-40 bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Trophy className="w-64 h-64 rotate-12 text-white" />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 text-center text-white"
            >
              <h1 className="text-3xl font-bold tracking-tight mb-2">Félicitations !</h1>
              <p className="text-emerald-100 font-medium bg-white/10 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm border border-white/20">
                Session terminée avec succès
              </p>
            </motion.div>
          </div>

          <CardContent className="px-6 py-8 sm:px-10">
            {/* Score Circle */}
            <div className="flex flex-col items-center justify-center -mt-20 mb-8 relative z-20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                className={cn(
                  "w-36 h-36 rounded-full flex items-center justify-center border-8 bg-white dark:bg-slate-800 shadow-xl",
                  score >= 70 ? "border-emerald-500 text-emerald-600" : "border-yellow-500 text-yellow-600"
                )}
              >
                <div className="text-center">
                  <span className="text-5xl font-extrabold tracking-tighter">{score}%</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-center space-y-1"
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <config.icon className={cn("w-6 h-6", config.color)} />
                  {config.message}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {interview.company} • {interview.title}
                </p>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <div className="mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {formatTimeDetailed(timeSpent)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Temps
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <div className="mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {interview.questions.length}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Questions
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <div className="mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">
                  +{Math.round(score / 10)} XP
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Gain
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Review Answers Button (Dialog) */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 text-base border-2 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all shadow-sm group"
                  >
                    <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Voir le détail des réponses
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-950 border-emerald-100 dark:border-emerald-900">
                  <DialogHeader className="p-6 pb-4 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10">
                    <DialogTitle className="text-xl flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Révision détaillée
                    </DialogTitle>
                    <DialogDescription className="text-emerald-600/80 dark:text-emerald-400/80">
                      Analysez vos réponses pour comprendre vos erreurs
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    <div className="p-6 space-y-8 pb-8">
                      {interview.questions.map((q, idx) => {
                        const userAnswer = answers[q.id]
                        const isCorrect = isAnswerCorrect(q, userAnswer)
                        const hasAnswered = userAnswer !== undefined && userAnswer !== null

                        let userIndex = -1
                        if (typeof userAnswer === "number") userIndex = userAnswer
                        else if (typeof userAnswer === "string" && !isNaN(Number(userAnswer))) userIndex = parseInt(userAnswer, 10)

                        let correctIndex = -1
                        if (typeof q.correctAnswer === "number") correctIndex = q.correctAnswer
                        else if (typeof q.correctAnswer === "string" && !isNaN(Number(q.correctAnswer))) correctIndex = parseInt(q.correctAnswer, 10)

                        return (
                          <div key={q.id} className="relative pl-8 group/item">
                            {/* Step Line */}
                            <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 -z-10 group-last/item:hidden" />

                            {/* Number Badge */}
                            <div className={cn(
                              "absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-slate-950 shadow-sm",
                              hasAnswered
                                ? isCorrect
                                  ? "bg-emerald-500 text-white"
                                  : "bg-red-500 text-white"
                                : "bg-slate-200 text-slate-500"
                            )}>
                              {isCorrect ? <Check className="w-3 h-3" /> : (hasAnswered ? <XCircle className="w-3 h-3" /> : idx + 1)}
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-lg text-slate-900 dark:text-white leading-snug">
                                  {q.question}
                                </h4>
                              </div>

                              {q.type === 'multiple-choice' && q.options && (
                                <div className="grid grid-cols-1 gap-2.5">
                                  {q.options.map((opt: string, optIdx: number) => {
                                    const isSelected = userIndex === optIdx
                                    const isTheCorrectAnswer = correctIndex === optIdx

                                    const variant = isTheCorrectAnswer
                                      ? "correct"
                                      : isSelected && !isTheCorrectAnswer
                                        ? "incorrect"
                                        : "default"

                                    return (
                                      <div key={optIdx} className={cn(
                                        "relative p-3.5 rounded-xl border-2 flex items-center gap-3.5 transition-all text-sm",
                                        variant === "correct" && "bg-emerald-50 border-emerald-500/30 dark:bg-emerald-900/20 dark:border-emerald-500/30",
                                        variant === "incorrect" && "bg-red-50 border-red-500/30 dark:bg-red-900/20 dark:border-red-500/30",
                                        variant === "default" && "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                      )}>
                                        <div className={cn(
                                          "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border shadow-sm",
                                          variant === "correct" && "bg-emerald-500 border-emerald-500 text-white",
                                          variant === "incorrect" && "bg-red-500 border-red-500 text-white",
                                          variant === "default" && "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                                        )}>
                                          {String.fromCharCode(65 + optIdx)}
                                        </div>
                                        <span className={cn(
                                          "flex-1 font-medium",
                                          variant === "correct" && "text-emerald-900 dark:text-emerald-100",
                                          variant === "incorrect" && "text-red-900 dark:text-red-100",
                                          variant === "default" && "text-slate-600 dark:text-slate-400"
                                        )}>
                                          {opt}
                                        </span>
                                        {variant === "correct" && <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-none">Bonne réponse</Badge>}
                                        {variant === "incorrect" && <Badge variant="destructive" className="shadow-none">Votre erreur</Badge>}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                              {q.explanation && (
                                <div className="mt-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 text-sm rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
                                  <div className="shrink-0 p-1 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                    <div className="text-lg">💡</div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-bold text-emerald-900 dark:text-emerald-100 text-xs uppercase tracking-wider">Explication</p>
                                    <p className="leading-relaxed opacity-90">{q.explanation}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
                    <Button variant="outline" onClick={() => document.querySelector('[data-state="open"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))} className="border-slate-200 hover:bg-slate-100 text-slate-600">Fermer</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/interviews")}
                  className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-100 text-slate-600 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button
                  size="lg"
                  onClick={() => window.location.reload()}
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
