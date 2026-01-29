import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MatchingProgressProps {
    progress: number
    isComplete: boolean
}

export function MatchingProgress({ progress, isComplete }: MatchingProgressProps) {
    return (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 shadow-lg">
            <CardContent className="p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            {isComplete ? (
                                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <Loader2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
                            )}
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {isComplete ? "Matching terminé !" : "Analyse IA en cours..."}
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {isComplete
                                ? "Les profils ont été analysés et classés avec succès"
                                : "Notre IA analyse les profils candidats pour trouver les meilleurs matchs"}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                Progression
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <Progress
                            value={progress}
                            className={cn(
                                "h-3 transition-all duration-500",
                                isComplete && "bg-emerald-100 dark:bg-emerald-900/30"
                            )}
                            indicatorClassName={cn(
                                "transition-all duration-500",
                                isComplete
                                    ? "bg-emerald-600 dark:bg-emerald-500"
                                    : "bg-gradient-to-r from-emerald-500 to-teal-500"
                            )}
                        />
                    </div>

                    {/* Status Steps */}
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className={cn(
                            "text-center p-3 rounded-lg transition-all",
                            progress >= 33
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                        )}>
                            <div className={cn(
                                "text-xs font-semibold uppercase tracking-wide mb-1",
                                progress >= 33 ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"
                            )}>
                                Récupération
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                {progress >= 33 ? "✓ Terminé" : "En cours..."}
                            </div>
                        </div>

                        <div className={cn(
                            "text-center p-3 rounded-lg transition-all",
                            progress >= 66
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                        )}>
                            <div className={cn(
                                "text-xs font-semibold uppercase tracking-wide mb-1",
                                progress >= 66 ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"
                            )}>
                                Analyse IA
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                {progress >= 66 ? "✓ Terminé" : progress >= 33 ? "En cours..." : "En attente"}
                            </div>
                        </div>

                        <div className={cn(
                            "text-center p-3 rounded-lg transition-all",
                            isComplete
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                        )}>
                            <div className={cn(
                                "text-xs font-semibold uppercase tracking-wide mb-1",
                                isComplete ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"
                            )}>
                                Sauvegarde
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                {isComplete ? "✓ Terminé" : progress >= 66 ? "En cours..." : "En attente"}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
