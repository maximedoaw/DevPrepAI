"use client"

import { GraduationCap, Target, Users2, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

const pillars = [
    {
        id: "p1",
        title: "Formation d'Excellence",
        description: "Un parcours qui transcende la formation pour une maîtrise réelle du métier.",
        icon: GraduationCap,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
        rotate: -2
    },
    {
        id: "p2",
        title: "Impact & Confiance",
        description: "Transformez vos entretiens en démonstrations de professionnalisme.",
        icon: Target,
        color: "text-sky-600",
        bg: "bg-sky-50 dark:bg-sky-900/10",
        rotate: 1
    },
    {
        id: "p3",
        title: "Sphère d'Opportunités",
        description: "Accédez à un réseau d'élite où chaque connexion est une opportunité.",
        icon: Users2,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/10",
        rotate: 2
    }
]

const backgroundWords = [
    { word: "RÉUSSITE", top: "15%", left: "10%", vertical: false },
    { word: "EXCELLENCE", top: "20%", right: "15%", vertical: true },
    { word: "AMBITION", bottom: "15%", left: "15%", vertical: true },
    { word: "CARRIÈRE", bottom: "20%", right: "10%", vertical: false },
    { word: "SUCCÈS", top: "50%", right: "8%", vertical: false }
]

export default function ThreePillars() {
    return (
        <section className="relative py-32 lg:py-48 bg-slate-50/30 dark:bg-slate-950 transition-colors duration-1000 overflow-hidden">
            {/* 5 Non-overlapping Success Words (Subtler & Smaller) */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-[0.05] dark:opacity-[0.02]">
                {backgroundWords.map((item, i) => (
                    <div
                        key={i}
                        className={`absolute font-black uppercase tracking-[0.3em] text-[40px] md:text-[60px] lg:text-[80px] whitespace-nowrap ${item.vertical ? "rotate-90 origin-center" : ""}`}
                        style={{
                            top: item.top,
                            left: item.left,
                            right: item.right,
                            bottom: item.bottom
                        }}
                    >
                        {item.word}
                    </div>
                ))}
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="text-center max-w-2xl mx-auto mb-32">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter mb-6"
                    >
                        Trois fondations pour votre <br />
                        <span className="text-emerald-600 font-light italic">succès durable</span>
                    </motion.h2>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* SVG Connector linking the PINS - Responsive logic */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                        <svg className="w-full h-full overflow-visible">
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 0.2 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                // Desktop Path: Links top-center of each col
                                d="M 16.6% -24 Q 33% -60, 50% -24 T 83.3% -24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-slate-400 dark:text-slate-500 hidden md:block"
                            />
                            {/* Mobile Path: Vertical Link */}
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 0.15 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                d="M 50% 120 L 50% 380 M 50% 500 L 50% 760"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                                className="text-slate-400 dark:text-slate-600 block md:hidden"
                                style={{ transform: "translateY(-40px)" }}
                            />
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-24 md:gap-16 lg:gap-24 items-start">
                        {pillars.map((pillar, index) => (
                            <motion.div
                                key={pillar.id}
                                initial={{ opacity: 0, y: 40, rotate: 0 }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                    rotate: pillar.rotate
                                }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.8 }}
                                className="group relative"
                            >
                                {/* PIN (Relié) */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                                    <div className="w-4 h-4 rounded-full bg-slate-400/80 dark:bg-slate-600 shadow-lg border border-white/50 dark:border-slate-800 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-200" />
                                    </div>
                                </div>

                                {/* PAPER SHEET CARD */}
                                <div
                                    className="relative bg-[#faf9f6] dark:bg-slate-900 p-8 pt-12 rounded-sm transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:z-40 cursor-default"
                                    style={{
                                        boxShadow: "0 15px 35px -15px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05)",
                                        borderLeft: "1px solid rgba(0,0,0,0.03)",
                                        borderTop: "1px solid rgba(0,0,0,0.01)"
                                    }}
                                >
                                    {/* Tactile paper corner shadow */}
                                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-transparent to-slate-200/30 dark:to-black/30 pointer-events-none rounded-br-sm group-hover:opacity-0 transition-opacity" />

                                    {/* Subtle Paper Grain Overlay */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

                                    <div className={`w-12 h-12 rounded-2xl ${pillar.bg} flex items-center justify-center mb-6 shadow-sm`}>
                                        <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                                    </div>

                                    <h3 className="text-xl font-black mb-4 text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                                        {pillar.title}
                                    </h3>

                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold mb-8 text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                                        {pillar.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:gap-4 transition-all">
                                        DÉCOUVRIR
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
