"use client"
import { Separator } from "@/components/ui/separator"

interface MinimalTemplateProps {
  portfolioData: any
}

export default function MinimalTemplate({ portfolioData }: MinimalTemplateProps) {
  const isSectionEnabled = (sectionId: string) => {
    return portfolioData.sections?.includes(sectionId) || false
  }

  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Minimal Header */}
        <header className="mb-24 text-center">
          {portfolioData.profileImage && (
            <img
              src={portfolioData.profileImage || "/placeholder.svg"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mx-auto mb-8 grayscale hover:grayscale-0 transition-all duration-500"
            />
          )}
          <h1 className="text-6xl font-light text-slate-900 dark:text-white mb-4 tracking-tight">
            {portfolioData.name || "John Doe"}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-light tracking-wide">
            {portfolioData.headline || "Designer & Developer"}
          </p>
        </header>

        {/* Bio */}
        {portfolioData.bio && (
          <section className="mb-24">
            <p className="text-2xl text-slate-700 dark:text-slate-300 font-light leading-relaxed text-center">
              {portfolioData.bio}
            </p>
          </section>
        )}

        <Separator className="my-16" />

        {/* Skills */}
        {isSectionEnabled("skills") && portfolioData.skills?.length > 0 && (
          <section className="mb-24">
            <h2 className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8 text-center font-medium">
              Expertise
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {portfolioData.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="text-lg text-slate-700 dark:text-slate-300 font-light hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {isSectionEnabled("skills") && portfolioData.skills?.length > 0 && <Separator className="my-16" />}

        {/* Projects */}
        {isSectionEnabled("projects") && portfolioData.projects?.length > 0 && (
          <section className="mb-24">
            <h2 className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-12 text-center font-medium">
              Selected Work
            </h2>
            <div className="space-y-16">
              {portfolioData.projects.map((project: any, index: number) => (
                <div key={index} className="group">
                  {project.images?.[0] && (
                    <div className="mb-6 overflow-hidden">
                      <img
                        src={project.images[0] || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-80 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                  )}
                  <h3 className="text-3xl font-light text-slate-900 dark:text-white mb-3">{project.title}</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-4">
                    {project.description}
                  </p>
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {project.technologies.map((tech: string, techIndex: number) => (
                        <span
                          key={techIndex}
                          className="text-sm text-slate-500 dark:text-slate-400 font-light tracking-wide"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {isSectionEnabled("projects") && portfolioData.projects?.length > 0 && <Separator className="my-16" />}

        {/* Experience */}
        {isSectionEnabled("experiences") && portfolioData.experiences?.length > 0 && (
          <section className="mb-24">
            <h2 className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-12 text-center font-medium">
              Experience
            </h2>
            <div className="space-y-12">
              {portfolioData.experiences.map((exp: any, index: number) => (
                <div key={index} className="text-center">
                  <h3 className="text-2xl font-light text-slate-900 dark:text-white mb-2">{exp.position}</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 font-light mb-1">{exp.company}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
                    {exp.current ? "Present" : new Date(exp.endDate).getFullYear()}
                  </p>
                  {exp.description && (
                    <p className="text-base text-slate-600 dark:text-slate-400 font-light mt-4 max-w-2xl mx-auto leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {isSectionEnabled("education") && portfolioData.education?.length > 0 && (
          <>
            <Separator className="my-16" />
            <section className="mb-24">
              <h2 className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-12 text-center font-medium">
                Education
              </h2>
              <div className="space-y-8">
                {portfolioData.education.map((edu: any, index: number) => (
                  <div key={index} className="text-center">
                    <h3 className="text-xl font-light text-slate-900 dark:text-white mb-1">{edu.degree}</h3>
                    <p className="text-base text-slate-600 dark:text-slate-400 font-light">{edu.institution}</p>
                    {edu.field && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">{edu.field}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Languages & Interests */}
        {((isSectionEnabled("languages") && portfolioData.languages?.length > 0) ||
          (isSectionEnabled("interests") && portfolioData.interests?.length > 0)) && (
          <>
            <Separator className="my-16" />
            <div className="grid md:grid-cols-2 gap-12 mb-24">
              {isSectionEnabled("languages") && portfolioData.languages?.length > 0 && (
                <div className="text-center">
                  <h2 className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 font-medium">
                    Languages
                  </h2>
                  <div className="space-y-2">
                    {portfolioData.languages.map((language: string, index: number) => (
                      <p key={index} className="text-base text-slate-700 dark:text-slate-300 font-light">
                        {language}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {isSectionEnabled("interests") && portfolioData.interests?.length > 0 && (
                <div className="text-center">
                  <h2 className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 font-medium">
                    Interests
                  </h2>
                  <div className="space-y-2">
                    {portfolioData.interests.map((interest: string, index: number) => (
                      <p key={index} className="text-base text-slate-700 dark:text-slate-300 font-light">
                        {interest}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="text-center pt-16 pb-8">
          <p className="text-sm text-slate-400 dark:text-slate-500 font-light tracking-wide">
            © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  )
}
