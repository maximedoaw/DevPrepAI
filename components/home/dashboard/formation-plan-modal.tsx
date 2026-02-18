"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    X,
    Sparkles,
    Target,
    ArrowRight,
    BookOpen,
    Trophy,
    Building2,
    Calendar,
    Download,
    Zap,
    GraduationCap,
    MapPin,
    Rocket,
    Layout
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef, useState } from "react"

interface FormationPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: any;
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

export function FormationPlanModal({ isOpen, onClose, plan }: FormationPlanModalProps) {
    if (!isOpen || !plan) return null;

    const {
        summary,
        institutionalFocus,
        strategicPillars = [],
        marketAlignment = {},
        implementationRoadmap = [],
        actionPlanForCohorts = {},
        motivationalMessage
    } = plan;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/90 backdrop-blur-md px-0 sm:px-6 py-0 md:py-12 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-950 rounded-none sm:rounded-[2rem] shadow-2xl w-full max-w-5xl border-0 sm:border border-slate-100 dark:border-slate-800 flex flex-col h-[100dvh] sm:h-[90vh] max-h-[90vh]">

                {/* Header Premium */}
                <div className="flex-none p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                    <div className="space-y-2">
                        <Badge variant="outline" className="bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                            ✨ Stratégie Académique IA
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Plan d'Accompagnement
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
                            Une vision stratégique pour l'excellence et l'insertion professionnelle.
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

                {/* Content with Tabs */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-4 md:px-8 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10 flex-none">
                            <TabsList className="h-14 w-full justify-start overflow-x-auto flex-nowrap gap-4 md:gap-6 bg-transparent p-0 scrollbar-hide">
                                <TabsTrigger value="overview" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm md:text-base">
                                    Vue d'ensemble
                                </TabsTrigger>
                                <TabsTrigger value="strategy" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm md:text-base">
                                    Piliers Stratégiques
                                </TabsTrigger>
                                <TabsTrigger value="blueprint" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm md:text-base">
                                    Marché & Impact
                                </TabsTrigger>
                                <TabsTrigger value="roadmap" className="h-14 shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 px-0 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm md:text-base">
                                    Route de Déploiement
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
                                                            Vision Stratégique
                                                        </h3>
                                                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white break-words capitalize">
                                                            Excellence & Insertion
                                                        </h4>
                                                    </div>
                                                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Focus Institutionnel</p>
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            {institutionalFocus || "Alignement Marché"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="prose prose-emerald dark:prose-invert max-w-none">
                                                    <ExpandableText
                                                        text={summary}
                                                        limit={200}
                                                        className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap break-words"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Advisory Card */}
                                        <div className="bg-slate-900 dark:bg-emerald-900/20 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <Trophy className="w-6 h-6 md:w-8 md:h-8 mb-4 text-emerald-400" />
                                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-3">Note du Stratège SkillWorkz</h3>
                                                <p className="text-base md:text-lg font-medium leading-relaxed italic border-l-2 border-emerald-500/30 pl-4 py-1 break-words">
                                                    "{motivationalMessage || "L'avenir académique se construit aujourd'hui."}"
                                                </p>
                                            </div>
                                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="strategy" className="mt-0 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            {strategicPillars.map((pillar: any, i: number) => (
                                                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group shrink-0">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                                                        </div>
                                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">{pillar.title}</h3>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                                                            {pillar.description}
                                                        </p>
                                                        <div className="pt-4 mt-auto">
                                                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-none px-3 py-1.5 text-[10px] font-black uppercase">
                                                                Impact : {pillar.impact}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="blueprint" className="mt-0 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 md:space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                                                        <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Alignement Marché</h3>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                            <div className="w-4 h-[1px] bg-slate-200" /> Besoins Employeurs
                                                        </h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic border-l-2 border-emerald-500/20 pl-4 break-words">
                                                            {marketAlignment.marketNeeds}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                            <div className="w-4 h-[1px] bg-slate-200" /> Focus Institutionnel
                                                        </h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                                                            {marketAlignment.institutionalGap}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-emerald-600 dark:bg-emerald-700 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white shadow-xl flex flex-col justify-between group h-full">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white/20 rounded-xl">
                                                            <Building2 className="w-5 h-5 text-emerald-100" />
                                                        </div>
                                                        <h3 className="font-bold text-xl">Potentiel de Placement</h3>
                                                    </div>
                                                    <p className="text-emerald-50 text-base leading-relaxed opacity-90">
                                                        Nous avons identifié des synergies fortes avec les acteurs majeurs du secteur pour vos cohortes.
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 pt-4">
                                                        {marketAlignment.targetEmployers?.map((emp: string, i: number) => (
                                                            <Badge key={i} className="bg-white/20 text-white border-0 text-[10px] font-bold uppercase py-1.5 px-4 rounded-full">
                                                                {emp}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mt-8 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-60">
                                                    <Sparkles className="w-3 h-3" /> Basé sur les Analytics SkillWorkz
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="roadmap" className="mt-0 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                            <div className="flex items-center gap-3 mb-6 md:mb-8">
                                                <Rocket className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                                                <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white">Route de Déploiement</h3>
                                            </div>

                                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800">
                                                {implementationRoadmap.map((step: any, idx: number) => (
                                                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                                        <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border border-white dark:border-slate-900 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-xs md:text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start lg:items-center gap-2 mb-3">
                                                                <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] md:text-sm tracking-tight break-words">{step.step}</h4>
                                                                <Badge variant="secondary" className="text-[8px] md:text-[9px] font-black uppercase bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-none shrink-0">
                                                                    {step.timeline}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                                                {step.description}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "w-2 h-2 rounded-full animate-pulse",
                                                                    step.priority === 'high' ? "bg-red-500" : "bg-emerald-500"
                                                                )} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priorité {step.priority === 'high' ? 'Haute' : 'Normale'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Plan Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                                            {[
                                                { title: "Phases Initiales", data: actionPlanForCohorts.launch, color: "emerald", icon: Layout },
                                                { title: "Développement", data: actionPlanForCohorts.midTerm, color: "blue", icon: Zap },
                                                { title: "Finalisation", data: actionPlanForCohorts.final, color: "purple", icon: Trophy }
                                            ].map((section, idx) => (
                                                <div key={idx} className={cn(
                                                    "rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 border shadow-sm",
                                                    section.color === "emerald" && "bg-white border-slate-100 dark:bg-slate-900/40 dark:border-emerald-900/30",
                                                    section.color === "blue" && "bg-white border-slate-100 dark:bg-slate-900/40 dark:border-blue-900/30",
                                                    section.color === "purple" && "bg-white border-slate-100 dark:bg-slate-900/40 dark:border-purple-900/30",
                                                )}>
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className={cn(
                                                            "p-2 rounded-xl",
                                                            section.color === "emerald" && "bg-emerald-100 text-emerald-600",
                                                            section.color === "blue" && "bg-blue-100 text-blue-600",
                                                            section.color === "purple" && "bg-purple-100 text-purple-600",
                                                        )}>
                                                            <section.icon className="w-4 h-4" />
                                                        </div>
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{section.title}</h4>
                                                    </div>
                                                    <ul className="space-y-4">
                                                        {section.data?.map((item: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-3">
                                                                <ArrowRight className={cn(
                                                                    "w-3 h-3 mt-1 shrink-0",
                                                                    section.color === "emerald" && "text-emerald-500",
                                                                    section.color === "blue" && "text-blue-500",
                                                                    section.color === "purple" && "text-purple-500",
                                                                )} />
                                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>

                {/* Footer Action */}
                <div className="flex-none p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                        Fermer le plan
                    </Button>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:flex-none border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase" disabled>
                            <Download className="w-4 h-4 mr-2" />
                            Rapport PDF
                        </Button>
                        <Button onClick={onClose} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all text-[10px] font-black uppercase tracking-widest h-11 px-8 rounded-xl">
                            Valider la Stratégie
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
