import {
  Search, Filter, Briefcase, Zap, Globe, Code, TrendingUp, Building2, Lock,
  Database, Brain, DollarSign, Cog, Palette, Server, Shield, Megaphone,
  Package, Smartphone, MessageSquare, Users, GraduationCap, Heart
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TalentMatchingFiltersProps {
  searchQuery: string
  selectedDomain: string
  onSearchChange: (value: string) => void
  onDomainChange: (value: string) => void
  onReset: () => void
}

const domainOptions = [
  { value: "ALL", label: "Tous les domaines", icon: Globe },
  { value: "DEVELOPMENT", label: "Développement", icon: Code },
  { value: "DATA_SCIENCE", label: "Data Science", icon: Database },
  { value: "MACHINE_LEARNING", label: "Machine Learning", icon: Brain },
  { value: "FINANCE", label: "Finance", icon: DollarSign },
  { value: "BUSINESS", label: "Business", icon: Briefcase },
  { value: "ENGINEERING", label: "Ingénierie", icon: Cog },
  { value: "DESIGN", label: "Design", icon: Palette },
  { value: "DEVOPS", label: "DevOps", icon: Server },
  { value: "CYBERSECURITY", label: "Cybersécurité", icon: Shield },
  { value: "MARKETING", label: "Marketing", icon: Megaphone },
  { value: "PRODUCT", label: "Product", icon: Package },
  { value: "ARCHITECTURE", label: "Architecture", icon: Building2 },
  { value: "MOBILE", label: "Mobile", icon: Smartphone },
  { value: "WEB", label: "Web", icon: Globe },
  { value: "COMMUNICATION", label: "Communication", icon: MessageSquare },
  { value: "MANAGEMENT", label: "Management", icon: Users },
  { value: "EDUCATION", label: "Éducation", icon: GraduationCap },
  { value: "HEALTH", label: "Santé", icon: Heart },
]

export function TalentMatchingFilters({
  searchQuery,
  selectedDomain,
  onSearchChange,
  onDomainChange,
  onReset,
}: TalentMatchingFiltersProps) {
  return (
    <Card className="border border-emerald-200/50 dark:border-emerald-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Filtrer les talents</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Recherche
            </label>
            <div className="relative">
              <Input
                placeholder="Nom, compétence, expertise..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900/50 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Domaine
            </label>
            <Select value={selectedDomain} onValueChange={onDomainChange}>
              <SelectTrigger className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900/50 rounded-lg focus:ring-2 focus:ring-emerald-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-lg bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800">
                {domainOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value} className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {option.label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Disponibilité
            </label>
            <Select defaultValue="ALL">
              <SelectTrigger className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900/50 rounded-lg focus:ring-2 focus:ring-emerald-500/20">
                <SelectValue placeholder="Toute disponibilité" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-lg bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800">
                <SelectItem value="ALL">Toute disponibilité</SelectItem>
                <SelectItem value="IMMEDIATE">Disponible immédiatement</SelectItem>
                <SelectItem value="PART_TIME">Temps partiel</SelectItem>
                <SelectItem value="FULL_TIME">Temps plein</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              onClick={onReset}
              className="flex-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"
            >
              Réinitialiser
            </Button>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 rounded-lg">
              Appliquer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
