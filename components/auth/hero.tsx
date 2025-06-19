import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Code, Brain, Sparkles } from "lucide-react"

export default function Hero() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Maîtrisez vos{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              entretiens techniques
            </span>{" "}
            avec l'IA
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Préparez-vous efficacement aux entretiens techniques avec notre plateforme alimentée par l'IA. Améliorez vos
            hard et soft skills pour décrocher le job de vos rêves.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background/50 border border-border/50 p-6 rounded-lg backdrop-blur-sm">
            <Code className="h-10 w-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Hard Skills</h3>
            <p className="text-muted-foreground">
              Pratiquez des questions techniques avec notre IA et recevez un feedback détaillé.
            </p>
          </div>
          <div className="bg-background/50 border border-border/50 p-6 rounded-lg backdrop-blur-sm">
            <Brain className="h-10 w-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Soft Skills</h3>
            <p className="text-muted-foreground">
              Améliorez votre communication et vos compétences comportementales pour les entretiens.
            </p>
          </div>
          <div className="bg-background/50 border border-border/50 p-6 rounded-lg backdrop-blur-sm">
            <Sparkles className="h-10 w-10 text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Feedback IA</h3>
            <p className="text-muted-foreground">
              Obtenez des analyses personnalisées et des conseils d'amélioration après chaque session.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
