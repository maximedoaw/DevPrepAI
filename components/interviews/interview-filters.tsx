"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Search,
    RotateCcw,
    Plus,
    Settings2,
    Filter as FilterIcon,
    Trash2,
    Save,
    Star
} from "lucide-react"
import { cn } from "@/lib/utils"

const DOMAINS = [
    "MACHINE_LEARNING",
    "DEVELOPMENT",
    "DATA_SCIENCE",
    "FINANCE",
    "BUSINESS",
    "ENGINEERING",
    "DESIGN",
    "DEVOPS",
    "CYBERSECURITY",
    "MARKETING",
    "PRODUCT",
    "ARCHITECTURE",
    "MOBILE",
    "WEB",
    "COMMUNICATION",
    "MANAGEMENT",
    "EDUCATION",
    "HEALTH"
]

interface InterviewFiltersProps {
    activeTab: string
    filters: {
        difficulty: string
        domain: string
        dateSort: string
    }
    onFilterChange: (key: string, value: string) => void
    onReset: () => void
    searchTerm: string
    onSearchChange: (val: string) => void

    // Favorites
    showFavorites: boolean
    onToggleFavorites: (val: boolean) => void

    // Templates
    templates?: any[]
    onSaveTemplate?: (name: string) => void
    onDeleteTemplate?: (id: string) => void
    onSelectTemplate?: (template: any) => void
    activeToggle: "filters" | "templates"
    onToggleChange: (val: "filters" | "templates") => void
}

export function InterviewFilters({
    activeTab,
    filters,
    onFilterChange,
    onReset,
    searchTerm,
    onSearchChange,
    showFavorites,
    onToggleFavorites,
    templates = [],
    onSaveTemplate,
    onDeleteTemplate,
    onSelectTemplate,
    activeToggle,
    onToggleChange
}: InterviewFiltersProps) {
    const [newTemplateName, setNewTemplateName] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = () => {
        if (!newTemplateName.trim()) return
        onSaveTemplate?.(newTemplateName)
        setNewTemplateName("")
        setIsSaving(false)
    }

    return (
        <div className="space-y-8">

            {/* Toggle Filters / Templates */}
            <div className="flex bg-slate-100/80 dark:bg-slate-900/40 p-1 rounded-full border border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => onToggleChange("filters")}
                    className={cn(
                        "flex-1 py-1.5 px-4 text-[12px] font-bold rounded-full transition-all",
                        activeToggle === "filters"
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                >
                    Filtres
                </button>
                <button
                    onClick={() => onToggleChange("templates")}
                    className={cn(
                        "flex-1 py-1.5 px-4 text-[12px] font-bold rounded-full transition-all",
                        activeToggle === "templates"
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                >
                    Modèles
                </button>
            </div>

            <div className="space-y-8">
                {activeToggle === "filters" ? (
                    <>
                        {/* Search */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Mots-clés</Label>
                            <div className="relative group">
                                <Input
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-4 pr-10 py-5 bg-transparent border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-2xl shadow-none transition-all text-xs font-medium"
                                />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                        </div>

                        {/* Domain Filter */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Thématique</Label>
                            <Select
                                value={filters.domain || "all"}
                                onValueChange={(val) => onFilterChange("domain", val === "all" ? "" : val)}
                            >
                                <SelectTrigger className="w-full py-5 bg-transparent border-slate-200 dark:border-slate-800 rounded-2xl text-[12px] font-medium text-slate-600 dark:text-slate-400 shadow-none">
                                    <SelectValue placeholder="Domaine" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <SelectItem value="all" className="text-[11px] font-bold uppercase">Tous les domaines</SelectItem>
                                    {DOMAINS.map((domain) => (
                                        <SelectItem key={domain} value={domain} className="text-[11px] font-bold uppercase">
                                            {domain.replace(/_/g, " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Level / Difficulty */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Exigence</Label>
                            <Select
                                value={filters.difficulty || "all"}
                                onValueChange={(val) => onFilterChange("difficulty", val)}
                            >
                                <SelectTrigger className="w-full py-5 bg-transparent border-slate-200 dark:border-slate-800 rounded-2xl text-[12px] font-medium text-slate-600 dark:text-slate-400 shadow-none">
                                    <SelectValue placeholder="Niveau" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <SelectItem value="all" className="text-[11px] font-bold uppercase">Tous les niveaux</SelectItem>
                                    <SelectItem value="JUNIOR" className="text-[11px] font-bold uppercase">Junior</SelectItem>
                                    <SelectItem value="MID" className="text-[11px] font-bold uppercase">Intermédiaire</SelectItem>
                                    <SelectItem value="SENIOR" className="text-[11px] font-bold uppercase">Senior</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Favorites Switch */}
                        <div className="flex items-center justify-between px-1 py-1">
                            <div className="flex items-center gap-2">
                                <Star className={cn("w-3.5 h-3.5", showFavorites ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mes Favoris</Label>
                            </div>
                            <Switch
                                checked={showFavorites}
                                onCheckedChange={onToggleFavorites}
                                className="data-[state=checked]:bg-amber-500"
                            />
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="advanced" className="border-none">
                                <AccordionTrigger className="flex items-center gap-2 py-2 px-1 hover:no-underline group">
                                    <div className="flex items-center gap-2">
                                        <Settings2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">Options</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 px-1 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] pl-0.5">Tri par date</Label>
                                        <Select
                                            value={filters.dateSort}
                                            onValueChange={(val) => onFilterChange("dateSort", val)}
                                        >
                                            <SelectTrigger className="bg-transparent border-slate-200 dark:border-slate-800 rounded-xl h-9 text-[11px] font-medium shadow-none">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="newest" className="text-[11px] font-medium">Le plus récent</SelectItem>
                                                <SelectItem value="oldest" className="text-[11px] font-medium">Le plus ancien</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <div className="pt-4 flex flex-col gap-2.5">
                            <Button
                                variant="outline"
                                className="w-full h-11 bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl text-[11px] uppercase tracking-widest shadow-none"
                                onClick={onReset}
                            >
                                <RotateCcw className="w-3.5 h-3.5 mr-2 opacity-50" />
                                Réinitialiser
                            </Button>

                            {!isSaving ? (
                                <Button
                                    onClick={() => setIsSaving(true)}
                                    className="w-full h-11 bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-2xl text-[11px] uppercase tracking-widest transition-all"
                                >
                                    <Save className="w-3.5 h-3.5 mr-2" />
                                    Enregistrer Modèle
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Nom du modèle..."
                                        value={newTemplateName}
                                        onChange={(e) => setNewTemplateName(e.target.value)}
                                        className="h-11 rounded-2xl bg-white dark:bg-slate-800 border-emerald-500/30 text-xs"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" className="flex-1 rounded-xl text-[10px]" onClick={() => setIsSaving(false)}>Annuler</Button>
                                        <Button size="sm" className="flex-1 rounded-xl bg-emerald-600 text-[10px]" onClick={handleSave}>Valider</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Mes modèles sauvegardés</Label>
                            {templates.length === 0 ? (
                                <div className="py-8 px-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-2xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aucun modèle</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="group flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm"
                                            onClick={() => onSelectTemplate?.(template)}
                                        >
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">{template.name}</p>
                                                <div className="flex gap-2">
                                                    <span className="text-[9px] font-bold text-slate-400">{template.filters?.difficulty || "Tout"} • {template.filters?.domain?.slice(0, 10) || "Tous domaines"}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDeleteTemplate?.(template.id)
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={() => onToggleChange("filters")}
                            variant="ghost"
                            className="w-full h-11 text-emerald-600 dark:text-emerald-400 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                        >
                            <FilterIcon className="w-3.5 h-3.5 mr-2" />
                            Retour aux filtres
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
