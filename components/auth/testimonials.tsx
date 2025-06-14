"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  avatar: string
  stars: number
  content: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sophie Martin",
    role: "Développeuse Frontend",
    company: "TechCorp",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "Dev Prep AI m'a aidée à décrocher mon job de rêve chez TechCorp. Les simulations d'entretien étaient incroyablement réalistes et le feedback m'a permis d'améliorer mes points faibles.",
  },
  {
    id: 2,
    name: "Thomas Dubois",
    role: "Ingénieur Fullstack",
    company: "StartupLab",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "Après 3 semaines d'utilisation intensive, j'ai réussi tous mes entretiens techniques. Le module sur les algorithmes m'a particulièrement aidé à structurer ma pensée.",
  },
  {
    id: 3,
    name: "Emma Bernard",
    role: "Data Scientist",
    company: "DataViz",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 4,
    content:
      "L'IA de Dev Prep a su identifier mes lacunes en SQL et m'a proposé des exercices ciblés. J'ai pu combler mes lacunes en un temps record.",
  },
  {
    id: 4,
    name: "Lucas Petit",
    role: "Développeur Backend",
    company: "CloudSys",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "Le coaching sur les soft skills a complètement changé ma façon d'aborder les entretiens. Je suis beaucoup plus confiant et je communique mieux mes idées.",
  },
  {
    id: 5,
    name: "Julie Moreau",
    role: "DevOps Engineer",
    company: "InfraTech",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 4,
    content:
      "Les questions techniques sur Docker et Kubernetes étaient exactement ce dont j'avais besoin. Le niveau de difficulté progressif m'a permis d'avancer à mon rythme.",
  },
  {
    id: 6,
    name: "Antoine Leroy",
    role: "Mobile Developer",
    company: "AppFactory",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "Grâce à Dev Prep AI, j'ai pu me préparer efficacement aux questions spécifiques sur React Native. L'application a dépassé toutes mes attentes.",
  },
]

export default function Testimonials() {
  const [activeTestimonials, setActiveTestimonials] = useState<Testimonial[]>(testimonials.slice(0, 3))

  return (
    <section id="testimonials" className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce que disent nos utilisateurs</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment Dev Prep AI aide les développeurs à réussir leurs entretiens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-background/30 border-border/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() =>
              setActiveTestimonials(activeTestimonials.length === 3 ? testimonials : testimonials.slice(0, 3))
            }
            className="text-sm font-medium text-primary hover:underline"
          >
            {activeTestimonials.length === 3 ? "Voir plus de témoignages" : "Voir moins de témoignages"}
          </button>
        </div>
      </div>
    </section>
  )
}
