"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Check, Layout, Palette, Settings, Briefcase, BookOpen, Code, Languages, Heart, Award } from "lucide-react"
import { PortfolioTemplate } from "@prisma/client"
import { cn } from "@/lib/utils"

// Data constants
const templates = [
    {
        id: PortfolioTemplate.CLASSIC,
        name: "Classique",
        description: "Design professionnel et épuré",
        color: "from-blue-500 to-blue-600",
    },
    {
        id: PortfolioTemplate.MODERN,
        name: "Moderne",
        description: "Style contemporain et fluide",
        color: "from-purple-500 to-purple-600",
    },
    {
        id: PortfolioTemplate.MINIMAL,
        name: "Minimaliste",
        description: "Simplicité et élégance",
        color: "from-slate-500 to-slate-700",
    },
    {
        id: PortfolioTemplate.CORPORATE,
        name: "Corporate",
        description: "Business et technologie",
        color: "from-cyan-500 to-blue-600",
    },
    {
        id: PortfolioTemplate.TECH,
        name: "Tech",
        description: "Pour les développeurs",
        color: "from-emerald-500 to-green-600",
    },
    {
        id: PortfolioTemplate.THREE_D,
        name: "Immersif 3D",
        description: "Expérience interactive 3D",
        color: "from-orange-500 to-amber-600",
    },
]

const themes = [
    { id: "blue", name: "Bleu Pro", color: "from-blue-500 to-blue-600" },
    { id: "purple", name: "Violet Créa", color: "from-purple-500 to-purple-600" },
    { id: "emerald", name: "Émeraude", color: "from-emerald-500 to-emerald-600" },
    { id: "rose", name: "Rose Vif", color: "from-rose-500 to-rose-600" },
    { id: "amber", name: "Ambre Chaud", color: "from-amber-500 to-amber-600" },
    { id: "indigo", name: "Indigo Tech", color: "from-indigo-500 to-indigo-600" },
]

const allSections = [
    { id: "experiences", name: "Expériences", icon: Briefcase, description: "Votre parcours pro" },
    { id: "education", name: "Formation", icon: BookOpen, description: "Diplômes et études" },
    { id: "projects", name: "Projets", icon: Code, description: "Vos réalisations" },
    { id: "skills", name: "Compétences", icon: Award, description: "Vos expertises" },
    { id: "languages", name: "Langues", icon: Languages, description: "Langues parlées" },
    { id: "interests", name: "Intérêts", icon: Heart, description: "Passions & hobbies" },
]

interface PortfolioSettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    portfolioData: any
    setPortfolioData: (data: any) => void
}

export default function PortfolioSettingsDialog({
    open,
    onOpenChange,
    portfolioData,
    setPortfolioData,
}: PortfolioSettingsDialogProps) {
    const [activeTab, setActiveTab] = useState<"templates" | "style" | "options">("templates")

    // Local state for deferred updates
    const [tempData, setTempData] = useState(portfolioData)

    // Sync temp state when dialog opens
    useEffect(() => {
        if (open) {
            setTempData(portfolioData)
        }
    }, [open, portfolioData])

    const handleTemplateSelect = (templateId: PortfolioTemplate) => {
        setTempData({ ...tempData, template: templateId })
    }

    const handleThemeChange = (themeId: string) => {
        setTempData({ ...tempData, theme: themeId })
    }

    const toggleSection = (sectionId: string) => {
        const currentSections = tempData.sections || []
        const newSections = currentSections.includes(sectionId)
            ? currentSections.filter((id: string) => id !== sectionId)
            : [...currentSections, sectionId]
        setTempData({ ...tempData, sections: newSections })
    }

    const handleSave = () => {
        setPortfolioData(tempData)
        onOpenChange(false)
    }

    const handleCancel = () => {
        // Reset temp data is handled by useEffect on re-open, but good to close
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-5xl h-[90vh] md:h-[85vh] p-0 gap-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-emerald-100 dark:border-emerald-900/20 shadow-2xl rounded-3xl flex flex-col">

                {/* HEADER FIXE */}
                <div className="flex-none p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                    <div className="flex flex-col items-center justify-center text-center mb-6">
                        <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Personnalisation
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                            Configurez l'apparence et le contenu de votre portfolio
                        </DialogDescription>
                    </div>

                    {/* Custom Manual Tabs */}
                    <div className="flex justify-center w-full">
                        <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 w-full max-w-2xl">
                            <button
                                onClick={() => setActiveTab("templates")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === "templates"
                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                                )}
                            >
                                <Layout className="w-4 h-4" />
                                <span className="hidden sm:inline">Modèles</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("style")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === "style"
                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                                )}
                            >
                                <Palette className="w-4 h-4" />
                                <span className="hidden sm:inline">Apparence</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("options")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === "options"
                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                                )}
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Options</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* SCROLLABLE CONTENT AREA - occupies remaining height */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30 dark:bg-black/20">
                    <div className="p-4 sm:p-8 max-w-6xl mx-auto">

                        {/* TEMPLATES CONTENT */}
                        <div className={cn("space-y-6 transition-opacity duration-300", activeTab === "templates" ? "opacity-100" : "hidden opacity-0")}>
                            <div className="space-y-2 text-center sm:text-left">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Choisissez votre structure</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Sélectionnez le modèle qui mettra le mieux en valeur votre parcours.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        onClick={() => handleTemplateSelect(template.id)}
                                        className={cn(
                                            "group relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                            tempData.template === template.id
                                                ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-800"
                                        )}
                                    >
                                        <div className={`h-36 rounded-xl mb-5 bg-gradient-to-br ${template.color} opacity-90 group-hover:opacity-100 transition-opacity shadow-inner flex items-center justify-center`}>
                                            <Layout className="w-12 h-12 text-white/50 transform group-hover:scale-110 transition-transform" />
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-lg mb-1">
                                                    {template.name}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{template.description}</p>
                                            </div>
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 transform border-2",
                                                tempData.template === template.id
                                                    ? "bg-emerald-500 border-emerald-500 text-white scale-100 rotate-0"
                                                    : "bg-transparent border-slate-200 dark:border-slate-700 text-transparent scale-90"
                                            )}>
                                                <Check className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* STYLE CONTENT */}
                        <div className={cn("space-y-6 transition-opacity duration-300", activeTab === "style" ? "opacity-100" : "hidden opacity-0")}>
                            <div className="space-y-2 text-center sm:text-left">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Palette de couleurs</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Une identité visuelle forte pour marquer les esprits.</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                                {themes.map((theme) => (
                                    <div
                                        key={theme.id}
                                        onClick={() => handleThemeChange(theme.id)}
                                        className={cn(
                                            "cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                                            tempData.theme === theme.id
                                                ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-emerald-500/20"
                                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200"
                                        )}
                                    >
                                        <div className={`h-24 rounded-xl bg-gradient-to-r ${theme.color} mb-4 shadow-sm`} />
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-900 dark:text-slate-200">{theme.name}</span>
                                            {tempData.theme === theme.id && (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-emerald-500/30 shadow-lg">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* OPTIONS CONTENT */}
                        <div className={cn("space-y-6 transition-opacity duration-300", activeTab === "options" ? "opacity-100" : "hidden opacity-0")}>
                            <div className="space-y-2 text-center sm:text-left">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sections visibles</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Activez uniquement les sections pertinentes pour votre profil.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-6">
                                {allSections.map((section) => {
                                    const Icon = section.icon
                                    const isEnabled = tempData.sections?.includes(section.id)

                                    return (
                                        <div
                                            key={section.id}
                                            className={cn(
                                                "relative overflow-hidden flex flex-col justify-between p-5 rounded-2xl border-2 transition-all duration-300 min-h-[140px]",
                                                isEnabled
                                                    ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm"
                                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            {isEnabled && (
                                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-100/50 to-transparent dark:from-emerald-900/30 rounded-bl-full -mr-6 -mt-6 pointer-events-none" />
                                            )}

                                            <div className="flex justify-between items-start mb-4 z-10">
                                                <div className={cn(
                                                    "p-3 rounded-2xl transition-colors",
                                                    isEnabled ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                                )}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <Switch
                                                    checked={isEnabled}
                                                    onCheckedChange={() => toggleSection(section.id)}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                            </div>

                                            <div className="z-10 mt-auto">
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{section.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{section.description}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>
                </div>

                {/* FOOTER FIXE */}
                <div className="flex-none p-5 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex justify-end gap-3 backdrop-blur-md">
                    <Button variant="ghost" onClick={handleCancel} className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 h-12 px-6">
                        Annuler
                    </Button>
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 px-8 h-12 font-semibold transition-all hover:scale-105 active:scale-95">
                        Valider les changements
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
