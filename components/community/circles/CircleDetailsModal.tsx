"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Users, Target, Calendar, MessageCircle, Trophy, Sparkles, ArrowRight, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { CommunityFeed } from "../feed/CommunityFeed"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { getRituals, joinRitual, completeRitual, createRitual } from "@/actions/community.action"
import { RitualCard } from "../rituals/RitualCard"
import { CreateRitualModal } from "../rituals/CreateRitualModal"
import { toast } from "sonner"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

interface CircleDetailsModalProps {
    open: boolean
    onClose: () => void
    circle: any
    onLeave?: () => void
}

export function CircleDetailsModal({ open, onClose, circle, onLeave }: CircleDetailsModalProps) {
    const queryClient = useQueryClient()
    const { user } = useKindeBrowserClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    // Sync tab with URL
    const urlTab = searchParams.get("tab") || "overview"
    const [activeTab, setActiveTab] = useState(urlTab)
    const [showCreateRitual, setShowCreateRitual] = useState(false)

    useEffect(() => {
        if (open && urlTab !== activeTab) {
            setActiveTab(urlTab)
        }
    }, [urlTab, open])

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        const params = new URLSearchParams(searchParams.toString())
        params.set("tab", value)
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    // Queries
    const { data: rituals, isLoading: ritualsLoading } = useQuery({
        queryKey: ["rituals", circle?.id],
        queryFn: () => circle?.id ? getRituals(circle.id).then(res => res.success ? res.data : []) : [],
        enabled: !!circle?.id && open
    })

    // Mutations
    const joinRitualMutation = useMutation({
        mutationFn: joinRitual,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Vous avez rejoint le rituel !")
                queryClient.invalidateQueries({ queryKey: ["rituals", circle.id] })
            } else {
                toast.error(res.error)
            }
        }
    })

    const completeRitualMutation = useMutation({
        mutationFn: completeRitual,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Bravo ! Rituel complété.")
                queryClient.invalidateQueries({ queryKey: ["rituals", circle.id] })
            } else {
                toast.error(res.error)
            }
        }
    })

    const createRitualMutation = useMutation({
        mutationFn: (data: any) => createRitual(circle.id, data),
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Rituel lancé avec succès !")
                queryClient.invalidateQueries({ queryKey: ["rituals", circle.id] })
                setShowCreateRitual(false)
            } else {
                toast.error(res.error)
            }
        }
    })

    if (!open || !circle) return null

    const memberCount = circle._count?.members || circle.members?.length || 0
    const postCount = circle._count?.posts || 0
    const daysLeft = circle.endDate
        ? Math.ceil((new Date(circle.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0

    const isMember = circle.isMember || circle.members?.some((m: any) => m.userId === user?.id)
    const isAdmin = circle.members?.find((m: any) => m.userId === user?.id)?.isAdmin

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/90 backdrop-blur-md px-0 sm:px-6 py-0 md:py-12 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-950 rounded-none sm:rounded-[2rem] shadow-2xl w-full max-w-5xl border-0 sm:border border-slate-100 dark:border-slate-800 flex flex-col h-[100dvh] sm:h-[90vh] max-h-[90vh]">

                {/* Header Premium */}
                <div className="flex-none p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                ✨ Espace de Proximité
                            </Badge>
                            {isMember && (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-none">
                                    Déjà membre
                                </Badge>
                            )}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                            {circle.name}
                        </h2>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                <Users className="w-4 h-4 text-emerald-600" />
                                <span>{memberCount} / {circle.maxMembers} membres</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                <Target className="w-4 h-4 text-blue-600" />
                                <span>{circle.targetCareer}</span>
                            </div>
                            {daysLeft > 0 ? (
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <Calendar className="w-4 h-4 text-amber-600" />
                                    <span>{daysLeft} jours restants</span>
                                </div>
                            ) : (
                                <Badge variant="secondary" className="text-[10px] h-5">Fini</Badge>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-colors flex-shrink-0"
                        onClick={onClose}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Content with Tabs */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-4 md:px-8 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10 flex-none">
                            <TabsList className="h-14 w-full justify-start overflow-x-auto flex-nowrap gap-6 bg-transparent p-0 scrollbar-hide">
                                <TabsTrigger value="overview" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-base">
                                    Vue d'ensemble
                                </TabsTrigger>
                                <TabsTrigger value="members" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-base">
                                    Membres
                                </TabsTrigger>
                                {isMember && (
                                    <>
                                        <TabsTrigger value="feed" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-base">
                                            Entraide & Questions
                                        </TabsTrigger>
                                        <TabsTrigger value="rituals" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-base">
                                            Rituels
                                        </TabsTrigger>
                                    </>
                                )}
                            </TabsList>
                        </div>

                        {/* Scrollable content area */}
                        <div className="flex-1 overflow-hidden relative">
                            <ScrollArea className="h-full w-full absolute inset-0 bg-slate-50/50 dark:bg-black/20">
                                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 pb-8">

                                    <TabsContent value="overview" className="mt-0 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        {/* Description Card */}
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">La Mission</h3>
                                            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                "{circle.description || "Pas de description spécifiée."}"
                                            </p>
                                        </div>

                                        {/* Activity Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                                                        <Users className="w-6 h-6 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{memberCount}</div>
                                                        <div className="text-xs text-slate-500">Compagnons</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                                        <MessageCircle className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{postCount}</div>
                                                        <div className="text-xs text-slate-500">Publications</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                                                        <Trophy className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{rituals?.length || 0}</div>
                                                        <div className="text-xs text-slate-500">Rituels actifs</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Join CTA if not member */}
                                        {!isMember && (
                                            <div className="bg-emerald-600 dark:bg-emerald-700 rounded-3xl p-8 text-white shadow-xl text-center space-y-4">
                                                <Sparkles className="w-10 h-10 mx-auto text-emerald-200" />
                                                <h4 className="text-2xl font-bold">Prêt à rejoindre l'aventure ?</h4>
                                                <p className="text-emerald-50 max-w-lg mx-auto">
                                                    En rejoignant ce cercle, vous pourrez échanger quotidiennement, participer à des rituels et progresser avec vos pairs.
                                                </p>
                                                <Button
                                                    size="lg"
                                                    className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-full font-bold px-10 h-12"
                                                    onClick={() => circle.onJoin?.(circle.id)}
                                                >
                                                    Rejoindre maintenant
                                                </Button>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="members" className="mt-0 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {circle.members?.map((member: any) => (
                                                <div key={member.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-all group">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                        {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                                                            {member.user?.firstName} {member.user?.lastName}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {member.isAdmin && <Badge variant="outline" className="text-[10px] h-4 bg-emerald-50 text-emerald-700 border-emerald-100">Mentor / Admin</Badge>}
                                                            <span className="text-xs text-slate-400 font-medium">Membre</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    {isMember && (
                                        <>
                                            <TabsContent value="feed" className="mt-0 animate-in slide-in-from-bottom-4 duration-500">
                                                <CommunityFeed circleId={circle.id} />
                                            </TabsContent>

                                            <TabsContent value="rituals" className="mt-0 animate-in slide-in-from-bottom-4 duration-500 pt-2">
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Défis Collectifs</h3>
                                                            <p className="text-sm text-slate-500">Relevez le niveau ensemble</p>
                                                        </div>
                                                        {isAdmin && (
                                                            <Button
                                                                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-full h-11 px-6 shadow-lg shadow-purple-600/20"
                                                                onClick={() => setShowCreateRitual(true)}
                                                            >
                                                                <Trophy className="w-4 h-4" />
                                                                Lancer un rituel
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {rituals && rituals.length > 0 ? (
                                                            rituals.map((ritual: any) => (
                                                                <RitualCard
                                                                    key={ritual.id}
                                                                    ritual={ritual}
                                                                    onJoin={async (id) => { await joinRitualMutation.mutateAsync(id) }}
                                                                    onComplete={async (id) => { await completeRitualMutation.mutateAsync(id) }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                                                                <Trophy className="w-12 h-12 text-slate-200 mb-4" />
                                                                <p className="text-slate-500 font-medium">Aucun défi lancé pour l'instant.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </>
                                    )}

                                </div>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>

                {/* Footer Premium Section */}
                <div className="flex-none p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {isMember ? (
                        <Button
                            variant="ghost"
                            onClick={onLeave}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm rounded-full px-6"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Quitter l'aventure
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-sm italic pl-2">
                            <Sparkles className="w-4 h-4" />
                            Prenez part à la réussite
                        </div>
                    )}
                    <div className="flex items-center gap-3 ml-auto">
                        {isAdmin && (
                            <Button variant="outline" className="rounded-full h-11 px-6 border-slate-200">
                                <Settings className="w-4 h-4 mr-2" />
                                Paramètres
                            </Button>
                        )}
                        <Button onClick={onClose} className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all rounded-full h-11 px-8 font-bold">
                            Fermer
                        </Button>
                    </div>
                </div>

            </div>

            <CreateRitualModal
                open={showCreateRitual}
                onClose={() => setShowCreateRitual(false)}
                onCreate={async (data) => {
                    await createRitualMutation.mutateAsync(data)
                }}
            />
        </div>
    )
}
