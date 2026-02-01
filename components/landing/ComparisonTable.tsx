"use client"

import { Check, X } from "lucide-react"
import { motion } from "framer-motion"

const avecSkillwokz = [
    { title: "Assistant IA 24/7", desc: "Une intelligence qui vous guide et vous corrige en temps réel.", rotate: -3, offset: "lg:-translate-x-12" },
    { title: "Préparation Technique", desc: "QCM, Live Coding et Simulations d'entretiens techniques adaptés à votre stack.", rotate: 2.5, offset: "lg:-translate-x-4" },
    { title: "Formation Action", desc: "Apprenez par la pratique avec des projets concrets, pas juste de la théorie.", rotate: -2, offset: "lg:-translate-x-16" },
    { title: "Matching Intelligent", desc: "Notre algo vous connecte directement aux recruteurs qui cherchent VOTRE profil.", rotate: 3.5, offset: "lg:-translate-x-8" },
    { title: "92% de Confiance", desc: "Augmentation radicale de l'aisance après 3 simulations.", rotate: -4, offset: "lg:-translate-x-20" },
    { title: "Job Intel", desc: "Opportunités invisibles grâce à nos partenaires exclusifs.", rotate: 1.5, offset: "lg:-translate-x-4" },
    { title: "IA Posture", desc: "Analyse chirurgicale de votre attitude et ton de voix.", rotate: -2.5, offset: "lg:-translate-x-10" },
    { title: "Badge Expert", desc: "Certification reconnue par les meilleurs recruteurs.", rotate: 3, offset: "lg:-translate-x-6" },
    // New points
    { title: "Réseautage Ciblé", desc: "Échangez avec des pairs partageant exactement vos objectifs.", rotate: -1.5, offset: "lg:-translate-x-14" },
]

const sansSkillwokz = [
    { title: "Cours Statiques", desc: "Des PDF et vidéos qui ne s'adaptent jamais à vous.", rotate: 4, offset: "lg:translate-x-12" },
    { title: "Théorie Uniquement", desc: "Aucune mise en situation réelle ni test technique blanc.", rotate: -3.5, offset: "lg:translate-x-4" },
    { title: "Projets Fantômes", desc: "Des tutos copiés-collés qui ne prouvent aucune compétence réelle.", rotate: 2.5, offset: "lg:translate-x-16" },
    { title: "Candidature Masse", desc: "Envoyer des centaines de CV au hasard sans ciblage précis.", rotate: -4.5, offset: "lg:translate-x-8" },
    { title: "Conseils Datés", desc: "Méthodes de recrutement pré-IA totalement inefficaces.", rotate: 1.5, offset: "lg:translate-x-20" },
    { title: "Stress Maximum", desc: "Aucune simulation réelle pour tester vos limites avant J-J.", rotate: -2.5, offset: "lg:translate-x-4" },
    { title: "Feedback Tardif", desc: "Attendre des jours pour un retour (souvent inexistant).", rotate: 4.5, offset: "lg:translate-x-10" },
    { title: "Zéro Réseau", desc: "Aucun lien direct avec les entreprises qui recrutent.", rotate: -3, offset: "lg:translate-x-6" },
    // New points matched to "Avec"
    { title: "Isolement Total", desc: "Apprendre seul sans soutien ni communauté.", rotate: 3, offset: "lg:translate-x-14" },
]

export default function ComparisonCards() {
    return (
        <section className="py-32 bg-white dark:bg-slate-950 overflow-hidden relative">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-6xl mx-auto mb-32">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-none flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6"
                    >
                        <span className="text-emerald-600">Avec SkillWokz</span>
                        <span className="text-slate-300 font-light italic text-3xl md:text-5xl">vs</span>
                        <span className="text-red-500">Sans SkillWokz</span>
                    </motion.h2>
                </div>

                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-0 items-start">

                    {/* Central Zig-Zag Divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-4 hidden lg:block pointer-events-none opacity-20 dark:opacity-10 h-full overflow-hidden">
                        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 20 1200">
                            <pattern id="zigzag" x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
                                <path d="M10,0 L20,10 L10,20 L0,10 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-200" />
                                <path d="M10,0 L20,20 L10,40 L0,20 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-200" />
                            </pattern>
                            {/* Simplified ZigZag for cleaner look, reusing the path approach or just extending it */}
                            <path
                                d={`M10,0 ${Array.from({ length: 30 }).map((_, i) => `L18,${i * 50 + 25} L2,${i * 50 + 50}`).join(' ')}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-slate-400 dark:text-slate-200"
                            />
                        </svg>
                    </div>

                    {/* AVEC SKILLWOKZ - Left Column */}
                    <div className="flex flex-col gap-12 lg:gap-20 items-center lg:items-end lg:pr-12">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-emerald-600 font-bold uppercase tracking-[0.4em] text-sm mb-8 lg:pr-24"
                        >
                            L'Aube de la Réussite
                        </motion.span>
                        <div className="flex flex-col gap-10 w-full max-w-md items-center lg:items-end">
                            {avecSkillwokz.map((point, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -50, rotate: 0 }}
                                    whileInView={{ opacity: 1, x: 0, rotate: point.rotate }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className={`relative bg-[#fdfdfd] dark:bg-slate-900 px-8 py-6 rounded-sm shadow-xl border border-slate-100 dark:border-slate-800 w-full lg:w-[400px] group hover:z-50 hover:scale-105 transition-all duration-500 ${point.offset}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                            <Check size={20} className="stroke-[3px]" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{point.title}</h4>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed opacity-80">{point.desc}</p>
                                        </div>
                                    </div>
                                    {/* Paper texture overlay */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* SANS SKILLWOKZ - Right Column */}
                    <div className="flex flex-col gap-12 lg:gap-20 items-center lg:items-start lg:pl-12">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-red-500 font-bold uppercase tracking-[0.4em] text-sm mb-8 lg:pl-24"
                        >
                            Le Passé Figé
                        </motion.span>
                        <div className="flex flex-col gap-10 w-full max-w-md items-center lg:items-start">
                            {sansSkillwokz.map((point, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 50, rotate: 0 }}
                                    whileInView={{ opacity: 1, x: 0, rotate: point.rotate }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className={`relative bg-[#f7f7f7] dark:bg-slate-900/50 px-8 py-6 rounded-sm shadow-lg border border-slate-200/50 dark:border-slate-800/50 w-full lg:w-[400px] group hover:z-50 hover:scale-105 transition-all duration-500 ${point.offset}`}
                                >
                                    <div className="flex items-center gap-6 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                            <X size={20} className="stroke-[3px]" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight line-through decoration-red-500/20">{point.title}</h4>
                                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">{point.desc}</p>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Artistic Background Texture */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 dark:bg-slate-900/20 -z-10 pointer-events-none" />
        </section>
    )
}
