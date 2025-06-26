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
import { Mic, Code, Settings, BookOpen, Trophy, Users, ChevronRight, Sparkles, Target, BarChart3, Menu } from 'lucide-react'
import { toast } from "sonner"

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
}

function InterviewSidebarContent() {
  const router = useRouter()
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const { state } = useSidebar()

  const sidebarOptions: SidebarOption[] = [
    {
      id: "vocal-interview",
      title: "Interview Vocale IA",
      description: "Entretien technique avec assistant vocal",
      icon: Mic,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-r from-blue-500 to-purple-600",
      action: () => {
        toast.success("Lancement de l'interview vocale...")
        router.push("/interview/vocal")
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
      id: "achievements",
      title: "Achievements",
      description: "Vos succès et récompenses",
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-gradient-to-r from-yellow-500 to-orange-600",
      action: () => {
        toast.success("Affichage des achievements...")
        router.push("/achievements")
      },
      badge: "3 nouveaux",
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 overflow-y-auto">
      <SidebarHeader className="border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl">
            <Target className="h-6 w-6 text-white" />
          </div>
          {state === "expanded" && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Actions Rapides
              </h2>
              <p className="text-sm text-gray-500">Lancez votre prochaine session</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : ""}>
            Entretiens
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {sidebarOptions.map((option, index) => (
                <SidebarMenuItem key={option.id}>
                  <SidebarMenuButton
                    onClick={option.action}
                    className={`h-auto p-3 hover:bg-gray-50/80 transition-all duration-200 group relative overflow-hidden ${
                      hoveredOption === option.id ? "shadow-lg scale-[1.02]" : ""
                    }`}
                    onMouseEnter={() => setHoveredOption(option.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    tooltip={state === "collapsed" ? option.title : undefined}
                  >
                    {/* Gradient background on hover */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200 ${option.bgColor}`}
                    />

                    <div className="flex items-center gap-4 w-full relative z-10">
                      <div
                        className={`p-2.5 rounded-lg ${option.bgColor} shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0`}
                      >
                        <option.icon className="h-5 w-5 text-white" />
                      </div>

                      {state === "expanded" && (
                        <>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors truncate">
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
                            </div>
                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors line-clamp-1">
                              {option.description}
                            </p>
                            {option.badge && !option.isNew && (
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
                  {index < sidebarOptions.length - 1 && state === "expanded" && (
                    <Separator className="my-2 bg-gray-100" />
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                toast.success("Ouverture des paramètres...")
                router.push("/settings")
              }}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50/80 transition-all duration-200"
              tooltip={state === "collapsed" ? "Paramètres" : undefined}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                  <Settings className="h-4 w-4 text-gray-600" />
                </div>
                {state === "expanded" && <span className="font-medium">Paramètres</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function InterviewSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <InterviewSidebarContent />
        <main className="flex-1 overflow-hidden">
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 rounded-lg p-2 transition-colors">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            </div>
          </div>
          <div className="p-6 overflow-auto h-[calc(100vh-73px)]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
