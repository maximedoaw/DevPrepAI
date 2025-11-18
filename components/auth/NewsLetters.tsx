"use client"

import { useState } from "react"
import { Mail, Send, CheckCircle2, Sparkles, Bell, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { toast } from "sonner"

// Enregistrer le plugin ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function NewsLetters() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    // Animation du titre
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      )
    }

    // Animation de la carte
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      )
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes("@")) {
      toast.error("Veuillez entrer une adresse email valide")
      return
    }

    setIsSubmitting(true)

    // Simulation de l'envoi (remplacer par votre logique API)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      setIsSubmitted(true)
      setEmail("")
      toast.success("Inscription réussie ! Merci de votre confiance.")
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setIsSubmitted(false)
      }, 3000)
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-24 bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden"
    >
      {/* Effets de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12 lg:mb-16">
          <Badge
            variant="outline"
            className="mb-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-4 lg:px-6 py-2 lg:py-3 inline-flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span>Restez informé</span>
          </Badge>

          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 leading-tight"
          >
            Ne manquez aucune nouveauté
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Recevez les dernières actualités, conseils de carrière et opportunités directement dans votre boîte de réception.
          </p>
        </div>

        <Card
          ref={cardRef}
          className="bg-white/80 dark:bg-slate-800/80 border-2 border-emerald-200 dark:border-emerald-900/40 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.01] opacity-0"
        >
          <CardContent className="p-6 sm:p-8 lg:p-10">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500 dark:text-emerald-400 pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-12 h-12 border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-400 dark:focus:border-emerald-600 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/30"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Zap className="mr-2 h-4 w-4 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        S'inscrire
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span>Conseils de carrière exclusifs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span>Offres d'emploi personnalisées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span>Nouvelles fonctionnalités</span>
                  </div>
                </div>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  En vous inscrivant, vous acceptez de recevoir nos newsletters. Vous pouvez vous désabonner à tout moment.
                </p>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mb-4 animate-pulse">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Inscription réussie !
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Merci de votre confiance. Vous recevrez bientôt nos meilleurs conseils directement dans votre boîte de réception.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </section>
  )
}

