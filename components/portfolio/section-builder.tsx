"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, BookOpen, Code, Languages, Heart, Award, GripVertical, Settings } from "lucide-react"
import { useState } from "react"

const allSections = [
  {
    id: "projects",
    name: "Projets",
    icon: Code,
    description: "Montrez vos réalisations et travaux",
    required: false,
  },
  {
    id: "experiences",
    name: "Expériences",
    icon: Briefcase,
    description: "Votre parcours professionnel",
    required: true,
  },
  {
    id: "education",
    name: "Formation",
    icon: BookOpen,
    description: "Vos diplômes et certifications",
    required: false,
  },
  {
    id: "skills",
    name: "Compétences",
    icon: Award,
    description: "Vos expertises techniques et soft skills",
    required: true,
  },
  {
    id: "languages",
    name: "Langues",
    icon: Languages,
    description: "Langues maîtrisées et niveaux",
    required: false,
  },
  {
    id: "interests",
    name: "Centres d'intérêt",
    icon: Heart,
    description: "Vos passions et hobbies",
    required: false,
  },
]

interface SectionBuilderProps {
  portfolioData: any
  setPortfolioData: (data: any) => void
}

export default function SectionBuilder({ portfolioData, setPortfolioData }: SectionBuilderProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const toggleSection = (sectionId: string) => {
    const currentSections = portfolioData.sections || []
    const newSections = currentSections.includes(sectionId)
      ? currentSections.filter((id: string) => id !== sectionId)
      : [...currentSections, sectionId]

    setPortfolioData({ ...portfolioData, sections: newSections })
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.innerHTML)

    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4"
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"

    if (dragIndex !== null && dragIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (dragIndex === null || dragIndex === dropIndex) {
      setDragOverIndex(null)
      return
    }

    const currentSections = [...portfolioData.sections]
    const [movedSection] = currentSections.splice(dragIndex, 1)
    currentSections.splice(dropIndex, 0, movedSection)

    setPortfolioData({ ...portfolioData, sections: currentSections })
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const enabledSections = allSections.filter((section) => portfolioData.sections?.includes(section.id))

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
        <CardHeader>
          <CardTitle className="text-xl">Gestion des Sections</CardTitle>
          <CardDescription className="text-base">
            Organisez l'ordre et activez les sections de votre portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Sections activées avec drag & drop */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Ordre des sections</h3>
              <Badge variant="outline" className="w-fit">
                {enabledSections.length} section{enabledSections.length > 1 ? "s" : ""} activée
                {enabledSections.length > 1 ? "s" : ""}
              </Badge>
            </div>

            {enabledSections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <Settings className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">Aucune section activée</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Activez des sections dans la liste ci-dessous
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {enabledSections.map((section, index) => {
                  const Icon = section.icon
                  const isDragging = dragIndex === index
                  const isDragOver = dragOverIndex === index

                  return (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl bg-white dark:bg-slate-800 cursor-grab active:cursor-grabbing transition-all ${
                        isDragging
                          ? "opacity-40 scale-95"
                          : isDragOver
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-lg scale-105"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                      }`}
                    >
                      <GripVertical className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-base truncate">
                          {section.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{section.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                        <Switch checked={true} onCheckedChange={() => toggleSection(section.id)} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              👆 Glissez-déposez pour réorganiser l'ordre d'affichage
            </p>
          </div>

          {/* Toutes les sections disponibles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Sections disponibles</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {allSections.map((section) => {
                const Icon = section.icon
                const isEnabled = portfolioData.sections?.includes(section.id)
                const isRequired = section.required

                return (
                  <div
                    key={section.id}
                    className={`flex flex-col p-4 rounded-xl border-2 transition-all duration-200 min-h-[120px] ${
                      isEnabled
                        ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/20"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                    } ${isRequired ? "opacity-100" : "opacity-100"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isEnabled
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={section.id}
                              className="font-semibold cursor-pointer text-slate-900 dark:text-white text-base"
                            >
                              {section.name}
                            </Label>
                            {isRequired && (
                              <Badge variant="secondary" className="text-xs">
                                Requis
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Switch
                        id={section.id}
                        checked={isEnabled || isRequired}
                        onCheckedChange={isRequired ? undefined : () => toggleSection(section.id)}
                        disabled={isRequired}
                      />
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">{section.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div className="text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
          <strong>{portfolioData.sections?.length || 0}</strong> sections activées • Glissez-déposez pour réorganiser
        </div>
        <Button size="lg" className="min-w-[140px]">
          Sauvegarder
        </Button>
      </div>
    </div>
  )
}
