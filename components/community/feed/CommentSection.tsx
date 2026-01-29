"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface CommentSectionProps {
    postId: string
    comments: any[]
    onComment: (content: string) => Promise<void>
}

export function CommentSection({ postId, comments, onComment }: CommentSectionProps) {
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            await onComment(content)
            setContent("")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            {/* Comments List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
                            <AvatarImage src={comment.user?.imageUrl} alt={comment.user?.firstName} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                                {comment.user?.firstName?.[0]}{comment.user?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-2">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    {comment.user?.firstName} {comment.user?.lastName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                <Input
                    placeholder="Apportez votre conseil..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-10 text-sm focus-visible:ring-emerald-500"
                />
                <Button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    size="icon"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 w-10 flex-shrink-0"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            </form>
        </div>
    )
}
