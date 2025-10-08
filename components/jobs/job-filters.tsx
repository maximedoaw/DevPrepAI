// job-filters.tsx
import { Domain, JobFilters as JobFiltersType, JobType, WorkMode } from "@/types/job";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
}

const domainLabels: Record<Domain, string> = {
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
};

const jobTypeLabels: Record<JobType, string> = {
  [JobType.CDI]: "CDI",
  [JobType.MISSION]: "Mission",
  [JobType.STAGE]: "Stage",
  [JobType.FULL_TIME]: "Temps plein",
  [JobType.PART_TIME]: "Temps partiel",
  [JobType.CONTRACT]: "Contrat",
  [JobType.INTERNSHIP]: "Stage",
};

const workModeLabels: Record<WorkMode, string> = {
  [WorkMode.REMOTE]: "Remote",
  [WorkMode.ON_SITE]: "Présentiel",
  [WorkMode.HYBRID]: "Hybride",
};

export const JobFilters = ({ filters, onFiltersChange }: JobFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDomain = (domain: Domain) => {
    const currentDomains = filters.domains || [];
    const newDomains = currentDomains.includes(domain)
      ? currentDomains.filter(d => d !== domain)
      : [...currentDomains, domain];
    
    onFiltersChange({ ...filters, domains: newDomains });
  };

  const toggleJobType = (type: JobType) => {
    const current = filters.jobTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    
    onFiltersChange({ ...filters, jobTypes: updated });
  };

  const toggleWorkMode = (mode: WorkMode) => {
    const current = filters.workModes || [];
    const updated = current.includes(mode)
      ? current.filter(m => m !== mode)
      : [...current, mode];
    
    onFiltersChange({ ...filters, workModes: updated });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = 
    (filters.domains?.length || 0) + 
    (filters.location ? 1 : 0) + 
    (filters.jobTypes?.length || 0) +
    (filters.workModes?.length || 0);

  return (
    <Card className={cn(
      "border-0 shadow-lg",
      "bg-gradient-to-br from-white via-blue-50/30 to-slate-100",
      "dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              {activeFiltersCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Réinitialiser
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            {isExpanded ? "Masquer" : "Afficher"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-6", isExpanded ? 'block' : 'hidden lg:block')}>
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-semibold">Localisation</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Ville, pays..."
              value={filters.location || ""}
              onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
              className="pl-10 border-blue-200/50 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 bg-white/50 dark:bg-slate-800/50"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Type de poste</Label>
          <div className="flex flex-wrap gap-2">
            {[JobType.CDI, JobType.MISSION, JobType.STAGE].map((type) => {
              const isSelected = filters.jobTypes?.includes(type);
              
              return (
                <Badge
                  key={type}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-0 px-3 py-1.5",
                    isSelected 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-300 dark:hover:bg-green-900/50"
                  )}
                  onClick={() => toggleJobType(type)}
                >
                  {jobTypeLabels[type]}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Mode de travail</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(workModeLabels).map(([key, label]) => {
              const mode = key as WorkMode;
              const isSelected = filters.workModes?.includes(mode);
              
              return (
                <Badge
                  key={mode}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-0 px-3 py-1.5",
                    isSelected 
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                      : "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                  )}
                  onClick={() => toggleWorkMode(mode)}
                >
                  {label}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Domaines</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(domainLabels).map(([key, label]) => {
              const domain = key as Domain;
              const isSelected = filters.domains?.includes(domain);
              
              return (
                <Badge
                  key={domain}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-0 px-3 py-1.5",
                    isSelected 
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                  )}
                  onClick={() => toggleDomain(domain)}
                >
                  {label}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};