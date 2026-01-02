"use client"

import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Terminal, Code, GitBranch, Database, Server, Cpu, Globe, Heart } from "lucide-react"

interface TechTemplateProps {
  portfolioData: any
}

export default function TechTemplate({ portfolioData }: TechTemplateProps) {
  const terminalRef = useRef<HTMLPreElement>(null)

  // Get sections order from data, or default to a standard order if empty
  const sectionsOrder = portfolioData.sections && portfolioData.sections.length > 0
    ? portfolioData.sections
    : ["skills", "projects", "experiences", "education", "languages", "interests"]

  useEffect(() => {
    // Typing animation for terminal
    if (terminalRef.current) {
      const name = (portfolioData.name || "developer").slice(0, 30)
      const headline = (portfolioData.headline || "Full-Stack Developer").slice(0, 50)
      const text = `$ whoami\n> ${name}\n$ cat bio.txt\n> ${headline}`
      let index = 0
      const element = terminalRef.current
      element.textContent = "" // Reset content

      const type = () => {
        if (index < text.length) {
          element.textContent += text.charAt(index)
          index++
          setTimeout(type, 50)
        }
      }
      type()
    }
  }, [portfolioData.name, portfolioData.headline])

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "skills":
        if (!portfolioData.skills?.length) return null
        return (
          <section key="skills">
            <div className="flex items-center gap-3 mb-6">
              <Code className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                <span className="text-green-500">$</span> ls skills/
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolioData.skills.map((skill: string, index: number) => (
                <Card
                  key={index}
                  className="bg-slate-800/50 dark:bg-slate-900/50 border-green-500/30 p-4 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-green-500 group-hover:animate-spin" />
                    <span className="text-slate-300 dark:text-slate-400 font-medium">{skill}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )

      case "projects":
        if (!portfolioData.projects?.length) return null
        return (
          <section key="projects">
            <div className="flex items-center gap-3 mb-6">
              <GitBranch className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                <span className="text-green-500">$</span> git log --projects
              </h2>
            </div>
            <div className="space-y-6">
              {portfolioData.projects.map((project: any, index: number) => (
                <Card
                  key={index}
                  className="bg-slate-800/50 dark:bg-slate-900/50 border-green-500/30 overflow-hidden hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    {project.images?.[0] && (
                      <div className="relative h-48 md:h-auto">
                        <img
                          src={project.images[0] || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-green-500/10" />
                      </div>
                    )}
                    <div className={`p-6 ${project.images?.[0] ? "md:col-span-2" : "md:col-span-3"}`}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-green-400">{project.title}</h3>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          <GitBranch className="h-3 w-3 mr-1" />
                          main
                        </Badge>
                      </div>
                      <p className="text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">{project.description}</p>
                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <span
                              key={techIndex}
                              className="px-3 py-1 bg-slate-700/50 dark:bg-slate-800/50 text-green-400 text-sm rounded border border-green-500/30"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )

      case "experiences":
        if (!portfolioData.experiences?.length) return null
        return (
          <section key="experiences">
            <div className="flex items-center gap-3 mb-6">
              <Server className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                <span className="text-green-500">$</span> history --work
              </h2>
            </div>
            <div className="space-y-4">
              {portfolioData.experiences.map((exp: any, index: number) => (
                <Card
                  key={index}
                  className="bg-slate-800/50 dark:bg-slate-900/50 border-green-500/30 p-6 hover:border-green-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-green-400">{exp.position}</h3>
                      <p className="text-slate-300 dark:text-slate-400">{exp.company}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      {exp.current ? "active" : new Date(exp.endDate).getFullYear()}
                    </Badge>
                  </div>
                  {exp.description && (
                    <p className="text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">{exp.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )

      case "education":
        if (!portfolioData.education?.length) return null
        return (
          <section key="education">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                <span className="text-green-500">$</span> cat education.json
              </h2>
            </div>
            <Card className="bg-slate-800/50 dark:bg-slate-900/50 border-green-500/30 p-6">
              <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                {JSON.stringify(
                  portfolioData.education.map((edu: any) => ({
                    degree: edu.degree,
                    institution: edu.institution,
                    field: edu.field,
                    year: new Date(edu.endDate).getFullYear()
                  })),
                  null,
                  2,
                )}
              </pre>
            </Card>
          </section>
        )

      case "languages":
        if (!portfolioData.languages?.length) return null
        return (
          <section key="languages">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                <span className="text-green-500">$</span> echo $LANGUAGES
              </h2>
            </div>
            <Card className="bg-slate-800/50 dark:bg-slate-900/50 border-green-500/30 p-6">
              <div className="space-y-2">
                {portfolioData.languages.map((language: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-green-500">›</span>
                    <span className="text-slate-300 dark:text-slate-400">{language}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )

      case "interests":
        if (!portfolioData.interests?.length) return null
        return (
          <section key="interests">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                <span className="text-green-500">$</span> cat interests.txt
              </h2>
            </div>
            <Card className="bg-slate-800/50 dark:bg-slate-900/50 border-green-500/30 p-6">
              <div className="space-y-2">
                {portfolioData.interests.map((interest: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-green-500">›</span>
                    <span className="text-slate-300 dark:text-slate-400">{interest}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100 font-mono">
      {/* Terminal Header */}
      <header className="bg-slate-900 dark:bg-slate-950 text-green-400 py-12 border-b-2 border-green-500">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-slate-800 dark:bg-slate-900 rounded-lg p-6 border border-green-500/30 shadow-lg shadow-green-500/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-slate-400">terminal — bash</span>
            </div>
            <div className="flex gap-6 items-start">
              {portfolioData.profileImage && (
                <img
                  src={portfolioData.profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-green-500/50"
                />
              )}
              <div className="flex-1">
                <pre
                  ref={terminalRef}
                  className="text-green-400 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px]"
                />
                <div className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* Bio Section */}
        {portfolioData.bio && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                <span className="text-green-500">$</span> cat about.md
              </h2>
            </div>
            <Card className="bg-slate-800/50 dark:bg-slate-900/50 border-green-500/30 p-6">
              <p className="text-slate-300 dark:text-slate-400 leading-relaxed">{portfolioData.bio}</p>
            </Card>
          </section>
        )}

        {/* Dynamic Sections */}
        {sectionsOrder.map((sectionId: string) => renderSection(sectionId))}

      </div>
    </div>
  )
}
