"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Star, GraduationCap, Briefcase, User, Building2, Users } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const competitors = [
  {
    name: "LinkedIn Learning",
    points: [
      { text: "Formations génériques", hasIt: true },
      { text: "Simulations d’entretien IA", hasIt: false },
      { text: "Matching recruteurs", hasIt: false },
      { text: "Multi-métiers techniques", hasIt: false },
    ],
  },
  {
    name: "LeetCode",
    points: [
      { text: "Exercices de code", hasIt: true },
      { text: "Simulations réalistes", hasIt: false },
      { text: "Coaching CV & profil", hasIt: false },
      { text: "Multi-domaines (hors dev)", hasIt: false },
    ],
  },
  {
    name: "InterviewBuddy",
    points: [
      { text: "Mock interview (humains)", hasIt: true },
      { text: "IA temps réel", hasIt: false },
      { text: "Scalabilité mass market", hasIt: false },
      { text: "Optimisation profils multi-plateformes", hasIt: false },
    ],
  },
]

const turboIntMax = {
  name: "🚀 TurboIntMax",
  points: [
    { text: "Simulation IA personnalisée", hasIt: true },
    { text: "Matching intelligent recruteurs/candidats", hasIt: true },
    { text: "Coaching CV multi-plateformes", hasIt: true },
    { text: "Métiers techniques & semi-techniques", hasIt: true },
  ],
}

export default function WhyTurboIntMax() {
  const cardsRef = useRef<HTMLDivElement | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (cardsRef.current) {
      const elements = cardsRef.current.querySelectorAll(".compare-card")
      gsap.fromTo(
        elements,
        { opacity: 0, y: 60, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.2,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
          },
        }
      )
    }

    if (targetRef.current) {
      const targets = targetRef.current.querySelectorAll(".audience-card")
      gsap.fromTo(
        targets,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: targetRef.current,
            start: "top 85%",
          },
        }
      )
    }
  }, [])

  return (
    <>
      {/* Section Comparatif */}
      <section className="relative py-20 bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-14">
            Pourquoi <span className="text-blue-600 dark:text-blue-400">TurboIntMax</span> ?
          </h2>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...competitors, turboIntMax].map((comp, idx) => (
              <Card
                key={idx}
                className={`compare-card relative overflow-hidden rounded-2xl border 
                  backdrop-blur-sm transition-all duration-300
                  hover:-translate-y-2 
                  ${
                    comp.name.includes("TurboIntMax")
                      ? "border-transparent bg-gradient-to-br from-blue-200/20 via-white/10 to-blue-200/20 dark:from-blue-900/20 dark:via-slate-900/50 dark:to-blue-900/20 shadow-lg hover:shadow-blue-500/40"
                      : "border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30 shadow-md hover:shadow-xl"
                  }`}
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {comp.name.includes("TurboIntMax") && (
                      <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                    )}
                    <CardTitle
                      className={`text-xl font-semibold ${
                        comp.name.includes("TurboIntMax")
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {comp.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col space-y-3">
                  {comp.points.map((p, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                        ${
                          p.hasIt
                            ? "bg-green-100/70 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100/70 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                    >
                      {p.hasIt ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {p.text}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nouvelle Section : Public cible */}
      <section className="relative py-20 bg-gradient-to-b from-blue-50 via-slate-100 to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-14">
            À qui s’adresse <span className="text-blue-600 dark:text-blue-400">TurboIntMax</span> ?
          </h2>

          <div
            ref={targetRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: GraduationCap, title: "Étudiants", desc: "Acquérez vos premières expériences d’entretien." },
              { icon: GraduationCap, title: "Jeunes diplômés", desc: "Trouvez rapidement un premier emploi grâce à l’IA." },
              { icon: User, title: "Travailleurs en reconversion", desc: "Changez de carrière avec des outils de préparation adaptés." },
              { icon: Building2, title: "Entreprises", desc: "Optimisez vos recrutements et formez vos talents." },
              { icon: Users, title: "Écoles & Bootcamps", desc: "Préparez vos étudiants et augmentez leur taux de placement." },
            ].map((aud, idx) => (
              <Card
                key={idx}
                className="audience-card group rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader className="flex flex-col items-center space-y-3">
                  <aud.icon className="w-10 h-10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-lg font-semibold">{aud.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{aud.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
