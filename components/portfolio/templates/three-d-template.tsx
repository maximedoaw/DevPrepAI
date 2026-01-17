"use client"

import React from "react"
import { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Float, Environment, PerspectiveCamera } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type * as THREE from "three"
import { BookOpen, Heart, Languages } from "lucide-react"

interface ThreeDTemplateProps {
  portfolioData: any
}

function FloatingCard({ position, children }: { position: [number, number, number]; children: React.ReactNode }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={position}>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  )
}

function Scene({ portfolioData }: { portfolioData: any }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Central sphere with profile */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial
            color="#3b82f6"
            metalness={0.9}
            roughness={0.1}
            emissive="#3b82f6"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>

      {/* Floating skill cards */}
      {portfolioData.skills?.slice(0, 6).map((skill: string, index: number) => {
        const angle = (index / 6) * Math.PI * 2
        const radius = 4
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        return <FloatingCard key={index} position={[x, 0, z]} children={null} />
      })}

      {/* Orbiting rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.05, 16, 100]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.5, 0.05, 16, 100]} />
        <meshStandardMaterial color="#ec4899" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Ambient particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={2}>
          <mesh position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.5} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export default function ThreeDTemplate({ portfolioData }: ThreeDTemplateProps) {

  // Get sections order from data, or default to a standard order if empty
  const sectionsOrder = portfolioData.sections && portfolioData.sections.length > 0
    ? portfolioData.sections
    : ["skills", "projects", "experiences", "education", "languages", "interests"]

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "skills":
        if (!portfolioData.skills?.length) return null
        return (
          <section className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Compétences 3D
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {portfolioData.skills.map((skill: string, index: number) => (
                  <div
                    key={index}
                    className="group relative"
                    style={{
                      transform: "perspective(1000px)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-2xl p-6 border-2 border-blue-500/30 hover:border-blue-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/50"
                      style={{
                        transform: "translateZ(20px)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                          <span className="text-2xl">⚡</span>
                        </div>
                        <span className="font-semibold text-white">{skill}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "projects":
        if (!portfolioData.projects?.length) return null
        return (
          <section className="py-24 px-6 bg-slate-900/50 dark:bg-slate-950/50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Projets Immersifs
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {portfolioData.projects.map((project: any, index: number) => (
                  <Card
                    key={index}
                    className="group relative overflow-hidden border-2 border-purple-500/30 hover:border-purple-500 transition-all duration-300 bg-slate-800/50 dark:bg-slate-900/50 backdrop-blur"
                    style={{
                      transform: "perspective(1000px) rotateX(2deg)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {project.images?.[0] && (
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={project.images[0] || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-slate-400 mb-4">{project.description}</p>
                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
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
          <section className="py-24 px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Parcours
              </h2>
              <div className="space-y-8">
                {portfolioData.experiences.map((exp: any, index: number) => (
                  <Card
                    key={index}
                    className="p-8 border-2 border-blue-500/30 hover:border-blue-500 transition-all duration-300 bg-slate-800/50 dark:bg-slate-900/50 backdrop-blur hover:shadow-2xl hover:shadow-blue-500/30"
                    style={{
                      transform: "perspective(1000px) translateZ(10px)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{exp.position}</h3>
                        <p className="text-xl text-blue-400">{exp.company}</p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                        {exp.current ? "Présent" : new Date(exp.endDate).getFullYear()}
                      </Badge>
                    </div>
                    {exp.description && <p className="text-slate-400 leading-relaxed">{exp.description}</p>}
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )

      case "education":
        if (!portfolioData.education?.length) return null
        return (
          <section className="py-24 px-6 bg-slate-900/50 dark:bg-slate-950/50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                Formation
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {portfolioData.education.map((edu: any, index: number) => (
                  <Card key={index} className="p-8 border-2 border-pink-500/30 hover:border-pink-500 transition-all duration-300 bg-slate-800/50 dark:bg-slate-900/50 backdrop-blur hover:shadow-2xl hover:shadow-pink-500/30"
                    style={{
                      transform: "perspective(1000px) rotateY(-2deg)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-full bg-pink-500/20 text-pink-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{edu.degree}</h3>
                        <p className="text-pink-400 font-medium">{edu.institution}</p>
                        {edu.field && <p className="text-slate-400 text-sm mt-1">{edu.field}</p>}
                      </div>
                      <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50">
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
          <section className="py-24 px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-12 text-white">Langues</h2>
              <div className="flex flex-wrap justify-center gap-6">
                {portfolioData.languages.map((lang: string, index: number) => (
                  <div key={index} className="bg-slate-800/80 backdrop-blur px-8 py-4 rounded-full border border-slate-700 flex items-center gap-3">
                    <Languages className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium text-lg">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "interests":
        if (!portfolioData.interests?.length) return null
        return (
          <section className="py-24 px-6 bg-slate-900/30">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-12 text-white">Intérêts</h2>
              <div className="flex flex-wrap justify-center gap-6">
                {portfolioData.interests.map((interest: string, index: number) => (
                  <div key={index} className="bg-slate-800/80 backdrop-blur px-8 py-4 rounded-full border border-slate-700 flex items-center gap-3">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="text-white font-medium text-lg">{interest}</span>
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
      {/* 3D Hero Section */}
      <section className="relative h-screen">
        <Canvas className="absolute inset-0">
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
          <Suspense fallback={null}>
            <Scene portfolioData={portfolioData} />
            <Environment preset="city" />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
            />
          </Suspense>
        </Canvas>

        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-6 px-6">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
              {portfolioData.name || "John Doe"}
            </h1>
            <p className="text-2xl md:text-3xl text-white drop-shadow-lg font-light">
              {portfolioData.headline || "3D Creative Developer"}
            </p>
            {portfolioData.bio && (
              <p className="text-lg text-slate-200 max-w-2xl mx-auto drop-shadow-md">{portfolioData.bio}</p>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce">
          <div className="text-sm mb-2">Scroll pour explorer</div>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full mx-auto flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Content sections with 3D cards */}
      <div className="relative z-10 bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 from-slate-100 to-slate-50">

        {/* Dynamic Sections */}
        {sectionsOrder.map((sectionId: string) => (
          <React.Fragment key={sectionId}>
            {renderSection(sectionId)}
          </React.Fragment>
        ))}

      </div>
    </div>
  )
}
