"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, LinkIcon, Copy, Check } from "lucide-react"
import { useState } from "react"

interface ExportPanelProps {
  portfolioData: any
}

export default function ExportPanel({ portfolioData }: ExportPanelProps) {
  const [copied, setCopied] = useState(false)
  const portfolioUrl = `https://portfolio.example.com/${portfolioData.name?.toLowerCase().replace(/\s+/g, "-") || "mon-portfolio"}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPDF = () => {
    // Logique pour télécharger en PDF
    console.log("Téléchargement PDF...")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Portfolio de ${portfolioData.name}`,
        text: portfolioData.headline || "Découvrez mon portfolio professionnel",
        url: portfolioUrl,
      })
    }
  }

  return (
    <Card className="bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Exporter & Partager</CardTitle>
        <CardDescription className="text-base">Téléchargez votre portfolio ou partagez-le en ligne</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL du portfolio */}
        <div className="space-y-3">
          <label className="text-sm font-medium block">URL de votre portfolio</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm break-all">
              {portfolioUrl}
            </div>
            <Button onClick={handleCopyUrl} variant="outline" className="flex-shrink-0 bg-transparent">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Actions d'export */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={handleDownloadPDF} className="w-full" size="lg">
            <Download className="h-5 w-5 mr-2" />
            Télécharger PDF
          </Button>
          <Button onClick={handleShare} variant="outline" className="w-full bg-transparent" size="lg">
            <Share2 className="h-5 w-5 mr-2" />
            Partager
          </Button>
        </div>

        {/* Informations supplémentaires */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Portfolio publié !</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Votre portfolio est accessible en ligne. Partagez le lien avec vos contacts professionnels.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
