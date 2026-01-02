"use client"

import { useEffect, useState } from "react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { usePortfolioBuilder } from "@/hooks/usePortfolioBuilder"
import { Button } from "@/components/ui/button"
import { User, Palette, Layout, Download, Loader2, Save, Settings } from "lucide-react"
import AISuggestions from "./ai-suggestions"
import ManualInput from "./manual-input"
import PortfolioPreview from "./portfolio-preview"
import SectionBuilder from "./section-builder"
import ExportPanel from "./export-panel"
import PortfolioSettingsDialog from "./portfolio-settings-dialog"
import { PortfolioTemplate } from "@prisma/client"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// Interface alignée avec usePortfolioBuilder
interface PortfolioData {
    name?: string
    headline?: string | null
    bio?: string | null
    // ... autres champs
    [key: string]: any
}

export default function PortfolioBuilder() {
    const { user, isAuthenticated, isLoading: authLoading } = useKindeBrowserClient()
    const userId = user?.id

    const {
        portfolio,
        savePortfolio,
        isSaving,
        isLoading: portfolioLoading,
        error,
    } = usePortfolioBuilder({ userId, enabled: !!userId })

    const [activeTab, setActiveTab] = useState("content")
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [portfolioData, setPortfolioData] = useState<PortfolioData>({})

    // Synchronisation des données depuis l'API
    useEffect(() => {
        if (portfolio && Object.keys(portfolio).length > 0) {
            setPortfolioData({
                name: portfolio.name || "",
                headline: portfolio.headline || "",
                bio: portfolio.bio || "",
                profileImage: portfolio.profileImage || null,
                template: portfolio.template || PortfolioTemplate.CLASSIC,
                theme: portfolio.theme || "blue",
                isPublic: portfolio.isPublic || false,
                skills: portfolio.skills || [],
                languages: portfolio.languages || [],
                interests: portfolio.interests || [],
                projects: portfolio.projects || [],
                experiences: portfolio.experiences || [],
                education: portfolio.education || [],
                certifications: portfolio.certifications || [],
                sections: portfolio.sections || ["experiences", "skills"],
            })
        }
    }, [portfolio])

    const handleSave = async (dataToSave?: PortfolioData) => {
        const data = dataToSave || portfolioData
        if (userId && data) {
            try {
                const result = await savePortfolio(data)
                if (result.success) {
                    // La sauvegarde a réussi
                }
            } catch (error) {
                console.error("Erreur lors de la sauvegarde:", error)
            }
        }
    }

    const editorTabs = [
        { id: "content", label: "Contenu", icon: User, description: "Vos infos" },
        { id: "design", label: "Design", icon: Palette, description: "Apparence" },
        { id: "layout", label: "Structure", icon: Layout, description: "Organisation" },
        { id: "export", label: "Export", icon: Download, description: "Finalisation" },
    ]

    if (authLoading || portfolioLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                    <Loader2 className="relative h-16 w-16 animate-spin text-emerald-500 mb-6" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Chargement de votre espace créatif...</p>
            </div>
        )
    }

    if (!isAuthenticated || !userId) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Authentification requise</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Connectez-vous pour commencer à sculpter votre carrière.</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">

            <PortfolioSettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                portfolioData={portfolioData}
                setPortfolioData={setPortfolioData}
                onSave={(newData) => handleSave(newData)}
            />

            {/* TOOLBAR */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-4 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-100 dark:border-emerald-900/30 rounded-2xl shadow-lg shadow-emerald-900/5 p-2 flex items-center justify-between"
            >
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 px-1">
                    {editorTabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap outline-none",
                                    isActive
                                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-emerald-600 dark:text-emerald-400" : "opacity-70")} />
                                <span className="text-sm font-medium">{tab.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeToolbarIndicator"
                                        className="absolute inset-0 rounded-xl bg-emerald-100/10 dark:bg-emerald-500/10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center gap-3 px-2 border-l border-slate-200 dark:border-slate-800 ml-2 pl-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mr-2 hidden sm:flex">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                                <span className="text-amber-600 dark:text-amber-500">Sauvegarde...</span>
                            </>
                        ) : (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-emerald-600 dark:text-emerald-400">Enregistré</span>
                            </>
                        )}
                    </div>

                    <Button
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                        <Save className="w-4 h-4 mr-1.5" />
                        <span className="hidden sm:inline">Sauvegarder</span>
                    </Button>
                </div>
            </motion.div>

            {/* SPLIT VIEW AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* EDITOR PANEL (Left) */}
                <motion.div
                    layout
                    className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6"
                >
                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/20">

                        {/* Dynamic Header for the Active Tool */}
                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                            {editorTabs.map(tab => tab.id === activeTab && (
                                <motion.div
                                    key={tab.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                                        <tab.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tab.label}</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{tab.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Tool Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="min-h-[400px]"
                            >
                                {activeTab === "content" && (
                                    <div className="space-y-6">
                                        <AISuggestions portfolioData={portfolioData} setPortfolioData={setPortfolioData} />
                                        <ManualInput
                                            portfolioData={portfolioData}
                                            setPortfolioData={setPortfolioData}
                                            onSave={() => handleSave()}
                                            isSaving={isSaving}
                                        />
                                    </div>
                                )}
                                {activeTab === "design" && (
                                    <div className="space-y-6 flex flex-col items-center justify-center text-center py-10 px-4">
                                        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6">
                                            <Palette className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Personnalisez votre Portfolio</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                                            Changez le modèle, les couleurs et l'apparence générale de votre portfolio pour qu'il vous ressemble.
                                        </p>
                                        <Button
                                            onClick={() => setSettingsOpen(true)}
                                            size="lg"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-6 shadow-lg shadow-emerald-600/20 text-lg transition-all hover:scale-105"
                                        >
                                            <Settings className="w-5 h-5 mr-2" />
                                            Ouvrir les réglages
                                        </Button>
                                    </div>
                                )}
                                {activeTab === "layout" && (
                                    <div className="space-y-6">
                                        <SectionBuilder
                                            portfolioData={portfolioData}
                                            setPortfolioData={setPortfolioData}
                                            onSave={() => handleSave()}
                                            isSaving={isSaving}
                                        />
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                                            <p className="text-sm text-slate-500 mb-4">Vous voulez activer ou désactiver des sections ?</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => setSettingsOpen(true)}
                                                className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                            >
                                                <Settings className="w-4 h-4 mr-2" />
                                                Gérer les sections
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === "export" && (
                                    <ExportPanel portfolioData={portfolioData} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* PREVIEW PANEL (Right) - Sticky on Desktop */}
                <div className="lg:col-span-7 xl:col-span-8 lg:sticky lg:top-24 h-fit">
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden min-h-[800px] lg:h-[calc(100vh-8rem)] relative group">

                        {/* Phone Scale / Desktop Scale Toggle could go here */}
                        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium">
                                Live Preview
                            </div>
                        </div>

                        <div className="w-full h-full overflow-y-auto no-scrollbar bg-white dark:bg-black">
                            <PortfolioPreview portfolioData={portfolioData} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
