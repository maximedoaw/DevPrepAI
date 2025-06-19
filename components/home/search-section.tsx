"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, MapPin, Clock, Star, TrendingUp } from "lucide-react"

interface SearchSectionProps {
  onSearch?: (query: string, filters: SearchFilters) => void
  onFiltersChange?: (filters: SearchFilters) => void
}

interface SearchFilters {
  difficulty: string[]
  type: string[]
  technology: string[]
  duration: string[]
}

export function SearchSection({ onSearch, onFiltersChange }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    difficulty: [],
    type: [],
    technology: [],
    duration: []
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const difficultyOptions = ["JUNIOR", "MID", "SENIOR"]
  const typeOptions = ["QCM", "CODING", "MOCK_INTERVIEW", "SOFT_SKILLS"]
  const technologyOptions = ["React", "JavaScript", "TypeScript", "Node.js", "Python", "Java", "SQL"]
  const durationOptions = ["15", "30", "45", "60"]

  const handleFilterToggle = (category: keyof SearchFilters, value: string) => {
    const newFilters = {
      ...filters,
      [category]: filters[category].includes(value)
        ? filters[category].filter(item => item !== value)
        : [...filters[category], value]
    }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleSearch = () => {
    onSearch?.(searchQuery, filters)
  }

  const clearFilters = () => {
    const newFilters = {
      difficulty: [],
      type: [],
      technology: [],
      duration: []
    }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0)

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12">
      {/* Barre de recherche principale */}
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Champ de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher des interviews, technologies, entreprises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            {/* Bouton de recherche */}
            <Button 
              onClick={handleSearch}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              Rechercher
            </Button>
            
            {/* Bouton filtres */}
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-12 px-6 border-gray-300 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {hasActiveFilters && (
                <Badge className="ml-2 h-5 w-5 rounded-full bg-blue-500 text-white text-xs">
                  {Object.values(filters).reduce((acc, arr) => acc + arr.length, 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Section des filtres */}
          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Difficulté */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Difficulté
                  </h3>
                  <div className="space-y-3">
                    {difficultyOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`difficulty-${option}`}
                          checked={filters.difficulty.includes(option)}
                          onCheckedChange={() => handleFilterToggle('difficulty', option)}
                        />
                        <label
                          htmlFor={`difficulty-${option}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Type
                  </h3>
                  <div className="space-y-3">
                    {typeOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${option}`}
                          checked={filters.type.includes(option)}
                          onCheckedChange={() => handleFilterToggle('type', option)}
                        />
                        <label
                          htmlFor={`type-${option}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {option === 'MOCK_INTERVIEW' ? 'Mock Interview' : option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Technologies
                  </h3>
                  <div className="space-y-3">
                    {technologyOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`technology-${option}`}
                          checked={filters.technology.includes(option)}
                          onCheckedChange={() => handleFilterToggle('technology', option)}
                        />
                        <label
                          htmlFor={`technology-${option}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Durée */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Durée
                  </h3>
                  <div className="space-y-3">
                    {durationOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`duration-${option}`}
                          checked={filters.duration.includes(option)}
                          onCheckedChange={() => handleFilterToggle('duration', option)}
                        />
                        <label
                          htmlFor={`duration-${option}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {option} min
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions des filtres */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Effacer tous les filtres
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsExpanded(false)}
                    className="border-gray-300"
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    Appliquer les filtres
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions de recherche rapide */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery("React")}
          className="border-gray-300 hover:bg-gray-50"
        >
          React
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery("JavaScript")}
          className="border-gray-300 hover:bg-gray-50"
        >
          JavaScript
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery("Google")}
          className="border-gray-300 hover:bg-gray-50"
        >
          Google
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery("Coding")}
          className="border-gray-300 hover:bg-gray-50"
        >
          Coding
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery("Senior")}
          className="border-gray-300 hover:bg-gray-50"
        >
          Senior
        </Button>
      </div>
    </div>
  )
} 