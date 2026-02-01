"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, HelpCircle, Sparkles } from "lucide-react"

const faqData = [
  {
    id: "1",
    question: "Comment sont structurés les écosystèmes de formation sur SkillWokz ?",
    answer: "Nos formations sont conçues comme des écosystèmes immersifs. Elles combinent des modules théoriques actualisés, des projets pratiques basés sur des cas réels d'entreprise, et une validation continue par IA pour garantir que vous maîtrisez les compétences les plus demandées du marché."
  },
  {
    id: "2",
    question: "Comment SkillWokz facilite-t-il le recrutement pour les entreprises ?",
    answer: "Nous offrons aux entreprises un accès à une pépinière de talents 'Vérifiés'. Grâce à notre tamisage par l'IA et aux tests de posture, les recruteurs réduisent leur temps de sourcing de 70% en ne rencontrant que des candidats dont les compétences techniques et humaines ont été pré-validées."
  },
  {
    id: "3",
    question: "Quelle est la précision de la préparation aux entretiens techniques ?",
    answer: "Notre IA est capable de simuler des entretiens spécifiques à plus de 50 technologies. Elle évalue la précision de votre code, votre logique algorithmique et votre capacité à expliquer des concepts complexes, vous offrant un score de préparation réaliste avant le jour J."
  },
  {
    id: "4",
    question: "Une école ou un centre de formation peut-il intégrer SkillWokz ?",
    answer: "Absolument. Nous proposons des licences 'Organisation' permettant aux écoles de piloter la progression de leurs étudiants, de proposer des simulations d'examens automatisées et de garantir une meilleure insertion professionnelle à leurs diplômés."
  },
  {
    id: "5",
    question: "Je suis en reconversion totale, la plateforme est-elle adaptée ?",
    answer: "Oui, c'est l'un de nos points forts. Nous aidons les profils en reconversion à identifier leurs 'compétences transférables' et à construire un pont crédible vers la tech via des parcours intensifs et un coaching sur la narration de leur nouveau parcours."
  },
  {
    id: "6",
    question: "Qu'est-ce qui différencie la préparation RH de la préparation technique ?",
    answer: "La préparation technique se concentre sur votre savoir-faire, tandis que la préparation RH (Comportementale) utilise l'IA pour analyser vos 'soft skills' : communication, résolution de conflits, leadership et adéquation culturelle avec l'entreprise visée."
  },
  {
    id: "7",
    question: "Comment fonctionne le matching intelligent entre candidats et offres ?",
    answer: "L'IA ne se contente pas de lire des mots-clés. Elle analyse votre 'Plan de Carrière', vos scores de réussite aux simulations et votre portfolio pour vous proposer des opportunités où vous avez statistiquement le plus de chances de réussir et de vous épanouir."
  },
  {
    id: "8",
    question: "Les projets réalisés sur SkillWokz sont-ils valorisables en entreprise ?",
    answer: "Oui, car ils sont basés sur des cahiers des charges réels. Chaque projet complété génère une preuve de compétence que vous pouvez intégrer directement à votre portfolio numérique SkillWokz, certifiant votre capacité à livrer des solutions concrètes."
  },
  {
    id: "9",
    question: "Quel support SkillWokz offre-t-il pour la négociation salariale ?",
    answer: "Notre plan Elite inclut des modules sur la psychologie de la négociation et des données actualisées sur les grilles salariales tech locales et internationales, vous permettant d'aborder la question financière avec assurance et des arguments solides."
  },
  {
    id: "10",
    question: "Peut-on s'entraîner en équipe ou en communauté ?",
    answer: "Oui, via nos 'Cercles' et 'Rituels'. SkillWokz encourage l'apprentissage entre pairs (Peer-learning). Vous pouvez partager vos retours d'expérience, participer à des simulations collectives et grandir au sein d'une communauté de passionnés."
  },
  {
    id: "11",
    question: "Comment l'IA garantit-elle la personnalisation du parcours ?",
    answer: "Dès votre inscription, un diagnostic complet est effectué. L'IA adapte ensuite la difficulté des exercices, suggère des ressources spécifiques pour combler vos lacunes et ajuste votre plan de carrière en temps réel selon votre progression."
  },
  {
    id: "12",
    question: "Quelles sont les garanties de sécurité et de confidentialité des données ?",
    answer: "La protection de vos données est une priorité absolue. Nous utilisons des protocoles de chiffrement de pointe et respectons scrupuleusement les normes RGPD. Vos simulations et données personnelles restent votre propriété exclusive."
  }
]

export default function FAQSection() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  return (
    <section className="py-32 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* Header Alignment with other sections */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-tight">
            Questions fréquentes
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((item, i) => {
            const isOpen = openItem === item.id

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <button
                  onClick={() => setOpenItem(isOpen ? null : item.id)}
                  className={`w-full text-left p-6 md:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden flex items-start gap-6
                    ${isOpen
                      ? "bg-white dark:bg-slate-900 border-emerald-500/30 shadow-xl shadow-emerald-500/5 scale-[1.02]"
                      : "bg-white/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-emerald-500/20 hover:scale-[1.01]"
                    }`}
                >
                  {/* Icon Indicator */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 
                    ${isOpen ? "bg-emerald-500 text-white rotate-[135deg]" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                    <Plus size={24} className="transition-transform duration-500" />
                  </div>

                  <div className="flex-1 pt-2">
                    <h3 className={`text-lg md:text-xl font-black uppercase tracking-tight transition-colors duration-300
                      ${isOpen ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                      {item.question}
                    </h3>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 pb-2">
                            <div className="h-px w-12 bg-emerald-500/30 mb-6" />
                            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Aesthetic Paper Texture for Open State */}
                  {isOpen && (
                    <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
    </section>
  )
}