import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code, Brain, Sparkles, Zap, ArrowRight, Rocket, Target, BarChart, Users, ChevronRight } from "lucide-react"
import { useRef, useEffect } from "react"
import gsap from "gsap"

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const sloganRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du titre
      gsap.fromTo(".title-part", 
        { 
          opacity: 0, 
          y: 30,
        },
        { 
          opacity: 1, 
          y: 0,
          duration: 1.2,
          ease: "elastic.out(1, 0.8)",
          stagger: 0.15
        }
      )

      // Animation du sous-titre
      gsap.fromTo(subtitleRef.current, 
        { 
          opacity: 0, 
          y: 20 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          delay: 0.6,
          ease: "power2.out" 
        }
      )

      // Animation du slogan
      gsap.fromTo(".slogan-word", 
        { 
          opacity: 0, 
          y: 15,
          rotation: -5
        },
        { 
          opacity: 1, 
          y: 0,
          rotation: 0, 
          duration: 0.8, 
          delay: 1.0,
          stagger: 0.1,
          ease: "back.out(1.7)" 
        }
      )

      // Animation des zigzag underlines
      gsap.fromTo(".zigzag-underline", 
        { 
          scaleX: 0 
        },
        { 
          scaleX: 1, 
          duration: 0.8, 
          delay: 1.4,
          stagger: 0.1,
          ease: "power2.out" 
        }
      )

      // Animation du CTA
      gsap.fromTo(ctaRef.current, 
        { 
          opacity: 0, 
          scale: 0.9 
        },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          delay: 1.6,
          ease: "back.out(1.7)" 
        }
      )

      // Animation des features
      gsap.fromTo(".feature-block", 
        { 
          opacity: 0, 
          y: 40 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          delay: 1.8,
          stagger: 0.15,
          ease: "power2.out" 
        }
      )

      // Animation des icônes
      gsap.fromTo(".feature-icon", 
        { 
          opacity: 0, 
          scale: 0,
          rotation: -180 
        },
        { 
          opacity: 1, 
          scale: 1,
          rotation: 0, 
          duration: 0.6, 
          delay: 2.0,
          stagger: 0.1,
          ease: "back.out(1.7)" 
        }
      )

      // Animation continue des éléments de fond
      gsap.to(".floating-element", {
        y: 15,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section 
      ref={heroRef}
      className="py-20 md:py-28 relative overflow-hidden min-h-screen flex items-center bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100"
    >
      {/* Background avec éléments animés */}
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] dark:from-indigo-900/10 dark:via-transparent dark:to-transparent bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent" />
      
      {/* Éléments décoratifs flottants */}
      <div className="absolute top-20 left-20 floating-element">
        <div className="w-12 h-12 rounded-full dark:bg-indigo-500/20 dark:blur-xl bg-blue-400/30 blur-lg"></div>
      </div>
      <div className="absolute top-1/3 right-20 floating-element">
        <div className="w-16 h-16 rounded-full dark:bg-purple-500/15 dark:blur-xl bg-purple-400/20 blur-lg"></div>
      </div>
      <div className="absolute bottom-40 left-1/4 floating-element">
        <div className="w-14 h-14 rounded-full dark:bg-pink-500/15 dark:blur-xl bg-pink-400/20 blur-lg"></div>
      </div>
      <div className="absolute top-1/2 right-1/3 floating-element">
        <div className="w-10 h-10 rounded-full dark:bg-blue-500/15 dark:blur-xl bg-cyan-400/20 blur-lg"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="title-part block">
              L'accélérateur de carrière
            </span>
            <span className="title-part block mt-2">
              pour <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-amber-400 dark:via-orange-400 dark:to-pink-400">TurboIntMax</span>
            </span>
          </h1>
          
          <p ref={subtitleRef} className="text-xl md:text-2xl dark:text-slate-300 text-slate-700 mb-10 max-w-2xl mx-auto">
            Propulsé par l'IA, notre plateforme transforme votre préparation aux entretiens en <span className="font-semibold dark:text-amber-300 text-blue-600">avantage compétitif</span>
          </p>
          
          <div ref={sloganRef} className="mb-12 text-lg md:text-xl font-medium">
            <p className="mb-4">
              <span className="slogan-word inline-block dark:text-amber-400 text-blue-600 font-bold -rotate-2 mx-1">Perfectionne</span>
              <span className="dark:text-slate-300 text-slate-700">tes réponses,</span>
              <span className="slogan-word inline-block dark:text-purple-400 text-purple-600 font-bold rotate-1 mx-1">impressionne</span>
              <span className="dark:text-slate-300 text-slate-700">les recruteurs</span>
            </p>
            <p>
              <span className="slogan-word inline-block dark:text-cyan-400 text-cyan-600 font-bold -rotate-1 mx-1">Maîtrise</span>
              <span className="dark:text-slate-300 text-slate-700">les défis,</span>
              <span className="slogan-word inline-block dark:text-pink-400 text-pink-600 font-bold rotate-2 mx-1">décroche</span>
              <span className="dark:text-slate-300 text-slate-700">le poste</span>
            </p>
            
            {/* Zigzag Underlines */}
            <svg className="w-full h-4 mt-4" viewBox="0 0 400 20" preserveAspectRatio="none">
              <path 
                className="zigzag-underline stroke-blue-500 dark:stroke-amber-400 stroke-2 origin-left"
                d="M0,10 L40,2 L80,10 L120,2 L160,10 L200,2 L240,10 L280,2 L320,10 L360,2 L400,10" 
                fill="none" 
                strokeLinecap="round"
              />
            </svg>
          </div>
          
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-amber-500 dark:to-orange-500 dark:hover:from-amber-600 dark:hover:to-orange-600 text-white text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-amber-500/25">
              <Link href="/signup">
                <Rocket className="h-5 w-5" />
                Propulser ma carrière
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-800 dark:hover:text-white dark:hover:bg-slate-800 text-lg px-8 py-6 rounded-2xl">
              <Link href="/demo">
                Voir la démo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <div ref={featuresRef} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="feature-block group relative bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/80 dark:border-slate-700/50 from-white/70 to-slate-100/90 border border-slate-200/60 p-7 rounded-3xl backdrop-blur-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="feature-icon-wrapper mb-5 inline-flex rounded-2xl bg-blue-500/10 dark:bg-blue-500/10 p-3 group-hover:bg-blue-500/20 transition-colors duration-300">
                <Target className="feature-icon h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white text-slate-800">Préparation Ciblée</h3>
              <p className="dark:text-slate-300 text-slate-600 mb-4">
                Des exercices adaptés à votre domaine et niveau pour maximiser votre impact.
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                <span>Commencer</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
          
          <div className="feature-block group relative bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/80 dark:border-slate-700/50 from-white/70 to-slate-100/90 border border-slate-200/60 p-7 rounded-3xl backdrop-blur-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="feature-icon-wrapper mb-5 inline-flex rounded-2xl bg-purple-500/10 dark:bg-purple-500/10 p-3 group-hover:bg-purple-500/20 transition-colors duration-300">
                <BarChart className="feature-icon h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white text-slate-800">Progression Mesurable</h3>
              <p className="dark:text-slate-300 text-slate-600 mb-4">
                Suivez vos progrès avec des analytics détaillés et des recommandations personnalisées.
              </p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
                <span>Progresser</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
          
          <div className="feature-block group relative bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/80 dark:border-slate-700/50 from-white/70 to-slate-100/90 border border-slate-200/60 p-7 rounded-3xl backdrop-blur-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="feature-icon-wrapper mb-5 inline-flex rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/10 p-3 group-hover:bg-cyan-500/20 transition-colors duration-300">
                <Users className="feature-icon h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white text-slate-800">Communauté d'Experts</h3>
              <p className="dark:text-slate-300 text-slate-600 mb-4">
                Échangez avec une communauté de professionnels et bénéficiez de conseils experts.
              </p>
              <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-medium">
                <span>Rejoindre</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}