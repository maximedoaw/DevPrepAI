"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Check, Star, Code, Palette, TrendingUp, BarChart, Server, Smartphone,
  Database, Globe, ShieldCheck, Cpu, Briefcase, Coins, Settings,
  Package, Building, MessageSquare, Users, GraduationCap, HeartPulse,
  BrainCircuit, Rocket,
  Sparkles
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatePresence, motion } from "framer-motion"

type Frequency = "month" | "year"

interface PricingPlan {
  id: string
  name: string
  price: { month: string; year: string }
  description: string
  features: string[]
  highlighted: boolean
  cta: string
}

interface TrainingDomain {
  title: string
  desc: string
  icon: React.ElementType
  rotate: number
  offset: string
}

const candidatePlans: PricingPlan[] = [
  {
    id: "free",
    name: "Explorateur",
    price: { month: "0 FCFA", year: "0 FCFA" },
    description: "Pour découvrir la plateforme et préparer vos premiers entretiens.",
    features: [
      "Profil carrière basique",
      "2 Simulations d'entretien (IA Vocale)",
      "Accès limité aux offres d'emploi",
      "Support communautaire",
      "Tests de personnalité simples"
    ],
    highlighted: false,
    cta: "Commencer Gratuitement"
  },
  {
    id: "pro",
    name: "Accélérateur",
    price: { month: "4 500 FCFA", year: "45 000 FCFA" },
    description: "La boîte à outils complète pour réussir sa transition ou son premier emploi.",
    features: [
      "Tout du plan Explorateur",
      "Simulations illimitées (Technique & RH)",
      "Analyse de CV & Portfolio par IA",
      "Accès complet aux formations projets",
      "Matching Recruteur Prioritaire",
      "Analytiques de progression détaillés",
      "Generation de cover letter illimité"
    ],
    highlighted: true,
    cta: "Devenir Membre Pro"
  },
  {
    id: "expert",
    name: "Elite",
    price: { month: "9 500 FCFA", year: "95 000 FCFA" },
    description: "Un accompagnement humain et technique pour une garantie de résultat.",
    features: [
      "Tout du plan Accélérateur",
      "Coaching Humain (2h/mois)",
      "Introduction directe aux entreprises",
      "Revue de code personnalisée",
      "Préparation intensives aux négociations",
      "Badge 'Candidat Vérifié' pour recruteurs"
    ],
    highlighted: false,
    cta: "Postuler au Programme"
  }
]

const organizationPlans: PricingPlan[] = [
  {
    id: "school",
    name: "Écoles",
    price: { month: "Sur Mesure", year: "Sur Mesure" },
    description: "Accompagnez l'insertion professionnelle de vos étudiants.",
    features: [
      "Tableau de bord de suivi pédagogique",
      "Ateliers carrières illimités pour étudiants",
      "Simulations d'entretiens de stage",
      "Connexion avec notre réseau d'entreprises",
      "Marque blanche disponible",
      "Support dédié établissement"
    ],
    highlighted: false,
    cta: "Devenir Partenaire"
  },
  {
    id: "enterprise",
    name: "Entreprises",
    price: { month: "Sur Mesure", year: "Sur Mesure" },
    description: "Recrutez les meilleurs talents, formés et évalués.",
    features: [
      "Accès à la CVthèque qualifiée",
      "Publication d'offres illimitée",
      "Matching prédictif par IA",
      "Tests techniques personnalisables",
      "Marque employeur enrichie",
      "Gestionnaire de compte dédié"
    ],
    highlighted: true,
    cta: "Contacter l'Équipe Sales"
  }
]

const trainingDomains: TrainingDomain[] = [
  { title: "Machine Learning", desc: "Modelez l'intelligence artificielle pour résoudre des problèmes complexes.", icon: BrainCircuit, rotate: 0, offset: "" },
  { title: "Dév. Web & Mobile", desc: "Bâtissez des applications d'envergure mondiale avec les derniers frameworks.", icon: Code, rotate: 0, offset: "" },
  { title: "Data Science", desc: "Transformez le bruit des données en décisions stratégiques et prédictives.", icon: BarChart, rotate: 0, offset: "" },
  { title: "Finance & FinTech", desc: "Maîtrisez les flux monétaires de la nouvelle économie numérique.", icon: Coins, rotate: 0, offset: "" },
  { title: "Business & Stratégie", desc: "Pilotez la croissance et dominez votre marché avec agilité.", icon: Briefcase, rotate: 0, offset: "" },
  { title: "Ingénierie", desc: "Concevez les infrastructures techniques et les systèmes de demain.", icon: Settings, rotate: 0, offset: "" },
  { title: "UX/UI Design", desc: "Créez des interfaces qui captivent, engagent et convertissent les utilisateurs.", icon: Palette, rotate: 0, offset: "" },
  { title: "DevOps & Cloud", desc: "Automatisez et sécurisez le déploiement d'applications à l'échelle mondiale.", icon: Server, rotate: 0, offset: "" },
  { title: "Cybersécurité", desc: "Devenez le rempart indispensable contre les cybermenaces modernes.", icon: ShieldCheck, rotate: 0, offset: "" },
  { title: "Marketing Digital", desc: "Propulsez des marques au sommet de la visibilité et du ROI.", icon: TrendingUp, rotate: 0, offset: "" },
  { title: "Product Management", desc: "Orchestrez le cycle de vie et le succès de produits révolutionnaires.", icon: Package, rotate: 0, offset: "" },
  { title: "Architecture IT", desc: "Dessinez les plans directeurs des systèmes d'information connectés.", icon: Building, rotate: 0, offset: "" },
  { title: "Communication", desc: "Influencez l'opinion et engagez votre audience par des récits puissants.", icon: MessageSquare, rotate: 0, offset: "" },
  { title: "Management & Leadership", desc: "Inspirez, dirigez et faites grandir des équipes de haute performance.", icon: Users, rotate: 0, offset: "" },
  { title: "Éducation & EdTech", desc: "Réinventez la transmission du savoir grâce aux nouvelles technologies.", icon: GraduationCap, rotate: 0, offset: "" },
  { title: "Santé & HealthTech", desc: "Innovez pour sauver des vies et améliorer l'accès aux soins de qualité.", icon: HeartPulse, rotate: 0, offset: "" },
]

export default function Pricing() {
  const [frequency, setFrequency] = useState<Frequency>("month")

  return (
    <div id="pricing" className="w-full bg-slate-50 dark:bg-slate-950 py-24 px-4 overflow-hidden relative scroll-mt-20">

      {/* Background Texture consistent with Moodboard */}
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
          Investissez dans votre <span className="text-emerald-500">avenir</span>
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Des forfaits adaptés à chaque étape de votre parcours, du premier test à la signature du contrat.
        </p>
      </div>

      <Tabs defaultValue="candidats" className="w-full max-w-7xl mx-auto relative z-10">

        {/* Responsive Tabs Navigation */}
        <div className="flex justify-center mb-16">
          <div className="w-full lg:w-auto overflow-x-auto pb-4 scrollbar-hide px-4 flex justify-start lg:justify-center">
            <TabsList className="bg-white/80 dark:bg-slate-900/50 p-1.5 rounded-full h-auto border border-slate-200 dark:border-slate-800 flex gap-2 w-max lg:w-auto">
              <TabsTrigger
                value="candidats"
                className="rounded-full px-6 lg:px-10 py-4 data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-500 dark:data-[state=active]:text-white dark:data-[state=active]:border-none transition-all duration-500 font-black text-xs uppercase tracking-widest whitespace-nowrap border border-transparent"
              >
                Candidats
              </TabsTrigger>
              <TabsTrigger
                value="organizations"
                className="rounded-full px-6 lg:px-10 py-4 data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-500 dark:data-[state=active]:text-white dark:data-[state=active]:border-none transition-all duration-500 font-black text-xs uppercase tracking-widest whitespace-nowrap border border-transparent"
              >
                Organisations
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent key="candidats-content" value="candidats" className="mt-0 outline-none">

          {/* Frequency Toggle for Candidates */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {(["month", "year"] as Frequency[]).map((f) => (
                <button
                  key={`freq-${f}`}
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
                    frequency === f
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  {f === "month" ? "Mensuel" : "Annuel (-20%)"}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Grid Candidates */}
          <motion.div
            key="pricing-candidates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
          >
            {candidatePlans.map((plan) => (
              <PricingCard key={`plan-${plan.id}`} plan={plan} frequency={frequency} />
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent key="organizations-content" value="organizations" className="mt-0 outline-none">
          {/* Pricing Grid Organizations */}
          <motion.div
            key="pricing-organizations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto"
          >
            {organizationPlans.map((plan) => (
              <PricingCard key={`org-plan-${plan.id}`} plan={plan} frequency="month" isCustom />
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Footer Note */}
      <div className="max-w-3xl mx-auto text-center mt-16 relative z-10">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          * Les tarifs annuels sont facturés en un seul paiement. TVA applicable selon votre localisation.
        </p>
      </div>

      {/* Training Domains Section */}
      <TrainingDomainsSection domains={trainingDomains} />
    </div>
  )
}

function PricingCard({ plan, frequency, isCustom = false }: { plan: PricingPlan, frequency: Frequency, isCustom?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-[2rem] p-8 -10 bg-white dark:bg-slate-900 transition-all duration-300 flex flex-col h-full",
        plan.highlighted
          ? "border-2 border-emerald-500 shadow-2xl scale-105 z-10"
          : "border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 shadow-xl"
      )}
    >

      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {plan.name}
          </h3>
          {plan.highlighted && (
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
              <Star size={12} fill="currentColor" />
              Populaire
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-6">
        <span className={`font-black text-slate-900 dark:text-white tracking-tighter ${isCustom ? "text-4xl" : "text-4xl md:text-5xl"}`}>
          {plan.price[frequency]}
        </span>
        {!isCustom && (
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            /{frequency === "month" ? "mois" : "an"}
          </span>
        )}
      </div>

      <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm font-medium">
        {plan.description}
      </p>

      <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-8" />

      {/* Features List */}
      <div className="flex-grow">
        <span className="block text-sm font-bold text-slate-900 dark:text-white mb-6">
          Ce qui est inclus :
        </span>
        <ul className="space-y-4 mb-10">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={12} className="text-emerald-600 dark:text-emerald-400 stroke-[3px]" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-snug">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <Button
        className={cn(
          "w-full py-6 rounded-xl text-base font-bold transition-all duration-300",
          plan.highlighted
            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
        )}
      >
        {plan.cta}
      </Button>

    </div>
  )
}

function TrainingDomainsSection({ domains }: { domains: TrainingDomain[] }) {
  const [hoveredDomain, setHoveredDomain] = useState<TrainingDomain | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < 768
  const outerRadius = isMobile ? 140 : 380
  const innerRadius = isMobile ? 90 : 220

  return (
    <section className="mt-80 relative z-10 py-48 overflow-hidden bg-slate-100/50 dark:bg-slate-950/60 rounded-[4rem] border border-slate-200 dark:border-slate-800/50 mx-4">
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counter-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-orbit {
          animation: orbit linear infinite;
        }
        .animate-counter-orbit {
          animation: counter-orbit linear infinite;
        }
      `}</style>

      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Galaxy Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[150px]" />

        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

        {/* Stars/Particles */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute bg-emerald-500/30 dark:bg-emerald-400/40 rounded-full"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%'
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="text-center max-w-4xl mx-auto mb-40 relative z-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-none text-slate-900 dark:text-white"
        >
          Explorez votre <span className="text-emerald-500 font-light italic">potentiel</span>
        </motion.h2>

        <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-semibold max-w-2xl mx-auto uppercase tracking-wider">
          Naviguez à travers nos {domains.length} écosystèmes de formation optimisés par IA.
        </p>
      </div>

      {/* Galaxy Container - Fully Responsive */}
      <div
        className="relative w-full max-w-5xl mx-auto aspect-square md:aspect-video flex items-center justify-center p-8 group/galaxy"
      >

        {/* The SUN: Central Training Objective (Minimalist Green) */}
        <div className="relative z-40 flex items-center justify-center">
          <motion.div
            animate={{
              boxShadow: ["0 0 20px rgba(16,185,129,0.2)", "0 0 40px rgba(16,185,129,0.4)", "0 0 20px rgba(16,185,129,0.2)"]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-emerald-500 flex items-center justify-center relative shadow-2xl transition-transform hover:scale-110 cursor-pointer border border-white/20"
          >
            {/* Core Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 animate-pulse" />

            <div className="relative flex flex-col items-center text-white text-center">
              <Rocket size={isMobile ? 24 : 32} className="text-white drop-shadow-md" />
            </div>
          </motion.div>

          {/* Note: Active Domain Info Box removed from here, now localized in OrbitSystem */}
        </div>

        {/* Orbit Systems */}
        <OrbitSystem
          radius={outerRadius}
          items={domains.slice(0, 8)}
          speed={80}
          onHover={setHoveredDomain}
          hoveredDomain={hoveredDomain}
          isPaused={!isMobile && hoveredDomain !== null}
          className="z-10"
        />

        <OrbitSystem
          radius={innerRadius}
          items={domains.slice(8, 16)}
          speed={60}
          reverse
          onHover={setHoveredDomain}
          hoveredDomain={hoveredDomain}
          isPaused={!isMobile && hoveredDomain !== null}
          className="z-20"
        />

        {/* Decorative Elliptical Rings */}
        <div className="absolute z-0 w-full h-full max-w-[80%] max-h-[80%] border border-emerald-500/5 dark:border-emerald-500/10 rounded-full pointer-events-none" />
      </div>

      {/* Bottom Action */}
      <div className="mt-40 text-center relative z-20 px-4">
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-14 md:h-16 rounded-xl text-sm font-black shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 group border-none">
          <span>Démarrer ma formation</span>
          <TrendingUp size={18} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Button>
      </div>
    </section>
  )
}

function OrbitSystem({ radius, items, speed, reverse = false, onHover, hoveredDomain, isPaused, className }: {
  radius: number,
  items: TrainingDomain[],
  speed: number,
  reverse?: boolean,
  onHover: (d: TrainingDomain | null) => void,
  hoveredDomain: TrainingDomain | null,
  isPaused: boolean,
  className?: string
}) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < 768

  return (
    <div
      className={cn("absolute flex items-center justify-center pointer-events-none", className)}
      style={{
        width: radius * 2,
        height: radius * 2,
      }}
    >
      {/* Visual Orbit Path */}
      <div className="absolute inset-0 border border-slate-300/30 dark:border-slate-800/40 rounded-full" />

      <div
        style={{
          width: '100%',
          height: '100%',
          animationPlayState: isPaused ? 'paused' : 'running',
          animationDuration: `${speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal'
        }}
        className="absolute inset-0 animate-orbit"
      >

        {items.map((domain, i) => {
          const Icon = domain.icon
          const angle = (i / items.length) * 2 * Math.PI
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          return (
            <div
              key={`${domain.title}-${i}`}
              className="absolute pointer-events-auto"
              style={{
                left: `calc(50% + ${x}px - ${isMobile ? 20 : 28}px)`, // Adjust for planet size
                top: `calc(50% + ${y}px - ${isMobile ? 20 : 28}px)`  // Adjust for planet size
              }}
            >
              {/* COUNTER-ROTATION: Keeps the icon and tooltip upright */}
              <div
                style={{
                  animationPlayState: isPaused ? 'paused' : 'running',
                  animationDuration: `${speed}s`,
                  animationDirection: reverse ? 'normal' : 'reverse' // Reverse the parent's direction
                }}
                onMouseEnter={(e) => { e.stopPropagation(); onHover(domain); }}
                onMouseLeave={() => onHover(null)}
                onClick={() => isMobile && (hoveredDomain?.title === domain.title ? onHover(null) : onHover(domain))}
                className="relative group cursor-pointer active:scale-95 transition-transform animate-orbit"
              >
                {/* Specialized Description Box - Appears Above Planet */}
                <AnimatePresence>
                  {hoveredDomain?.title === domain.title && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -20, x: "-50%" }}
                      animate={{ opacity: 1, scale: 1, y: -10, x: "-50%" }}
                      exit={{ opacity: 0, scale: 0.8, y: -20, x: "-50%" }}
                      className="absolute bottom-full left-1/2 mb-4 w-48 md:w-56 bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-2xl rounded-2xl p-4 text-center z-[100] backdrop-blur-xl"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-2">
                        <Icon size={16} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest mb-1">{domain.title}</h4>
                      <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{domain.desc}</p>
                      {/* Tooltip Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-slate-900" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Planet Orb */}
                <div
                  className={cn(
                    "w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg border",
                    "bg-white/90 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 backdrop-blur-sm",
                    "group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:scale-125 group-hover:z-50 group-hover:shadow-emerald-500/40",
                    hoveredDomain?.title === domain.title && "bg-emerald-500 border-emerald-400 scale-110 shadow-emerald-500/40 z-50"
                  )}
                >
                  <Icon
                    size={isMobile ? 16 : 24}
                    className={cn(
                      "text-emerald-500 group-hover:text-white transition-colors duration-300",
                      hoveredDomain?.title === domain.title && "text-white"
                    )}
                  />
                </div>

                {/* Floating Title */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-black px-2 py-1 rounded-full whitespace-nowrap shadow-xl uppercase tracking-tighter">
                    {domain.title}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
