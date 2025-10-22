"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Layout, Sparkles, Code, Box, Building2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { PortfolioTemplate } from "@prisma/client"

const templates = [
  {
    id: PortfolioTemplate.CLASSIC,
    name: "Classique",
    description: "Design professionnel et épuré, parfait pour les carrières corporate",
    color: "from-blue-500 to-blue-600",
    layout: "vertical",
    style: "professional",
    icon: Layout,
    features: ["Structure linéaire", "Typographie classique", "Sections empilées"],
    bestFor: "Professionnels corporate, consultants, managers",
  },
  {
    id: PortfolioTemplate.MODERN,
    name: "Moderne",
    description: "Style contemporain avec grilles asymétriques et animations fluides",
    color: "from-purple-500 to-purple-600",
    layout: "asymmetric",
    style: "creative",
    icon: Zap,
    features: ["Grilles flexibles", "Animations subtiles", "Design fluide"],
    bestFor: "Designers, marketeurs, créatifs",
  },
  {
    id: PortfolioTemplate.MINIMAL,
    name: "Minimaliste",
    description: "Simplicité élégante, maximum d'impact avec minimum d'éléments",
    color: "from-slate-500 to-slate-700",
    layout: "clean",
    style: "minimal",
    icon: Sparkles,
    features: ["Espace généreux", "Contraste élevé", "Focus sur le contenu"],
    bestFor: "Architectes, photographes, artistes",
  },
  {
    id: PortfolioTemplate.CORPORATE,
    name: "Corporate",
    description: "Design professionnel avec effets technologiques et grilles animées",
    color: "from-cyan-500 to-blue-600",
    layout: "modular",
    style: "enterprise",
    icon: Building2,
    features: ["Grilles animées", "Effets de curseur", "Style entreprise"],
    bestFor: "Entreprises tech, consultants, architectes solutions",
  },
  {
    id: PortfolioTemplate.TECH,
    name: "Technologique",
    description: "Style orienté développeur avec éléments terminal et code",
    color: "from-emerald-500 to-green-600",
    layout: "modular",
    style: "tech",
    icon: Code,
    features: ["Éléments code", "Style terminal", "Thème Matrix"],
    bestFor: "Développeurs, ingénieurs, startups tech",
  },
  {
    id: PortfolioTemplate.THREE_D,
    name: "Immersif 3D",
    description: "Expérience immersive avec éléments 3D et profondeur",
    color: "from-orange-500 to-amber-600",
    layout: "layered",
    style: "immersive",
    icon: Box,
    features: ["Profondeur 3D", "Éléments flottants", "Perspectives dynamiques"],
    bestFor: "Designers 3D, game designers, artistes VR",
  },
]

interface TemplateGalleryProps {
  portfolioData: any
  setPortfolioData: (data: any) => void
  onSave?: () => void
  isSaving?: boolean
}

export default function TemplateGallery({ portfolioData, setPortfolioData, onSave, isSaving = false }: TemplateGalleryProps) {
  const corporateRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!corporateRef.current) return

      const card = corporateRef.current
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateY = (x - centerX) / 25
      const rotateX = (centerY - y) / 25

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    }

    const handleMouseLeave = () => {
      if (!corporateRef.current) return
      corporateRef.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)"
    }

    const corporateCard = corporateRef.current
    if (corporateCard && portfolioData.template === PortfolioTemplate.CORPORATE) {
      corporateCard.addEventListener("mousemove", handleMouseMove)
      corporateCard.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (corporateCard) {
        corporateCard.removeEventListener("mousemove", handleMouseMove)
        corporateCard.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [portfolioData.template])

  const handleTemplateSelect = (templateId: PortfolioTemplate) => {
    const selectedTemplate = templates.find(t => t.id === templateId)
    if (selectedTemplate) {
      setPortfolioData({
        ...portfolioData,
        template: templateId,
        templateStyle: selectedTemplate.style,
        templateLayout: selectedTemplate.layout,
      })
      
      // Sauvegarde automatique lors de la sélection du template
      if (onSave) {
        setTimeout(() => {
          onSave()
        }, 500)
      }
    }
  }

  const renderTemplatePreview = (template: (typeof templates)[0]) => {
    const Icon = template.icon

    switch (template.id) {
      case PortfolioTemplate.CLASSIC:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-3 flex flex-col justify-between border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Icon className="h-3 w-3 text-white" />
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full"></div>
              <div className="h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full w-3/4"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-4 h-4 bg-blue-300 dark:bg-blue-700 rounded"></div>
              <div className="w-4 h-4 bg-blue-400 dark:bg-blue-600 rounded"></div>
            </div>
          </div>
        )

      case PortfolioTemplate.MODERN:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-3 relative overflow-hidden border border-purple-200 dark:border-purple-800">
            <div className="absolute top-1 right-1 w-6 h-6 bg-purple-500 rounded-full opacity-20"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 bg-pink-400 rounded-full opacity-30"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="w-6 h-1.5 bg-purple-300 dark:bg-purple-700 rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div className="h-3 bg-white/80 dark:bg-slate-800/80 rounded shadow-sm"></div>
                <div className="h-3 bg-white/80 dark:bg-slate-800/80 rounded shadow-sm"></div>
              </div>

              <div className="flex justify-end">
                <div className="w-10 h-1.5 bg-purple-200 dark:bg-purple-800 rounded-full"></div>
              </div>
            </div>
          </div>
        )

      case PortfolioTemplate.MINIMAL:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30 rounded-lg p-3 flex flex-col justify-center items-center space-y-2 border border-slate-200 dark:border-slate-700">
            <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
              <Icon className="h-3 w-3 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="space-y-1 w-full">
              <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3 mx-auto"></div>
            </div>
          </div>
        )

      case PortfolioTemplate.CORPORATE:
        return (
          <div
            ref={corporateRef}
            className="w-full h-24 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-lg p-3 relative overflow-hidden transform-gpu transition-transform duration-200 border border-cyan-200 dark:border-cyan-800"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgb(6, 182, 212) 1px, transparent 1px),
                    linear-gradient(to bottom, rgb(6, 182, 212) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 bg-cyan-500 rounded-lg"></div>
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-16 h-3 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-lg"></div>
              </div>

              <div className="flex justify-between">
                <div className="w-6 h-1.5 bg-cyan-300 dark:bg-cyan-700 rounded-full"></div>
                <div className="w-6 h-1.5 bg-cyan-400 dark:bg-cyan-600 rounded-full"></div>
              </div>
            </div>
          </div>
        )

      case PortfolioTemplate.TECH:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-950/30 rounded-lg p-3 relative overflow-hidden border border-green-200 dark:border-green-800">
            <div className="absolute inset-0 opacity-10 font-mono text-[10px] text-green-800 dark:text-green-400 p-1">
              <div>{`<Portfolio>`}</div>
              <div className="ml-2">{`<Section/>`}</div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-8 h-1.5 bg-green-300 dark:bg-green-700 rounded-full"></div>
              </div>

              <div className="space-y-1">
                <div className="h-3 bg-white/80 dark:bg-slate-800/80 rounded border-l-2 border-green-500"></div>
                <div className="h-3 bg-white/80 dark:bg-slate-800/80 rounded border-l-2 border-green-400"></div>
              </div>

              <div className="flex gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              </div>
            </div>
          </div>
        )

      case PortfolioTemplate.THREE_D:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg p-3 relative overflow-hidden transform-gpu border border-amber-200 dark:border-amber-800">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg blur-xs opacity-30"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-5 h-5 bg-amber-500 rounded-lg shadow-lg transform rotate-45"></div>
                <div className="flex gap-0.5">
                  <div className="w-2 h-2 bg-amber-400 rounded-full shadow-md"></div>
                  <div className="w-2 h-2 bg-amber-300 rounded-full shadow-md"></div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-12 h-2.5 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-inner"></div>
              </div>

              <div className="flex justify-around">
                <div className="w-3 h-3 bg-amber-400 rounded-sm shadow-md transform -rotate-12"></div>
                <div className="w-3 h-3 bg-amber-300 rounded-sm shadow-md transform rotate-12"></div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100 border-0 shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
          Choisissez Votre Style
        </CardTitle>
        <CardDescription className="text-base text-slate-600 dark:text-slate-400 text-center">
          Sélectionnez un template qui reflète votre personnalité professionnelle
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`group cursor-pointer transition-all duration-300 ${
                portfolioData.template === template.id ? "transform scale-100" : "hover:scale-105"
              }`}
              onClick={() => handleTemplateSelect(template.id)}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={`relative rounded-xl p-4 sm:p-5 transition-all duration-300 border h-full flex flex-col ${
                  portfolioData.template === template.id
                    ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20"
                    : "border-slate-200 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600 group-hover:shadow-md bg-white/70 dark:bg-slate-800/50"
                }`}
              >
                {portfolioData.template === template.id && (
                  <div className="absolute -top-2.5 -right-2.5 bg-blue-500 text-white p-1.5 rounded-full z-20 shadow-lg">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                <div className="w-full mb-4 lg:mb-0">{renderTemplatePreview(template)}</div>

                <div className="flex gap-3 mb-3 flex-shrink-0">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${template.color} flex-shrink-0 shadow-md`}>
                    <template.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {template.name}
                    </h3>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 whitespace-nowrap ${
                      portfolioData.template === template.id
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {portfolioData.template === template.id ? "✓ Sél." : "Dispo"}
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{template.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {template.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-block px-2.5 py-1 text-xs bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-600"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Idéal pour : </span>
                    <span className="line-clamp-1">{template.bestFor}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>
                      <strong>Layout:</strong> {template.layout}
                    </span>
                    <span>
                      <strong>Style:</strong> {template.style}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}