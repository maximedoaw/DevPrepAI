"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  Mic, 
  Code, 
  Settings, 
  BookOpen, 
  Trophy, 
  Users, 
  ChevronRight, 
  Sparkles, 
  Target, 
  BarChart3, 
  Menu,
  Shield,
  Home,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react'
import { toast } from "sonner"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"

interface SidebarOption {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  action: () => void
  badge?: string
  isNew?: boolean
  isAdmin?: boolean
}

function InterviewSidebarContent() {
  const router = useRouter()
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const { state } = useSidebar()
  const { user } = useKindeBrowserClient()

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.email === "maximedoaw204@gmail.com"

  const sidebarOptions: SidebarOption[] = [
    {
      id: "dashboard",
      title: "Accueil",
      description: "Vue d'ensemble de votre progression",
      icon: Home,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-r from-gray-500 to-gray-600",
      action: () => {
        toast.success("Retour à l'accueil...")
        router.push("/")
      },
    },
    {
      id: "vocal-interview",
      title: "Interview Vocale IA",
      description: "Entretien technique avec assistant vocal",
      icon: Mic,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-r from-blue-500 to-purple-600",
      action: () => {
        toast.success("Lancement de l'interview vocale...")
        router.push("/vocal")
      },
      badge: "IA",
      isNew: true,
    },
    {
      id: "tech-interview",
      title: "Entretien Technique",
      description: "Profils développeur disponibles",
      icon: Code,
      color: "text-green-600",
      bgColor: "bg-gradient-to-r from-green-500 to-emerald-600",
      action: () => {
        toast.success("Accès aux entretiens techniques...")
        router.push("/interview/technical")
      },
      badge: "12 profils",
    },
    {
      id: "learning-path",
      title: "Parcours d'Apprentissage",
      description: "Cours et ressources structurés",
      icon: BookOpen,
      color: "text-indigo-600",
      bgColor: "bg-gradient-to-r from-indigo-500 to-purple-600",
      action: () => {
        toast.success("Ouverture des parcours...")
        router.push("/learning")
      },
    },
    {
      id: "reputation",
      title: "Réputation",
      description: "Vos succès et récompenses",
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-gradient-to-r from-yellow-500 to-orange-600",
      action: () => {
        toast.success("Affichage des récompenses...")
        router.push(`/reputation?id=${user?.id}`)
      },
      badge: "3 nouveaux",
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Statistiques et progression",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-r from-purple-500 to-pink-600",
      action: () => {
        toast.success("Ouverture des analytics...")
        router.push("/analytics")
      },
    },
    // Option admin - seulement visible pour l'email spécifique
    ...(isAdmin ? [{
      id: "admin",
      title: "Administration",
      description: "Gestion de la plateforme",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-gradient-to-r from-red-500 to-red-600",
      action: () => {
        toast.success("Accès à l'administration...")
        router.push("/admin")
      },
      badge: "Admin",
      isAdmin: true,
    }] : []),
  ]

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-gray-200 overflow-y-auto bg-white shadow-sm"
      style={{ 
        width: state === "expanded" ? "280px" : "72px",
        minWidth: state === "expanded" ? "280px" : "72px",
        transition: "width 0.3s ease, min-width 0.3s ease"
      }}
    >
      <SidebarHeader className="border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex-shrink-0">
            <Target className="h-6 w-6 text-white" />
          </div>
          {state === "expanded" && (
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate">
                DevPrepAi
              </h2>
              <p className="text-sm text-gray-500 truncate">Votre assistant de préparation</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className={`${state === "collapsed" ? "sr-only" : ""} text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {sidebarOptions.map((option, index) => (
                <SidebarMenuItem key={option.id}>
                  <SidebarMenuButton
                    onClick={option.action}
                    className={`h-auto p-3 hover:bg-gray-50/80 transition-all duration-200 group relative overflow-hidden rounded-lg ${
                      hoveredOption === option.id ? "shadow-lg scale-[1.02] bg-gray-50" : ""
                    } ${option.isAdmin ? "border-l-4 border-red-500" : ""}`}
                    onMouseEnter={() => setHoveredOption(option.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    tooltip={state === "collapsed" ? option.title : undefined}
                  >
                    {/* Gradient background on hover */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200 ${option.bgColor} rounded-lg`}
                    />

                    <div className="flex items-center gap-4 w-full relative z-10">
                      <div
                        className={`p-2.5 rounded-lg ${option.bgColor} shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0 ${
                          option.isAdmin ? "ring-2 ring-red-200" : ""
                        }`}
                      >
                        <option.icon className="h-5 w-5 text-white" />
                      </div>

                      {state === "expanded" && (
                        <>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold group-hover:text-gray-800 transition-colors truncate ${
                                option.isAdmin ? "text-red-700" : "text-gray-900"
                              }`}>
                                {option.title}
                              </h3>
                              {option.isNew && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Sparkles className="h-3 w-3 text-yellow-500" />
                                  <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                                    Nouveau
                                  </Badge>
                                </div>
                              )}
                              {option.isAdmin && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Zap className="h-3 w-3 text-red-500" />
                                  <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
                                    Admin
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors line-clamp-1">
                              {option.description}
                            </p>
                            {option.badge && !option.isNew && !option.isAdmin && (
                              <Badge className="mt-2 text-xs bg-gray-100 text-gray-600 border-gray-200">
                                {option.badge}
                              </Badge>
                            )}
                          </div>

                          <ChevronRight
                            className={`h-4 w-4 text-gray-400 transition-all duration-200 flex-shrink-0 ${
                              hoveredOption === option.id ? "translate-x-1 text-gray-600" : ""
                            }`}
                          />
                        </>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section séparée pour les outils */}
        {state === "expanded" && (
          <>
            <Separator className="my-4 bg-gray-200" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Outils
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        toast.success("Ouverture des paramètres...")
                        router.push("/settings")
                      }}
                      className="h-auto p-3 hover:bg-gray-50/80 transition-all duration-200 group relative overflow-hidden rounded-lg"
                      onMouseEnter={() => setHoveredOption("settings")}
                      onMouseLeave={() => setHoveredOption(null)}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="p-2.5 bg-gray-100 rounded-lg shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                          <Settings className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                            Paramètres
                          </h3>
                          <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                            Configuration de votre compte
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 transition-all duration-200 flex-shrink-0 ${
                            hoveredOption === "settings" ? "translate-x-1 text-gray-600" : ""
                          }`}
                        />
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer avec informations utilisateur */}
      <SidebarFooter className="border-t border-gray-100 p-4">
        {state === "expanded" && user ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user.given_name?.[0]}{user.family_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.given_name} {user.family_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

export default function InterviewSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gray-50">
        <InterviewSidebarContent />
        <main className="flex-1 overflow-hidden bg-white">
          {/* Header responsive comme YouTube */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-gray-100 rounded-lg p-2 transition-colors">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Contenu principal avec scroll */}
          <div className="p-6 overflow-auto h-[calc(100vh-73px)]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
