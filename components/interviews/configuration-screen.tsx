import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Code, Clock, User, X, Sparkles } from "lucide-react"
import React from "react"

interface ConfigurationScreenProps {
  availableTechnologies: string[]
  selectedTechnologies: string[]
  setSelectedTechnologies: (techs: string[]) => void
  context: string
  setContext: (ctx: string) => void
  customTechnology: string
  setCustomTechnology: (val: string) => void
  interviewDuration: string
  setInterviewDuration: (val: string) => void
  canStartInterview: boolean
  handleStartInterview: () => void
}

export const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({
  availableTechnologies,
  selectedTechnologies,
  setSelectedTechnologies,
  context,
  setContext,
  customTechnology,
  setCustomTechnology,
  interviewDuration,
  setInterviewDuration,
  canStartInterview,
  handleStartInterview
}) => {
  const addTechnology = (tech: string) => {
    if (!selectedTechnologies.includes(tech)) {
      setSelectedTechnologies([...selectedTechnologies, tech])
    }
  }
  const removeTechnology = (tech: string) => {
    setSelectedTechnologies(selectedTechnologies.filter(t => t !== tech))
  }
  const addCustomTechnology = () => {
    if (customTechnology.trim() && !selectedTechnologies.includes(customTechnology.trim())) {
      setSelectedTechnologies([...selectedTechnologies, customTechnology.trim()])
      setCustomTechnology("")
    }
  }
  const durationOptions = [
    { value: "10", label: "10 minutes" },
    { value: "15", label: "15 minutes" },
    { value: "20", label: "20 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 heure" },
    { value: "90", label: "1h 30" },
    { value: "120", label: "2 heures" }
  ]
  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
      <CardHeader className=" text-white rounded-t-lg">
        <CardTitle className="font-mono flex items-center gap-3">
          <Sparkles className="h-6 w-6" />
          Configuration de l'entretien
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Sélection des technologies */}
        <div className="space-y-4">
          <Label className="text-gray-700 font-mono text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            Technologies à évaluer
          </Label>
          {/* Technologies sélectionnées */}
          {selectedTechnologies.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {selectedTechnologies.map((tech) => (
                <Badge
                  key={tech}
                  className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200 font-mono px-4 py-2 text-sm shadow-sm"
                >
                  {tech}
                  <button
                    onClick={() => removeTechnology(tech)}
                    className="ml-2 hover:text-emerald-900 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {/* Liste des technologies disponibles */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableTechnologies.map((tech) => (
              <Button
                key={tech}
                variant="outline"
                size="sm"
                onClick={() => addTechnology(tech)}
                disabled={selectedTechnologies.includes(tech)}
                className={`font-mono text-xs transition-all duration-200 ${
                  selectedTechnologies.includes(tech)
                    ? "bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-300 text-emerald-700 shadow-md"
                    : "bg-white/60 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {tech}
              </Button>
            ))}
          </div>
          {/* Ajout de technologie personnalisée */}
          <div className="flex gap-3">
            <Input
              placeholder="Ajouter une technologie personnalisée..."
              value={customTechnology}
              onChange={(e) => setCustomTechnology(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomTechnology()}
              className="font-mono border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
            <Button
              onClick={addCustomTechnology}
              disabled={!customTechnology.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-mono shadow-md"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Sélection de la durée */}
        <div className="space-y-4">
          <Label className="text-gray-700 font-mono text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Durée de l'entretien
          </Label>
          <Select value={interviewDuration} onValueChange={setInterviewDuration}>
            <SelectTrigger className="w-full md:w-80 font-mono border-blue-200 focus:border-blue-400 focus:ring-blue-400">
              <SelectValue placeholder="Sélectionnez la durée" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="font-mono">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600 font-mono">
            Durée minimale : 10 minutes • Durée maximale : 2 heures
          </p>
        </div>
        {/* Contexte de l'entretien */}
        <div className="space-y-4">
          <Label className="text-gray-700 font-mono text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Contexte de l'entretien
          </Label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Décrivez le contexte de l'entretien (niveau d'expérience, type de poste, entreprise, etc.)..."
            className="w-full p-4 border border-blue-200 rounded-lg resize-none font-mono text-sm focus:border-blue-400 focus:ring-blue-400"
            rows={4}
          />
        </div>
        {/* Bouton de démarrage */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleStartInterview}
            disabled={!canStartInterview}
            className={`px-10 py-4 font-mono text-lg transition-all duration-300 ${
              canStartInterview
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <Plus className="h-6 w-6 mr-3" />
            Démarrer l'entretien
          </Button>
        </div>
        {!canStartInterview && (
          <p className="text-center text-gray-500 text-sm font-mono">
            Veuillez sélectionner au moins une technologie et décrire le contexte
          </p>
        )}
      </CardContent>
    </Card>
  )
} 