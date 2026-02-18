"use client"

import { GraduationCap, Target, Users2, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

const pillars = [
    {
        id: "p1",
        title: "Formation d'Excellence",
        description: "Un parcours qui transcende la formation pour une maîtrise réelle du métier.",
        icon: GraduationCap,
        color: "text-amber-800 dark:text-amber-200",
        paperColor: "bg-[#fff176] dark:bg-amber-900/40",
        lineColor: "rgba(0, 0, 0, 0.2)",
        darkLineColor: "rgba(255, 255, 255, 0.1)",
        pinColor: "bg-red-500",
        rotate: -3
    },
    {
        id: "p2",
        title: "Impact & Confiance",
        description: "Transformez vos entretiens en démonstrations de professionnalisme.",
        icon: Target,
        color: "text-rose-800 dark:text-rose-200",
        paperColor: "bg-[#f48fb1] dark:bg-rose-900/40",
        lineColor: "rgba(0, 0, 0, 0.18)",
        darkLineColor: "rgba(255, 255, 255, 0.1)",
        pinColor: "bg-blue-500",
        rotate: 2
    },
    {
        id: "p3",
        title: "Sphère d'Opportunités",
        description: "Accédez à un réseau d'élite où chaque connexion est une opportunité.",
        icon: Users2,
        color: "text-emerald-800 dark:text-emerald-200",
        paperColor: "bg-[#a5d6a7] dark:bg-emerald-900/40",
        lineColor: "rgba(0, 0, 0, 0.2)",
        darkLineColor: "rgba(255, 255, 255, 0.1)",
        pinColor: "bg-amber-500",
        rotate: 1.5
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
                                {/* Push Pin (Realistic) */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 drop-shadow-md group-hover:scale-110 transition-transform">
                                    <div className={`w-6 h-6 rounded-full ${pillar.pinColor} relative flex items-center justify-center border-b-4 border-black/20`}>
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/40" />
                                        <div className="w-1 h-3 bg-slate-300 absolute -bottom-2 rounded-full" />
                                    </div>
                                </div>

                                {/* PAPER SHEET CARD (Post-it Style) */}
                                <div
                                    className={`relative ${pillar.paperColor} p-8 pt-14 rounded-sm transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:z-40 cursor-default border border-white/40 dark:border-emerald-500/30 backdrop-blur-md shadow-xl dark:shadow-emerald-500/5`}
                                    style={{
                                        backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, var(--line-color, ${pillar.lineColor}) 27px, var(--line-color, ${pillar.lineColor}) 28px)`
                                    }}
                                >
                                    <style jsx>{`
                                        div {
                                            --line-color: ${pillar.lineColor};
                                        }
                                        :global(.dark) div {
                                            --line-color: ${pillar.darkLineColor};
                                        }
                                    `}</style>
                                    {/* Red Vertical Margin Line */}
                                    <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-red-500/20" />

                                    {/* Tactile paper corner shadow */}
                                    <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent via-black/[0.02] to-black/[0.1] pointer-events-none rounded-br-sm group-hover:opacity-0 transition-opacity" />

                                    {/* Subtle Paper Grain Overlay */}
                                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

                                    <div className={`relative z-10 w-12 h-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center mb-6 shadow-sm border border-white/50 dark:border-slate-700 transition-transform group-hover:rotate-12`}>
                                        <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                                    </div>

                                    <h3 className="relative z-10 text-3xl font-black mb-4 text-slate-800 dark:text-white leading-tight tracking-tight font-caveat -rotate-1">
                                        {pillar.title}
                                    </h3>

                                    <p className="relative z-10 text-slate-700 dark:text-slate-300 leading-relaxed font-bold mb-8 text-xl opacity-95 group-hover:opacity-100 transition-opacity min-h-[90px] font-caveat rotate-1">
                                        {pillar.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
