"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCircleDetails, joinRitual, completeRitual } from "@/actions/community.action"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Users, Calendar, Target, MessageCircle, HelpCircle, Trophy, Hash, Info, Plus } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { CommunityFeed } from "@/components/community/feed/CommunityFeed"
import { CircleChat } from "@/components/community/circles/CircleChat"
import { RitualCard } from "@/components/community/rituals/RitualCard"
import { CreateRitualModal } from "@/components/community/rituals/CreateRitualModal"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"

interface CircleDetailsViewProps {
    circleId: string
}

export function CircleDetailsView({ circleId }: CircleDetailsViewProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const queryClient = useQueryClient()
    const { user } = useKindeBrowserClient()

    // Local state for tabs to prevent page refresh, initialized from URL or default
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "chat")
    const [isCreateRitualOpen, setIsCreateRitualOpen] = useState(false)

    // Sync URL silently when tab changes (optional, for bookmarking without refresh)
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        const params = new URLSearchParams(searchParams.toString())
        params.set("tab", value)
        window.history.pushState(null, "", `${pathname}?${params.toString()}`)
    }

    const { data: circle, isLoading } = useQuery({
        queryKey: ["circle", circleId],
        queryFn: () => getCircleDetails(circleId).then(res => res.success ? res.data : null),
        refetchInterval: 5000 // Real-time polling every 5 seconds
    })

    // Check if current user is admin
    const isAdmin = circle?.members?.some((m: any) => m.userId === user?.id && m.isAdmin)

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete("circleId")
        params.delete("tab")
        router.push(`${pathname}?${params.toString()}`)
    }

    const joinRitualMutation = useMutation({
        mutationFn: (id: string) => joinRitual(id),
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Défi accepté ! Bon courage !")
                queryClient.invalidateQueries({ queryKey: ["circle", circleId] })
            } else {
                toast.error(res.error || "Erreur lors de l'inscription")
            }
        }
    })

    const completeRitualMutation = useMutation({
        mutationFn: (id: string) => completeRitual(id),
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Félicitations ! Défi validé 🏆")
                queryClient.invalidateQueries({ queryKey: ["circle", circleId] })
            } else {
                toast.error(res.error || "Erreur lors de la validation")
            }
        }
    })

    if (isLoading) {
        return <div className="p-8 space-y-8 min-h-[600px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-6 w-48" />
            </div>
        </div>
    }

    if (!circle) return <div className="p-8 text-center">Cercle introuvable</div>

    return (
        <div className="flex flex-col h-[85vh] md:h-[calc(100vh-100px)] bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
            {/* Create Ritual Modal */}
            <CreateRitualModal
                open={isCreateRitualOpen}
                onClose={() => setIsCreateRitualOpen(false)}
                circleId={circleId}
            />

            {/* Header / Navigation Rail */}
            <div className="flex flex-col md:flex-row h-full overflow-hidden">

                {/* Sidebar Navigation (Desktop) / Topbar (Mobile) */}
                <div className="w-full md:w-72 bg-slate-50/80 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col pt-6 pb-4 md:h-full shrink-0 z-20">

                    <div className="px-6 mb-6">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white -ml-2 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Retour
                        </Button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 shrink-0 overflow-hidden">
                                {circle.imageUrl ? (
                                    <img src={circle.imageUrl} alt={circle.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Target className="w-5 h-5" />
                                )}
                            </div>
                            <h1 className="font-bold text-lg leading-tight text-slate-900 dark:text-white line-clamp-2">
                                {circle.name}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 pl-1">
                            {circle.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[10px]">
                                {circle.level}
                            </Badge>
                            <Badge variant="secondary" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[10px] flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {circle._count?.members}
                            </Badge>
                        </div>

                        {circle.isMember && !isAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    if (confirm("Voulez-vous vraiment quitter ce cercle ?")) {
                                        const { leaveCircle } = await import("@/actions/community.action")
                                        const res = await leaveCircle(circleId)
                                        if (res.success) {
                                            toast.success("Vous avez quitté le cercle")
                                            router.push("/community")
                                        } else {
                                            toast.error(res.error)
                                        }
                                    }
                                }}
                                className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                            >
                                Quitter le cercle
                            </Button>
                        )}
                        {isAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    if (confirm("⚠️ Voulez-vous vraiment supprimer ce cercle ? Cette action est IRRÉVERSIBLE et supprimera toutes les données associées.")) {
                                        const { deleteCircle } = await import("@/actions/community.action")
                                        const res = await deleteCircle(circleId)
                                        if (res.success) {
                                            toast.success("Cercle supprimé définitivement")
                                            router.push("/community")
                                        } else {
                                            toast.error(res.error)
                                        }
                                    }
                                }}
                                className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                            >
                                🗑️ Supprimer le cercle
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                        <nav className="space-y-1">
                            <button
                                onClick={() => handleTabChange("chat")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    activeTab === "chat"
                                        ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <Hash className="w-4 h-4" />
                                Salon de discussion
                            </button>
                            <button
                                onClick={() => handleTabChange("questions")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    activeTab === "questions"
                                        ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <HelpCircle className="w-4 h-4" />
                                Entraide & Questions
                            </button>
                            <button
                                onClick={() => handleTabChange("rituals")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    activeTab === "rituals"
                                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <Trophy className="w-4 h-4" />
                                Défis & Rituels
                            </button>
                            <button
                                onClick={() => handleTabChange("members")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    activeTab === "members"
                                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <Users className="w-4 h-4" />
                                Membres
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden bg-white/50 dark:bg-slate-950/50 p-0 relative h-full flex flex-col">
                    <Tabs value={activeTab} className="w-full h-full flex flex-col">
                        <TabsContent value="chat" className="flex-1 mt-0 p-4 md:p-6 h-full outline-none data-[state=inactive]:hidden flex flex-col">
                            <div className="max-w-4xl mx-auto h-full flex flex-col w-full">
                                <div className="mb-4 shrink-0">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Hash className="w-5 h-5 text-emerald-500" />
                                        Salon de discussion
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Échangez en direct avec les membres du cercle.</p>
                                </div>
                                <div className="flex-1 min-h-0 relative bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
                                    <CircleChat circleId={circleId} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="questions" className="flex-1 mt-0 p-4 md:p-6 h-full outline-none overflow-y-auto custom-scrollbar data-[state=inactive]:hidden">
                            <div className="max-w-4xl mx-auto">
                                <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex items-start gap-4">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-700 dark:text-amber-500">
                                        <HelpCircle className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-amber-900 dark:text-amber-500">Espace Entraide</h3>
                                        <p className="text-sm text-amber-800/80 dark:text-amber-400/80">
                                            Un problème technique ? Une question carrière ? Posez-la ici pour obtenir l'aide de la communauté.
                                            Les questions restent visibles et indexées pour aider les futurs membres.
                                        </p>
                                    </div>
                                </div>
                                <CommunityFeed circleId={circleId} filterType="QUESTIONS" />
                            </div>
                        </TabsContent>

                        <TabsContent value="rituals" className="flex-1 mt-0 p-4 md:p-6 h-full outline-none overflow-y-auto custom-scrollbar data-[state=inactive]:hidden">
                            <div className="max-w-5xl mx-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Trophy className="w-6 h-6 text-blue-500" />
                                        Défis actifs
                                    </h2>
                                    {isAdmin && (
                                        <Button
                                            onClick={() => setIsCreateRitualOpen(true)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-lg shadow-emerald-900/20"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Créer un défi
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {circle.rituals?.map((ritual: any) => (
                                        <RitualCard
                                            key={ritual.id}
                                            ritual={ritual}
                                            onJoin={async (id) => await joinRitualMutation.mutateAsync(id)}
                                            onComplete={async (id) => { await completeRitualMutation.mutateAsync(id) }}
                                            isAdmin={isAdmin}
                                        />
                                    ))}
                                    {(!circle.rituals || circle.rituals.length === 0) && (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                            <Trophy className="w-12 h-12 text-slate-300 mb-4" />
                                            <p className="text-slate-500 font-medium">Aucun défi en cours.</p>
                                            {isAdmin && <p className="text-sm text-blue-600 mt-2 cursor-pointer hover:underline" onClick={() => setIsCreateRitualOpen(true)}>Créez le premier !</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="members" className="flex-1 mt-0 p-4 md:p-6 h-full outline-none overflow-y-auto custom-scrollbar data-[state=inactive]:hidden">
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-slate-500" />
                                    Membres du cercle
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {circle.members?.map((member: any) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={member.id}
                                            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-lg hover:shadow-emerald-900/5 transition-all group flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                                {member.user.imageUrl ? (
                                                    <img src={member.user.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-200 dark:bg-slate-800">
                                                        {member.user.firstName?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-emerald-600 transition-colors">
                                                    {member.user.firstName} {member.user.lastName}
                                                </h4>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <Badge variant="secondary" className={cn(
                                                        "text-[10px] px-1.5 h-5",
                                                        member.isAdmin
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500"
                                                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                    )}>
                                                        {member.isAdmin ? "Admin" : "Membre"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
