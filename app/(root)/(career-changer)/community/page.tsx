"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
    Search,
    Users,
    MapPin,
    Briefcase,
    Target,
    ArrowRight,
    LayoutGrid,
    List,
    ChevronRight,
    ChevronLeft,
    MessageCircle,
    Sparkles,
    Plus,
    Trophy,
    TrendingUp,
    Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PageBanner } from "@/components/shared/Banner"
import { motion, AnimatePresence } from "framer-motion"
import { CircleCard } from "@/components/community/circles/CircleCard"
import { CreateCircleModal } from "@/components/community/circles/CreateCircleModal"
import { CircleDetailsView } from "@/components/community/circles/CircleDetailsView"
import { CommunityFeed } from "@/components/community/feed/CommunityFeed"
import { RitualCard } from "@/components/community/rituals/RitualCard"
import {
    getCircles,
    createCircle,
    joinCircle,
    getCircleDetails,
    getMyCircles,
    getRealCareerChangers,
    getSuggestedCircles,
    getAllPosts,
    getAllRituals,
    joinRitual,
    completeRitual
} from "@/actions/community.action"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Full Domain list from schema
const ALL_DOMAINS = [
    "MACHINE_LEARNING", "DEVELOPMENT", "DATA_SCIENCE", "FINANCE", "BUSINESS",
    "ENGINEERING", "DESIGN", "DEVOPS", "CYBERSECURITY", "MARKETING", "PRODUCT",
    "ARCHITECTURE", "MOBILE", "WEB", "COMMUNICATION", "MANAGEMENT", "EDUCATION", "HEALTH"
]

export default function CommunityCareerChangerPage() {
    const queryClient = useQueryClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [activeTab, setActiveTab] = useState("members")
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCareer, setFilterCareer] = useState("all")

    // Circle & Modal States from URL
    const circleIdFromUrl = searchParams.get("circleId")
    const [showCreateCircle, setShowCreateCircle] = useState(false)

    // We just check circleIdFromUrl in the render

    const handleViewCircleDetails = (id: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("circleId", id)
        router.push(`${pathname}?${params.toString()}`)
    }

    // Queries
    const { data: circlesData, isLoading: circlesLoading } = useQuery({
        queryKey: ["circles"],
        queryFn: () => getCircles().then(res => res.success ? res.data : [])
    })

    const { data: myCirclesData } = useQuery({
        queryKey: ["myCircles"],
        queryFn: () => getMyCircles().then(res => res.success ? res.data : [])
    })

    const { data: realMembers, isLoading: membersLoading } = useQuery({
        queryKey: ["realMembers"],
        queryFn: () => getRealCareerChangers().then(res => res.success ? res.data : [])
    })

    const { data: suggestedCircles } = useQuery({
        queryKey: ["suggestedCircles"],
        queryFn: () => getSuggestedCircles().then(res => res.success ? res.data : [])
    })

    const { data: globalRituals, isLoading: ritualsLoading } = useQuery({
        queryKey: ["globalRituals"],
        queryFn: () => getAllRituals().then(res => res.success ? res.data : [])
    })

    // Mutations
    const createCircleMutation = useMutation({
        mutationFn: createCircle,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Cercle créé !")
                queryClient.invalidateQueries({ queryKey: ["circles"] })
                queryClient.invalidateQueries({ queryKey: ["myCircles"] })
                // Navigate to the new circle
                const params = new URLSearchParams(searchParams.toString())
                params.set("circleId", res.data.id)
                router.push(`${pathname}?${params.toString()}`)
                setShowCreateCircle(false)
            } else toast.error(res.error)
        }
    })

    const joinCircleMutation = useMutation({
        mutationFn: joinCircle,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Bienvenue dans le cercle !")
                queryClient.invalidateQueries({ queryKey: ["circles"] })
                queryClient.invalidateQueries({ queryKey: ["myCircles"] })
            } else toast.error(res.error)
        }
    })

    const joinRitualMutation = useMutation({
        mutationFn: joinRitual,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Défi rejoint !")
                queryClient.invalidateQueries({ queryKey: ["globalRituals"] })
            } else toast.error(res.error)
        }
    })

    const completeRitualMutation = useMutation({
        mutationFn: completeRitual,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Bravo ! Objectif atteint.")
                queryClient.invalidateQueries({ queryKey: ["globalRituals"] })
            } else toast.error(res.error)
        }
    })

    // Filtering logic
    const filteredMembers = useMemo(() => {
        if (!realMembers) return []
        let members = [...realMembers]
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            members = members.filter(m =>
                `${m.firstName} ${m.lastName}`.toLowerCase().includes(term) ||
                m.domains?.some((d: string) => d.toLowerCase().includes(term))
            )
        }
        if (filterCareer !== "all") {
            members = members.filter(m => m.domains?.includes(filterCareer))
        }
        return members
    }, [realMembers, searchTerm, filterCareer])

    const myCircleIds = myCirclesData?.map((c: any) => c.id) || []

    // If circleId is present, show the details view INLINE
    if (circleIdFromUrl) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <CircleDetailsView circleId={circleIdFromUrl} />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <PageBanner
                    badge={{ text: "Communauté Deep IA", icon: Sparkles }}
                    title={<>L'espace des <span className="text-emerald-100 italic">Audacieux</span></>}
                    description="Échangez avec ceux qui réécrivent leur histoire. Pas de bruit, juste du soutien et de l'action."
                    stats={[
                        { value: (realMembers?.length || 0) + 120, label: "Membres" },
                        { value: circlesData?.length || 0, label: "Cercles" }
                    ]}
                    image={<div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 rotate-12 shadow-2xl relative overflow-hidden">
                        <Users className="w-12 h-12 text-white" />
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-400 rounded-full blur-xl opacity-50"></div>
                    </div>}
                />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-[1.25rem] h-14 w-max md:w-auto shadow-sm">
                                <TabsTrigger value="members" className="rounded-xl px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg h-11 transition-all">
                                    <Users className="w-4 h-4 mr-2" />
                                    Communauté
                                </TabsTrigger>
                                <TabsTrigger value="circles" className="rounded-xl px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white h-11 transition-all">
                                    <Target className="w-4 h-4 mr-2" />
                                    Cercles de proximité
                                </TabsTrigger>
                                <TabsTrigger value="feed" className="rounded-xl px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white h-11 transition-all">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Progression & Questions
                                </TabsTrigger>
                                <TabsTrigger value="rituals" className="rounded-xl px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white h-11 transition-all">
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Défis
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {activeTab === "circles" && (
                            <Button
                                onClick={() => setShowCreateCircle(true)}
                                className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 text-white rounded-full h-12 px-8 font-bold shadow-xl shadow-slate-900/10 transition-transform active:scale-95"
                            >
                                <Plus className="w-5 h-5 mr-1" />
                                Créer un cercle
                            </Button>
                        )}
                    </div>

                    <TabsContent value="members" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm overflow-hidden">
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Filter className="w-5 h-5 text-emerald-600" />
                                                Filtres
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                <Input
                                                    placeholder="Rechercher un profil..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-emerald-500"
                                                />
                                            </div>
                                            <Select value={filterCareer} onValueChange={setFilterCareer}>
                                                <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none">
                                                    <SelectValue placeholder="Domaine" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    <SelectItem value="all">Tous les domaines</SelectItem>
                                                    {ALL_DOMAINS.map((d: any) => (
                                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white px-2 flex items-center justify-between">
                                        Cercles suggérés
                                        <ArrowRight className="w-4 h-4 text-emerald-600" />
                                    </h3>
                                    <div className="space-y-3">
                                        {suggestedCircles?.slice(0, 3).map((circle: any) => (
                                            <button
                                                key={circle.id}
                                                onClick={() => handleViewCircleDetails(circle.id)}
                                                className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                        <Target className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{circle.name}</div>
                                                        <div className="text-[10px] text-slate-500 font-medium">{circle._count.members} membres engagés</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
                                {membersLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <AnimatePresence>
                                            {filteredMembers.map((member: any) => (
                                                <motion.div
                                                    key={member.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="group"
                                                >
                                                    <Card className="h-full rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-emerald-100 dark:hover:border-emerald-900/50 transition-all duration-500 overflow-hidden flex flex-col">
                                                        <CardContent className="p-6 flex flex-col h-full bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950/20">
                                                            <div className="flex items-start gap-4 mb-6">
                                                                <Avatar className="w-16 h-16 rounded-2xl border-2 border-white dark:border-slate-800 shadow-lg">
                                                                    <AvatarImage src={member.imageUrl} />
                                                                    <AvatarFallback className="bg-emerald-600 text-white font-bold text-xl rounded-2xl">
                                                                        {member.firstName?.[0]}{member.lastName?.[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 min-w-0 pt-1">
                                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate leading-tight mb-1">
                                                                        {member.firstName} {member.lastName}
                                                                    </h3>
                                                                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                                                        <Briefcase className="w-3 h-3 text-emerald-600" />
                                                                        <span className="truncate">{member.domains?.[0] || "Explorateur Tech"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 space-y-4">
                                                                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed italic text-slate-600 dark:text-slate-400">
                                                                    "En pleine transition vers le {member.domains?.[0] || 'Digital'}. Motivé par l'apprentissage continu et le partage d'expérience."
                                                                </div>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {member.domains?.map((d: string) => (
                                                                        <Badge key={d} variant="secondary" className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold tracking-tight">
                                                                            {d}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="mt-6">
                                                                <Button className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all font-bold gap-2 group/btn shadow-lg shadow-slate-900/5">
                                                                    <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                                    Échanger
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="circles" className="mt-0 outline-none animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {circlesLoading ? (
                                [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-[2rem]" />)
                            ) : circlesData && circlesData.length > 0 ? (
                                circlesData.map((circle: any) => (
                                    <CircleCard
                                        key={circle.id}
                                        circle={circle}
                                        isMember={myCircleIds.includes(circle.id)}
                                        onJoin={(id) => joinCircleMutation.mutate(id)}
                                        onViewDetails={handleViewCircleDetails}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-6">
                                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center">
                                        <Target className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Aucun cercle actif</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto">Soyez le pionnier en lançant la première communauté sur ce domaine.</p>
                                    </div>
                                    <Button onClick={() => setShowCreateCircle(true)} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-10 h-14 font-bold">
                                        Lancer un cercle
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="feed" className="mt-0 outline-none animate-in fade-in">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                                Journal d'Entraide
                            </h2>
                            <CommunityFeed circleId="all" />
                        </div>
                    </TabsContent>

                    <TabsContent value="rituals" className="mt-0 outline-none animate-in fade-in">
                        <div className="max-w-5xl mx-auto space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white italic tracking-tight">Défis Communautaires</h2>
                                    <p className="text-slate-500">L'excellence ne s'atteint jamais seul.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {ritualsLoading ? (
                                    [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)
                                ) : globalRituals && globalRituals.length > 0 ? (
                                    globalRituals.map((ritual: any) => (
                                        <RitualCard
                                            key={ritual.id}
                                            ritual={ritual}
                                            onJoin={async (id) => { await joinRitualMutation.mutateAsync(id) }}
                                            onComplete={async (id) => { await completeRitualMutation.mutateAsync(id) }}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                                        <Trophy className="w-12 h-12 text-slate-200 mb-4" />
                                        <p className="text-slate-500 font-medium italic">Le prochain grand défi est en préparation...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <CreateCircleModal
                open={showCreateCircle}
                onClose={() => setShowCreateCircle(false)}
                onCreate={async (data) => {
                    await createCircleMutation.mutateAsync(data)
                }}
            />
        </div>
    )
}
