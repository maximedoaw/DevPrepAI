"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Mail, MapPin, Calendar, GraduationCap } from "lucide-react"

interface ClassicTemplateProps {
  portfolioData: any
}

export default function ClassicTemplate({ portfolioData }: ClassicTemplateProps) {

  // Get sections order from data, or default to a standard order if empty
  const sectionsOrder = portfolioData.sections && portfolioData.sections.length > 0
    ? portfolioData.sections
    : ["skills", "experiences", "projects", "education", "languages", "interests"]

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "skills":
        if (!portfolioData.skills?.length) return null
        return (
          <section key="skills" className="bg-white dark:bg-slate-800/50 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-600 rounded-full" />
              Compétences
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolioData.skills.map((skill: string, index: number) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 text-center border border-blue-200 dark:border-slate-500 hover:shadow-md transition-shadow"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )

      case "experiences":
        if (!portfolioData.experiences?.length) return null
        return (
          <section key="experiences" className="bg-white dark:bg-slate-800/50 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-600 rounded-full" />
              Expérience Professionnelle
            </h2>
            <div className="space-y-8">
              {portfolioData.experiences.map((exp: any, index: number) => (
                <div key={index} className="relative pl-8 border-l-2 border-blue-600">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full" />
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{exp.position}</h3>
                      <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {exp.current ? "Présent" : new Date(exp.endDate).getFullYear()}
                    </Badge>
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )

      case "education":
        if (!portfolioData.education?.length) return null
        return (
          <section key="education" className="bg-white dark:bg-slate-800/50 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-600 rounded-full" />
              Formation
            </h2>
            <div className="space-y-6">
              {portfolioData.education.map((edu: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{edu.degree}</h3>
                    <p className="text-purple-600 dark:text-purple-400 font-medium">{edu.institution}</p>
                    {edu.field && <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{edu.field}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )

      case "projects":
        if (!portfolioData.projects?.length) return null
        return (
          <section key="projects" className="bg-white dark:bg-slate-800/50 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-600 rounded-full" />
              Projets
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {portfolioData.projects.map((project: any, index: number) => (
                <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow border-2">
                  {project.images?.[0] && (
                    <img
                      src={project.images[0] || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{project.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{project.description}</p>
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <Badge key={techIndex} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )

      case "languages":
        if (!portfolioData.languages?.length) return null
        return (
          <section key="languages" className="bg-white dark:bg-slate-800/50 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Langues</h2>
            <div className="flex flex-wrap gap-3">
              {portfolioData.languages.map((language: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-base px-4 py-2">
                  {language}
                </Badge>
              ))}
            </div>
          </section>
        )

      case "interests":
        if (!portfolioData.interests?.length) return null
        return (
          <section key="interests" className="bg-white dark:bg-slate-800/50 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Centres d'intérêt</h2>
            <div className="flex flex-wrap gap-3">
              {portfolioData.interests.map((interest: string, index: number) => (
                <Badge key={index} variant="outline" className="text-base px-4 py-2">
                  {interest}
                </Badge>
              ))}
            </div>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100 pb-20">
      {/* Header with Profile */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-16 border-b-4 border-blue-600">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {portfolioData.profileImage && (
              <img
                src={portfolioData.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-40 h-40 rounded-full border-8 border-white/20 object-cover shadow-2xl"
              />
            )}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-5xl font-bold mb-3">{portfolioData.name || "John Doe"}</h1>
              <p className="text-2xl text-blue-200 mb-4 font-light">
                {portfolioData.headline || "Développeur Full-Stack"}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Paris, France</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-6 space-y-16">
        {/* Bio Section - Always first if exists */}
        {portfolioData.bio && (
          <section className="bg-white dark:bg-slate-800/50 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-600 rounded-full" />À Propos
            </h2>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">{portfolioData.bio}</p>
          </section>
        )}

        {/* Dynamic Sections */}
        {sectionsOrder.map((sectionId: string) => renderSection(sectionId))}

      </div>
    </div>
  )
}
