"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, Share2, MoreVertical, ThumbsUp, Lightbulb, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ReactionBar } from "./ReactionBar"
import { CommentSection } from "./CommentSection"

interface PostCardProps {
    post: any
    currentUserId?: string
    onReact: (type: string) => Promise<void>
    onComment: (content: string) => Promise<void>
    onDelete?: () => Promise<void>
}

export function PostCard({ post, currentUserId, onReact, onComment, onDelete }: PostCardProps) {
    const [showComments, setShowComments] = useState(false)

    const isAuthor = post.userId === currentUserId
    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "PROGRESS": return { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", label: "Progrès" }
            case "BLOCKED": return { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", label: "Bloqué" }
            case "QUESTION": return { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", label: "Question" }
            case "RITUAL": return { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-400", label: "Rituel" }
            default: return { bg: "bg-slate-50", text: "text-slate-700", label: "Post" }
        }
    }

    const styles = getTypeStyles(post.type)

    return (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden mb-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardContent className="p-5 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-slate-100 dark:border-slate-800">
                            {post.isAnonymous ? (
                                <div className="bg-slate-200 dark:bg-slate-800 flex items-center justify-center w-full h-full text-slate-500">
                                    <span className="text-sm font-bold">🎭</span>
                                </div>
                            ) : (
                                <>
                                    <AvatarImage src={post.user?.imageUrl} alt={post.user?.firstName} />
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold uppercase">
                                        {post.user?.firstName?.[0]}{post.user?.lastName?.[0]}
                                    </AvatarFallback>
                                </>
                            )}
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {post.isAnonymous ? "Membre anonyme" : `${post.user?.firstName} ${post.user?.lastName}`}
                                </span>
                                <Badge variant="secondary" className={cn("text-[10px] px-1.5 h-4 font-medium", styles.bg, styles.text)}>
                                    {styles.label}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-xs text-slate-400">{timeAgo}</p>
                                {post.circle && (
                                    <>
                                        <span className="text-slate-300 dark:text-slate-600">•</span>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                            {post.circle.name}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 -mt-1 -mr-2">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </p>
                </div>

                {/* Action bar and stats */}
                <div className="flex flex-col gap-4 border-t border-slate-50 dark:border-slate-800 pt-4">
                    <div className="flex items-center justify-between">
                        <ReactionBar
                            postId={post.id}
                            reactions={post.reactions}
                            onReact={onReact}
                            counts={post._count?.reactions || 0}
                        />

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-emerald-600 h-8 gap-2"
                            onClick={() => setShowComments(!showComments)}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-medium">{post._count?.comments || 0} conseils</span>
                        </Button>
                    </div>

                    {/* Comment input quick view or section */}
                    {showComments && (
                        <CommentSection
                            postId={post.id}
                            comments={post.comments}
                            onComment={onComment}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
