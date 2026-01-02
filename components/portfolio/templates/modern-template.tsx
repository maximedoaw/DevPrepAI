"use client"

import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github, ExternalLink, Sparkles, Code2, Rocket, Briefcase, BookOpen, Languages, Heart } from "lucide-react"

interface ModernTemplateProps {
  portfolioData: any
}

export default function ModernTemplate({ portfolioData }: ModernTemplateProps) {
  const heroRef = useRef<HTMLDivElement>(null)

  // Get sections order from data, or default to a standard order if empty
  const sectionsOrder = portfolioData.sections && portfolioData.sections.length > 0
    ? portfolioData.sections
    : ["skills", "experiences", "projects", "education", "languages", "interests"]

  useEffect(() => {
    // Parallax effect on scroll
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY
        heroRef.current.style.transform = `translateY(${scrolled * 0.3}px)`
        // Ensure opacity doesn't go below 0.4 to keep text visible
        const opacity = Math.max(0.4, 1 - scrolled / 800)
        heroRef.current.style.opacity = `${opacity}`
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "skills":
        if (!portfolioData.skills?.length) return null
        return (
          <section key="skills" className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Compétences
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {portfolioData.skills.map((skill: string, index: number) => (
                  <div
                    key={index}
                    className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
                    <Code2 className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-slate-900 dark:text-white relative z-10">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "projects":
        if (!portfolioData.projects?.length) return null
        return (
          <section key="projects" className="py-24 px-6 bg-white/50 dark:bg-slate-900/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Projets Récents
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {portfolioData.projects.map((project: any, index: number) => (
                  <Card
                    key={index}
                    className="group overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
                  >
                    {project.images?.[0] && (
                      <div className="relative overflow-hidden h-64">
                        <img
                          src={project.images[0] || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{project.description}</p>
                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <Badge
                              key={techIndex}
                              className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 border-0"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Button size="sm" variant="outline" className="group/btn bg-transparent">
                          <Github className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                          Code
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 group/btn">
                          <ExternalLink className="h-4 w-4 mr-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                          Demo
                        </Button>
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
          <section key="experiences" className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Parcours
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600" />

                <div className="space-y-12">
                  {portfolioData.experiences.map((exp: any, index: number) => (
                    <div key={index} className="relative pl-20 group">
                      <div className="absolute left-5 top-0 w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full border-4 border-white dark:border-slate-900 group-hover:scale-125 transition-transform" />

                      <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500 dark:hover:border-blue-500">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{exp.position}</h3>
                            <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                          </div>
                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                            {exp.current ? "Présent" : new Date(exp.endDate).getFullYear()}
                          </Badge>
                        </div>
                        {exp.description && (
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{exp.description}</p>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )

      case "education":
        if (!portfolioData.education?.length) return null
        return (
          <section key="education" className="py-24 px-6 bg-white/50 dark:bg-slate-900/50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Formation
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-rose-600 mx-auto rounded-full" />
              </div>
              <div className="grid gap-6">
                {portfolioData.education.map((edu: any, index: number) => (
                  <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-pink-600">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-pink-100 dark:bg-pink-900/20 p-3 rounded-xl">
                          <BookOpen className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{edu.degree}</h3>
                          <p className="text-pink-600 dark:text-pink-400 font-medium">{edu.institution}</p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full self-start">
                        {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                      </div>
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
          <section key="languages" className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Langues</h2>
                <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full" />
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {portfolioData.languages.map((lang: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
                    <Languages className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "interests":
        if (!portfolioData.interests?.length) return null
        return (
          <section key="interests" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/30">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Intérêts</h2>
                <div className="w-16 h-1 bg-purple-600 mx-auto rounded-full" />
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {portfolioData.interests.map((interest: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
                    <Heart className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{interest}</span>
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
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div ref={heroRef} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {portfolioData.profileImage && (
            <div className="mb-8 inline-block animate-fade-in">
              <img
                src={portfolioData.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white/50 dark:border-white/20 object-cover shadow-2xl mx-auto hover:scale-110 transition-transform duration-300"
              />
            </div>
          )}

          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in-up truncate">
            {portfolioData.name || "John Doe"}
          </h1>

          <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 mb-8 font-light animate-fade-in-up delay-200">
            {portfolioData.headline || "Creative Developer & Designer"}
          </p>

          {portfolioData.bio && (
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-300">
              {portfolioData.bio}
            </p>
          )}

          <div className="flex gap-4 justify-center animate-fade-in-up delay-500">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Voir mes projets
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              Me contacter
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-400 dark:border-slate-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-400 dark:bg-slate-600 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Dynamic Sections */}
      {sectionsOrder.map((sectionId: string) => renderSection(sectionId))}

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <Sparkles className="h-12 w-12 text-white mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-bold text-white mb-4">Travaillons ensemble</h2>
            <p className="text-xl text-white/90 mb-8">Vous avez un projet en tête ? Discutons-en !</p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
              Démarrer un projet
              <Rocket className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  )
}
