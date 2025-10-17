"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Share2, Smartphone, Monitor, Code } from "lucide-react"

interface PortfolioPreviewProps {
  portfolioData: any
}

export default function PortfolioPreview({ portfolioData }: PortfolioPreviewProps) {
  const isSectionEnabled = (sectionId: string) => {
    return portfolioData.sections?.includes(sectionId) || false
  }

  const renderClassicPortfolio = () => (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          {portfolioData.profileImage && (
            <img
              src={portfolioData.profileImage || "/placeholder.svg"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white/20 object-cover mx-auto mb-6"
            />
          )}
          <h1 className="text-4xl font-bold mb-4">{portfolioData.name || "John Doe"}</h1>
          <p className="text-xl text-white/90 mb-6">{portfolioData.headline || "Développeur Full-Stack Passionné"}</p>
        </div>
      </header>

      {/* Sections */}
      <div className="max-w-4xl mx-auto py-12 space-y-12 px-6">
        {/* Bio */}
        {portfolioData.bio && (
          <section className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">À Propos</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{portfolioData.bio}</p>
          </section>
        )}

        {isSectionEnabled("skills") && portfolioData.skills?.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Compétences</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolioData.skills.map((skill: string, index: number) => (
                <div key={index} className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center">
                  <Code className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {isSectionEnabled("projects") && portfolioData.projects?.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Projets</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {portfolioData.projects.map((project: any, index: number) => (
                <div key={index} className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  {project.images?.[0] && (
                    <img
                      src={project.images[0] || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{project.description}</p>
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech: string, techIndex: number) => (
                        <Badge key={techIndex}>{tech}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {isSectionEnabled("experiences") && portfolioData.experiences?.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Expériences</h2>
            <div className="space-y-6">
              {portfolioData.experiences.map((exp: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-6 py-4">
                  <h3 className="text-xl font-semibold">{exp.position}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{exp.company}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {exp.current ? "Présent" : new Date(exp.endDate).getFullYear()}
                  </p>
                  {exp.description && <p className="mt-2 text-slate-700 dark:text-slate-300">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {isSectionEnabled("education") && portfolioData.education?.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Formation</h2>
            <div className="space-y-6">
              {portfolioData.education.map((edu: any, index: number) => (
                <div key={index} className="border-l-4 border-purple-500 pl-6 py-4">
                  <h3 className="text-xl font-semibold">{edu.degree}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{edu.institution}</p>
                  {edu.field && <p className="text-sm text-slate-500">{edu.field}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {isSectionEnabled("languages") && portfolioData.languages?.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Langues</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {portfolioData.languages.map((language: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-base px-4 py-2">
                  {language}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {isSectionEnabled("interests") && portfolioData.interests?.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Centres d'intérêt</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {portfolioData.interests.map((interest: string, index: number) => (
                <Badge key={index} variant="outline" className="text-base px-4 py-2">
                  {interest}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )

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
            <strong>{portfolioData.theme || "blue"}</strong> •{portfolioData.sections?.length || 0} sections activées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            {renderClassicPortfolio()}
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
