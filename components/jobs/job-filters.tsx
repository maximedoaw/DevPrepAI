import { Domain, JobFilters as JobFiltersType, JobType, WorkMode } from "@/types/job"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Filter, Search, RotateCcw, Building2, MapPin, Briefcase, Monitor } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface JobFiltersProps {
  filters: JobFiltersType
  onFiltersChange: (filters: JobFiltersType) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
}

const domainLabels: Record<Domain, string> = {
  [Domain.MACHINE_LEARNING]: "Machine Learning",
  [Domain.DEVELOPMENT]: "Développement",
  [Domain.DATA_SCIENCE]: "Data Science",
  [Domain.FINANCE]: "Finance",
  [Domain.BUSINESS]: "Business",
  [Domain.ENGINEERING]: "Ingénierie",
  [Domain.DESIGN]: "Design",
  [Domain.DEVOPS]: "DevOps",
  [Domain.CYBERSECURITY]: "Cybersécurité",
  [Domain.MARKETING]: "Marketing",
  [Domain.PRODUCT]: "Product",
  [Domain.ARCHITECTURE]: "Architecture",
  [Domain.MOBILE]: "Mobile",
  [Domain.WEB]: "Web",
  [Domain.COMMUNICATION]: "Communication",
  [Domain.MANAGEMENT]: "Management",
  [Domain.EDUCATION]: "Éducation",
  [Domain.HEALTH]: "Santé"
}

const jobTypeLabels: Record<JobType, string> = {
  [JobType.CDI]: "CDI",
  [JobType.MISSION]: "Mission",
  [JobType.STAGE]: "Stage",
  [JobType.FULL_TIME]: "Temps plein",
  [JobType.PART_TIME]: "Temps partiel",
  [JobType.CONTRACT]: "Contrat",
  [JobType.INTERNSHIP]: "Stage",
}

const workModeLabels: Record<WorkMode, string> = {
  [WorkMode.REMOTE]: "Remote",
  [WorkMode.ON_SITE]: "Présentiel",
  [WorkMode.HYBRID]: "Hybride",
}

export const JobFilters = ({ filters, onFiltersChange, searchTerm, onSearchChange }: JobFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleDomain = (domain: Domain) => {
    const currentDomains = filters.domains || []
    const newDomains = currentDomains.includes(domain)
      ? currentDomains.filter(d => d !== domain)
      : [...currentDomains, domain]

    onFiltersChange({ ...filters, domains: newDomains })
  }

  const toggleJobType = (type: JobType) => {
    const current = filters.jobTypes || []
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]

    onFiltersChange({ ...filters, jobTypes: updated })
  }

  const toggleWorkMode = (mode: WorkMode) => {
    const current = filters.workModes || []
    const updated = current.includes(mode)
      ? current.filter(m => m !== mode)
      : [...current, mode]

    onFiltersChange({ ...filters, workModes: updated })
  }

  const clearFilters = () => {
    onFiltersChange({})
    if (onSearchChange) onSearchChange("")
  }

  const activeFiltersCount =
    (filters.domains?.length || 0) +
    (filters.location ? 1 : 0) +
    (filters.jobTypes?.length || 0) +
    (filters.workModes?.length || 0)

  return (
    <div className="space-y-8">
      {/* Search Header */}
      {onSearchChange && (
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Mots-clés</Label>
          <div className="relative group">
            <Input
              placeholder="Titre, compétences..."
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-4 pr-10 py-5 bg-transparent border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-2xl shadow-none transition-all text-xs font-medium"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          </div>
        </div>
      )}

      {/* Filters Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtres actifs ({activeFiltersCount})</span>
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-[10px] font-bold uppercase tracking-wide text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reset
          </Button>
        )}
      </div>

      <div className={cn("space-y-8", isExpanded ? 'block' : 'hidden lg:block')}>

        {/* Localisation */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Localisation</Label>
          <div className="relative group">
            <Input
              placeholder="Ville, pays..."
              value={filters.location || ""}
              onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
              className="pl-4 pr-10 py-5 bg-transparent border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-2xl shadow-none transition-all text-xs font-medium"
            />
            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          </div>
        </div>

        <Accordion type="multiple" defaultValue={["types", "modes", "domains"]} className="w-full space-y-4">

          {/* Type de poste */}
          <AccordionItem value="types" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">Type de poste</Label>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="flex flex-wrap gap-2">
                {[JobType.CDI, JobType.MISSION, JobType.STAGE, JobType.FULL_TIME, JobType.PART_TIME].map((type) => {
                  const isSelected = filters.jobTypes?.includes(type)
                  return (
                    <button
                      key={type}
                      onClick={() => toggleJobType(type)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm"
                          : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 hover:text-slate-700 dark:text-slate-400"
                      )}
                    >
                      {jobTypeLabels[type]}
                    </button>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Mode de travail */}
          <AccordionItem value="modes" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">Mode de travail</Label>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="flex flex-wrap gap-2">
                {Object.entries(workModeLabels).map(([key, label]) => {
                  const mode = key as WorkMode
                  const isSelected = filters.workModes?.includes(mode)
                  return (
                    <button
                      key={mode}
                      onClick={() => toggleWorkMode(mode)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                        isSelected
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20"
                          : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 hover:text-slate-700 dark:text-slate-400"
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Domaines */}
          <AccordionItem value="domains" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">Domaines</Label>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="flex flex-wrap gap-2">
                {Object.entries(domainLabels).map(([key, label]) => {
                  const domain = key as Domain
                  const isSelected = filters.domains?.includes(domain)
                  return (
                    <button
                      key={domain}
                      onClick={() => toggleDomain(domain)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm"
                          : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 hover:text-slate-700 dark:text-slate-400"
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
      >
        {isExpanded ? "Masquer les filtres" : "Afficher les filtres"}
      </Button>
    </div>
  )
}