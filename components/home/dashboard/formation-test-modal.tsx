"use client"

import { useState, useEffect, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
    GraduationCap,
    ArrowRight,
    ArrowLeft,
    Loader2,
    BookOpen,
    Target,
    Clock,
    Zap,
    Mic,
    MicOff,
    Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface FormationTestModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (answers: Record<string, string>) => void
    isSubmitting: boolean
}

export function FormationTestModal({ isOpen, onClose, onSubmit, isSubmitting }: FormationTestModalProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [isRecording, setIsRecording] = useState(false)
    const [recognition, setRecognition] = useState<any>(null)
    const baseTextRef = useRef<string>("")
    const currentQuestionIdRef = useRef<string>("")

    const questions = [
        {
            id: "institutional_priority",
            label: "Quelle est votre priorité stratégique actuelle ?",
            description: "Identifiez l'objectif majeur de votre institution pour ce semestre.",
            type: "qcm",
            options: [
                { value: "academic_excellence", label: "Excellence Académique (Résultats & Mentions)" },
                { value: "market_employability", label: "Employabilité Immédiate (Insertion Pro)" },
                { value: "digital_innovation", label: "Innovation Numérique (Méthodes Modernes)" },
                { value: "global_ranking", label: "Rayonnement & Réputation (Partenariats)" }
            ]
        },
        {
            id: "student_challenges",
            label: "Quels sont les plus grands freins de vos étudiants ?",
            description: "Détaillez les obstacles que vous observez au quotidien.",
            type: "text",
            placeholder: "Ex: Manque de pratique concrète, difficultés en anglais technique, gestion du temps, etc."
        },
        {
            id: "target_market",
            label: "Vers quels domaines orientez-vous vos cohortes prioritaires ?",
            description: "Sélectionnez le secteur d'activité le plus critique à renforcer.",
            type: "qcm",
            options: [
                { value: "software_dev", label: "Développement Logiciel & Cloud" },
                { value: "data_ai", label: "Data Science & Intelligence Artificielle" },
                { value: "digital_marketing", label: "Marketing Digital & Stratégie" },
                { value: "cybersecurity", label: "Cybersécurité & Réseaux" },
                { value: "product_management", label: "Product Management & Agilité" },
                { value: "ux_ui_design", label: "Design UX/UI & Création Digitale" },
                { value: "agriculture_tech", label: "Agri-Tech & Développement Durable" },
                { value: "other", label: "Autre (Veuillez préciser ci-dessous)" }
            ]
        },
        {
            id: "partnership_strategy",
            label: "Comment souhaitez-vous intégrer le monde professionnel ?",
            description: "Choisissez le type d'immersion à privilégier pour vos étudiants.",
            type: "qcm",
            options: [
                { value: "internships", label: "Stages & Alternances en Entreprise" },
                { value: "mentorship", label: "Mentorat par des Experts du Secteur" },
                { value: "hackathons", label: "Compétitions de Projets & Hackathons" },
                { value: "certifications", label: "Passage de Certifications Internationales" }
            ]
        }
    ]

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(s => s + 1)
        } else {
            onSubmit(answers)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1)
        }
    }

    const currentQuestion = questions[currentStep]
    currentQuestionIdRef.current = currentQuestion.id
    const isAnswered = !!answers[currentQuestion.id]

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
                setAnswers((prev: Record<string, string>) => ({
                    ...prev,
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
            toast.error('La reconnaissance vocale n\'est pas supportée sur ce navigateur.')
            return
        }

        if (isRecording) {
            recognition.stop()
            setIsRecording(false)
        } else {
            baseTextRef.current = answers[currentQuestion.id] || ''
            recognition.start()
            setIsRecording(true)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 border-0 bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="sr-only">
                    <DialogTitle>Questionnaire de Création de Programme</DialogTitle>
                    <DialogDescription>
                        Aidez-nous à personnaliser votre parcours académique en répondant à ces quelques questions.
                    </DialogDescription>
                </DialogHeader>

                {/* Fixed Header Section */}
                <div className="p-5 md:p-10 pb-4 space-y-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-none px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Stratégie Pédagogique
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                            {currentQuestion.label}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium leading-relaxed italic line-clamp-2 md:line-clamp-none">
                            "{currentQuestion.description}"
                        </p>
                    </div>
                </div>

                {/* Scrollable Middle Content Area */}
                <div className="flex-1 overflow-y-auto px-5 md:px-10 pb-6 custom-scrollbar">
                    <div className="space-y-6">
                        {/* Progress Bar */}
                        <div className="space-y-3 relative mb-6">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                <span>Étape {currentStep + 1} sur {questions.length}</span>
                                <span className="text-emerald-600 dark:text-emerald-400">{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                />
                            </div>
                        </div>

                        <div className="min-h-[200px] flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {currentQuestion.type === "qcm" ? (
                                        <RadioGroup
                                            value={answers[currentQuestion.id]}
                                            onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                                            className="grid grid-cols-1 gap-3"
                                        >
                                            {currentQuestion.options?.map((opt) => (
                                                <div key={opt.value}>
                                                    <RadioGroupItem value={opt.value} id={opt.value} className="peer sr-only" />
                                                    <Label
                                                        htmlFor={opt.value}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 md:p-4 rounded-2xl border-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-[13px] md:text-sm",
                                                            answers[currentQuestion.id] === opt.value
                                                                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                                : "border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400"
                                                        )}
                                                    >
                                                        <span className="flex-1 pr-2">{opt.label}</span>
                                                        {answers[currentQuestion.id] === opt.value && <Zap className="w-4 h-4 fill-current shrink-0" />}
                                                    </Label>
                                                </div>
                                            ))}

                                            {/* Interactive Textarea for 'Other' option */}
                                            {currentQuestion.id === "target_market" && answers[currentQuestion.id] === "other" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="pt-2"
                                                >
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">
                                                        Précisez le domaine personnalisé
                                                    </Label>
                                                    <Textarea
                                                        placeholder="Ex: Énergie solaire, Fintech local, etc."
                                                        value={answers["target_market_custom"] || ""}
                                                        onChange={(e) => setAnswers(prev => ({ ...prev, target_market_custom: e.target.value }))}
                                                        className="min-h-[100px] rounded-2xl border-2 border-emerald-500/50 focus:border-emerald-500 bg-white dark:bg-slate-900 transition-all text-sm font-medium resize-none shadow-sm"
                                                    />
                                                </motion.div>
                                            )}
                                        </RadioGroup>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles className="w-3 h-3" />
                                                Astuce : Vous pouvez parler pour détailler votre vision.
                                            </p>
                                            <div className="relative">
                                                <Textarea
                                                    placeholder={currentQuestion.placeholder}
                                                    value={answers[currentQuestion.id] || ""}
                                                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                                    className="min-h-[180px] rounded-2xl border-2 border-slate-100 dark:border-white/5 focus:border-emerald-500 transition-all p-5 pr-14 text-base font-medium resize-none shadow-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={toggleRecording}
                                                    className={cn(
                                                        "absolute top-4 right-4 h-10 w-10 p-0 rounded-xl transition-all shadow-md",
                                                        isRecording
                                                            ? "bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-red-500/20"
                                                            : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-emerald-500/10"
                                                    )}
                                                >
                                                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="px-5 md:px-10 py-5 md:py-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 shrink-0">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Button>

                        <Button
                            disabled={!isAnswered || isSubmitting}
                            onClick={handleNext}
                            className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8 shadow-lg hover:scale-105 transition-all"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Génération...
                                </>
                            ) : (
                                <>
                                    {currentStep === questions.length - 1 ? "Générer mon plan" : "Suivant"}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}
