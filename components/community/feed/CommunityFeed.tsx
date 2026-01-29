"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getPosts, createPost, addReaction, addComment, getAllPosts } from "@/actions/community.action"
import { PostComposer } from "./PostComposer"
import { PostCard } from "./PostCard"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"

interface CommunityFeedProps {
    circleId: string
    filterType?: "FEED" | "QUESTIONS"
}

export function CommunityFeed({ circleId, filterType = "FEED" }: CommunityFeedProps) {
    const queryClient = useQueryClient()
    const { user } = useKindeBrowserClient()

    const { data: posts, isLoading } = useQuery({
        queryKey: ["posts", circleId, filterType],
        queryFn: async () => {
            if (circleId === "all") {
                const res = await getAllPosts()
                return res.success ? res.data : []
            }
            // For FEED tab: hide questions
            // For QUESTIONS tab: show ONLY questions
            const type = filterType === "QUESTIONS" ? "QUESTION" : undefined
            const excludeType = filterType === "FEED" ? "QUESTION" : undefined

            const res = await getPosts(circleId, type, excludeType)
            return res.success ? res.data : []
        },
    })

    const createMutation = useMutation({
        mutationFn: (data: { type: string, content: string, isAnonymous: boolean }) =>
            createPost({ circleId, ...data }),
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Publication partagée !")
                queryClient.invalidateQueries({ queryKey: ["posts", circleId] }) // Invalidate all post queries for this circle
                if (circleId !== "all") queryClient.invalidateQueries({ queryKey: ["posts", "all"] })
            } else {
                toast.error(res.error || "Erreur lors de la publication")
            }
        }
    })

    const reactMutation = useMutation({
        mutationFn: ({ postId, type }: { postId: string, type: string }) => addReaction(postId, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts", circleId] })
        }
    })

    const commentMutation = useMutation({
        mutationFn: ({ postId, content }: { postId: string, content: string }) => addComment(postId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts", circleId] })
            toast.success("Commentaire ajouté !")
        }
    })

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-[200px] w-full rounded-2xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {circleId !== "all" && (
                <PostComposer
                    circleId={circleId}
                    defaultType={filterType === "QUESTIONS" ? "QUESTION" : "PROGRESS"}
                    onSubmit={async (data) => {
                        await createMutation.mutateAsync(data)
                    }}
                />
            )}

            <div className="space-y-4">
                {posts && posts.length > 0 ? (
                    posts.map((post: any) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={user?.id}
                            onReact={async (type) => {
                                await reactMutation.mutateAsync({ postId: post.id, type })
                            }}
                            onComment={async (content) => {
                                await commentMutation.mutateAsync({ postId: post.id, content })
                            }}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500 font-medium">Aucune publication pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
