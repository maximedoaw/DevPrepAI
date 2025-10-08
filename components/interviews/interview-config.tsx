"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Settings, Sparkles, Building2, Clock, Target } from "lucide-react"
import { InterviewData } from "./vocal-interview"
import { PREDEFINED_INTERVIEWS } from "./predefined-interviews"

interface InterviewConfigProps {
  onStartInterview: (data: InterviewData) => void
  predefinedInterviews?: InterviewData[]
}

const DOMAINS = [
  'DEVELOPMENT', 'DATA_SCIENCE', 'MOBILE', 'WEB', 'DEVOPS', 'ENGINEERING',
  'DESIGN', 'FINANCE', 'BUSINESS', 'MARKETING', 'PRODUCT', 'MANAGEMENT',
  'EDUCATION', 'HEALTH', 'CYBERSECURITY', 'ARCHITECTURE', 'COMMUNICATION'
]

const DIFFICULTIES = ['JUNIOR', 'MID', 'SENIOR']
const DURATIONS = [15, 30, 45, 60, 90, 120]

const COMMON_TECHNOLOGIES = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Java',
  'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart',
  'Vue.js', 'Angular', 'Svelte', 'Express.js', 'Django', 'Flask', 'Spring Boot',
  'ASP.NET', 'Laravel', 'Rails', 'GraphQL', 'REST API', 'MongoDB', 'PostgreSQL',
  'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git',
  'CI/CD', 'Agile', 'Scrum', 'DevOps', 'Microservices', 'Serverless',
  'Machine Learning', 'Data Science', 'Blockchain', 'Web3'
]

export function InterviewConfig({ onStartInterview, predefinedInterviews = PREDEFINED_INTERVIEWS }: InterviewConfigProps) {
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [selectedPredefined, setSelectedPredefined] = useState<string>("")
  const [customData, setCustomData] = useState<Partial<InterviewData>>({
    title: "",
    company: "",
    domain: "DEVELOPMENT",
    technologies: [],
    description: "",
    duration: 30,
    difficulty: "MID"
  })
  const [newTech, setNewTech] = useState("")

  const handleStartPredefined = () => {
    if (selectedPredefined) {
      const interview = predefinedInterviews.find(i => i.id === selectedPredefined)
      if (interview) {
        onStartInterview(interview)
      }
    }
  }

  const handleStartCustom = () => {
    if (customData.title && customData.company && customData.domain) {
      const interviewData: InterviewData = {
        id: `custom-${Date.now()}`,
        title: customData.title!,
        company: customData.company!,
        domain: customData.domain!,
        technologies: customData.technologies || [],
        description: customData.description || "",
        duration: customData.duration || 30,
        difficulty: customData.difficulty || "MID"
      }
      onStartInterview(interviewData)
    }
  }

  const addTechnology = () => {
    if (newTech.trim() && !customData.technologies?.includes(newTech.trim())) {
      setCustomData(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), newTech.trim()]
      }))
      setNewTech("")
    }
  }

  const removeTechnology = (tech: string) => {
    setCustomData(prev => ({
      ...prev,
      technologies: prev.technologies?.filter(t => t !== tech) || []
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-slate-700 rounded-xl px-8 py-6 mb-6 shadow-lg">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Configuration d'Interview
              </h1>
              <p className="text-blue-600 dark:text-blue-400 font-mono text-sm mt-1">
                Choisissez un contexte prédéfini ou créez votre propre interview
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interviews Prédéfinies */}
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-blue-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-600/50">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Interviews Prédéfinies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {predefinedInterviews.length > 0 ? (
                <>
                  <Select value={selectedPredefined} onValueChange={setSelectedPredefined}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez une interview prédéfinie" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedInterviews.map((interview) => (
                        <SelectItem key={interview.id} value={interview.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{interview.title}</span>
                            <span className="text-sm text-gray-500">
                              {interview.company} • {interview.domain} • {interview.difficulty}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPredefined && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-blue-200/50 dark:border-slate-600/50">
                      {(() => {
                        const interview = predefinedInterviews.find(i => i.id === selectedPredefined)
                        return interview ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-gray-900 dark:text-white">{interview.company}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-purple-600" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{interview.domain}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{interview.duration} minutes</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {interview.technologies.map((tech) => (
                                <Badge key={tech} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                            {interview.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{interview.description}</p>
                            )}
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}

                  <Button
                    onClick={handleStartPredefined}
                    disabled={!selectedPredefined}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Démarrer l'Interview Prédéfinie
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune interview prédéfinie disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Personnalisée */}
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-emerald-200/50 dark:border-slate-700/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-600/50">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                Interview Personnalisée
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'Interview</Label>
                  <Input
                    id="title"
                    value={customData.title || ""}
                    onChange={(e) => setCustomData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Interview Frontend React"
                    className="dark:bg-slate-700 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    value={customData.company || ""}
                    onChange={(e) => setCustomData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Ex: Google, Microsoft..."
                    className="dark:bg-slate-700 dark:border-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domaine</Label>
                  <Select value={customData.domain} onValueChange={(value) => setCustomData(prev => ({ ...prev, domain: value }))}>
                    <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAINS.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <Select value={customData.difficulty} onValueChange={(value) => setCustomData(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Select value={customData.duration?.toString()} onValueChange={(value) => setCustomData(prev => ({ ...prev, duration: parseInt(value) }))}>
                  <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Technologies</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Ajouter une technologie"
                    className="dark:bg-slate-700 dark:border-slate-600"
                    onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                  />
                  <Button onClick={addTechnology} size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customData.technologies?.map((tech) => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeTechnology(tech)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={customData.description || ""}
                  onChange={(e) => setCustomData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez le contexte de l'interview..."
                  className="dark:bg-slate-700 dark:border-slate-600"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleStartCustom}
                disabled={!customData.title || !customData.company || !customData.domain}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Démarrer l'Interview Personnalisée
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
