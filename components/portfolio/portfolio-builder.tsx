
// portfolio-builder.tsx
"use client"

import { useEffect, useState } from "react"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { usePortfolioBuilder } from "@/hooks/usePortfolioBuilder"
import { Button } from "@/components/ui/button"
import { Sparkles, User, Palette, Layout, Eye, Download, Loader2, Save, Wand2 } from "lucide-react"
import AISuggestions from "./ai-suggestions"
import ManualInput from "./manual-input"
import TemplateGallery from "./template-gallery"
import ThemePicker from "./theme-picker"
import PortfolioPreview from "./portfolio-preview"
import SectionBuilder from "./section-builder"
import ExportPanel from "./export-panel"
import { PortfolioTemplate } from "@prisma/client"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
          // La sauvegarde a réussi - on pourrait ajouter un toast ici
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error)
      }
    }
  }

  const tabs = [
    { id: "content", label: "Contenu", icon: User, description: "Vos informations" },
    { id: "design", label: "Design", icon: Palette, description: "Apparence" },
    { id: "layout", label: "Structure", icon: Layout, description: "Organisation" },
    { id: "preview", label: "Aperçu", icon: Eye, description: "Visualisation" },
    { id: "export", label: "Export", icon: Download, description: "Finalisation" },
  ]

  if (authLoading || portfolioLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
           <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
           <Loader2 className="relative h-16 w-16 animate-spin text-emerald-500 mb-6" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Chargement de votre espace créatif...</p>
      </div>
    )
  }

  if (!isAuthenticated || !userId) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Authentification requise</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Connectez-vous pour commencer à sculpter votre carrière.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Premium Floating Sidebar Navigation */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 lg:sticky lg:top-8 z-20"
      >
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-xl shadow-emerald-900/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10">
            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-slate-100">
               <Wand2 className="w-5 h-5 text-emerald-500" />
               <span>Studio Portfolio</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-7">Édition professionnelle</p>
          </div>
          
          <nav className="p-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group relative w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 outline-none",
                    isActive 
                      ? "text-emerald-700 dark:text-emerald-300" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                    isActive ? "bg-white dark:bg-emerald-950 shadow-sm" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700"
                  )}>
                    <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")} />
                  </div>
                  
                  <div className="relative z-10 text-left">
                    <div className="font-semibold text-sm">{tab.label}</div>
                    <div className="text-[10px] opacity-70 font-medium">{tab.description}</div>
                  </div>

                  {isActive && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-500" 
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Status Bar */}
          <div className="mx-4 mb-4 mt-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sauvegarde</span>
               {isSaving ? (
                 <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
               ) : (
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               )}
             </div>
             <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
               {isSaving ? "Synchronisation..." : "Vos modifications sont enregistrées automatiquement."}
             </p>
          </div>
        </div>
      </motion.div>

      {/* Immersive Main Canvas */}
      <motion.div 
        className="lg:col-span-9"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 dark:border-slate-700/30 shadow-2xl overflow-hidden min-h-[600px]">
          
          {/* Canvas Decoration */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-emerald-500/5 to-transparent rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40"></div>
          
          <div className="relative z-10 p-6 sm:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "content" && (
                   <div className="space-y-8">
                     <div className="flex items-center justify-between">
                       <div>
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contenu du Portfolio</h2>
                         <p className="text-slate-500 dark:text-slate-400">Remplissez les détails de votre parcours professionnel.</p>
                       </div>
                       <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-lg shadow-emerald-600/20">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                          Sauvegarder
                       </Button>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AISuggestions portfolioData={portfolioData} setPortfolioData={setPortfolioData} />
                        <ManualInput 
                          portfolioData={portfolioData} 
                          setPortfolioData={setPortfolioData}
                          onSave={handleSave}
                          isSaving={isSaving}
                        />
                     </div>
                   </div>
                )}
                
                {activeTab === "design" && (
                  <div className="space-y-8">
                     <div>
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Design & Apparence</h2>
                       <p className="text-slate-500 dark:text-slate-400">Choisissez un modèle et personnalisez les couleurs.</p>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <TemplateGallery  
                         portfolioData={portfolioData} 
                         setPortfolioData={setPortfolioData}
                         onSave={handleSave}
                         isSaving={isSaving}
                       />
                       <ThemePicker portfolioData={portfolioData} setPortfolioData={setPortfolioData} />
                     </div>
                  </div>
                )}

                {activeTab === "layout" && (
                   <div className="space-y-8">
                     <div>
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Structure des Sections</h2>
                       <p className="text-slate-500 dark:text-slate-400">Organisez l'ordre d'affichage de vos sections.</p>
                     </div>
                     <SectionBuilder 
                      portfolioData={portfolioData} 
                      setPortfolioData={setPortfolioData}
                      onSave={handleSave}
                      isSaving={isSaving}
                    />
                   </div>
                )}

                {activeTab === "preview" && (
                  <div className="h-full">
                     <PortfolioPreview portfolioData={portfolioData} />
                  </div>
                )}

                {activeTab === "export" && (
                  <div className="h-full">
                     <ExportPanel portfolioData={portfolioData} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
