"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Sparkles, Mic, MicOff, Landmark, Wallet, Briefcase, Star, Info, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CareerChangerTestQuestion {
    id: string
    label: string
    placeholder: string
    type: "text" | "radio" | "checkbox"
    options?: string[]
    icon?: any
}

interface CareerChangerTestModalProps {
    open: boolean
    onClose: () => void
    answers: Record<string, string | string[]>
    setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | string[]>>>
    currentQuestion: number
    setCurrentQuestion: (n: number) => void
    onSubmit: () => Promise<void>
    isSubmitting: boolean
}

export function CareerChangerTestModal({
    open,
    onClose,
    answers,
    setAnswers,
    currentQuestion,
    setCurrentQuestion,
    onSubmit,
    isSubmitting,
}: CareerChangerTestModalProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [recognition, setRecognition] = useState<any>(null)
    const baseTextRef = useRef<string>("")
    const currentQuestionIdRef = useRef<string>("")

    const questions: CareerChangerTestQuestion[] = useMemo(() => [
        {
            id: "current_level",
            label: "Quel est ton niveau actuel ?",
            placeholder: "Sélectionne ton niveau...",
            type: "radio",
            icon: Briefcase,
            options: [
                "Je débute complètement",
                "J'ai déjà appris seul(e)",
                "J'ai suivi une formation (Bootcamp, diplôme)"
            ]
        },
        {
            id: "background_desc",
            label: "Parle-moi de ton parcours actuel (ton métier, tes années d'expérience...)",
            placeholder: "Ex: Je suis comptable depuis 5 ans, j'aime la logique mais je veux créer des choses...",
            type: "text",
            icon: Info
        },
        {
            id: "transferable_skills",
            label: "Quelles sont les compétences de ton métier actuel que tu penses pouvoir réutiliser ?",
            placeholder: "Ex: Gestion de projet, rigueur, relation client, analyse de données...",
            type: "text",
            icon: Star
        },
        {
            id: "obstacles",
            label: "Quels sont tes principaux freins ? (plusieurs choix)",
            placeholder: "Sélectionne tes freins...",
            type: "checkbox",
            options: [
                "Manque de confiance",
                "Pas de roadmap claire",
                "Peur des entretiens",
                "Manque de temps",
                "Contraintes financières (salaire)"
            ]
        },
        {
            id: "salary_current",
            label: "Quel est ton salaire annuel actuel (ou dernier perçu) ?",
            placeholder: "En FCFA (annuel)",
            type: "radio",
            icon: Wallet,
            options: [
                "Moins de 5 000 000 FCFA",
                "5M - 15M FCFA",
                "15M - 30M FCFA",
                "30M - 50M FCFA",
                "Plus de 50 000 000 FCFA"
            ]
        },
        {
            id: "salary_min_target",
            label: "Quel est le salaire minimum que tu acceptes pour ton premier poste dans ce nouveau domaine ?",
            placeholder: "Ton seuil de sécurité",
            type: "radio",
            icon: Landmark,
            options: [
                "3 000 000 - 8 000 000 FCFA",
                "8M - 15M FCFA",
                "15M - 25M FCFA",
                "Plus de 25M FCFA",
                "Pas de sacrifice possible"
            ]
        },
        {
            id: "learning_preference",
            label: "Quelle approche d'apprentissage te correspond le mieux ?",
            placeholder: "Choisis ton style...",
            type: "radio",
            options: [
                "Apprendre en faisant (projets concrets)",
                "Suivre un parcours structuré étape par étape",
                "Mix théorie dense et pratique"
            ]
        },
        {
            id: "time_commitment",
            label: "Combien de temps peux-tu y consacrer par semaine ?",
            placeholder: "Ta disponibilité...",
            type: "radio",
            options: [
                "Moins de 5h",
                "5 à 15h (parallèle boulot)",
                "15 à 30h",
                "Temps plein (Plus de 35h)"
            ]
        },
        {
            id: "roadmap_step",
            label: "Quelle étape est ta priorité absolue aujourd'hui ?",
            placeholder: "Ta priorité...",
            type: "radio",
            options: [
                "Les bases fondamentales",
                "Projets pour le portfolio",
                "Coaching entretien & CV",
                "Tout est urgent !"
            ]
        }
    ], [])

    const q = questions[currentQuestion]
    currentQuestionIdRef.current = q.id

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            const recognitionInstance = new SpeechRecognition()
            recognitionInstance.continuous = true
            recognitionInstance.interimResults = true
            recognitionInstance.lang = 'fr-FR'

            recognitionInstance.onresult = (event: any) => {
                let currentTranscript = ''
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript
                }
                setAnswers((prevAnswers: Record<string, string | string[]>) => ({
                    ...prevAnswers,
                    [currentQuestionIdRef.current]: baseTextRef.current + currentTranscript
                }))
            }

            recognitionInstance.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error)
                setIsRecording(false)
                if (event.error === 'not-allowed') {
                    toast.error('Accès au microphone refusé.')
                }
            }

            recognitionInstance.onend = () => {
                setIsRecording(false)
            }

            setRecognition(recognitionInstance)
        }

        return () => {
            if (recognition) {
                recognition.stop()
            }
        }
    }, [])

    const toggleRecording = () => {
        if (!recognition) {
            toast.error('La reconnaissance vocale n\'est pas supportée.')
            return
        }

        if (isRecording) {
            recognition.stop()
            setIsRecording(false)
        } else {
            baseTextRef.current = (answers[q.id] as string) || ''
            recognition.start()
            setIsRecording(true)
        }
    }

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
        }
    }

    const handleRadioChange = (value: string) => {
        setAnswers(prev => ({ ...prev, [q.id]: value }))
    }

    const handleCheckboxChange = (value: string) => {
        setAnswers(prev => {
            const current = (prev[q.id] as string[]) || []
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value]
            return { ...prev, [q.id]: updated }
        })
    }

    const canProceed = useMemo(() => {
        const answer = answers[q.id]
        if (q.type === "text") return typeof answer === "string" && answer.trim().length > 0
        if (q.type === "checkbox") return Array.isArray(answer) && answer.length > 0
        return !!answer
    }, [answers, q.id, q.type])

    if (!open) return null

    const Icon = q.icon || Sparkles

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/90 backdrop-blur-md px-4 py-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-950 rounded-2xl md:rounded-3xl shadow-2xl max-w-2xl w-full p-5 md:p-10 space-y-6 md:space-y-8 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto relative">
                <div className="relative flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                                <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-none px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Bilan IA
                            </Badge>
                        </div>
                        <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Profil de carrière
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md italic">
                            "L'IA calcule ton futur financier et tes ponts de compétences."
                        </p>
                    </div>
                    <button
                        className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-emerald-600 transition-all group"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-3 relative">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <span>Étape {currentQuestion + 1} sur {questions.length}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Area */}
                <div className="space-y-6 relative min-h-[300px]">
                    <div className="space-y-4">
                        <h4 className="text-base md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                            {q.label}
                        </h4>
                        {q.type === "text" && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <Sparkles className="inline-block w-3 h-3 mr-1" />
                                Astuce: Tu peux aussi parler pour détailler ton vécu.
                            </p>
                        )}
                    </div>

                    {q.type === "radio" && (
                        <div className="grid grid-cols-1 gap-3">
                            {q.options?.map((option) => {
                                const isSelected = answers[q.id] === option;
                                return (
                                    <div
                                        key={option}
                                        className={cn(
                                            "flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group",
                                            isSelected
                                                ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                                                : "border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                        )}
                                        onClick={() => handleRadioChange(option)}
                                    >
                                        <span className={cn(
                                            "text-sm md:text-[15px] font-medium transition-colors flex-1 pr-2",
                                            isSelected ? "text-emerald-900 dark:text-emerald-50" : "text-slate-600 dark:text-slate-400"
                                        )}>
                                            {option}
                                        </span>
                                        {isSelected && (
                                            <div className="p-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20">
                                                <Check className="h-3.5 w-3.5 text-white" />
                                            </div>
                                        )}
                                        <input
                                            type="radio"
                                            name={q.id}
                                            value={option}
                                            checked={isSelected}
                                            onChange={() => { }}
                                            className="hidden"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {q.type === "checkbox" && (
                        <div className="grid grid-cols-1 gap-3">
                            {q.options?.map((option) => {
                                const isChecked = ((answers[q.id] as string[]) || []).includes(option)
                                return (
                                    <div
                                        key={option}
                                        className={cn(
                                            "flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group",
                                            isChecked
                                                ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                                                : "border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                        )}
                                        onClick={() => handleCheckboxChange(option)}
                                    >
                                        <span className={cn(
                                            "text-sm md:text-[15px] font-medium transition-colors flex-1 pr-2",
                                            isChecked ? "text-emerald-900 dark:text-emerald-50" : "text-slate-600 dark:text-slate-400"
                                        )}>
                                            {option}
                                        </span>
                                        {isChecked && (
                                            <div className="p-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20">
                                                <Check className="h-3.5 w-3.5 text-white" />
                                            </div>
                                        )}
                                        <input
                                            type="checkbox"
                                            value={option}
                                            checked={isChecked}
                                            onChange={() => { }}
                                            className="hidden"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {q.type === "text" && (
                        <div className="relative">
                            <textarea
                                className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 px-5 md:px-6 py-4 md:py-5 pr-16 text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all min-h-[180px] resize-none"
                                placeholder={q.placeholder}
                                value={(answers[q.id] as string) || ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setAnswers(prev => ({ ...prev, [q.id]: val }));
                                }}
                            />
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={toggleRecording}
                                    className={cn(
                                        "h-10 w-10 p-0 rounded-xl transition-all",
                                        isRecording
                                            ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                                            : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    )}
                                >
                                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className="flex-1 h-14 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all disabled:opacity-30"
                    >
                        Retour
                    </Button>

                    {currentQuestion === questions.length - 1 ? (
                        <Button
                            onClick={onSubmit}
                            disabled={isSubmitting || !canProceed}
                            className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-600/10 font-extrabold text-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Génération...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    Finaliser mon Profil
                                </div>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed}
                            className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-600/10 font-bold text-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            Suivant
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

function Check(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}

