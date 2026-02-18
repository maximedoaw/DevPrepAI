"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Sparkles, Target, ArrowRight, BookOpen, Trophy, Building2, Calendar, Download, Wallet, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface CareerPlanModalProps {
    open: boolean;
    onClose: () => void;
    careerPlan: any;
    onEditAnswers: () => void; // New prop for editing answers
}

function ExpandableText({ text, limit = 150, className }: { text: string, limit?: number, className?: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) return null;
    if (text.length <= limit) return <p className={className}>{text}</p>;

    return (
        <div className="flex flex-col items-start gap-1">
            <p className={cn(className, !isExpanded && "line-clamp-3")}>
                {text}
            </p>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
            >
                {isExpanded ? "Voir moins" : "Voir plus"}
            </button>
        </div>
    );
}

export function CareerPlanModal({ open, onClose, careerPlan, onEditAnswers }: CareerPlanModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    if (!open || !careerPlan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/90 backdrop-blur-md px-0 sm:px-6 py-0 md:py-12 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-950 rounded-none sm:rounded-[2rem] shadow-2xl w-full max-w-5xl border-0 sm:border border-slate-100 dark:border-slate-800 flex flex-col h-[100dvh] sm:h-[90vh] max-h-[90vh]">

                {/* Header Premium */}
                <div className="flex-none p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                    <div className="space-y-2">
                        <Badge variant="outline" className="bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                            ✨ Généré par IA
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Votre Plan de Carrière
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
                            Une feuille de route personnalisée pour atteindre vos objectifs professionnels.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                        onClick={onClose}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Content with Tabs - Updated scroll structure */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-4 md:px-8 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10 flex-none">
                            <TabsList className="h-14 w-full justify-start overflow-x-auto flex-nowrap gap-4 md:gap-6 bg-transparent p-0 scrollbar-hide">
                                <TabsTrigger value="overview" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm md:text-base">
                                    Vue d'ensemble
                                </TabsTrigger>
                                <TabsTrigger value="skills" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm md:text-base">
                                    Analyses & Ponts
                                </TabsTrigger>
                                <TabsTrigger value="path" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm md:text-base">
                                    Parcours & Étapes
                                </TabsTrigger>
                                <TabsTrigger value="actions" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm md:text-base">
                                    Plan d'Action
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Scrollable content area */}
                        <div className="flex-1 overflow-hidden relative">
                            <ScrollArea className="h-full w-full absolute inset-0 bg-slate-50/50 dark:bg-black/20">
                                <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8 pb-8">

                                    <TabsContent value="overview" className="mt-0 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        {/* Hero Summary */}
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500"></div>

                                            <div className="relative z-10">
                                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-6">
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                                                            Votre Profil Reconverti
                                                        </h3>
                                                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white break-words">
                                                            {careerPlan.persona?.type || "Profil Professionnel"}
                                                        </h4>
                                                    </div>
                                                    {careerPlan.persona?.tags && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {careerPlan.persona.tags.map((tag: string) => (
                                                                <Badge key={tag} variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-none px-3 py-1.5 text-sm whitespace-normal text-center">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="prose prose-emerald dark:prose-invert max-w-none">
                                                    <ExpandableText
                                                        text={careerPlan.summary}
                                                        limit={200}
                                                        className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap break-words"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            {/* Objectifs */}
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col h-full shrink-0">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <Target className="w-12 h-12 text-blue-500" />
                                                </div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                                                        <Target className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Objectifs Clés</h3>
                                                </div>
                                                <ul className="space-y-3 flex-1">
                                                    {careerPlan.careerGoals?.shortTerm?.slice(0, 3).map((item: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                            <span className="leading-relaxed text-sm break-words">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Motivation Card */}
                                            <div className="bg-emerald-600 dark:bg-emerald-700 rounded-2xl md:rounded-3xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden flex flex-col h-full justify-center shrink-0">
                                                <div className="relative z-10">
                                                    <Trophy className="w-8 h-8 mb-4 text-emerald-200" />
                                                    <blockquote className="text-lg font-medium leading-relaxed italic pl-0 py-1">
                                                        "{careerPlan.motivationalMessage || "Prêt à transformer votre carrière ?"}"
                                                    </blockquote>
                                                </div>
                                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="skills" className="mt-0 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        {/* Compétences Transférables Section */}
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                                                        <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Compétences Transférables</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    {careerPlan.transferableSkillsAnalysis?.identifiedSkills?.map((item: any, i: number) => (
                                                        <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                                                            <div className="flex justify-between items-start gap-3 mb-2">
                                                                <span className="font-bold text-slate-900 dark:text-white break-words flex-1">{item.skill}</span>
                                                                <Badge className={cn(
                                                                    "text-[10px] uppercase shrink-0",
                                                                    item.value === 'haute' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                                )}>
                                                                    Valeur {item.value}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                                                                {item.context}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Financial Bridge Section */}
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col space-y-6">
                                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                                    <Wallet className="w-24 h-24 text-emerald-600" />
                                                </div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                                                        <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Sécurité Financière</h3>
                                                </div>

                                                {careerPlan.financialBridge ? (
                                                    <div className="space-y-6 flex-1 flex flex-col">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
                                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Salaire Actuel</p>
                                                                <p className="text-2xl font-bold text-slate-900 dark:text-white truncate" title={careerPlan.financialBridge.currentEstimated}>{careerPlan.financialBridge.currentEstimated}</p>
                                                            </div>
                                                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
                                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Cible Junior</p>
                                                                <p className="text-2xl font-bold text-slate-900 dark:text-white truncate" title={careerPlan.financialBridge.targetJuniorEntry}>{careerPlan.financialBridge.targetJuniorEntry}</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                                Analyse de l'écart
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-slate-200 dark:border-slate-700 pl-3 break-words">
                                                                "{careerPlan.financialBridge.gapAnalysis}"
                                                            </p>
                                                        </div>
                                                        <div className="mt-auto p-5 rounded-2xl bg-slate-900 text-white shadow-xl dark:bg-emerald-900/20 border border-slate-800 dark:border-emerald-800">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Landmark className="w-4 h-4 text-emerald-400" />
                                                                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Stratégie Recommandée</h4>
                                                            </div>
                                                            <p className="text-sm text-slate-300 leading-relaxed font-medium break-words">
                                                                {careerPlan.financialBridge.bridgeStrategy}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 italic">Analyse financière non disponible pour ce profil.</p>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="path" className="mt-0 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid gap-4 md:gap-6">
                                            {/* Timeline Steps */}
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white mb-6 md:mb-8">Votre Parcours Recommandé</h3>

                                                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800">
                                                    {careerPlan.recommendedPath?.nextSteps?.map((step: any, idx: number) => (
                                                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border border-white dark:border-slate-900 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-xs md:text-sm">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-800/50 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                                                    <h4 className="font-bold text-slate-900 dark:text-white break-words">{step.step}</h4>
                                                                    {step.timeline && (
                                                                        <Badge variant="secondary" className="text-xs bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                                            {step.timeline}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed break-words">
                                                                    {step.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Skills Grid */}
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <BookOpen className="w-5 h-5 text-purple-500" />
                                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Compétences à Acquérir</h3>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {careerPlan.recommendedPath?.skillsToAcquire?.map((skill: any, idx: number) => (
                                                        <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{skill.skill}</span>
                                                                <Badge variant="outline" className={cn(
                                                                    "text-[10px] uppercase font-bold tracking-wider",
                                                                    skill.importance === 'high' ? "border-red-200 text-red-600 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400" :
                                                                        "border-slate-200 text-slate-500"
                                                                )}>
                                                                    {skill.importance === 'high' ? 'Prioritaire' : 'Conseillé'}
                                                                </Badge>
                                                            </div>
                                                            {skill.resources && (
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                                    <span className="font-medium text-slate-700 dark:text-slate-300">Ressources : </span>
                                                                    {skill.resources.join(", ")}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="actions" className="mt-0 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <div className="flex items-center gap-3 mb-6 md:mb-8">
                                                <Calendar className="w-6 h-6 text-green-500" />
                                                <div>
                                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Plan d'Action Immédiat</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Vos priorités pour les semaines à venir</p>
                                                </div>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                {[
                                                    { title: "Cette Semaine", data: careerPlan.actionPlan?.week1, color: "emerald" },
                                                    { title: "Ce Mois-ci", data: careerPlan.actionPlan?.month1, color: "blue" },
                                                    { title: "Ce Trimestre", data: careerPlan.actionPlan?.month3, color: "purple" },
                                                    { title: "À 6 Mois", data: careerPlan.actionPlan?.month6, color: "amber" }
                                                ].map((section, idx) => (
                                                    section.data && section.data.length > 0 && (
                                                        <div key={idx} className={cn(
                                                            "rounded-2xl p-6 border",
                                                            section.color === "emerald" && "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/50",
                                                            section.color === "blue" && "bg-blue-50/50 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/50",
                                                            section.color === "purple" && "bg-purple-50/50 border-purple-100 dark:bg-purple-950/10 dark:border-purple-900/50",
                                                            section.color === "amber" && "bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/50",
                                                        )}>
                                                            <h4 className={cn(
                                                                "font-bold mb-4 flex items-center gap-2",
                                                                section.color === "emerald" && "text-emerald-800 dark:text-emerald-300",
                                                                section.color === "blue" && "text-blue-800 dark:text-blue-300",
                                                                section.color === "purple" && "text-purple-800 dark:text-purple-300",
                                                                section.color === "amber" && "text-amber-800 dark:text-amber-300",
                                                            )}>
                                                                {section.title}
                                                            </h4>
                                                            <ul className="space-y-3">
                                                                {section.data.map((item: string, i: number) => (
                                                                    <li key={i} className="flex items-start gap-3">
                                                                        <div className={cn(
                                                                            "mt-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-black flex-shrink-0 flex items-center justify-center",
                                                                            section.color === "emerald" && "border-emerald-400",
                                                                            section.color === "blue" && "border-blue-400",
                                                                            section.color === "purple" && "border-purple-400",
                                                                            section.color === "amber" && "border-amber-400",
                                                                        )}>
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full",
                                                                                section.color === "emerald" && "bg-emerald-500",
                                                                                section.color === "blue" && "bg-blue-500",
                                                                                section.color === "purple" && "bg-purple-500",
                                                                                section.color === "amber" && "bg-amber-500",
                                                                            )} />
                                                                        </div>
                                                                        <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>

                                        {/* Motivation */}
                                        {careerPlan.motivationalMessage && (
                                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white shadow-lg text-center">
                                                <Trophy className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-4 text-emerald-200" />
                                                <p className="text-lg md:text-2xl font-medium leading-relaxed italic opacity-90 break-words">
                                                    "{careerPlan.motivationalMessage}"
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>

                {/* Footer Action */}
                <div className="flex-none p-5 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onEditAnswers();
                            onClose();
                        }}
                        className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-sm"
                    >
                        Revoir mes réponses
                    </Button>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:flex-none border-slate-200 dark:border-slate-800" disabled>
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        <Button onClick={onClose} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all">
                            Ça marche, je fonce !
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div >
        </div >
    );
}