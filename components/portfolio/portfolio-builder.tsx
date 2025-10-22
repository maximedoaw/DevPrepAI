// portfolio-builder.tsx
"use client"

import { useEffect, useState } from "react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { usePortfolioBuilder } from "@/hooks/use-portfolio-builder"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, User, Palette, Layout, Eye, Download, Loader2 } from "lucide-react"
import AISuggestions from "./ai-suggestions"
import ManualInput from "./manual-input"
import TemplateGallery from "./template-gallery"
import ThemePicker from "./theme-picker"
import PortfolioPreview from "./portfolio-preview"
import SectionBuilder from "./section-builder"
import ExportPanel from "./export-panel"
import { PortfolioTemplate } from "@prisma/client"

// Interface alignée avec usePortfolioBuilder
interface PortfolioData {
  name?: string
  headline?: string | null
  bio?: string | null
  profileImage?: string | null
  template?: PortfolioTemplate
  theme?: string | null
  isPublic?: boolean
  skills?: string[]
  languages?: string[]
  interests?: string[]
  projects?: any[] | null
  experiences?: any[] | null
  education?: any[] | null
  certifications?: any[] | null
  sections?: string[]
}

export default function PortfolioBuilder() {
  const { isAuthenticated, isLoading: authLoading, user } = useKindeBrowserClient()
  const userId = user?.id

  // UTILISATION DU HOOK : Récupérez savePortfolio et isSaving
  const {
    portfolio,
    isLoading: portfolioLoading,
    savePortfolio, // ← Fonction de sauvegarde manuelle
    isSaving, // ← État de sauvegarde
  } = usePortfolioBuilder({ userId, enabled: !!userId })

  const [activeTab, setActiveTab] = useState("content")
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({})

  // Synchronisation des données depuis l'API
  useEffect(() => {
    if (portfolio && Object.keys(portfolio).length > 0) {
      setPortfolioData({
        name: portfolio.name || "",
        headline: portfolio.headline || "",
        bio: portfolio.bio || "",
        profileImage: portfolio.profileImage || null,
        template: portfolio.template || PortfolioTemplate.CLASSIC,
        theme: portfolio.theme || "blue",
        isPublic: portfolio.isPublic || false,
        projects: portfolio.projects || [],
        experiences: portfolio.experiences || [],
        education: portfolio.education || [],
        certifications: portfolio.certifications || [],
        skills: portfolio.skills || [],
        languages: portfolio.languages || [],
        interests: portfolio.interests || [],
        sections: portfolio.sections || ["experiences", "skills"],
      })
    }
  }, [portfolio])

  // AJOUT : Fonction de sauvegarde manuelle
  const handleSave = async () => {
    if (userId && portfolioData) {
      try {
        const result = await savePortfolio(portfolioData)
        if (result.success) {
          // La sauvegarde a réussi
          console.log("Portfolio sauvegardé avec succès")
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error)
      }
    }
  }

  const tabs = [
    { id: "content", label: "Contenu", icon: User },
    { id: "design", label: "Design", icon: Palette },
    { id: "layout", label: "Sections", icon: Layout },
    { id: "preview", label: "Aperçu", icon: Eye },
    { id: "export", label: "Export", icon: Download },
  ]

  if (authLoading || portfolioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
            <CardDescription>Vous devez être connecté pour créer votre portfolio</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950  min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Créateur de Portfolio
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Créez un portfolio professionnel unique. Utilisez l'IA pour générer du contenu ou personnalisez tout
          manuellement.
        </p>
        {isSaving && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sauvegarde en cours...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1">
          <Card className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Configuration
              </CardTitle>
              <CardDescription>
                Étape {tabs.findIndex((tab) => tab.id === activeTab) + 1} sur {tabs.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  const stepNumber = tabs.findIndex((t) => t.id === tab.id) + 1

                  return (
                    <Button
                      key={tab.id}
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          isActive
                            ? "bg-white text-blue-600"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {stepNumber}
                      </div>
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <Card className="min-h-[600px] bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="content" className="space-y-6 m-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AISuggestions portfolioData={portfolioData} setPortfolioData={setPortfolioData} />
                    {/* AJOUT : Passez les props de sauvegarde à ManualInput */}
                    <ManualInput 
                      portfolioData={portfolioData} 
                      setPortfolioData={setPortfolioData}
                      onSave={handleSave}
                      isSaving={isSaving}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-6 m-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AJOUT : Passez les props de sauvegarde à TemplateGallery */}
                    <TemplateGallery  
                      portfolioData={portfolioData} 
                      setPortfolioData={setPortfolioData}
                      onSave={handleSave}
                      isSaving={isSaving}
                    />
                    <ThemePicker portfolioData={portfolioData} setPortfolioData={setPortfolioData} />
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="m-0">
                  {/* AJOUT : Passez les props de sauvegarde à SectionBuilder */}
                  <SectionBuilder 
                    portfolioData={portfolioData} 
                    setPortfolioData={setPortfolioData}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </TabsContent>

                <TabsContent value="preview" className="m-0">
                  <PortfolioPreview portfolioData={portfolioData} />
                </TabsContent>

                <TabsContent value="export" className="m-0">
                  <ExportPanel portfolioData={portfolioData} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}