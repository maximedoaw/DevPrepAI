"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TechnicalQuestion {
    id: string
    question: string
    expectedOutput?: string
    correctAnswer?: string
    codeTemplate?: string
    codeSnippet?: string
    explanation?: string
    points?: number
    type?: string
}

interface TechnicalViewProps {
    question: TechnicalQuestion
    currentIndex: number
    totalQuestions: number
    onNext: () => void
    onPrevious: () => void
    isSaving?: boolean
    difficulty?: string
    timeLeft: number
    formatTime: (seconds: number) => string
}

export function TechnicalView({
    question,
    currentIndex,
    totalQuestions,
    onNext,
    onPrevious,
    isSaving = false,
    difficulty = "MEDIUM",
    timeLeft,
    formatTime
}: TechnicalViewProps) {
    const getDifficultyColor = (diff: string) => {
        switch (diff.toUpperCase()) {
            case "JUNIOR":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            case "MID":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            case "SENIOR":
                return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
            default:
                return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
        }
    }

    const getTimerColor = () => {
        const percentage = (timeLeft / (60 * 60)) * 100
        if (percentage <= 10) return "text-rose-600 dark:text-rose-400"
        if (percentage <= 30) return "text-amber-600 dark:text-amber-400"
        return "text-emerald-600 dark:text-emerald-400"
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header with Timer */}
                <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Question {currentIndex + 1} sur {totalQuestions}
                            </span>
                            <Badge className={cn("text-xs font-medium", getDifficultyColor(difficulty))}>
                                {difficulty}
                            </Badge>
                            {question.points && (
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {question.points} pts
                                </span>
                            )}
                        </div>

                        {/* Timer */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Clock className={cn("w-4 h-4", getTimerColor())} />
                            <span className={cn("text-sm font-mono font-semibold", getTimerColor())}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                    >
                        {/* Question */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white leading-relaxed">
                                {question.question}
                            </h2>
                        </div>

                        {/* Expected Output */}
                        {(question.expectedOutput || question.correctAnswer) && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50">
                                    <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                        Résultat attendu
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                        <pre className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                                            {question.expectedOutput || question.correctAnswer}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Code Template */}
                        {(question.codeTemplate || question.codeSnippet) && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50">
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                        Template de code
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                        <pre className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                                            {question.codeTemplate || question.codeSnippet}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Explanation */}
                        {question.explanation && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/50">
                                    <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                        Explication
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {question.explanation}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 p-4 sm:relative sm:mt-8 sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={onPrevious}
                            disabled={currentIndex === 0 || isSaving}
                            className="disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Précédent
                        </Button>

                        <Button
                            onClick={onNext}
                            disabled={isSaving}
                            className={cn(
                                "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50",
                                !isSaving && "hover:shadow-lg hover:shadow-emerald-500/20"
                            )}
                        >
                            {currentIndex === totalQuestions - 1 ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Terminer
                                </>
                            ) : (
                                <>
                                    Suivant
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Spacer for fixed footer on mobile */}
                <div className="h-20 sm:hidden" />
            </div>
        </div>
    )
}
