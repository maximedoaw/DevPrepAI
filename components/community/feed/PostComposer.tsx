"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MessageSquare, HelpCircle, AlertCircle, Trophy, Sparkles, Loader2, Send, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface PostComposerProps {
    circleId: string
    defaultType?: string
    onSubmit: (data: { type: string, content: string, isAnonymous: boolean }) => Promise<void>
}

export function PostComposer({ circleId, defaultType = "PROGRESS", onSubmit }: PostComposerProps) {
    const [content, setContent] = useState("")
    const [type, setType] = useState(defaultType)
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!content.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            await onSubmit({ type, content, isAnonymous })
            setContent("")
            setIsAnonymous(false)
            if (textareaRef.current) textareaRef.current.style.height = "auto"
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [content])

    const getTypeColor = () => {
        switch (type) {
            case "PROGRESS": return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
            case "BLOCKED": return "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
            case "QUESTION": return "text-blue-500 bg-blue-50 dark:bg-blue-500/10"
            case "RITUAL": return "text-purple-500 bg-purple-50 dark:bg-purple-500/10"
            default: return "text-slate-500 bg-slate-50 dark:bg-slate-500/10"
        }
    }

    return (
        <div className="sticky bottom-0 left-0 right-0 py-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 z-20 transition-all">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-2 pl-4 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        {/* Type Picker */}
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className={cn("w-auto border-none h-8 px-3 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-none focus:ring-0", getTypeColor())}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-[1.25rem] border-slate-200 dark:border-slate-800 shadow-2xl">
                                <SelectItem value="PROGRESS" className="rounded-lg">💪 Progrès</SelectItem>
                                <SelectItem value="BLOCKED" className="rounded-lg">🛑 Bloqué</SelectItem>
                                <SelectItem value="QUESTION" className="rounded-lg">❓ Question</SelectItem>
                                <SelectItem value="RITUAL" className="rounded-lg">✨ Rituel</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Anonymous Toggle */}
                        <div className="flex items-center gap-2 ml-auto pr-3">
                            <Label htmlFor="anon" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer">
                                {isAnonymous ? "Anonyme" : "Profil"}
                            </Label>
                            <Switch
                                id="anon"
                                checked={isAnonymous}
                                onCheckedChange={setIsAnonymous}
                                className="scale-75 data-[state=checked]:bg-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-2 pr-1">
                        <div className="flex-1 relative flex items-center">
                            <Textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    type === "PROGRESS" ? "Partagez votre réussite..." :
                                        type === "BLOCKED" ? "Où est-ce que ça bloque ?" :
                                            type === "QUESTION" ? "Posez votre question..." :
                                                "Prêt pour le rituel ?"
                                }
                                className="min-h-[40px] max-h-[150px] resize-none py-2 bg-transparent border-none focus-visible:ring-0 text-sm placeholder:text-slate-400 no-scrollbar"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!content.trim() || isSubmitting}
                            className={cn(
                                "w-10 h-10 rounded-full flex-shrink-0 transition-all",
                                content.trim() ? "bg-emerald-600 hover:bg-emerald-700 text-white scale-100" : "bg-slate-100 dark:bg-slate-800 text-slate-400 scale-90"
                            )}
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </div>
                </form>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2 font-medium tracking-wide">
                Appuyez sur <kbd className="font-sans px-1 bg-slate-100 dark:bg-slate-800 rounded">Entrée</kbd> pour partager instantanément
            </p>
        </div>
    )
}
