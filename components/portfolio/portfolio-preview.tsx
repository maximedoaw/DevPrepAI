"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Share2, Smartphone, Monitor } from "lucide-react"
import ClassicTemplate from "./templates/classic-template"
import ModernTemplate from "./templates/modern-template"
import MinimalTemplate from "./templates/minimal-template"
import TechTemplate from "./templates/tech-template"
import CorporateTemplate from "./templates/corporate-template"
import ThreeDTemplate from "./templates/three-d-template"

interface PortfolioPreviewProps {
  portfolioData: any
}

export default function PortfolioPreview({ portfolioData }: PortfolioPreviewProps) {
  const renderTemplate = () => {
    const template = portfolioData.template?.toUpperCase() || "CLASSIC"

    switch (template) {
      case "MODERN":
        return <ModernTemplate portfolioData={portfolioData} />
      case "MINIMAL":
        return <MinimalTemplate portfolioData={portfolioData} />
      case "TECH":
        return <TechTemplate portfolioData={portfolioData} />
      case "CORPORATE":
        return <CorporateTemplate portfolioData={portfolioData} />
      case "THREE_D":
        return <ThreeDTemplate portfolioData={portfolioData} />
      case "CLASSIC":
      default:
        return <ClassicTemplate portfolioData={portfolioData} />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-2xl">Aperçu du Portfolio</span>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-base">
            Template: <strong>{portfolioData.template || "CLASSIC"}</strong> • Thème:{" "}
            <strong>{portfolioData.theme || "blue"}</strong> • {portfolioData.sections?.length || 0} sections activées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl max-h-[800px] overflow-y-auto">
            {renderTemplate()}
          </div>

          {/* Indicateurs de responsive */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2 text-slate-500 justify-center">
              <Monitor className="h-4 w-4" />
              Desktop Optimisé
            </div>
            <div className="flex items-center gap-2 text-slate-500 justify-center">
              <Smartphone className="h-4 w-4" />
              Mobile Responsive
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
