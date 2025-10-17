"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Wand2, Copy, Check } from "lucide-react"

interface AISuggestionsProps {
  portfolioData: any
  setPortfolioData: (data: any) => void
}

export default function AISuggestions({ portfolioData, setPortfolioData }: AISuggestionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const aiSuggestions = {
    headline: "Développeur Full-Stack Passionné | React, Node.js, TypeScript",
    bio: "Développeur full-stack avec 5 ans d'expérience dans la création d'applications web modernes. Passionné par les technologies émergentes et les défis techniques complexes. Expertise en React, Node.js et architectures cloud.",
    skills: ["React", "TypeScript", "Node.js", "Python", "MongoDB", "AWS", "Docker", "Git"],
    languages: ["Français", "Anglais", "Espagnol"],
    interests: ["IA & Machine Learning", "Open Source", "Photographie", "Voyages"],
  }

  const generateWithAI = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setPortfolioData({
        ...portfolioData,
        ...aiSuggestions,
      })
      setIsGenerating(false)
    }, 2000)
  }

  const copySuggestion = (field: string, value: any) => {
    setPortfolioData({
      ...portfolioData,
      [field]: value,
    })
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Suggestions IA
        </CardTitle>
        <CardDescription>Laissez l'IA générer du contenu professionnel pour vous</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={generateWithAI} disabled={isGenerating} className="w-full gap-2" size="lg">
          <Wand2 className="h-4 w-4" />
          {isGenerating ? "Génération en cours..." : "Générer avec l'IA"}
        </Button>

        <div>
          <h4 className="font-semibold text-sm mb-3">Compétences suggérées</h4>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer gap-1 group"
                onClick={() => {
                  if (!portfolioData.skills.includes(skill)) {
                    setPortfolioData({
                      ...portfolioData,
                      skills: [...portfolioData.skills, skill],
                    })
                  }
                }}
              >
                {skill}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">+</span>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Phrase d'accroche</h4>
          <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 relative">
            <p className="text-sm">{aiSuggestions.headline}</p>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={() => copySuggestion("headline", aiSuggestions.headline)}
            >
              {copiedField === "headline" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Biographie</h4>
          <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 relative">
            <p className="text-sm">{aiSuggestions.bio}</p>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={() => copySuggestion("bio", aiSuggestions.bio)}
            >
              {copiedField === "bio" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
