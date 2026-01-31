"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, GraduationCap, Briefcase, Target, ShieldCheck, Rocket, Building2, School, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const categories = [
    {
        id: "students",
        title: "Étudiants",
        subtitle: "Étudiants & Premiers Emplois",
        features: [
            {
                title: "Tableau de bord",
                desc: "Suivez votre parcours de carriere et accédez à des ressources adaptées à votre profil.",
                icon: GraduationCap,
                image: "/features/students/img1.PNG"
            },
           {
                title: "Personnalisation de l'experience utilisateur",
                desc: "Un questionnaire intelligent pour personnaliser votre profil et votre parcours vers la reussite via votre plan de carriere",
                icon: GraduationCap,
                image: "/features/students/img2.PNG"
            },
            {
                title: "Plan de carriere",
                desc: "Un plan de carriere intelligent pour vous aider à atteindre votre objectif",
                icon: GraduationCap,
                image: "/features/students/img3.PNG"
            },
             {
                title: "Hub de préparation aux entretiens",
                desc: "Préparez vous efficacement pour vos futurs entretiens(QCM, technique, entretien vocale via IA recruiter )",
                icon: GraduationCap,
                image: "/features/students/img5.PNG"
            },
            {
                title: "Portail d'emploi",
                desc: "L'IA analyse votre plan de carriere et vous propose des offres d'emploi adaptées à votre profil.",
                icon: GraduationCap,
                image: "/features/students/img6.PNG"
            },
            {
                title: "Simulation Live",
                desc: "Entraînez-vous face à une IA qui imite parfaitement les processus de recrutement des grandes entreprises.",
                icon: Target,
                image: "/features/students/img8.PNG"
            },
            {
                title: "Optimisation de CV et portfolio",
                desc: "Faites ressortir vos compétences clés avec une analyse sémantique avancée.",
                icon: Sparkles,
                image: "/features/students/img4.PNG"
            }
        ]
    },
    {
        id: "reconversion",
        title: "Reconversion",
        subtitle: "Changement de Carrière",
        features: [
            {
                title: "Plan de Transition",
                desc: "Identifiez vos compétences transférables et comblez les lacunes avec un parcours sur-mesure.",
                icon: Sparkles,
                image: "/features/career-changer/img2.PNG"
            },
            {
                title: "Accès Réseau",
                desc: "Rejoignez des cercles de pairs qui vivent la même transition que vous pour échanger.",
                icon: Briefcase,
                image: "/features/career-changer/img7.PNG"
            },
            {
                title: "Coaching Intensif",
                desc: "Validez la viabilité de votre nouvelle voie avec des simulations de cas réels du métier.",
                icon: Zap,
                image: "/features/career-changer/img6.PNG"
            },
            {
                title: "Hub de préparation aux entretiens",
                desc: "Préparez vous efficacement pour vos futurs entretiens(QCM, technique, entretien vocale via IA recruiter )",
                icon: GraduationCap,
                image: "/features/students/img5.PNG"
            },
        ]
    },
    {
        id: "bootcamps",
        title: "Bootcamps",
        subtitle: "Accélération Intensive",
        features: [
            {
                title: "Nexus Alumni",
                desc: "Gardez le lien avec l'excellence et partagez vos succès post-formation intensive.",
                icon: Rocket
            },
            {
                title: "Intelligence Marché",
                desc: "Accédez aux opportunités invisibles grâce à notre réseau de partenaires exclusifs.",
                icon: Briefcase
            },
            {
                title: "Suivi Métier",
                desc: "Un accompagnement constant pour transformer votre formation en emploi durable.",
                icon: Target
            }
        ]
    },
    {
        id: "entreprises",
        title: "Entreprises",
        subtitle: "Recrutement & Talent",
        features: [
            {
                title: "Tamisage IA",
                desc: "Identifiez les meilleurs potentiels en amont grâce à des tests de posture innovants.",
                icon: Building2
            },
            {
                title: "Marque Employeur",
                desc: "Valorisez votre image en offrant une expérience de recrutement moderne et humaine.",
                icon: Sparkles
            },
            {
                title: "Reporting IA",
                desc: "Suivez l'adéquation des candidats avec votre culture d'entreprise en temps réel.",
                icon: ShieldCheck
            }
        ]
    },
    {
        id: "ecoles",
        title: "Écoles",
        subtitle: "Partenariats Éducation",
        features: [
            {
                title: "Modules Pédagogiques",
                desc: "Intégrez nos outils de simulation directement dans vos cursus d'accompagnement.",
                icon: School
            },
            {
                title: "Monitoring Étudiant",
                desc: "Suivez la préparation et la progression de vos promotions vers le marché de l'emploi.",
                icon: Target
            },
            {
                title: "Certification IA",
                desc: "Délivrez des badges de compétences reconnus par nos partenaires recruteurs.",
                icon: ShieldCheck
            }
        ]
    }
]

export default function TargetFeatures() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-1000 overflow-hidden relative">
            {/* Background Texture consistent with Moodboard */}
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black mb-8 text-slate-900 dark:text-white tracking-tighter"
                    >
                        Une expérience <span className="text-emerald-600 font-light italic">sur-mesure</span>
                    </motion.h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-semibold max-w-2xl mx-auto uppercase tracking-wider">
                        Quel que soit votre horizon, SkillWokz s'adapte à votre ambition.
                    </p>
                </div>

                <Tabs defaultValue="students" className="w-full">
                    {/* Responsive Tabs Navigation */}
                    <div className="flex justify-center mb-20">
                        <div className="w-full lg:w-auto overflow-x-auto pb-4 scrollbar-hide px-4 flex justify-start lg:justify-center">
                            <TabsList className="bg-white/80 dark:bg-slate-900/50 p-1.5 rounded-full h-auto border border-slate-200 dark:border-slate-800 flex gap-2 w-max lg:w-auto">
                                {categories.map((cat) => (
                                    <TabsTrigger
                                        key={cat.id}
                                        value={cat.id}
                                        className="rounded-full px-6 lg:px-10 py-4 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-500 font-black text-xs uppercase tracking-widest whitespace-nowrap border border-transparent"
                                    >
                                        {cat.title}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {categories.map((cat) => (
                            <TabsContent key={cat.id} value={cat.id} className="mt-0 outline-none">
                                <InnerCarousel category={cat} />
                            </TabsContent>
                        ))}
                    </AnimatePresence>
                </Tabs>
            </div>
        </section>
    )
}

function InnerCarousel({ category }: { category: typeof categories[0] }) {
    const [activeIndex, setActiveIndex] = useState(0)

    const next = () => setActiveIndex((prev) => (prev + 1) % category.features.length)
    const prev = () => setActiveIndex((prev) => (prev - 1 + category.features.length) % category.features.length)

    const hasImage = (category.features[activeIndex] as any).image

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                {/* Visual Section - Minimalist Elegant Card */}
                <motion.div
                    key={category.id + activeIndex + "vis"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative order-2 lg:order-1"
                >
                    <div className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center justify-center transition-all duration-500 ${hasImage ? "aspect-video p-6" : "aspect-square p-12 lg:p-16"}`}>
                        {/* Subtle Paper Pin */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center z-20">
                            <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ duration: 0.4 }}
                                className={`relative z-10 w-full h-full flex items-center justify-center ${hasImage ? "" : "p-8"}`}
                            >
                                {hasImage ? (
                                    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-sm group">
                                        <img
                                            src={(category.features[activeIndex] as any).image}
                                            alt={category.features[activeIndex].title}
                                            className="w-full h-full object-contain transition-transform duration-700 hover:scale-[1.02]"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/5 flex items-center justify-center mx-auto mb-8 border border-emerald-500/10">
                                            {(() => {
                                                const Icon = category.features[activeIndex].icon
                                                return <Icon size={40} className="text-emerald-500" />
                                            })()}
                                        </div>
                                        <div className="space-y-4 max-w-[160px] mx-auto">
                                            <div className="h-1 w-full bg-emerald-500/10 rounded-full" />
                                            <div className="h-1 w-2/3 bg-slate-50 dark:bg-slate-800 rounded-full mx-auto" />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Paper Grain Overlay */}
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                    </div>
                </motion.div>

                {/* Content Section */}
                <div className="order-1 lg:order-2 px-4">
                    <motion.div
                        key={category.id + activeIndex + "txt"}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <span className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-[10px] block opacity-70">
                            {category.subtitle}
                        </span>
                        <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">
                            {category.features[activeIndex].title}
                        </h3>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md">
                            {category.features[activeIndex].desc}
                        </p>
                    </motion.div>

                    {/* Minimalist Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-10 mt-12 lg:mt-16">
                        <div className="flex gap-3">
                            {category.features.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? "w-10 bg-emerald-500" : "w-3 bg-slate-200 dark:bg-slate-800 hover:bg-emerald-100"}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3 sm:ml-auto">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={prev}
                                className="rounded-full h-12 w-12 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:text-emerald-500 transition-all active:scale-90"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={next}
                                className="rounded-full h-12 w-12 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:text-emerald-500 transition-all active:scale-90"
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
