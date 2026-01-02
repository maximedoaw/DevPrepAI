"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Terminal,
  Database,
  Cloud,
  Lock,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  Cpu,
  Network,
  BookOpen,
  Languages,
  Heart
} from "lucide-react"

interface CorporateTemplateProps {
  portfolioData: any
}

export default function CorporateTemplate({ portfolioData }: CorporateTemplateProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Get sections order from data, or default to a standard order if empty
  const sectionsOrder = portfolioData.sections && portfolioData.sections.length > 0
    ? portfolioData.sections
    : ["skills", "projects", "experiences", "education", "languages", "interests"]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "skills":
        if (!portfolioData.skills?.length) return null
        return (
          <section className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                  Stack Technologique
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                  Technologies de pointe pour des solutions robustes
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {portfolioData.skills.map((skill: string, index: number) => (
                  <div
                    key={index}
                    className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-300" />
                    <Terminal className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <div className="text-center font-semibold text-slate-900 dark:text-white text-sm">{skill}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "projects":
        if (!portfolioData.projects?.length) return null
        return (
          <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-900/50 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                  Projets d'Entreprise
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400">Solutions scalables et performantes</p>
              </div>

              <div className="space-y-8">
                {portfolioData.projects.map((project: any, index: number) => (
                  <Card
                    key={index}
                    className="group overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="grid md:grid-cols-2 gap-0">
                      {project.images?.[0] && (
                        <div className="relative h-80 overflow-hidden">
                          <img
                            src={project.images[0] || "/placeholder.svg"}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
                        </div>
                      )}
                      <div className="p-8 flex flex-col justify-center">
                        <Badge className="w-fit mb-4 bg-blue-600 text-white">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Enterprise
                        </Badge>
                        <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">{project.title}</h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                          {project.description}
                        </p>
                        {project.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.technologies.map((tech: string, techIndex: number) => (
                              <Badge
                                key={techIndex}
                                variant="outline"
                                className="border-blue-500/50 text-blue-600 dark:text-blue-400"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-3">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            Voir le projet
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button variant="outline" className="border-2 bg-transparent">
                            <Database className="mr-2 h-4 w-4" />
                            Architecture
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )

      case "experiences":
        if (!portfolioData.experiences?.length) return null
        return (
          <section className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                  Expérience Professionnelle
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400">Leadership et innovation technologique</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {portfolioData.experiences.map((exp: any, index: number) => (
                  <Card
                    key={index}
                    className="p-8 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Cloud className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{exp.position}</h3>
                        <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                      </div>
                      <Badge className="bg-blue-600 text-white">
                        {exp.current ? "Actuel" : new Date(exp.endDate).getFullYear()}
                      </Badge>
                    </div>
                    {exp.description && (
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{exp.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )

      case "education":
        if (!portfolioData.education?.length) return null
        return (
          <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-900/50 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                  Formation & Certifications
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400">Excellence académique et continue</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {portfolioData.education.map((edu: any, index: number) => (
                  <Card key={index} className="p-8 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl group">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{edu.degree}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{edu.institution}</p>
                        {edu.field && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{edu.field}</p>}
                      </div>
                      <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">
                        {new Date(edu.endDate).getFullYear()}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )

      case "languages":
        if (!portfolioData.languages?.length) return null
        return (
          <section className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Langues</h2>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {portfolioData.languages.map((lang: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 bg-white dark:bg-slate-800 px-8 py-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <Languages className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-slate-900 dark:text-white text-lg">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "interests":
        if (!portfolioData.interests?.length) return null
        return (
          <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-900/50 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Intérêts</h2>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {portfolioData.interests.map((interest: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 bg-white dark:bg-slate-800 px-8 py-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <Heart className="w-5 h-5 text-cyan-500" />
                    <span className="font-bold text-slate-900 dark:text-white text-lg">{interest}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-20 dark:opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(to right, rgb(59, 130, 246) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(59, 130, 246) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Cursor glow effect */}
      <div
        className="fixed w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-30 dark:opacity-20 transition-all duration-300"
        style={{
          background: "radial-gradient(circle, rgb(59, 130, 246), transparent)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Hero Section */}
      <section className="relative flex items-center justify-center px-6 py-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium">
                <Zap className="h-4 w-4" />
                <span>Enterprise Solutions</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                <span className="text-slate-900 dark:text-white truncate block">
                  {portfolioData.name || "John Doe"}
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {portfolioData.headline || "Tech Lead"}
                </span>
              </h1>

              {portfolioData.bio && (
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  {portfolioData.bio}
                </p>
              )}

              <div className="flex gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 group">
                  Voir les projets
                  <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-300 dark:border-slate-700 bg-transparent"
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  Documentation
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Années d'exp.</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Projets livrés</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">99%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {portfolioData.profileImage && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl blur-2xl opacity-20 animate-pulse" />
                  <img
                    src={portfolioData.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="relative w-full max-w-md mx-auto rounded-2xl border-2 border-blue-500/20 shadow-2xl object-cover"
                  />
                  {/* Tech icons floating around */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                    <Cpu className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg animate-bounce delay-300">
                    <Network className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Sections */}
      {sectionsOrder.map((sectionId: string) => renderSection(sectionId))}

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-blue-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-600 opacity-10" />
            <div className="relative p-12 text-center">
              <Lock className="h-16 w-16 mx-auto mb-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Prêt à transformer votre entreprise ?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                Discutons de vos besoins en architecture logicielle et solutions cloud
              </p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Planifier une consultation
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
