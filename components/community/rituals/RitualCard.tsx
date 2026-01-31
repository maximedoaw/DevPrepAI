"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, Loader2, Check, X, Trash2, LogOut } from "lucide-react"
import { differenceInDays, addDays, isSameDay, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import { toggleDailyRitual, leaveRitual, deleteRitual } from "@/actions/community.action"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface RitualCardProps {
    ritual: any
    onJoin: (id: string) => Promise<void>
    onComplete: (id: string) => Promise<void>
    isLoading?: boolean
    isAdmin?: boolean
}

export function RitualCard({ ritual, onJoin, onComplete, isLoading, isAdmin }: RitualCardProps) {
    const queryClient = useQueryClient()
    const startDate = new Date(ritual.startDate)
    const endDate = new Date(ritual.endDate)
    const today = new Date()
    const isActive = today >= startDate && today <= endDate
    const isJoined = !!ritual.userParticipation

    // Calculate duration in days
    const duration = differenceInDays(endDate, startDate) + 1

    // Generate days array
    const days = Array.from({ length: duration }, (_, i) => {
        const date = addDays(startDate, i)
        const isToday = isSameDay(date, today)
        return {
            date,
            dayNumber: i + 1,
            isPast: date < startOfDay(today),
            isToday,
            isFuture: date > today && !isToday
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
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const { mutate: leave, isPending: isLeaving } = useMutation({
        mutationFn: async () => {
            const res = await leaveRitual(ritual.id)
            if (!res.success) throw new Error(res.error)
            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["circle", ritual.circleId] })
            toast.success("Vous avez quitté le défi")
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const { mutate: remove, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const res = await deleteRitual(ritual.id)
            if (!res.success) throw new Error(res.error)
            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["circle", ritual.circleId] })
            toast.success("Défi supprimé")
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
                        <div className="flex items-center gap-2">
                            {isActive && (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse">
                                    En cours
                                </Badge>
                            )}
                            {isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm("Voulez-vous vraiment supprimer ce défi ? Cette action est irréversible.")) {
                                            remove()
                                        }
                                    }}
                                    disabled={isDeleting}
                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Supprimer le défi"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </Button>
                            )}
                        </div>
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

                            {/* Scrollable container for days */}
                            <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-1 custom-scrollbar">
                                {days.map((day) => {
                                    const isCompletedDay = ritual.dailyCompletions?.some((c: any) => isSameDay(new Date(c.date), day.date))
                                    const canToggle = !day.isFuture

                                    return (
                                        <button
                                            key={day.dayNumber}
                                            onClick={() => canToggle && handleToggleDay(day.date)}
                                            disabled={!canToggle || isToggling}
                                            className={cn(
                                                "flex flex-col items-center justify-center w-12 h-16 shrink-0 rounded-xl border-2 transition-all relative overflow-hidden",
                                                isCompletedDay
                                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                                    : day.isToday
                                                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-800 text-emerald-700 dark:text-emerald-400"
                                                        : canToggle
                                                            ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-white dark:hover:bg-slate-700"
                                                            : "opacity-40 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-not-allowed grayscale"
                                            )}
                                        >
                                            {day.isToday && (
                                                <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500 rounded-t" />
                                            )}
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase",
                                                isCompletedDay ? "text-white/90" : day.isToday ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                                            )}>
                                                J{day.dayNumber}
                                            </span>
                                            <div className={cn(
                                                "h-6 w-6 rounded-full flex items-center justify-center mt-0.5",
                                                isCompletedDay
                                                    ? "bg-white/20"
                                                    : day.isToday
                                                        ? "bg-emerald-100 dark:bg-emerald-900/50"
                                                        : ""
                                            )}>
                                                {isCompletedDay ? <Check className="w-4 h-4" /> : null}
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
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rejoindre le défi"}
                            </Button>
                        ) : (
                            <div className="flex w-full gap-2">
                                <div className="flex-1 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 py-2">
                                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Continuez ! Chaque jour compte.</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Voulez-vous vraiment abandonner ce défi ? Vos progrès seront perdus.")) {
                                            leave()
                                        }
                                    }}
                                    disabled={isLeaving}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30 px-3 gap-1.5"
                                    title="Quitter le défi"
                                >
                                    {isLeaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                    <span className="hidden sm:inline">Quitter</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

