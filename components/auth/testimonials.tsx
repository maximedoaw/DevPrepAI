"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

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
    name: "Aminata Diallo",
    role: "Développeuse Frontend",
    company: "TechCorp",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "Dev Prep AI m'a aidée à décrocher mon job de rêve chez TechCorp. Les simulations d'entretien étaient incroyablement réalistes et le feedback m'a permis d'améliorer mes points faibles.",
  },
  {
    id: 2,
    name: "Kouamé Nguemo",
    role: "Ingénieur Fullstack",
    company: "StartupLab",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "Après 3 semaines d'utilisation intensive, j'ai réussi tous mes entretiens techniques. Le module sur les algorithmes m'a particulièrement aidé à structurer ma pensée.",
  },
  {
    id: 3,
    name: "Fatou Mbaye",
    role: "Data Scientist",
    company: "DataViz",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 4,
    content:
      "L'IA de Dev Prep a su identifier mes lacunes en SQL et m'a proposé des exercices ciblés. J'ai pu combler mes lacunes en un temps record.",
  },
  {
    id: 4,
    name: "Moussa Sarr",
    role: "Développeur Backend",
    company: "CloudSys",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "Le coaching sur les soft skills a complètement changé ma façon d'aborder les entretiens. Je suis beaucoup plus confiant et je communique mieux mes idées.",
  },
  {
    id: 5,
    name: "Aïcha Koné",
    role: "DevOps Engineer",
    company: "InfraTech",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 4,
    content:
      "Les questions techniques sur Docker et Kubernetes étaient exactement ce dont j'avais besoin. Le niveau de difficulté progressif m'a permis d'avancer à mon rythme.",
  },
  {
    id: 6,
    name: "Boubacar Traoré",
    role: "Mobile Developer",
    company: "AppFactory",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "Grâce à Dev Prep AI, j'ai pu me préparer efficacement aux questions spécifiques sur React Native. L'application a dépassé toutes mes attentes.",
  },
  {
    id: 7,
    name: "Mariama Sow",
    role: "Lead Developer",
    company: "InnovTech",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "En tant que lead, j'utilise Dev Prep AI pour former mon équipe. Les exercices de code en temps réel et les feedbacks instantanés sont excellents.",
  },
  {
    id: 8,
    name: "Ibrahim Diop",
    role: "Software Architect",
    company: "ArchitecturePlus",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 5,
    content:
      "Les questions sur l'architecture système et les patterns de conception m'ont permis de briller lors de mes entretiens. Un outil indispensable !",
  },
  {
    id: 9,
    name: "Awa Fall",
    role: "UX/UI Developer",
    company: "DesignStudio",
    avatar: "/placeholder.svg?height=40&width=40",
    stars: 4,
    content:
      "La section sur les bonnes pratiques UX et l'accessibilité m'a ouvert les yeux sur des aspects que je négligeais. Très enrichissant !",
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3)
  if (visibleTestimonials.length < 3) {
    visibleTestimonials.push(...testimonials.slice(0, 3 - visibleTestimonials.length))
  }

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment Dev Prep AI aide les développeurs à réussir leurs entretiens
          </p>
        </div>

        <div className="relative">
          {/* Boutons de navigation */}
          <Button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full w-12 h-12 p-0 bg-white/80 hover:bg-white shadow-lg border-0"
            variant="outline"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full w-12 h-12 p-0 bg-white/80 hover:bg-white shadow-lg border-0"
            variant="outline"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Carrousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-16">
            {visibleTestimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.id} 
                className="bg-white/95 border-0 shadow-xl backdrop-blur-sm overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl min-h-[380px] relative group"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                {/* Bordure subtile */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                
                <CardContent className="p-8 relative z-10 h-full flex flex-col">
                  {/* En-tête avec avatar */}
                  <div className="flex items-center mb-6">
                    <Avatar className="h-14 w-14 mr-4 ring-2 ring-blue-100 shadow-md">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-800 mb-1">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                  
                  {/* Étoiles */}
                  <div className="flex mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.stars 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Contenu du témoignage */}
                  <div className="flex-1 flex flex-col justify-center">
                    <blockquote className="text-gray-700 leading-relaxed text-base italic relative">
                      <span className="absolute -top-2 -left-1 text-3xl text-blue-200 opacity-60">"</span>
                      {testimonial.content}
                      <span className="absolute -bottom-2 -right-1 text-3xl text-purple-200 opacity-60">"</span>
                    </blockquote>
                  </div>
                  
                  {/* Badge de score */}
                  <div className="mt-6 flex justify-center">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full font-medium text-sm shadow-md">
                      {testimonial.stars * 20}% de satisfaction
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Indicateurs */}
          <div className="flex justify-center mt-12 space-x-2">
            {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index * 3)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / 3) === index
                    ? "bg-blue-600 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Bouton pause/play */}
          <div className="text-center mt-6">
            <Button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              variant="outline"
              className="rounded-full px-6"
            >
              {isAutoPlaying ? "Pause" : "Lecture automatique"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
