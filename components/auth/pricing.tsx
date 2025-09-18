"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Infinity as InfinityIcon, ChevronLeft, ChevronRight, Star, Zap, Crown, Building, GraduationCap, Briefcase, FileText, Award, Users } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Enregistrer le plugin ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type Frequency = "month" | "year" | "lifetime"

interface PricingPlan {
  id: string
  name: string
  price: { month: string; year: string; lifetime: string }
  description: string
  features: string[]
  highlighted: boolean
  cta: string
  icon: React.ElementType
  gradient: string
  savings?: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Gratuit",
    price: { month: "0 FCFA", year: "0 FCFA", lifetime: "0 FCFA" },
    description: "Démarrez gratuitement et découvrez les bases.",
    features: [
      "Création de profil simple",
      "Portfolio basique en ligne",
      "Accès à 2 simulations d’entretien IA/mois",
      "Matching limité avec entreprises",
    ],
    highlighted: false,
    cta: "Commencer gratuitement",
    icon: FileText,
    gradient: "from-slate-100 via-blue-50 to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900",
  },
  {
    id: "pro",
    name: "Pro",
    price: { month: "4 500 FCFA", year: "45 000 FCFA", lifetime: "90 000 FCFA" },
    description: "Boostez votre carrière avec des outils intelligents.",
    features: [
      "Rédaction intelligente de CV et rapport",
      "Portfolio pro avec hébergement inclus",
      "10 simulations d’entretien IA/mois",
      "Matching avancé avec recruteurs",
    ],
    highlighted: true,
    cta: "Passer en Pro",
    icon: Briefcase,
    gradient: "from-blue-100 via-indigo-200 to-blue-300 dark:from-blue-950 dark:via-indigo-900 dark:to-blue-950",
    savings: "Économisez 20% avec l’abonnement annuel",
  },
  {
    id: "expert",
    name: "Expert",
    price: { month: "9 500 FCFA", year: "95 000 FCFA", lifetime: "200 000 FCFA" },
    description: "Pour ceux qui veulent exceller et être accompagnés.",
    features: [
      "Coaching IA + recruteur en direct",
      "CV & rapport optimisés avec IA avancée",
      "Portfolio premium avec analytics visiteurs",
      "Matching prioritaire avec entreprises",
      "Entretiens illimités (IA) + 5 humains/mois",
    ],
    highlighted: true,
    cta: "Devenir Expert",
    icon: Award,
    gradient: "from-purple-200 via-fuchsia-300 to-purple-400 dark:from-purple-950 dark:via-fuchsia-900 dark:to-purple-950",
    savings: "Économisez 30% avec l’annuel",
  },
  {
    id: "enterprise",
    name: "Entreprise",
    price: { month: "Sur mesure", year: "Sur mesure", lifetime: "Sur mesure" },
    description: "Solutions de recrutement et formation pour entreprises.",
    features: [
      "Accès illimité à la base de talents",
      "Matching IA avec candidats adaptés",
      "Simulations d’entretien personnalisées",
      "Rapports RH intelligents",
      "Formation continue pour employés",
    ],
    highlighted: false,
    cta: "Nous contacter",
    icon: Building,
    gradient: "from-green-200 via-emerald-300 to-green-400 dark:from-green-950 dark:via-emerald-900 dark:to-green-950",
  },
  {
    id: "school",
    name: "École",
    price: { month: "Sur mesure", year: "Sur mesure", lifetime: "Sur mesure" },
    description: "Accompagnez vos étudiants vers l’excellence.",
    features: [
      "Rédaction de CV et rapports pour étudiants",
      "Création de portfolio collectif et individuel",
      "Sessions d’entretiens simulés IA & humains",
      "Suivi pédagogique avec analytics",
      "Accès privilégié aux entreprises partenaires",
    ],
    highlighted: false,
    cta: "Devenir partenaire",
    icon: Users,
    gradient: "from-yellow-100 via-amber-200 to-orange-300 dark:from-yellow-950 dark:via-amber-900 dark:to-orange-950",
  },
]


export function Pricing() {
  const [frequency, setFrequency] = useState<Frequency>("month")
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Animation GSAP pour le titre et les cartes
  useEffect(() => {
    // Animation du titre
    gsap.fromTo(titleRef.current, 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      }
    )

    // Animation des cartes
    const cards = containerRef.current?.querySelectorAll('.pricing-card')
    cards?.forEach((card, index) => {
      gsap.fromTo(card, 
        { 
          opacity: 0, 
          y: 60,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: index * 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )
    })

    // Animation du toggle de fréquence
    const toggleButtons : any= containerRef.current?.querySelectorAll('.frequency-toggle')
    gsap.fromTo(toggleButtons, 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: toggleButtons?.[0],
          start: "top 90%",
          toggleActions: "play none none none"
        }
      }
    )
  }, [])

  // Drag handling pour le carousel
  let isDown = false
  let startX: number
  let scrollLeft: number

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    isDown = true
    scrollRef.current.classList.add("cursor-grabbing")
    scrollRef.current.classList.remove("cursor-grab")
    startX = e.pageX - scrollRef.current.offsetLeft
    scrollLeft = scrollRef.current.scrollLeft
  }

  const handleMouseLeaveOrUp = () => {
    if (!scrollRef.current) return
    isDown = false
    scrollRef.current.classList.remove("cursor-grabbing")
    scrollRef.current.classList.add("cursor-grab")
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      scrollRef.current.scrollBy({
        left: dir === "left" ? -clientWidth * 0.8 : clientWidth * 0.8,
        behavior: "smooth",
      })
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full items-center bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-16 px-4"
    >
      {/* Title */}
      <h1 ref={titleRef} className="text-black dark:text-white text-4xl md:text-6xl font-bold mb-8 text-center opacity-0">
        Nos <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Tarifs</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 text-center max-w-2xl">
        Choisissez l'offre qui correspond à vos besoins de préparation aux entretiens
      </p>

      {/* Frequency Toggle */}
      <div className="flex gap-2 mb-12 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
        {(["month", "year", "lifetime"] as Frequency[]).map((f) => (
          <Button
            key={f}
            variant={frequency === f ? "default" : "ghost"}
            onClick={() => setFrequency(f)}
            className="frequency-toggle opacity-0 rounded-lg px-6 py-2 transition-all duration-200"
          >
            {f === "month" ? "Mensuel" : f === "year" ? "Annuel" : "À vie"}
          </Button>
        ))}
      </div>

      {/* Carousel wrapper */}
      <div className="relative w-full max-w-7xl">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 shadow-lg p-3 rounded-full hover:scale-110 transition-transform cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>

        {/* Cards container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-scroll px-6 cursor-grab select-none scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
        >
          {pricingPlans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.id}
                className={cn(
                  "pricing-card flex flex-col flex-shrink-0 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[30%] xl:w-[25%]",
                  "relative rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 transition-all duration-300",
                  "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md",
                  "hover:shadow-2xl hover:-translate-y-2",
                  plan.highlighted 
                    ? "ring-2 ring-blue-500 dark:ring-blue-400 scale-[1.02] border-blue-200 dark:border-blue-800" 
                    : ""
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 mt-6">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                      POPULAIRE
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  {plan.name}
                  {plan.id === "expert" && <InfinityIcon className="w-5 h-5 text-purple-500" />}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 min-h-[48px]">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                      {plan.price[frequency]}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                      {frequency === "month" ? "/mois" : frequency === "year" ? "/an" : ""}
                    </span>
                  </div>
                  
                  {plan.savings && frequency === "year" && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                      {plan.savings}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-6 space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-slate-700 dark:text-slate-200 text-sm"
                    >
                      <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold transition-all duration-200",
                    plan.highlighted
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {plan.cta}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 shadow-lg p-3 rounded-full hover:scale-110 transition-transform cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
      </div>

      {/* Note */}
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-12 text-center max-w-2xl">
        Tous nos plans incluent un support client dédié et des mises à jour régulières. 
        Paiement sécurisé et remboursement sous 14 jours.
      </p>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}