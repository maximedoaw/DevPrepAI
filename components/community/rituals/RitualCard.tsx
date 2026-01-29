"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, CheckCircle2, ArrowRight, Loader2, Check } from "lucide-react"
import { format, differenceInDays, addDays, isSameDay, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toggleDailyRitual } from "@/actions/community.action"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface RitualCardProps {
    ritual: any
    onJoin: (id: string) => Promise<void>
    onComplete: (id: string) => Promise<void>
    isLoading?: boolean
}

export function RitualCard({ ritual, onJoin, onComplete, isLoading }: RitualCardProps) {
    const queryClient = useQueryClient()
    const startDate = new Date(ritual.startDate)
    const endDate = new Date(ritual.endDate)
    const today = new Date()
    const isActive = today >= startDate && today <= endDate
    const isCompleted = ritual.userParticipation?.status === "COMPLETED" // Check updated status logic if needed
    const isJoined = !!ritual.userParticipation

    // Calculate duration in days
    const duration = differenceInDays(endDate, startDate) + 1

    // Generate days array
    const days = Array.from({ length: duration }, (_, i) => {
        const date = addDays(startDate, i)
        return {
            date,
            dayNumber: i + 1,
            isPast: date < startOfDay(today), // Strict past
            isToday: isSameDay(date, today),
            isFuture: date > today
        }
    })

    const { mutate: toggleDay, isPending: isToggling } = useMutation({
        mutationFn: async (date: Date) => {
            const res = await toggleDailyRitual(ritual.id, date)
            if (!res.success) throw new Error(res.error)
            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["circle", ritual.circleId] })
            toast.success("Progression mise à jour")
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const handleToggleDay = (date: Date) => {
        if (!isJoined) return
        toggleDay(date)
    }

    // Calculate progress
    const completedCount = ritual.dailyCompletions?.length || 0
    const progressPercent = Math.round((completedCount / duration) * 100)

    return (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Trophy className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                    {ritual.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{duration} Jours</span>
                                    <span>•</span>
                                    <Users className="w-3 h-3" />
                                    <span>{ritual._count?.participations || 0} participants</span>
                                </div>
                            </div>
                        </div>
                        {isActive && (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse">
                                En cours
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 italic border-l-2 border-purple-200 pl-3">
                        "{ritual.description}"
                    </p>

                    {/* Daily Progress Checklist */}
                    {isJoined && (
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Votre progression
                                </label>
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    {progressPercent}%
                                </span>
                            </div>

                            {/* Scrollable container for days if many */}
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mask-gradient-right">
                                {days.map((day) => {
                                    const isCompletedDay = ritual.dailyCompletions?.some((c: any) => isSameDay(new Date(c.date), day.date))
                                    const canToggle = !day.isFuture // Allow toggling past days? Yes, catch up.

                                    return (
                                        <button
                                            key={day.dayNumber}
                                            onClick={() => canToggle && handleToggleDay(day.date)}
                                            disabled={!canToggle || isToggling}
                                            className={cn(
                                                "flex flex-col items-center justify-center w-12 h-14 shrink-0 rounded-xl border transition-all relative overflow-hidden",
                                                isCompletedDay
                                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                                                    : canToggle
                                                        ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-300 dark:hover:border-emerald-700"
                                                        : "opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 cursor-not-allowed"
                                            )}
                                        >
                                            <span className="text-[10px] font-medium uppercase opacity-80">J{day.dayNumber}</span>
                                            <div className="h-5 flex items-center justify-center">
                                                {isCompletedDay ? <Check className="w-4 h-4" /> : <div className="w-3 h-3 rounded-full border-2 border-current opacity-30" />}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {!isJoined ? (
                            <Button
                                onClick={() => onJoin(ritual.id)}
                                disabled={isLoading}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rejoindre le défi"}
                            </Button>
                        ) : (
                            <div className="w-full text-center text-xs text-slate-400">
                                Continuez comme ça ! Chaque jour compte.
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
