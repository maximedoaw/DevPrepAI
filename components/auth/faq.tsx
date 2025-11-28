"use client"

import React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
  {
    id: "1",
    question: "Comment SkillWokz m'aide-t-il à préparer mes entretiens d'embauche ?",
    answer: "SkillWokz utilise l'IA pour simuler des entretiens réalistes adaptés à votre domaine. Notre système analyse vos réponses, vous donne des feedbacks personnalisés et identifie les points à améliorer pour maximiser vos chances de succès."
  },
  {
    id: "2",
    question: "Combien de temps faut-il pour voir des résultats concrets ?",
    answer: "La plupart de nos utilisateurs constatent une amélioration notable après 2-3 semaines d'utilisation régulière. Certains ont même décroché des emplois en seulement 2 semaines grâce à notre préparation intensive."
  },
  {
    id: "3",
    question: "SkillWokz est-il adapté à tous les domaines professionnels ?",
    answer: "Absolument ! Nous couvrons un large éventail de domaines incluant le développement web, la data science, la santé, la finance, l'ingénierie, le marketing, l'architecture et le management. Notre contenu est constamment mis à jour pour s'adapter aux besoins du marché."
  },
  {
    id: "4",
    question: "Comment fonctionne le coaching personnalisé de CV ?",
    answer: "Notre système d'IA analyse votre CV et le compare aux standards de votre industrie. Nous vous fournissons des recommandations spécifiques pour mettre en valeur vos compétences, optimiser les mots-clés et augmenter vos chances de passer les filtres ATS."
  },
  {
    id: "5",
    question: "Puis-je utiliser SkillWokz sur mobile ?",
    answer: "Oui, notre plateforme est entièrement responsive et fonctionne sur tous les appareils. Vous pouvez pratiquer vos entretiens où que vous soyez, à tout moment."
  },
  {
    id: "6",
    question: "Quelle est la différence entre SkillWokz et les autres plateformes de préparation ?",
    answer: "Contrairement aux solutions génériques, SkillWokz offre des simulations hyper-réalistes avec un feedback IA avancé, un coaching personnalisé adapté au marché camerounais et africain,un matching intelligent avec des recruteurs entreprises et partenaires, et un suivi de progression détaillé pour mesurer vos améliorations le tout en un."
  }
]

export default function FAQSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Questions Fréquentes</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Tout ce que vous devez savoir sur SkillWokz
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqData.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={item.id}
              className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <AccordionTrigger className="flex justify-between items-center w-full p-6 text-left font-semibold text-slate-800 dark:text-slate-200 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-300">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}