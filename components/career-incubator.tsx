import { useRef, useEffect, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Zap } from "lucide-react"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function CareerIncubator() {
    const containerRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)
    const acceleratorRef = useRef<HTMLDivElement>(null)
    const [phase, setPhase] = useState(0)
    const [showLightning, setShowLightning] = useState(false)
    const [currentImage, setCurrentImage] = useState("/img1.jpeg")

    useEffect(() => {
        if (!containerRef.current || !profileRef.current || !acceleratorRef.current) return

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=500%",
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const p = self.progress
                        if (p < 0.15) {
                            setPhase(0)
                            setShowLightning(false)
                            setCurrentImage("/img1.jpeg")
                        } else if (p < 0.35) {
                            setPhase(1)
                            setShowLightning(false)
                            setCurrentImage("/img1.jpeg")
                        } else if (p < 0.65) {
                            setPhase(2)
                            setShowLightning(true)
                            setCurrentImage("/img1.jpeg")
                        } else if (p < 0.85) {
                            setPhase(3)
                            setShowLightning(false)
                            // Changement d'image quand le profil commence à ressortir
                            setCurrentImage("/img2.png")
                        } else {
                            setPhase(4)
                            setShowLightning(false)
                            setCurrentImage("/img2.png")
                        }
                    }
                }
            })

            // Animation du profil
            tl.fromTo(profileRef.current,
                { y: -300, opacity: 0, scale: 0.9, zIndex: 10 },
                { y: -50, opacity: 1, scale: 1, zIndex: 10, duration: 1.5, ease: "power2.out" }
            )
            .to(profileRef.current, {
                y: 0,
                scale: 0.75,
                zIndex: 5,
                duration: 1.5,
                ease: "power2.inOut"
            })
            .to(profileRef.current, {
                y: 0,
                scale: 0.6,
                opacity: 0.4,
                zIndex: 5,
                duration: 1.5,
                ease: "power1.inOut"
            })
            .to(profileRef.current, {
                y: 50,
                scale: 0.8,
                opacity: 1,
                zIndex: 10,
                duration: 1.5,
                ease: "power2.out"
            })
            .to(profileRef.current, {
                y: 150,
                scale: 1.1,
                zIndex: 10,
                duration: 1.5,
                ease: "back.out(1.3)"
            })

            // Animation de l'incubateur
            tl.to(acceleratorRef.current, {
                scale: 1.05,
                duration: 1
            }, 1.5)
            .to(acceleratorRef.current, {
                scale: 1,
                duration: 1
            }, 3)

        }, containerRef)

        return () => ctx.revert()
    }, [])

    const phaseInfo = [
        { title: "Chercheur d'emploi", subtitle: "À la recherche d'opportunités", color: "blue", gradient: "from-blue-500 to-cyan-500" },
        { title: "Entrée dans l'accelerateur de carriere", subtitle: "Début du processus d'accélération", color: "indigo", gradient: "from-indigo-500 to-blue-500" },
        { title: "Transformation", subtitle: "Optimisation et matching en cours", color: "purple", gradient: "from-purple-500 to-pink-500" },
        { title: "Sortie optimisée", subtitle: "Profil amélioré et prêt", color: "green", gradient: "from-emerald-500 to-green-500" },
        { title: "Emploi trouvé", subtitle: "Mission accomplie", color: "green", gradient: "from-green-500 to-emerald-500" }
    ]

    const current = phaseInfo[phase]

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-center">
                <div className="w-full max-w-5xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-20 mt-15">
                        <Badge className={`mb-4 bg-gradient-to-r ${current.gradient} text-white border-0 text-sm px-4 py-1.5`}>
                            Phase {phase + 1}/5
                        </Badge>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-3 text-slate-900 dark:text-white">
                            {current.title}
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            {current.subtitle}
                        </p>
                    </div>

                    {/* Main visualization */}
                    <div className="relative flex items-center justify-center h-[500px]">
                        {/* Incubateur de carrière */}
                        <div 
                            ref={acceleratorRef}
                            className="absolute w-96 h-96 rounded-3xl border-4 border-indigo-300/60 dark:border-indigo-600/60 bg-white/20 dark:bg-slate-800/20 backdrop-blur-2xl shadow-2xl"
                            style={{ zIndex: 8 }}
                        >
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
                          
                            {/* Icône centrale */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`p-8 rounded-2xl bg-gradient-to-r ${current.gradient} shadow-xl transition-all duration-500`}>
                                    <Zap className="w-20 h-20 text-white" />
                                </div>
                            </div>

                            {/* Effets d'éclair pendant la transformation */}
                            {showLightning && (
                                <>
                                    {/* Éclairs animés */}
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-1 bg-gradient-to-b from-yellow-300 via-purple-400 to-transparent animate-pulse"
                                            style={{
                                                height: '60%',
                                                left: `${15 + i * 15}%`,
                                                top: '20%',
                                                animationDelay: `${i * 0.15}s`,
                                                animationDuration: '0.5s',
                                                opacity: 0.8
                                            }}
                                        />
                                    ))}
                                    
                                    {/* Particules d'énergie */}
                                    {[...Array(12)].map((_, i) => (
                                        <div
                                            key={`particle-${i}`}
                                            className="absolute w-2 h-2 bg-purple-400 rounded-full animate-ping"
                                            style={{
                                                top: `${15 + Math.random() * 70}%`,
                                                left: `${15 + Math.random() * 70}%`,
                                                animationDelay: `${i * 0.1}s`,
                                                animationDuration: '1s'
                                            }}
                                        />
                                    ))}

                                    {/* Aura pulsante */}
                                    <div className="absolute inset-4 rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 animate-pulse" />
                                </>
                            )}

                            {/* Indicateurs de coins */}
                            <div className="absolute top-4 left-4 w-3 h-3 bg-indigo-400 rounded-full animate-pulse" />
                            <div className="absolute top-4 right-4 w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                            <div className="absolute bottom-4 left-4 w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                            <div className="absolute bottom-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} />
                        </div>

                        {/* Carte profil */}
                        <Card 
                            ref={profileRef}
                            className="absolute w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl p-6 rounded-2xl"
                        >
                            {/* Photo de profil */}
                            <div className="flex justify-center mb-4">
                                <div className={`relative w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 transition-all duration-300 ${
                                    phase >= 3 ? 'ring-green-500' : 
                                    phase >= 2 ? 'ring-purple-500' :
                                    phase >= 1 ? 'ring-indigo-500' : 'ring-blue-500'
                                }`}>
                                    <img 
                                        src={currentImage} 
                                        alt="Profil"
                                        className="w-full h-full object-cover transition-all duration-300"
                                    />
                                    {showLightning && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-pink-500/40 animate-pulse" />
                                    )}
                                </div>
                            </div>

                            {/* Informations */}
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    Thomas Martin
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {phase >= 3 ? "Employé" : "Chercheur d'emploi"}
                                </p>
                            </div>

                            {/* Statut */}
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${current.gradient} text-white text-center text-sm font-semibold transition-all duration-300`}>
                                {current.subtitle}
                            </div>

                            {/* Détails emploi trouvé */}
                            {phase >= 4 && (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 animate-fade-in">
                                    <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400 font-semibold">
                                        <span className="mr-2">🎉</span>
                                        Poste trouvé avec succès
                                    </div>
                                    <div className="text-center text-xs text-slate-600 dark:text-slate-400">
                                        CDI - Entreprise innovante
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Indicateurs de progression */}
                    <div className="flex justify-center gap-2 mt-12">
                        {phaseInfo.map((p, i) => (
                            <div 
                                key={i}
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    i === phase ? `w-12 bg-gradient-to-r ${p.gradient}` :
                                    i < phase ? `w-8 bg-slate-400 dark:bg-slate-600` :
                                    'w-8 bg-slate-200 dark:bg-slate-800'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    )
}