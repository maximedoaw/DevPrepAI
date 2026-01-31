"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, Zap, Globe, Shield, BookOpen, GraduationCap, Users2, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useRef, useEffect } from "react"
import gsap from "gsap"

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du titre
      gsap.fromTo(".title-char",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.02,
          ease: "power2.out"
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
          duration: 1.2,
          delay: 0.8,
          ease: "power3.out"
        }
      )

      // Animation des CTAs
      gsap.fromTo(ctaRef.current,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 1.2,
          ease: "power3.out"
        }
      )

      // Animation infinie des formes d'apprentissage (très lente)
      gsap.to(".learning-motif", {
        y: "random(-30, 30)",
        x: "random(-15, 15)",
        rotation: "random(-8, 8)",
        duration: "random(8, 12)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })

      // Animation de la "ligne de progression"
      gsap.fromTo(".path-line",
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 5, ease: "power1.inOut" }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const renderAnimatedText = (text: string, className: string) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        className={`title-char inline-block ${char === " " ? "w-2" : ""} ${className}`}
      >
        {char}
      </span>
    ))
  }

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden min-h-screen flex items-center bg-white dark:bg-slate-950 transition-colors duration-700"
    >
      {/* Background Soft Grid */}
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* Decorative Learning Motifs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Motif Livre / Savoir */}
        <div className="learning-motif absolute left-[8%] top-[15%] opacity-15 dark:opacity-25">
          <BookOpen size={220} strokeWidth={0.3} className="text-emerald-500/60" />
        </div>

        {/* Motif Diplôme / Réussite */}
        <div className="learning-motif absolute right-[10%] top-[10%] opacity-10 dark:opacity-20">
          <GraduationCap size={260} strokeWidth={0.3} className="text-emerald-600/60" />
        </div>

        {/* Chemin de progression abstrait */}
        <svg className="absolute left-[15%] top-1/4 w-full h-full opacity-10 dark:opacity-20" viewBox="0 0 1000 1000">
          <path
            className="path-line"
            d="M0,600 C250,500 350,700 550,600 C750,500 850,700 1050,600"
            fill="none"
            stroke="url(#grad1_hero)"
            strokeWidth="1.5"
            strokeDasharray="8,12"
          />
          <defs>
            <linearGradient id="grad1_hero" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>

        {/* Cercles de croissance */}
        <div className="learning-motif absolute left-1/4 bottom-[5%] w-80 h-80 rounded-full border border-emerald-500/15 dark:border-emerald-500/10 rotate-12" />
        <div className="learning-motif absolute right-1/4 bottom-[15%] w-56 h-56 rounded-full border border-sky-500/15 dark:border-sky-500/10" />
      </div>

      <div className="container relative z-20 py-24 md:py-32 px-4 md:px-6">
        <div className="max-w-6xl mx-auto text-center md:text-left">

          {/* Headline Optimisée SEO */}
          <div ref={titleRef} className="mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              <span className="block mb-4 opacity-80 font-semibold tracking-wide">
                {renderAnimatedText("Formation & Reconversion", "")}
              </span>
              <span className="block mb-4">
                {renderAnimatedText("Réussissez vos entretiens", "bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent")}
              </span>
              <span className="block relative inline-block text-slate-700 dark:text-slate-300">
                {renderAnimatedText("et votre recrutement.", "font-medium italic")}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 2.2, duration: 1.5, ease: "circOut" }}
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-emerald-500/30 origin-left"
                />
              </span>
            </h1>
          </div>

          {/* Sous-titre Épuré & SEO */}
          <p ref={subtitleRef} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-14 leading-relaxed max-w-3xl font-medium tracking-wide opacity-90">
            SkillWokz est la plateforme de <span className="text-emerald-600 dark:text-emerald-400 font-semibold italic">préparation aux interviews</span> qui humanise votre parcours professionnel.
            Maîtrisez les codes du recrutement et transformez chaque entretien en succès.
          </p>

          {/* Badges Section */}
          <div className="flex flex-wrap gap-4 mb-16 justify-center md:justify-start">
            {[
              { label: "Mentorat de Carrière", icon: Users2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "Simulations d'Entretiens", icon: Zap, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "Communauté Active", icon: Globe, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-900/20" },
              { label: "Certification Reconnue", icon: Star, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" }
            ].map((feature, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-500 group cursor-default`}
              >
                <div className={`p-2 rounded-xl ${feature.bg} transition-transform group-hover:scale-110`}>
                  <feature.icon className={`h-5 w-5 ${feature.color} opacity-80 group-hover:opacity-100`} />
                </div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
            <Button
              asChild
              size="lg"
              className="h-16 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              <Link href="/signup" className="flex items-center gap-3">
                Commencer ma formation
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-16 px-10 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-900 dark:text-white text-lg font-bold transition-all hover:-translate-y-1 active:scale-95"
            >
              <Link href="/demo">
                Voir la démo interview
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .title-char {
          display: inline-block;
          transition: color 0.4s ease;
        }
        .title-char:hover {
          color: #10b981;
        }
      `}</style>
    </section>
  )
}