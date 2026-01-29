"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Target, ArrowRight, Clock, Sparkles, Code, Palette, Database } from "lucide-react"
import { cn } from "@/lib/utils"

interface CircleCardProps {
    circle: {
        id: string
        name: string
        description?: string | null
        targetCareer: string
        level: string
        maxMembers: number
        duration: number
        startDate: Date | string
        endDate?: Date | string | null
        status: string
        _count?: {
            members: number
            posts: number
        }
    }
    onJoin?: (id: string) => void
    onViewDetails?: (id: string) => void
    isMember?: boolean
}

export function CircleCard({ circle, onJoin, onViewDetails, isMember }: CircleCardProps) {
    const memberCount = circle._count?.members || 0
    const postCount = circle._count?.posts || 0
    // If maxMembers is null/0, it's unlimited, so it's never full
    const isFull = circle.maxMembers ? (circle.maxMembers - memberCount <= 0) : false

    const startDate = new Date(circle.startDate)
    const endDate = circle.endDate ? new Date(circle.endDate) : null
    const daysLeft = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

    return (
        <Card className="h-full rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 group border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
            <CardContent className="p-7 flex flex-col h-full relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>

                {/* Header */}
                <div className="flex items-start gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-700/30 shadow-sm shrink-0 overflow-hidden">
                        {(circle as any).imageUrl ? (
                            <img src={(circle as any).imageUrl} alt={circle.name} className="w-full h-full object-cover" />
                        ) : (
                            circle.name.includes("Dev") ? <Code className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> :
                                circle.name.includes("Design") ? <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" /> :
                                    circle.name.includes("Data") ? <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" /> :
                                        <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold tracking-tight">
                                {circle.level}
                            </Badge>
                            {isMember && (
                                <Badge className="bg-blue-500 text-white border-none text-[10px]">Membre</Badge>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">
                            {circle.name}
                        </h3>
                    </div>
                </div>

                {/* Info Pills */}
                <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                        <Target className="w-3.5 h-3.5 text-blue-500" />
                        {circle.targetCareer}
                    </div>
                    {daysLeft > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                            <Clock className="w-3.5 h-3.5" />
                            {daysLeft}j restants
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="flex-1 min-h-[60px] relative z-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {circle.description || "Un espace d'entraide pour réussir votre transition ensemble."}
                    </p>
                </div>

                {/* Footer Stats & Actions */}
                <div className="mt-8 space-y-4 relative z-10">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400 overflow-hidden">
                                        <Users className="w-3 h-3" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {memberCount}{circle.maxMembers ? `/${circle.maxMembers}` : ""} <span className="text-slate-400 font-normal ml-1">inscrits</span>
                            </span>
                        </div>
                        {isFull && !isMember && circle.maxMembers && (
                            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold uppercase">Complet</span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {isMember ? (
                            <Button
                                onClick={() => onViewDetails?.(circle.id)}
                                className="flex-1 h-12 rounded-[1.25rem] bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-[1.02] transition-all"
                            >
                                Ouvrir l'espace
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => onJoin?.(circle.id)}
                                disabled={isFull || circle.status !== "ACTIVE"}
                                className="flex-1 h-12 rounded-[1.25rem] bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white font-bold transition-all disabled:opacity-50"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Rejoindre
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
