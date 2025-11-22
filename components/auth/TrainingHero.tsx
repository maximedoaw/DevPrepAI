'use client'

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Award, Zap, ArrowRight } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function TrainingHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Animation pour l'image
    if (imageRef.current) {
      gsap.fromTo(imageRef.current,
        {
          opacity: 0,
          scale: 0.95,
          y: 30
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )
    }

    // Animation pour le texte
    if (textRef.current) {
      const elements = textRef.current.querySelectorAll('.fade-in-up')
      gsap.fromTo(elements,
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )
    }
  }, [])

  return (
    <section 
      ref={containerRef}
      className="relative py-16 lg:py-24 xl:py-32 bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 dark:bg-green-500/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Texte à gauche */}
          <div ref={textRef} className="order-2 lg:order-1 space-y-6 lg:space-y-8">

            {/* Titre principal - Style Notion */}
            <h1 className="fade-in-up text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6">
              <span className="block mb-3">
                Améliorez vos compétences
              </span>
              <span className="block bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent">
                en vous entraînant avec des recruteurs qualifiés
              </span>
            </h1>

            {/* Description - Style Notion */}
            <p className="fade-in-up text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-normal">
              Pratiquez avec des professionnels du recrutement pour perfectionner 
              vos compétences techniques et comportementales dans un environnement 
              sûr et bienveillant.
            </p>

            {/* Points clés */}
            <div className="fade-in-up grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Recruteurs certifiés
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Experts du secteur
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div className="flex-shrink-0 p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Progression rapide
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Suivi personnalisé
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div className="flex-shrink-0 p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                  <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Feedback détaillé
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Conseils concrets
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Disponible 24/7
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Quand vous voulez
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Image à droite - Style Notion */}
          <div ref={imageRef} className="order-1 lg:order-2 relative">
            <div className="relative w-full aspect-[4/3] lg:aspect-square rounded-xl lg:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900">
              {/* Overlay subtil pour le style Notion */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/3 via-transparent to-green-500/3 dark:from-emerald-500/5 dark:to-green-500/5 z-10" />
              
              <Image
                src="/notion/notion1.jpg"
                alt="Entraînement avec des recruteurs qualifiés"
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              

              {/* Décoration bottom subtile */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50/60 dark:from-slate-950/60 to-transparent z-10" />
            </div>

      
          </div>
        </div>
      </div>
    </section>
  )
}

