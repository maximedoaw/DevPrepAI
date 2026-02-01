"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import gsap from "gsap"

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  stars: number
  content: string
  avatarColor: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Eric Nguemta",
    role: "Développeur Frontend",
    company: "ActivSpace Douala",
    stars: 5,
    content: "TurboIntMax m'a aidé à décrocher un poste en seulement deux semaines grâce aux simulations réalistes et au coaching CV.",
    avatarColor: "bg-blue-500"
  },
  {
    id: 2,
    name: "Marie Tchoumi",
    role: "Data Analyst",
    company: "Orange Cameroun",
    stars: 5,
    content: "Les retours de l'IA sur mes points faibles en SQL ont été décisifs. J'ai gagné en confiance et j'ai réussi mes entretiens.",
    avatarColor: "bg-purple-500"
  },
  {
    id: 3,
    name: "Jacques Mbarga",
    role: "Ingénieur Cloud",
    company: "Camtel",
    stars: 4,
    content: "Grâce aux entraînements ciblés, j'ai maîtrisé Docker et Kubernetes pour briller face aux recruteurs.",
    avatarColor: "bg-green-500"
  },
  {
    id: 4,
    name: "Nathalie Abena",
    role: "UX Designer",
    company: "MTN Cameroun",
    stars: 5,
    content: "Les simulations m'ont préparée à des questions concrètes d'UX/UI. Mon portfolio a fait la différence.",
    avatarColor: "bg-pink-500"
  },
  {
    id: 5,
    name: "Cyrille Ndongo",
    role: "Mobile Developer",
    company: "Njorku",
    stars: 5,
    content: "Les entretiens simulés en React Native m'ont permis de réussir mon test technique du premier coup.",
    avatarColor: "bg-orange-500"
  },
  {
    id: 6,
    name: "Aïcha Mohamadou",
    role: "Data Scientist",
    company: "CBC Health Care",
    stars: 5,
    content: "Les défis techniques en machine learning m'ont permis de me démarquer lors de mon entretien.",
    avatarColor: "bg-red-500"
  },
  {
    id: 7,
    name: "Samuel Ndzana",
    role: "Architecte Solutions",
    company: "Next Technology",
    stars: 5,
    content: "La préparation aux questions d'architecture système était exceptionnellement réaliste et pertinente.",
    avatarColor: "bg-indigo-500"
  },
  {
    id: 8,
    name: "Chantal Mballa",
    role: "Responsable Marketing",
    company: "InnovaTech",
    stars: 4,
    content: "J'ai pu pratiquer des présentations clients avec un feedback personnalisé qui a transformé mon approche.",
    avatarColor: "bg-teal-500"
  },
  {
    id: 9,
    name: "Pauline Fotso",
    role: "Ingénieure Biomédicale",
    company: "Essilor Cameroun",
    stars: 5,
    content: "Les simulations techniques spécifiques à mon domaine étaient incroyablement précises et utiles.",
    avatarColor: "bg-cyan-500"
  },
  {
    id: 10,
    name: "Marcellin Njiensi",
    role: "Chef de Projet",
    company: "GICAM",
    stars: 5,
    content: "La préparation aux questions de gestion de projet et de leadership a été déterminante pour mon recrutement.",
    avatarColor: "bg-amber-500"
  }
]

export default function Testimonials() {
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation de la première ligne (vers la gauche)
      if (row1Ref.current) {
        const rowWidth = row1Ref.current.scrollWidth / 2;
        gsap.to(row1Ref.current, {
          x: -rowWidth,
          duration: 40,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % rowWidth)
          }
        });
      }

      // Animation de la deuxième ligne (vers la droite)
      if (row2Ref.current) {
        const rowWidth = row2Ref.current.scrollWidth / 2;
        gsap.to(row2Ref.current, {
          x: rowWidth,
          duration: 45,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % -rowWidth)
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Dupliquer les témoignages pour créer l'effet de boucle infini
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      ref={containerRef}
      className="relative py-20 overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 text-center mb-14">
        <h2 className="text-4xl font-bold mb-4">
          Témoignages et preuves sociales
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Étudiants, professionnels et entreprises qui ont réussi avec TurboIntMax
        </p>
      </div>

      {/* Première ligne (défilement vers la gauche) */}
      <div className="overflow-hidden mb-10">
        <div ref={row1Ref} className="flex gap-6 w-max">
          {duplicatedTestimonials.map((t, index) => (
            <Card
              key={`row1-${t.id}-${index}`}
              className="w-80 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className={`h-12 w-12 mr-3 ${t.avatarColor} text-white font-bold`}>
                    <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {t.company}
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < t.stars
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                  "{t.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>



      {/* Overlay gradients pour un effet de fondu sur les bords */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-transparent dark:from-slate-950 dark:via-slate-900 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 via-emerald-50/30 to-transparent dark:from-slate-950 dark:via-slate-900 pointer-events-none"></div>
    </section>
  )
}