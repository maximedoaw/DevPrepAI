"use client"

import { Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterType?: string
  onFilterTypeChange?: (value: string) => void
}

export function SearchFilters({ 
  searchTerm, 
  onSearchChange, 
  filterType = "all",
  onFilterTypeChange 
}: SearchFiltersProps) {
  return (
    <Card className="border border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/80 shadow-lg mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une offre ou un test..."
              className="pl-10 bg-white/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-600/70 focus:border-green-300 dark:focus:border-green-600"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          {onFilterTypeChange && (
            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger className="w-full sm:w-40 bg-white/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-600/70">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
                <SelectItem value="closed">Clôturés</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" className="border-slate-200/70 dark:border-slate-600/70 hover:bg-slate-50/80 dark:hover:bg-slate-800/80">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}