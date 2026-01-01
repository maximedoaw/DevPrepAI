"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, BookOpen, Code, Languages, Heart, Award, GripVertical, Settings } from "lucide-react"
import { Reorder } from "framer-motion"

const allSections = [
  {
    id: "experiences",
    name: "Expériences",
    icon: Briefcase,
    description: "Votre parcours professionnel",
  },
  {
    id: "education",
    name: "Formation",
    icon: BookOpen,
    description: "Vos diplômes et certifications",
  },
  {
    id: "projects",
    name: "Projets",
    icon: Code,
    description: "Montrez vos réalisations",
  },
  {
    id: "skills",
    name: "Compétences",
    icon: Award,
    description: "Vos expertises techniques",
  },
  {
    id: "languages",
    name: "Langues",
    icon: Languages,
    description: "Langues maîtrisées",
  },
  {
    id: "interests",
    name: "Centres d'intérêt",
    icon: Heart,
    description: "Vos passions et hobbies",
  },
]

interface SectionBuilderProps {
  portfolioData: any
  setPortfolioData: (data: any) => void
  onSave?: () => void
  isSaving?: boolean
}

export default function SectionBuilder({ portfolioData, setPortfolioData, onSave, isSaving = false }: SectionBuilderProps) {

  // Get currently enabled sections
  const enabledSections = portfolioData.sections || []

  // Update order when drag ends
  const handleReorder = (newOrder: string[]) => {
    setPortfolioData({ ...portfolioData, sections: newOrder })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            Organisation du contenu
          </CardTitle>
          <CardDescription className="text-base text-slate-500 max-w-md">
            Glissez-déposez les éléments pour modifier l'ordre d'affichage sur votre portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">

            {enabledSections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
                <p className="text-slate-500 font-medium">Aucune section active</p>
                <p className="text-sm text-slate-400 mt-1">Activez des sections via le menu "Options" dans les paramètres</p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={enabledSections}
                onReorder={handleReorder}
                className="space-y-3"
              >
                {enabledSections.map((sectionId: string, index: number) => {
                  const sectionInfo = allSections.find(s => s.id === sectionId)
                  if (!sectionInfo) return null

                  const Icon = sectionInfo.icon

                  return (
                    <Reorder.Item key={sectionId} value={sectionId}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group select-none">

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <GripVertical className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />

                          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="sm:hidden flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {sectionInfo.name}
                            </h4>
                          </div>
                        </div>

                        <div className="flex-1 hidden sm:block">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {sectionInfo.name}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {sectionInfo.description}
                          </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-4">
                          <Badge variant="secondary" className="font-mono text-xs text-slate-400">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            )}

            <p className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
              L'ordre défini ici sera celui affiché sur le portfolio final
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}