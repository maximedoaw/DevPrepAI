"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Mail,
    ShieldCheck,
    Settings,
    ArrowRight,
    Loader2,
    Calendar,
    Briefcase,
    X,
    Camera,
    AtSign,
    User as UserIcon,
    Zap,
    CreditCard,
    Trash2,
    AlertTriangle
} from "lucide-react"
import { getFullUserData, createOrUpdateUserWithRole } from "@/actions/user.action"
import { toast } from "sonner"
import { UploadButton } from "@uploadthing/react"
import { OurFileRouter } from "@/app/api/uploadthing/core"
import { motion, AnimatePresence } from "framer-motion"

const ALL_DOMAINS = [
    "DEVELOPMENT", "DESIGN", "MARKETING", "FINANCE", "PRODUCT",
    "DEVOPS", "CYBERSECURITY", "DATA_SCIENCE", "MACHINE_LEARNING",
    "MANAGEMENT", "WEB", "MOBILE", "ARCHITECTURE"
]

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading } = useKindeBrowserClient()
    const queryClient = useQueryClient()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        imageUrl: "",
        domains: [] as string[]
    })

    const { data: userData, isLoading: dataLoading } = useQuery({
        queryKey: ["full-user-data", user?.id],
        queryFn: async () => {
            if (!user?.id) return null
            return await getFullUserData(user.id)
        },
        enabled: !!user?.id,
    })

    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                username: (userData as any).username || "",
                imageUrl: (userData as any).imageUrl || "",
                domains: (userData.domains as string[]) || []
            })
        }
    }, [userData])

    const updateMutation = useMutation({
        mutationFn: async (updatedData: typeof formData) => {
            if (!user?.id || !user.email) throw new Error("Auth failed")
            return await createOrUpdateUserWithRole(
                user.id, user.email, updatedData.firstName, updatedData.lastName,
                userData?.role as string, updatedData.domains, undefined, undefined,
                updatedData.username, updatedData.imageUrl
            )
        },
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Profil mis à jour")
                // Update query cache immediately for real-time feel
                queryClient.setQueryData(["full-user-data", user?.id], (old: any) => ({
                    ...old,
                    ...formData
                }))
                queryClient.invalidateQueries({ queryKey: ["full-user-data", user?.id] })
                setIsEditModalOpen(false)
            } else toast.error("Erreur de mise à jour")
        },
        onError: () => toast.error("Une erreur est survenue")
    })

    const toggleDomain = (domain: string) => {
        setFormData(prev => ({
            ...prev,
            domains: prev.domains.includes(domain)
                ? prev.domains.filter(d => d !== domain)
                : [...prev.domains, domain]
        }))
    }

    if (authLoading || dataLoading) return <ProfileSkeleton />

    if (!isAuthenticated || !userData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck className="text-slate-300" size={32} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Accès restreint</h2>
                <p className="text-sm text-slate-500 mb-6">Veuillez vous connecter pour voir votre profil.</p>
                <Button onClick={() => window.location.href = "/"} className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-white border-none">Retour à l'accueil</Button>
            </div>
        )
    }

    const roleLabel = {
        CANDIDATE: "Candidat", CAREER_CHANGER: "Reconversion", RECRUITER: "Recruteur",
        ENTERPRISE: "Entreprise", BOOTCAMP: "Bootcamp", SCHOOL: "École",
    }[userData.role as string] || "Membre"

    return (
        <div className="max-w-5xl mx-auto pb-20 px-6 animate-in fade-in duration-700">
            {/* Minimal Header Section */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 pt-10 pb-16">
                <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
                    {/* Simplified Avatar */}
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 overflow-hidden flex items-center justify-center shadow-sm">
                            {(userData as any).imageUrl || user?.picture ? (
                                <img src={(userData as any).imageUrl || user?.picture || ""} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <UserIcon className="w-10 h-10 text-slate-300" />
                            )}
                        </div>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-600 border border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20"
                        >
                            <Camera size={14} />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                {userData.firstName} {userData.lastName}
                            </h1>
                            <Badge variant="outline" className="bg-emerald-500/[0.03] border-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                {roleLabel}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-400 text-sm">
                            {(formData.username || (userData as any).username) && (
                                <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                                    <AtSign size={14} className="text-emerald-500/50" /> {(userData as any).username || formData.username}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="opacity-40" /> {new Date(userData.createdAt).getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsEditModalOpen(true)}
                        variant="outline"
                        className="rounded-xl h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-600/10 text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
                    >
                        <Settings size={14} className="mr-2" /> Éditer le profil
                    </Button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                    {/* About Section (Domains) */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Expertises</h3>
                        <div className="flex flex-wrap gap-2">
                            {userData.domains?.length ? (userData.domains as string[]).map(d => (
                                <span key={d} className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                    {d}
                                </span>
                            )) : (
                                <p className="text-sm text-slate-400 italic">Aucun domaine renseigné</p>
                            )}
                        </div>
                    </section>

                    {/* Activity Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Activités récentes</h3>
                            <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 hover:text-emerald-700 p-0 h-auto">Tout voir</Button>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-white/[0.03] border-t border-slate-100 dark:border-white/[0.03]">
                            {userData.quizResults?.length ? userData.quizResults.slice(0, 5).map((res: any) => (
                                <div key={res.id} className="flex items-center justify-between py-5 group cursor-pointer transition-colors hover:px-2 -mx-2">
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/5 transition-all">
                                            {res.score}%
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-tight">{res.quiz?.title}</h4>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">QCM • {new Date(res.completedAt).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-200 transition-all group-hover:text-emerald-500 group-hover:translate-x-1" />
                                </div>
                            )) : (
                                <div className="py-12 text-center">
                                    <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold opacity-50">Aucune activité pour le moment</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info Area */}
                <aside className="lg:col-span-4 space-y-10">
                    {/* IA Credits Card - Simplified */}
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden relative group">
                        <Zap className="absolute top-0 right-0 w-32 h-32 text-emerald-500/5 -mr-8 -mt-8 rotate-12 transition-transform group-hover:scale-110" size={128} />
                        <div className="relative space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Skillwokz IA</p>
                                <h3 className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tight">Capacité de génération</h3>
                            </div>
                            <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {userData.credits.toLocaleString()}
                                <span className="text-xs text-slate-300 dark:text-slate-600 ml-2 font-medium uppercase tracking-widest">Jetons</span>
                            </div>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl text-[10px] font-bold uppercase tracking-widest h-10 shadow-lg shadow-emerald-600/10 transition-all active:scale-95">Recharger</Button>
                        </div>
                    </div>

                    {/* Subscription & Plans */}
                    <div className="p-8 rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <CreditCard size={16} />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Abonnement</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan Actuel</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black tracking-widest px-1.5 h-4">ACTIVE</Badge>
                                </div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">Premium Personnel</p>
                                <p className="text-[9px] text-slate-400 mt-2 uppercase tracking-tight">Prochaine facture : 12 mars 2026</p>
                            </div>
                            <Button variant="ghost" className="w-full text-emerald-600 hover:text-emerald-700 font-bold text-[10px] uppercase tracking-widest h-auto p-0">Gérer mon plan</Button>
                        </div>
                    </div>

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="rounded-2xl h-24 flex flex-col items-center justify-center gap-2 border-emerald-100 dark:border-emerald-500/10 bg-emerald-50/30 dark:bg-emerald-500/5 hover:border-emerald-500/40 transition-all group text-emerald-600 dark:text-emerald-500 shadow-sm shadow-emerald-500/5">
                            <Briefcase size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Carrière</span>
                        </Button>
                        <Button variant="outline" className="rounded-2xl h-24 flex flex-col items-center justify-center gap-2 border-emerald-100 dark:border-emerald-500/10 bg-emerald-50/30 dark:bg-emerald-500/5 hover:border-emerald-500/40 transition-all group text-emerald-600 dark:text-emerald-500 shadow-sm shadow-emerald-500/5">
                            <Mail size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Support</span>
                        </Button>
                    </div>
                    {/* Danger Zone */}
                    <div className="p-8 rounded-3xl border border-red-100/50 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5 space-y-4">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
                            <AlertTriangle size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Zone Critique</h3>
                        </div>
                        <p className="text-[10px] text-red-400 dark:text-red-600/60 uppercase font-medium leading-relaxed px-1">La suppression est irréversible et effacera toutes vos données.</p>
                        <Button variant="ghost" className="w-full h-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                            <Trash2 size={14} className="mr-2" /> Supprimer mon compte
                        </Button>
                    </div>
                </aside>
            </div>

            {/* Redesigned Minimal Edit Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="rounded-3xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] sm:max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900">
                    <div className="p-8 space-y-8">
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white leading-none">Réglages du Compte</DialogTitle>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Personnalisez votre identité</p>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shrink-0">
                                    <img src={formData.imageUrl || user?.picture || ""} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Avatar</Label>
                                    <UploadButton
                                        endpoint="mediaUploader"
                                        onClientUploadComplete={(res) => {
                                            if (res?.[0]) {
                                                setFormData({ ...formData, imageUrl: res[0].url })
                                                toast.success("Photo mise à jour")
                                            }
                                        }}
                                        content={{ button: "Choisir un fichier", allowedContent: "" }}
                                        appearance={{
                                            button: "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold uppercase h-8 px-4 w-auto",
                                            allowedContent: "hidden"
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Identifiant</Label>
                                    <div className="relative">
                                        <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                        <Input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="rounded-xl h-10 bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5 pl-9 text-sm font-medium focus:ring-emerald-500/10 focus:border-emerald-500/30" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Prénom</Label>
                                        <Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="rounded-xl h-10 bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5 px-4 text-sm font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Nom</Label>
                                        <Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="rounded-xl h-10 bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5 px-4 text-sm font-medium" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Expertises</Label>
                                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                                    {ALL_DOMAINS.map(domain => {
                                        const isSelected = formData.domains.includes(domain)
                                        return (
                                            <button
                                                key={domain}
                                                onClick={() => toggleDomain(domain)}
                                                className={`px-2.5 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all border ${isSelected
                                                    ? "bg-slate-900 dark:bg-emerald-600 text-white border-transparent"
                                                    : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/5 hover:border-emerald-500/30"
                                                    }`}
                                            >
                                                {domain}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <Button
                                onClick={() => updateMutation.mutate(formData)}
                                disabled={updateMutation.isPending}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] mt-4 border-none"
                            >
                                {updateMutation.isPending ? <Loader2 className="animate-spin" /> : "Sauvegarder les modifications"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-pulse p-6 pt-10">
            <div className="flex items-center gap-6 mb-16">
                <Skeleton className="w-32 h-32 rounded-3xl" />
                <div className="space-y-3">
                    <Skeleton className="h-10 w-64 rounded-xl" />
                    <Skeleton className="h-4 w-40 rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
                <div className="lg:col-span-4 space-y-10">
                    <Skeleton className="h-48 w-full rounded-3xl" />
                    <Skeleton className="h-32 w-full rounded-3xl" />
                </div>
            </div>
        </div>
    )
}
