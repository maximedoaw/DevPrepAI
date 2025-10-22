"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Infinity as InfinityIcon, Star, Zap, Crown, Building, GraduationCap, Briefcase, FileText, Award, Users, Check } from "lucide-react"

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
  savings?: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Gratuit",
    price: { month: "0 FCFA", year: "0 FCFA", lifetime: "0 FCFA" },
    description: "Démarrez gratuitement et découvrez les bases de votre préparation carrière.",
    features: [
      "Profil professionnel basique",
      "Portfolio en ligne simple",
      "2 simulations d'entretien IA/mois",
      "Matching limité avec entreprises",
      "Support par email"
    ],
    highlighted: false,
    cta: "Commencer gratuitement",
    icon: FileText,
  },
  {
    id: "pro",
    name: "Pro",
    price: { month: "4 500 FCFA", year: "45 000 FCFA", lifetime: "90 000 FCFA" },
    description: "Optimisez votre recherche avec des outils professionnels.",
    features: [
      "CV et rapport optimisés IA",
      "Portfolio professionnel complet",
      "10 simulations d'entretien IA/mois",
      "Matching avancé avec recruteurs",
      "Support prioritaire",
      "Analytics de profil"
    ],
    highlighted: true,
    cta: "Choisir Pro",
    icon: Briefcase,
    savings: "Économisez 20% avec l'annuel",
  },
  {
    id: "expert",
    name: "Expert",
    price: { month: "9 500 FCFA", year: "95 000 FCFA", lifetime: "200 000 FCFA" },
    description: "Excellence et accompagnement personnalisé pour votre carrière.",
    features: [
      "Coaching IA + recruteur en direct",
      "CV & rapport premium avec IA avancée",
      "Portfolio premium avec analytics",
      "Matching prioritaire entreprises",
      "Entretiens illimités IA + 5 humains/mois",
      "Support dédié 24/7"
    ],
    highlighted: false,
    cta: "Devenir Expert",
    icon: Award,
    savings: "Économisez 30% avec l'annuel",
  },
  {
    id: "enterprise",
    name: "Entreprise",
    price: { month: "Sur mesure", year: "Sur mesure", lifetime: "Sur mesure" },
    description: "Solutions complètes de recrutement et développement talent.",
    features: [
      "Accès illimité à la base de talents",
      "Matching IA avancé",
      "Simulations d'entretien personnalisées",
      "Rapports RH intelligents",
      "Formation continue employés",
      "Dashboard administrateur"
    ],
    highlighted: false,
    cta: "Nous contacter",
    icon: Building,
  },
  {
    id: "school",
    name: "École",
    price: { month: "Sur mesure", year: "Sur mesure", lifetime: "Sur mesure" },
    description: "Accompagnement excellence pour vos étudiants.",
    features: [
      "CV et rapports étudiants",
      "Portfolios collectifs et individuels",
      "Sessions d'entretiens simulés",
      "Suivi pédagogique analytics",
      "Accès entreprises partenaires",
      "Support dédié établissement"
    ],
    highlighted: false,
    cta: "Devenir partenaire",
    icon: Users,
  },
]

export function Pricing() {
  const [frequency, setFrequency] = useState<Frequency>("month")

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 py-16 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Investissez dans votre{" "}
          <span className="text-green-600 dark:text-green-500">carrière</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Des outils professionnels pour accélérer votre progression et décrocher le poste de vos rêves
        </p>
      </div>

      {/* Frequency Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {(["month", "year", "lifetime"] as Frequency[]).map((f) => (
            <Button
              key={f}
              variant={frequency === f ? "default" : "ghost"}
              onClick={() => setFrequency(f)}
              className={cn(
                "rounded-md px-6 py-2 transition-all duration-200",
                frequency === f && " dark:bg-slate-700 dark:text-white shadow-sm"
              )}
            >
              {f === "month" ? "Mensuel" : f === "year" ? "Annuel" : "À vie"}
            </Button>
          ))}
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-xl border bg-white dark:bg-slate-900 p-6 transition-all duration-300",
                  "hover:shadow-lg hover:border-green-200 dark:hover:border-green-800",
                  plan.highlighted
                    ? "border-green-300 dark:border-green-700 shadow-lg ring-1 ring-green-100 dark:ring-green-900"
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      RECOMMANDÉ
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {plan.price[frequency]}
                    </span>
                    {plan.price[frequency] !== "Sur mesure" && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {frequency === "month" ? "/mois" : frequency === "year" ? "/an" : ""}
                      </span>
                    )}
                  </div>
                  {plan.savings && frequency === "year" && (
                    <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                      {plan.savings}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={cn(
                    "w-full rounded-lg py-3 font-medium transition-all duration-200",
                    plan.highlighted
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {plan.cta}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-3xl mx-auto text-center mt-12">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tous nos plans incluent un support client dédié et des mises à jour régulières. 
          Paiement sécurisé et satisfaction garantie sous 14 jours.
        </p>
      </div>
    </div>
  )
}