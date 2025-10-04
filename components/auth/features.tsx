'use client'

import { CheckCircle, Code, Users, Brain, Zap, BarChart, Clock, Linkedin, Github, Database, Calculator, TrendingUp, Target, Award, Rocket, FileText, Building2, Sparkles, Eye, Play, ChevronDown, Cpu, Palette, Cloud, Shield, MessageSquare, GitBranch, Server, BarChart3, Smartphone, Globe, Mail, Calendar, BookOpen, Heart, Search, Check, Star, Loader, FileCheck, UserCheck, Building, Network, Bell, ThumbsUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { timelineSteps } from "@/constants"
import CareerIncubator from "../career-incubator"

// Enregistrer le plugin ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Composant pour l'animation du terminal avec scroll horizontal
const AnimatedTerminal = ({ code, language, isVisible, onComplete }: { 
  code: string, 
  language: string, 
  isVisible: boolean,
  onComplete?: () => void 
}) => {
  const [displayedCode, setDisplayedCode] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible) {
      setDisplayedCode('')
      setCurrentIndex(0)
      setIsComplete(false)
      return
    }

    if (currentIndex < code.length) {
      const timer = setTimeout(() => {
        setDisplayedCode(prev => prev + code[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 40)
      return () => clearTimeout(timer)
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete?.()
      setTimeout(() => {
        setShowCursor(false)
      }, 3000)
    }
  }, [isVisible, currentIndex, code, isComplete, onComplete])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (terminalRef.current && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        terminalRef.current.scrollLeft += e.deltaX
      }
    }

    const terminal = terminalRef.current
    if (terminal) {
      terminal.addEventListener('wheel', handleWheel, { passive: false })
      return () => terminal.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div className="relative">
      <div 
        ref={terminalRef}
        className="bg-slate-900 dark:bg-slate-950 rounded-xl p-4 font-mono text-sm overflow-x-auto border border-slate-700 dark:border-slate-800 shadow-lg scrollbar-hide md:scrollbar-default hover:scrollbar-visible"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex items-center mb-3 min-w-max">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="ml-4 text-slate-400 text-xs font-semibold">{language}</span>
        </div>
        <pre className="text-green-400 leading-relaxed min-h-[120px] min-w-max">
          <code>
            {displayedCode}
            {showCursor && <span className="animate-pulse bg-green-400 text-green-400">|</span>}
          </code>
        </pre>
      </div>
      
      <div className="md:hidden absolute right-2 top-12 bg-slate-800/70 rounded-full p-1 animate-bounce">
        <ChevronDown className="h-4 w-4 text-slate-300 rotate-90" />
      </div>
    </div>
  )
}

// Composant pour les métiers animés
const AnimatedProfessions = ({ isActive }: { isActive: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentProfession, setCurrentProfession] = useState(0)

  const professions = [
    { icon: Code, name: "Développement", color: "text-blue-500" },
    { icon: Database, name: "Data Science", color: "text-purple-500" },
    { icon: Calculator, name: "Finance", color: "text-green-500" },
    { icon: BarChart3, name: "Business", color: "text-yellow-500" },
    { icon: Cpu, name: "Ingénierie", color: "text-red-500" },
    { icon: Palette, name: "Design", color: "text-pink-500" },
    { icon: Cloud, name: "DevOps", color: "text-indigo-500" },
    { icon: Shield, name: "Cybersécurité", color: "text-orange-500" },
    { icon: MessageSquare, name: "Marketing", color: "text-teal-500" },
    { icon: GitBranch, name: "Product", color: "text-cyan-500" },
    { icon: Server, name: "Architecture", color: "text-amber-500" },
    { icon: Smartphone, name: "Mobile", color: "text-lime-500" },
    { icon: Globe, name: "Web", color: "text-emerald-500" },
    { icon: Mail, name: "Communication", color: "text-rose-500" },
    { icon: Calendar, name: "Management", color: "text-violet-500" },
    { icon: BookOpen, name: "Éducation", color: "text-fuchsia-500" },
    { icon: Heart, name: "Santé", color: "text-sky-500" }
  ]

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setCurrentProfession(prev => (prev + 1) % professions.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isActive, professions.length])

  useEffect(() => {
    if (!containerRef.current || !isActive) return

    const elements = containerRef.current.querySelectorAll('.profession-item')
    gsap.fromTo(elements, 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    )
  }, [isActive])

  return (
    <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
      {professions.map((profession, index) => {
        const Icon = profession.icon
        return (
          <div 
            key={index} 
            className={`profession-item flex flex-col items-center p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm transition-all duration-300 ${
              index === currentProfession 
                ? 'scale-110 shadow-lg ring-2 ring-opacity-50 ' + profession.color.replace('text-', 'ring-') 
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Icon className={`h-6 w-6 mb-2 ${profession.color}`} />
            <span className="text-xs font-medium text-center text-slate-700 dark:text-slate-300">{profession.name}</span>
          </div>
        )
      })}
      <div className="profession-item flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
        <span className="text-xs font-medium text-center text-slate-700 dark:text-slate-300">Et bien d'autres...</span>
      </div>
    </div>
  )
}

// Composant pour l'analyse de CV animée
const CVAnalysisAnimation = ({ isActive }: { isActive: boolean }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const steps = [
    { icon: FileCheck, text: "Analyse du format et structure", color: "text-blue-500" },
    { icon: Search, text: "Extraction des mots-clés métier", color: "text-purple-500" },
    { icon: Brain, text: "Évaluation de la pertinence", color: "text-indigo-500" },
    { icon: TrendingUp, text: "Calcul du score ATS", color: "text-green-500" },
    { icon: Sparkles, text: "Génération des recommandations", color: "text-yellow-500" },
    { icon: Check, text: "Optimisation terminée", color: "text-emerald-500" }
  ]

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, steps.length])

  useEffect(() => {
    if (!containerRef.current || !isActive) return

    const elements = containerRef.current.querySelectorAll('.analysis-step')
    gsap.fromTo(elements, 
      { opacity: 0, x: -20 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.6, 
        stagger: 0.2,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    )
  }, [isActive])

  return (
    <div ref={containerRef} className="space-y-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <div 
            key={index}
            className={`analysis-step flex items-center p-3 rounded-lg transition-all duration-300 ${
              index === currentStep 
                ? 'bg-white dark:bg-slate-700 shadow-md scale-105' 
                : 'bg-transparent opacity-70'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              index === currentStep ? 'bg-blue-100 dark:bg-blue-900/30' : ''
            }`}>
              {index <= currentStep ? (
                <Icon className={`h-4 w-4 ${step.color}`} />
              ) : (
                <Loader className="h-4 w-4 text-slate-400 animate-spin" />
              )}
            </div>
            <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              {step.text}
            </span>
            {index === currentStep && (
              <div className="ml-auto">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Composant pour l'optimisation LinkedIn animée
const LinkedInOptimizationAnimation = ({ isActive }: { isActive: boolean }) => {
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setTimeout(() => setProgress(0), 1000)
          return 100
        }
        return prev + 10
      })
    }, 300)

    return () => clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    if (!containerRef.current || !isActive) return

    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    )
  }, [isActive])

  return (
    <div ref={containerRef} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Linkedin className="h-5 w-5 text-blue-600 mr-2" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Optimisation LinkedIn</span>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {progress}%
        </Badge>
      </div>
      
      <Progress value={progress} className="h-2 mb-4" />
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center">
          <Check className="h-3 w-3 text-green-500 mr-1" />
          <span className="text-slate-600 dark:text-slate-400">Profil complété</span>
        </div>
        <div className="flex items-center">
          {progress > 25 ? (
            <Check className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <Loader className="h-3 w-3 text-slate-400 animate-spin mr-1" />
          )}
          <span className="text-slate-600 dark:text-slate-400">Photo optimisée</span>
        </div>
        <div className="flex items-center">
          {progress > 50 ? (
            <Check className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <Loader className="h-3 w-3 text-slate-400 animate-spin mr-1" />
          )}
          <span className="text-slate-600 dark:text-slate-400">Mots-clés ajoutés</span>
        </div>
        <div className="flex items-center">
          {progress > 75 ? (
            <Check className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <Loader className="h-3 w-3 text-slate-400 animate-spin mr-1" />
          )}
          <span className="text-slate-600 dark:text-slate-400">Réseau étendu</span>
        </div>
      </div>
    </div>
  )
}

// Composant pour le matching candidat-entreprise animé
const MatchingAnimation = ({ isActive }: { isActive: boolean }) => {
  const [matchProgress, setMatchProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setMatchProgress(prev => {
        if (prev >= 100) {
          setTimeout(() => setMatchProgress(0), 1500)
          return 100
        }
        return prev + 5
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    if (!containerRef.current || !isActive) return

    gsap.fromTo(containerRef.current, 
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    )
  }, [isActive])

  return (
    <div ref={containerRef} className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700/50">
      <div className="text-center mb-4">
        <Network className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
        <h4 className="font-semibold text-indigo-700 dark:text-indigo-300">Matching Candidat-Entreprise</h4>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-400 dark:border-indigo-600 flex items-center justify-center mx-auto mb-2">
            <UserCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400">Votre profil</span>
        </div>
        
        <div className="relative flex-1 mx-4">
          <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${matchProgress}%` }}
            ></div>
          </div>
          {matchProgress > 0 && matchProgress < 100 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Loader className="h-4 w-4 text-indigo-500 animate-spin" />
            </div>
          )}
          {matchProgress === 100 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Check className="h-5 w-5 text-green-500 bg-white dark:bg-slate-900 rounded-full p-1" />
            </div>
          )}
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-purple-400 dark:border-purple-600 flex items-center justify-center mx-auto mb-2">
            <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400">Entreprises</span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          {matchProgress < 50 && "Recherche de correspondances..."}
          {matchProgress >= 50 && matchProgress < 100 && "Analyse des compétences..."}
          {matchProgress === 100 && "12 entreprises correspondent à votre profil"}
        </p>
        <div className="flex justify-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`h-4 w-4 ${
                matchProgress >= star * 20 ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Composant de timeline étape
const TimelineStep = ({ 
  step, 
  title, 
  description, 
  icon: Icon, 
  progress, 
  color, 
  details, 
  codeExample,
  isActive,
  animationType
}: any) => {
  const stepRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          const progressInterval = setInterval(() => {
            setAnimationProgress(prev => {
              if (prev >= progress) {
                clearInterval(progressInterval)
                return progress
              }
              return prev + 2
            })
          }, 30)
        }
      },
      { threshold: 0.2 }
    )

    if (stepRef.current) {
      observer.observe(stepRef.current)
    }

    return () => observer.disconnect()
  }, [progress])

  useEffect(() => {
    if (!stepRef.current || !isVisible) return

    gsap.fromTo(stepRef.current, 
      {
        opacity: 0,
        y: 40
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: stepRef.current,
          start: "top 85%",
          end: "bottom 60%",
          toggleActions: "play none none none"
        }
      }
    )

    const detailsElements = stepRef.current.querySelectorAll('.detail-item')
    gsap.fromTo(detailsElements, 
      { opacity: 0, x: -20 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.6, 
        stagger: 0.15,
        scrollTrigger: {
          trigger: stepRef.current,
          start: "top 75%",
          toggleActions: "play none none none"
        }
      }
    )
  }, [isVisible])

  const getColorClasses = (colorName: string) => {
    const colors = {
      blue: {
        gradient: 'from-blue-500 to-cyan-500',
        border: 'border-blue-400/30 dark:border-blue-500/40',
        text: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-500/10'
      },
      purple: {
        gradient: 'from-purple-500 to-pink-500',
        border: 'border-purple-400/30 dark:border-purple-500/40',
        text: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-500/10'
      },
      indigo: {
        gradient: 'from-indigo-500 to-purple-500',
        border: 'border-indigo-400/30 dark:border-indigo-500/40',
        text: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-500/10'
      },
      green: {
        gradient: 'from-green-500 to-emerald-500',
        border: 'border-green-400/30 dark:border-green-500/40',
        text: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-500/10'
      },
      pink: {
        gradient: 'from-pink-500 to-rose-500',
        border: 'border-pink-400/30 dark:border-pink-500/40',
        text: 'text-pink-600 dark:text-pink-400',
        bg: 'bg-pink-50 dark:bg-pink-500/10'
      }
    }
    return colors[colorName as keyof typeof colors] || colors.blue
  }

  const colorClasses = getColorClasses(color)

  const renderAnimation = () => {
    switch (animationType) {
      case 'cvAnalysis':
        return <CVAnalysisAnimation isActive={isVisible} />
      case 'linkedinOptimization':
        return <LinkedInOptimizationAnimation isActive={isVisible} />
      case 'matching':
        return <MatchingAnimation isActive={isVisible} />
      default:
        return codeExample ? (
          <AnimatedTerminal 
            code={codeExample.code}
            language={codeExample.language}
            isVisible={isVisible}
          />
        ) : null
    }
  }

  return (
    <div ref={stepRef} className="relative mb-16 lg:mb-24 opacity-0">
      <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 lg:transform lg:-translate-x-1/2 overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 origin-top transition-transform duration-1000 ease-out"
          style={{ 
            transform: `scaleY(${isVisible ? 1 : 0})`,
            transition: 'transform 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)'
          }}
        />
      </div>
      
      <div 
        className={`absolute left-4 lg:left-1/2 top-8 w-4 h-4 lg:w-6 lg:h-6 rounded-full bg-gradient-to-r ${colorClasses.gradient} border-4 border-white dark:border-slate-900 lg:transform lg:-translate-x-1/2 z-10 transition-all duration-700 ${
          isVisible ? 'animate-pulse shadow-lg scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      />

      <div className="ml-12 lg:ml-0 lg:grid lg:grid-cols-2 lg:gap-12 items-start">
        <div className={`${step % 2 === 0 ? 'lg:order-1' : 'lg:order-2'} mb-8 lg:mb-0`}>
          <Card className={`bg-white/80 dark:bg-slate-800/80 border-2 backdrop-blur-sm hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] ${isVisible ? colorClasses.border + ' shadow-lg' : 'border-slate-200 dark:border-slate-700'} group`}>
            <CardContent className="p-6 lg:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className={`flex-shrink-0 p-3 lg:p-4 rounded-2xl bg-gradient-to-r ${colorClasses.gradient} shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className={`${colorClasses.border} ${colorClasses.text} mb-3 px-3 py-1 text-xs lg:text-sm`}>
                    Étape {step}
                  </Badge>
                  <h3 className="text-lg lg:text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base leading-relaxed">{description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs lg:text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <TrendingUp className="h-4 w-4" />
                    Progression
                  </span>
                  <span className={`text-xs lg:text-sm font-bold ${colorClasses.text}`}>{animationProgress}%</span>
                </div>
                <Progress value={animationProgress} className="h-2 lg:h-3 rounded-full" />
              </div>

              <ul className="space-y-3 lg:space-y-4 mb-6">
                {details.map((detail: any, index: number) => {
                  const DetailIcon = detail.icon
                  return (
                    <li key={index} className="detail-item flex items-center space-x-3 lg:space-x-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors opacity-0 group/item">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${colorClasses.bg} group-hover/item:scale-110 transition-transform`}>
                        <DetailIcon className={`h-4 w-4 lg:h-5 lg:w-5 ${colorClasses.text}`} />
                      </div>
                      <span className="font-medium text-sm lg:text-base text-slate-700 dark:text-slate-300">{detail.text}</span>
                    </li>
                  )
                })}
              </ul>

              {step === 2 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Domaines pris en charge
                  </h4>
                  <AnimatedProfessions isActive={isVisible} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className={`${step % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} ${step % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'}`}>
          <div className="sticky top-24">
            {renderAnimation()}
          </div>
        </div>
      </div>
    </div>
  )
}


const CareerIncubatorSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  
  return (
    <div ref={sectionRef} className="relative py-20 bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4">        
        <CareerIncubator/>
      </div>
    </div>
  )
}

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    gsap.fromTo(titleRef.current, 
      { opacity: 0, y: 40, scale: 0.95 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 1,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      }
    )
    
    gsap.fromTo(subtitleRef.current, 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        delay: 0.3,
        scrollTrigger: {
          trigger: subtitleRef.current,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      }
    )

    if (timelineRef.current) {
      gsap.fromTo(timelineRef.current, 
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1,
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )
    }

    const timelineSteps = containerRef.current.querySelectorAll('.relative.mb-16')
    timelineSteps.forEach((step) => {
      gsap.to(step.querySelector('.absolute.w-px > div'), {
        scaleY: 1,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: step,
          start: "top 85%",
          end: "bottom 60%",
          toggleActions: "play none none none"
        }
      })
    })
  }, [])

  return (
    <section className="relative overflow-hidden mt-15">
      <CareerIncubatorSection />
      {/* Section Timeline avec fond approprié */}
      <div className="py-16 lg:py-32 relative z-10 bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container relative max-w-7xl mx-auto px-4 lg:px-8" ref={containerRef}>
          {/* Header */}
          <div className="text-center mb-16 lg:mb-24">
            <Badge variant="outline" className="mb-6 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border-indigo-400/30 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 px-4 lg:px-6 py-2 lg:py-3">
              <Sparkles className="h-4 w-4 mr-2" />
              Parcours d'excellence professionnel
            </Badge>
            
            <h2 ref={titleRef} className="text-3xl lg:text-5xl xl:text-6xl font-bold mb-6 lg:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 leading-tight">
              Ton voyage vers le succès
              <br />
              <span className="text-xl lg:text-2xl xl:text-3xl text-slate-600 dark:text-slate-400 font-normal">
                étape par étape
              </span>
            </h2>
          </div>

          {/* Timeline verticale */}
          <div ref={timelineRef} className="relative max-w-6xl mx-auto">
            {timelineSteps.map((step) => (
              <TimelineStep
                key={step.step}
                {...step}
                isActive={true}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}