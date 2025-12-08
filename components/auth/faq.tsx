"use client"

import React, { useState } from "react"

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
    answer: "Contrairement aux solutions génériques, SkillWokz offre des simulations hyper-réalistes avec un feedback IA avancé, un coaching personnalisé adapté au marché camerounais et africain, un matching intelligent avec des recruteurs entreprises et partenaires, et un suivi de progression détaillé pour mesurer vos améliorations le tout en un."
  }
]

export default function FAQSection() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white via-emerald-50/20 to-white dark:from-slate-950 dark:via-emerald-950/5 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-5 tracking-tight">
            Questions Fréquentes
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tout ce que vous devez savoir sur SkillWokz et comment nous vous aidons à réussir
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item) => {
            const isOpen = openItem === item.id
            
            return (
              <div
                key={item.id}
                className="group relative overflow-hidden"
              >
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/0 to-emerald-50/0 
                  dark:from-emerald-950/0 dark:via-emerald-950/0 dark:to-emerald-950/0
                  group-hover:from-emerald-50/20 group-hover:via-emerald-50/10 group-hover:to-emerald-50/5
                  dark:group-hover:from-emerald-950/10 dark:group-hover:via-emerald-950/5 dark:group-hover:to-emerald-950/2
                  transition-all duration-500 rounded-2xl
                  ${isOpen ? '!from-emerald-50/30 !via-emerald-50/15 !to-emerald-50/5 dark:!from-emerald-950/15 dark:!via-emerald-950/10 dark:!to-emerald-950/5' : ''}
                `} />
                
                <div className={`
                  relative border border-slate-200 dark:border-slate-800/50 
                  rounded-2xl overflow-hidden
                  transition-all duration-300
                  ${isOpen ? 'shadow-lg shadow-emerald-100/20 dark:shadow-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30' : 
                    'hover:shadow-md hover:shadow-slate-100/20 dark:hover:shadow-slate-900/20 hover:border-slate-300/50 dark:hover:border-slate-700/50'}
                `}>
                  <div className="flex items-start gap-4 p-2">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full text-left focus:outline-none px-6 py-6 -m-2 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 rounded-xl"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <h3 className={`
                              text-lg lg:text-xl font-semibold mb-2 
                              transition-colors duration-300
                              ${isOpen 
                                ? 'text-emerald-700 dark:text-emerald-300' 
                                : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                              }
                            `}>
                              {item.question}
                            </h3>
                            
                            <div className={`
                              overflow-hidden transition-all duration-500 ease-out
                              ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}
                            `}>
                              <div className="pb-2">
                                <div className="w-12 h-[2px] bg-gradient-to-r from-emerald-400 to-emerald-300 dark:from-emerald-500 dark:to-emerald-400 rounded-full mb-4"></div>
                                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Bouton agrandi à droite */}
                          <div className="flex-shrink-0">
                            <div className={`
                              w-12 h-12 rounded-xl flex items-center justify-center
                              transition-all duration-300
                              ${isOpen 
                                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30' 
                                : 'bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
                              }
                            `}>
                              <div className="relative w-5 h-5">
                                {/* Ligne horizontale */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className={`
                                    w-3 h-0.5 rounded-full transition-all duration-300
                                    ${isOpen 
                                      ? 'bg-emerald-600 dark:bg-emerald-400 rotate-180' 
                                      : 'bg-slate-500 dark:bg-slate-400 group-hover:bg-slate-600 dark:group-hover:bg-slate-300'
                                    }
                                  `} />
                                </div>
                                {/* Ligne verticale */}
                                <div className={`
                                  absolute inset-0 flex items-center justify-center transition-all duration-300
                                  ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}
                                `}>
                                  <div className={`
                                    w-0.5 h-3 rounded-full
                                    ${isOpen 
                                      ? 'bg-emerald-600 dark:bg-emerald-400' 
                                      : 'bg-slate-500 dark:bg-slate-400 group-hover:bg-slate-600 dark:group-hover:bg-slate-300'
                                    }
                                  `} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}