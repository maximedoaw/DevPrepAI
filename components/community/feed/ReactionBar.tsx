"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Sparkles, Lightbulb, CheckCircle2, Heart } from "lucide-react"

interface ReactionBarProps {
    postId: string
    reactions: any[]
    onReact: (type: string) => Promise<void>
    counts: number
}

const REACTION_TYPES = [
    { type: "ENCOURAGEMENT", icon: Sparkles, label: "Encouragement", emoji: "👏", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { type: "ADVICE", icon: Lightbulb, label: "Conseil", emoji: "💡", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { type: "VALIDATION", icon: CheckCircle2, label: "Validation", emoji: "✅", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { type: "SUPPORT", icon: Heart, label: "Soutien", emoji: "❤️", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
]

export function ReactionBar({ postId, reactions, onReact, counts }: ReactionBarProps) {
    // Simple summary of emoji counts
    const reactionCounts = reactions.reduce((acc: any, r: any) => {
        acc[r.type] = (acc[r.type] || 0) + 1
        return acc
    }, {})

    return (
        <div className="flex items-center gap-1.5">
            <TooltipProvider>
                {REACTION_TYPES.map((reaction) => {
                    const count = reactionCounts[reaction.type] || 0
                    return (
                        <Tooltip key={reaction.type}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onReact(reaction.type)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2 py-1 rounded-full transition-all hover:scale-105 active:scale-95",
                                        count > 0 ? reaction.bg : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <reaction.icon className={cn("w-4 h-4", count > 0 ? reaction.color : "text-slate-400")} />
                                    {count > 0 && (
                                        <span className={cn("text-xs font-bold", reaction.color)}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p className="text-xs">{reaction.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                })}
            </TooltipProvider>
        </div>
    )
}
