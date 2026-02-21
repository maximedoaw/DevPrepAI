"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { PageBanner } from "@/components/shared/Banner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import React from "react"
import {
    Plus,
    Trash2,
    GraduationCap,
    Save,
    Clock,
    Target,
    Layers,
    ArrowRight,
    ArrowLeft,
    BookOpen,
    Sparkles,
    CheckCircle2,
    Image as ImageIcon,
    Building,
    Brain,
    Edit3,
    VolumeX,
    UserCheck,
    FileText,
    Mic,
    MicOff,
    Wand2,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "@/components/ui/accordion"

const DOMAINS = [
    { id: "MACHINE_LEARNING", label: "Machine Learning" },
    { id: "DEVELOPMENT", label: "Développement Logiciel" },
    { id: "DATA_SCIENCE", label: "Data Science" },
    { id: "FINANCE", label: "Finance & Fintech" },
    { id: "BUSINESS", label: "Business & Management" },
    { id: "ENGINEERING", label: "Ingénierie" },
    { id: "DESIGN", label: "Design UI/UX" },
    { id: "DEVOPS", label: "DevOps & Cloud" },
    { id: "CYBERSECURITY", label: "Cybersécurité" },
    { id: "MARKETING", label: "Marketing Digital" },
    { id: "PRODUCT", label: "Product Management" },
    { id: "ARCHITECTURE", label: "Architecture Système" },
    { id: "MOBILE", label: "Développement Mobile" },
    { id: "WEB", label: "Développement Web" },
    { id: "EDUCATION", label: "Education & Pédagogie" },
    { id: "HEALTH", label: "Santé & BioTech" }
]

const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours} h ${mins} min`;
    if (hours > 0) return `${hours} h`;
    return `${mins} min`;
}

type CourseSection = {
    id: string
    title: string
    description: string
    duration: number
}

export default function CreateCoursePage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [progressValues, setProgressValues] = useState({ objectives: 0, skills: 0, prerequisites: 0, sections: 0 })
    const [openReviewSection, setOpenReviewSection] = useState<string | null>("objectives")

    // Speech-to-Text State
    const [isRecording, setIsRecording] = useState(false)
    const [recognition, setRecognition] = useState<any>(null)
    const baseTextRef = React.useRef<string>("")

    // Test Generator State
    const [testGenStates, setTestGenStates] = useState<Record<string, { step: number; isGenerating: boolean; generatedQuiz: any | null; numQuestions?: number }>>({})

    // Form State
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        domain: "",
        estimatedDuration: 0,
        isPublished: false,
        imageUrl: "",
        objectives: [] as string[],
        targetSkills: [] as string[],
        prerequisites: [] as string[],
        difficultyLevel: "JUNIOR",
        recommendedTests: [] as string[]
    })

    const [sections, setSections] = useState<CourseSection[]>([])

    // Gestion de tableau simple
    const handleArrayChange = (field: keyof typeof courseData, index: number, value: string) => {
        const currentArray = courseData[field] as string[];
        const newArray = [...currentArray];
        newArray[index] = value;
        setCourseData({ ...courseData, [field]: newArray });
    }

    const addArrayItem = (field: keyof typeof courseData) => {
        const currentArray = courseData[field] as string[];
        setCourseData({ ...courseData, [field]: [...currentArray, ""] });
    }

    const removeArrayItem = (field: keyof typeof courseData, index: number) => {
        const currentArray = courseData[field] as string[];
        setCourseData({ ...courseData, [field]: currentArray.filter((_, i) => i !== index) });
    }

    // Speech-to-Text Effect
    React.useEffect(() => {
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
                setCourseData((prev) => ({
                    ...prev,
                    description: baseTextRef.current + (baseTextRef.current && currentTranscript ? " " : "") + currentTranscript
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
            toast.error('La reconnaissance vocale n\'est pas supportée par votre navigateur.')
            return
        }

        if (isRecording) {
            recognition.stop()
            setIsRecording(false)
        } else {
            baseTextRef.current = courseData.description || ''
            recognition.start()
            setIsRecording(true)
        }
    }

    // Handlers
    const handleNext = async () => {
        if (currentStep === 1) {
            if (!courseData.title || !courseData.domain) {
                toast.error("Veuillez remplir le titre et sélectionner un domaine éducatif.")
                return
            }
            setCurrentStep(2);
            return;
        }
        setCurrentStep(prev => Math.min(prev + 1, 4))
    }

    const generateCourseWithAI = async () => {
        try {
            setIsGenerating(true);
            setProgressValues({ objectives: 0, skills: 0, prerequisites: 0, sections: 0 });

            const interval = setInterval(() => {
                setProgressValues(prev => ({
                    objectives: Math.min(prev.objectives + Math.random() * 15, 95),
                    skills: Math.min(prev.skills + Math.random() * 10, 90),
                    prerequisites: Math.min(prev.prerequisites + Math.random() * 12, 92),
                    sections: Math.min(prev.sections + Math.random() * 8, 85),
                }));
            }, 500);

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'generate-course',
                    title: courseData.title,
                    domain: courseData.domain,
                    description: courseData.description,
                    difficultyLevel: courseData.difficultyLevel
                })
            });

            clearInterval(interval);
            setProgressValues({ objectives: 100, skills: 100, prerequisites: 100, sections: 100 });

            if (!response.ok) throw new Error("Erreur api");

            const result = await response.json();
            if (result.success && result.data) {
                const aiData = result.data;
                setCourseData(prev => ({
                    ...prev,
                    objectives: aiData.objectives || [],
                    targetSkills: aiData.targetSkills || [],
                    prerequisites: aiData.prerequisites || [],
                    difficultyLevel: aiData.difficultyLevel || courseData.difficultyLevel,
                    recommendedTests: aiData.recommendedTests || []
                }));

                if (aiData.courseSections && Array.isArray(aiData.courseSections)) {
                    setSections(aiData.courseSections.map((s: { title: string; description: string; duration: number }) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        title: s.title,
                        description: s.description,
                        duration: s.duration || 60
                    })));
                }

                toast.success("Programme généré avec succès par l'IA !");
            } else {
                throw new Error("Format de réponse invalide");
            }

        } catch (error) {
            console.error("Erreur gèn:", error);
            toast.error("L'IA n'a pas pu générer le programme. Veuillez réessayer ou structurer manuellement.");
            if (sections.length === 0) {
                setSections([{ id: "1", title: "Introduction au module", description: "", duration: 30 }]);
            }
        } finally {
            // on s'assure que tout est a 100 avant de cacher
            setTimeout(() => setIsGenerating(false), 500);
        }
    }

    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const addSection = () => {
        setSections([...sections, {
            id: Math.random().toString(36).substr(2, 9),
            title: "",
            description: "",
            duration: 30
        }])
    }

    const removeSection = (id: string) => {
        if (sections.length > 1) {
            setSections(sections.filter(s => s.id !== id))
        }
    }

    const handleSectionChange = (id: string, field: keyof CourseSection, value: string | number) => {
        setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    const generateTestForType = async (testType: string) => {
        const genState = testGenStates[testType] || {};
        const numQuestions = genState.numQuestions || 5;

        setTestGenStates(prev => ({ ...prev, [testType]: { ...prev[testType], isGenerating: true } }));
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'generate-interview',
                    quizType: testType,
                    domain: courseData.domain,
                    difficulty: courseData.difficultyLevel,
                    numberOfQuestions: numQuestions,
                    technology: courseData.targetSkills,
                    totalPoints: numQuestions * 20,
                    description: `Test: ${testType} for course ${courseData.title}`
                })
            });
            const result = await response.json();
            if (result.success) {
                setTestGenStates(prev => ({
                    ...prev,
                    [testType]: { step: 2, isGenerating: false, generatedQuiz: result.data, numQuestions }
                }));
                toast.success(`Le test "${testType}" a été généré avec succès !`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error(`Erreur lors de la génération du test "${testType}"`);
            setTestGenStates(prev => ({ ...prev, [testType]: { ...prev[testType], isGenerating: false } }));
        }
    }

    const startTestGeneration = (testType: string) => {
        setTestGenStates(prev => ({ ...prev, [testType]: { step: 1, isGenerating: false, generatedQuiz: null, numQuestions: 5 } }));
    }

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success("Formation immersive créée avec succès !")
            router.push("/school/courses") // Ajustez la route selon vos besoins
        } catch (error) {
            toast.error("Une erreur est survenue lors de la création de la formation.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Calculate total duration based on sections
    const totalDuration = sections.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Banner */}
                <PageBanner
                    badge={{ text: "Espace Académique", icon: GraduationCap }}
                    title={
                        <>
                            Création Formations <br />
                            <span className="text-emerald-100">Techniques & Immersives</span>
                        </>
                    }
                    description="Concevez des parcours d'apprentissage engageants, alignés avec les besoins du marché pour vos étudiants."
                    image={<Building className="w-32 h-32 text-emerald-100 drop-shadow-lg" />}
                />

                {/* Form Container */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                    {/* Progress indicator - matched with onboarding/page.tsx */}
                    <div className="flex justify-center mb-10 relative z-10">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4].map((num) => (
                                <React.Fragment key={num}>
                                    <div className={cn(
                                        "flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-300 font-bold",
                                        currentStep >= num
                                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                                    )}>
                                        {num === 1 ? <FileText className="w-5 h-5" /> : num === 2 ? <Brain className="w-5 h-5" /> : num === 3 ? <Layers className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                    </div>
                                    {num < 4 && (
                                        <div className={cn(
                                            "w-12 sm:w-16 h-1 transition-all duration-300 rounded-full",
                                            currentStep > num ? "bg-emerald-400 dark:bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"
                                        )}></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">

                        {/* STEP 1: GENERAL INFORMATIONS */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 relative z-10"
                            >
                                <div className="space-y-2 text-center mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Identité de la formation</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Définissez les bases de votre programme intensif.</p>
                                </div>

                                <div className="grid gap-6 max-w-3xl mx-auto">
                                    <div className="space-y-3">
                                        <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Titre de la formation *</Label>
                                        <Input
                                            id="title"
                                            placeholder="Ex: Masterclass React Native Avancé..."
                                            value={courseData.title}
                                            onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                            className="h-14 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl text-lg px-4 focus-visible:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Domaine d'expertise *</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {DOMAINS.map(domain => (
                                                <motion.button
                                                    key={domain.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setCourseData({ ...courseData, domain: domain.id })}
                                                    className={cn(
                                                        "p-4 rounded-xl border text-left transition-all flex items-center gap-3",
                                                        courseData.domain === domain.id
                                                            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm"
                                                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-200 dark:hover:border-emerald-800"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                        courseData.domain === domain.id ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-slate-100 dark:bg-slate-800"
                                                    )}>
                                                        {courseData.domain === domain.id ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Layers className="w-4 h-4 text-slate-400" />}
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-wider">{domain.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Description détaillée</Label>
                                        <div className="relative">
                                            <Textarea
                                                id="description"
                                                placeholder="Décrivez les objectifs, prérequis et débouchés de cette formation... L'IA s'en servira pour générer le reste."
                                                rows={5}
                                                value={courseData.description}
                                                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl resize-none p-4 pr-16 focus-visible:ring-emerald-500 min-h-[160px]"
                                            />
                                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={toggleRecording}
                                                    title="Dicter avec la voix"
                                                    className={cn(
                                                        "h-10 w-10 p-0 rounded-xl transition-all shadow-sm border",
                                                        isRecording
                                                            ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600 animate-pulse dark:bg-red-950/50 dark:border-red-900"
                                                            : "bg-white text-slate-400 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:bg-slate-900 dark:border-slate-800"
                                                    )}
                                                >
                                                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: AI REVIEW */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 relative z-10"
                            >
                                <div className="space-y-2 text-center mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-center gap-2">
                                        <Target className="w-6 h-6 text-emerald-500" />
                                        Analyse Pédagogique
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Générez la structure avec l'IA pour le niveau visé, ou remplissez manuellement.</p>
                                </div>

                                <div className="flex flex-col items-center gap-6 mb-8 bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <div className="space-y-2 text-center">
                                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">1. Choisir le niveau de la formation</Label>
                                        <div className="flex items-center justify-center gap-3 mt-2">
                                            {["JUNIOR", "MID", "SENIOR"].map(lvl => (
                                                <Badge
                                                    key={lvl}
                                                    variant={courseData.difficultyLevel === lvl ? "default" : "outline"}
                                                    className={cn("cursor-pointer px-4 py-2 text-sm transition-all", courseData.difficultyLevel === lvl ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20" : "hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/30")}
                                                    onClick={() => setCourseData({ ...courseData, difficultyLevel: lvl })}
                                                >
                                                    {lvl}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 w-full text-center border-t border-slate-200 dark:border-slate-800 pt-6">
                                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-4">2. Générer le contenu du programme</Label>
                                        <Button
                                            onClick={generateCourseWithAI}
                                            disabled={isGenerating}
                                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900 shadow-sm border border-emerald-200 dark:border-emerald-800 rounded-xl px-6 h-12"
                                        >
                                            {isGenerating ? <><Brain className="w-4 h-4 mr-2 animate-pulse" /> Génération en cours...</> : <><Sparkles className="w-4 h-4 mr-2" /> Générer les 4 piliers avec l'IA</>}
                                        </Button>
                                    </div>
                                </div>

                                {isGenerating && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-5 p-6 bg-white dark:bg-slate-950 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase"><span>Objectifs Pédagogiques</span> <span className="text-emerald-600">{Math.round(progressValues.objectives)}%</span></div>
                                            <Progress value={progressValues.objectives} indicatorClassName="bg-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase"><span>Compétences Visées</span> <span className="text-emerald-600">{Math.round(progressValues.skills)}%</span></div>
                                            <Progress value={progressValues.skills} indicatorClassName="bg-emerald-500 transition-all duration-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase"><span>Prérequis & Tests</span> <span className="text-emerald-600">{Math.round(progressValues.prerequisites)}%</span></div>
                                            <Progress value={progressValues.prerequisites} indicatorClassName="bg-emerald-500 transition-all duration-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase"><span>Structure Pédagogique (Modules)</span> <span className="text-emerald-600">{Math.round(progressValues.sections)}%</span></div>
                                            <Progress value={progressValues.sections} indicatorClassName="bg-emerald-500 transition-all duration-300" />
                                        </div>
                                    </motion.div>
                                )}

                                <div className={cn("max-w-4xl mx-auto space-y-4 transition-opacity duration-500", isGenerating ? "opacity-50 pointer-events-none" : "opacity-100")}>
                                    {[
                                        { id: 'objectives', title: 'Objectifs Pédagogiques', icon: Target, key: 'objectives' as const },
                                        { id: 'targetSkills', title: 'Compétences Clés', icon: Sparkles, key: 'targetSkills' as const },
                                        { id: 'prerequisites', title: 'Prérequis', icon: BookOpen, key: 'prerequisites' as const },
                                        { id: 'recommendedTests', title: 'Types de tests', icon: CheckCircle2, key: 'recommendedTests' as const }
                                    ].map((section, i) => {
                                        const isOpen = openReviewSection === section.id;
                                        const items = courseData[section.key] as string[];

                                        return (
                                            <motion.div
                                                key={section.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group"
                                            >
                                                <div
                                                    className={cn(
                                                        "w-full text-left p-6 md:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden flex flex-col gap-0",
                                                        isOpen
                                                            ? "bg-white dark:bg-slate-900 border-emerald-500/30 shadow-xl shadow-emerald-500/5 scale-[1.02]"
                                                            : "bg-white/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-emerald-500/20 hover:scale-[1.01]"
                                                    )}
                                                >
                                                    <div
                                                        onClick={() => setOpenReviewSection(isOpen ? null : section.id)}
                                                        className="flex items-start gap-6 w-full text-left focus:outline-none relative z-10 cursor-pointer"
                                                    >
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                                                            isOpen ? "bg-emerald-500 text-white rotate-[135deg]" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                        )}>
                                                            <Plus size={24} className="transition-transform duration-500" />
                                                        </div>
                                                        <div className="flex-1 pt-2">
                                                            <h3 className={cn(
                                                                "text-lg md:text-xl font-black uppercase tracking-tight transition-colors duration-300 flex items-center gap-3",
                                                                isOpen ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                                            )}>
                                                                <section.icon className="w-5 h-5 flex-shrink-0" />
                                                                {section.title}
                                                            </h3>

                                                            <AnimatePresence>
                                                                {!isOpen && items.length > 0 && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: "auto" }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        className="mt-4 flex flex-wrap gap-2 overflow-hidden"
                                                                    >
                                                                        {items.slice(0, 3).map((item, idx) => (
                                                                            <Badge key={idx} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 pointer-events-none font-medium truncate max-w-[200px]">
                                                                                {item}
                                                                            </Badge>
                                                                        ))}
                                                                        {items.length > 3 && (
                                                                            <Badge variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-700 pointer-events-none">
                                                                                +{items.length - 3} autres
                                                                            </Badge>
                                                                        )}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {isOpen && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                                className="overflow-hidden w-full relative z-10 mt-6"
                                                            >
                                                                <div className="pl-[4.5rem] pr-2">
                                                                    <div className="h-px w-12 bg-emerald-500/30 mb-6" />
                                                                    <div className="space-y-3">
                                                                        {items.length === 0 && <p className="text-sm text-slate-400 italic mb-4">Aucun élément défini pour l'instant.</p>}
                                                                        {items.map((item, idx) => (
                                                                            <div key={idx} className="flex gap-3 items-start group/item">
                                                                                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-4 shrink-0 opacity-50 group-hover/item:opacity-100 transition-opacity" />
                                                                                <Input
                                                                                    value={item}
                                                                                    onChange={(e) => handleArrayChange(section.key, idx, e.target.value)}
                                                                                    className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-emerald-500"
                                                                                    placeholder={`Saisir un élément...`}
                                                                                />
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={(e) => { e.stopPropagation(); removeArrayItem(section.key, idx); }}
                                                                                    className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 h-12 w-12 rounded-xl shrink-0 transition-colors"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={(e) => { e.stopPropagation(); addArrayItem(section.key); }}
                                                                            className="mt-6 border-dashed border-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800 w-full rounded-xl h-12 transition-all"
                                                                        >
                                                                            <Plus className="w-4 h-4 mr-2" /> Ajouter un nouvel élément
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {isOpen && (
                                                        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: COURSE SECTIONS */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 relative z-10"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Programme Pédagogique</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Structurez votre cours en modules ou sessions interactives.</p>
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 font-black h-10 px-4 rounded-xl text-sm">
                                        <Clock className="w-4 h-4 mr-2" /> {formatDuration(totalDuration)}
                                    </Badge>
                                </div>

                                <div className="space-y-6">
                                    {sections.length > 0 && (
                                        <Accordion type="multiple" className="space-y-4" defaultValue={[sections[0].id]}>
                                            {sections.map((section, index) => (
                                                <AccordionItem key={section.id} value={section.id} className="border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 shadow-sm rounded-3xl overflow-hidden group transition-all hover:border-emerald-500/30">
                                                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900/40">
                                                        <div className="flex items-center gap-4 text-left w-full pr-4">
                                                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <h4 className="font-bold text-slate-700 dark:text-slate-300">
                                                                    {section.title || `Module ${index + 1}`}
                                                                </h4>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                                    {formatDuration(section.duration)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-6 pt-4 space-y-6 border-t border-slate-100 dark:border-slate-800/50">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                            <div className="md:col-span-3 space-y-2">
                                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Titre du module</Label>
                                                                <Input
                                                                    placeholder="Ex: Architecture Microservices..."
                                                                    value={section.title}
                                                                    onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                                                                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-medium focus-visible:ring-emerald-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Durée (Min)</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="5"
                                                                    value={section.duration}
                                                                    onChange={(e) => handleSectionChange(section.id, 'duration', parseInt(e.target.value) || 0)}
                                                                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-medium focus-visible:ring-emerald-500 text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Contenu détaillé & Objectifs d'apprentissage</Label>
                                                            <Textarea
                                                                placeholder="Que vont apprendre les étudiants dans ce module ? Quels concepts seront couverts ?"
                                                                value={section.description}
                                                                onChange={(e) => handleSectionChange(section.id, 'description', e.target.value)}
                                                                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl resize-none min-h-[120px] font-medium leading-relaxed p-4 focus-visible:ring-emerald-500"
                                                            />
                                                        </div>
                                                        {sections.length > 1 && (
                                                            <div className="flex justify-end border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    onClick={() => removeSection(section.id)}
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer ce module
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    )}

                                    <Button
                                        onClick={addSection}
                                        variant="outline"
                                        className="w-full h-16 border-dashed border-2 border-slate-300 dark:border-slate-700 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-3xl font-black uppercase tracking-widest transition-all"
                                    >
                                        <Plus className="w-5 h-5 mr-2" /> Ajouter un Module
                                    </Button>
                                </div>

                                {/* TEST GENERATOR SECTION */}
                                {courseData.recommendedTests.length > 0 && (
                                    <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-8">
                                        <div className="space-y-2 text-center">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-center gap-2">
                                                <Target className="w-6 h-6 text-emerald-500" />
                                                Générateur de Tests (IA)
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">Générez des évaluations pour chaque test recommandé.</p>
                                        </div>

                                        <div className="grid gap-6">
                                            {courseData.recommendedTests.map((testType, idx) => {
                                                const genState = testGenStates[testType] || { step: 0, isGenerating: false, generatedQuiz: null };

                                                return (
                                                    <Card key={idx} className="border-emerald-100 dark:border-emerald-900/30 shadow-sm rounded-3xl overflow-hidden">
                                                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                                                            <div className="flex-1 space-y-2">
                                                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                                    <BookOpen className="w-5 h-5 text-emerald-500" />
                                                                    {testType}
                                                                </h4>
                                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                    Créez un test personnalisé pour valider l'acquisition de ce niveau de compétence.
                                                                </p>
                                                            </div>

                                                            <div className="flex-shrink-0 w-full md:w-auto">
                                                                {genState.step === 0 && (
                                                                    <Button
                                                                        onClick={() => startTestGeneration(testType)}
                                                                        className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:hover:bg-emerald-900 dark:text-emerald-300 font-bold rounded-xl h-12"
                                                                    >
                                                                        Créer ce quiz
                                                                    </Button>
                                                                )}

                                                                {genState.step > 0 && (
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex flex-col items-center">
                                                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", genState.step >= 1 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>1</div>
                                                                            <span className="text-[10px] font-bold uppercase mt-1 text-slate-500">Config</span>
                                                                        </div>
                                                                        <div className={cn("h-0.5 w-8 content-['']", genState.step >= 2 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700")} />
                                                                        <div className="flex flex-col items-center">
                                                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", genState.step >= 2 ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>2</div>
                                                                            <span className="text-[10px] font-bold uppercase mt-1 text-slate-500">Quiz</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {genState.step === 1 && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6 md:p-8 space-y-6">
                                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">L'IA générera des questions adaptées au niveau <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-white ml-2">{courseData.difficultyLevel}</Badge>.</p>
                                                                    <div className="flex items-center gap-3">
                                                                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 shrink-0">Nb de questions :</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="1"
                                                                            max="30"
                                                                            value={genState.numQuestions || 5}
                                                                            onChange={(e) => setTestGenStates(prev => ({ ...prev, [testType]: { ...prev[testType], numQuestions: parseInt(e.target.value) || 5 } }))}
                                                                            className="w-20 text-center font-bold"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-end">
                                                                    <Button
                                                                        onClick={() => generateTestForType(testType)}
                                                                        disabled={genState.isGenerating}
                                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 px-6 font-bold shadow-md shadow-emerald-500/20"
                                                                    >
                                                                        {genState.isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</> : <><Wand2 className="w-4 h-4 mr-2" /> Valider & Générer</>}
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        )}

                                                        {genState.step === 2 && genState.generatedQuiz && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-6">
                                                                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                                                    <div className="space-y-1">
                                                                        <p className="font-bold text-emerald-800 dark:text-emerald-300">{genState.generatedQuiz.title}</p>
                                                                        <p className="text-xs font-medium text-emerald-600/70">{genState.generatedQuiz.questions?.length} Questions générées • {genState.generatedQuiz.totalPoints} pts totaux</p>
                                                                    </div>
                                                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                                                </div>
                                                                <p className="text-sm text-slate-500">Aperçu du contenu généré pour cette évaluation :</p>
                                                                <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                                    {genState.generatedQuiz.questions?.map((q: any, i: number) => (
                                                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                                                                            <div className="flex gap-4 justify-between items-start">
                                                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug break-words flex-1">
                                                                                    {i + 1}. {q.text || q.title || "Question"}
                                                                                </p>
                                                                                <Badge variant="outline" className="shrink-0 bg-white dark:bg-slate-900">{q.points} pt{q.points > 1 ? 's' : ''}</Badge>
                                                                            </div>
                                                                            <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl">
                                                                                <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 break-words">
                                                                                    <span className="font-bold opacity-70">RÉPONSE CLÉ : </span>
                                                                                    {typeof q.correctAnswer === 'number' && q.options
                                                                                        ? q.options[q.correctAnswer]
                                                                                        : (q.correctAnswer || "Évaluation par l'examinateur")}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex justify-center mt-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => startTestGeneration(testType)}
                                                                        className="text-slate-500 hover:text-emerald-600 font-bold"
                                                                    >
                                                                        <Wand2 className="w-4 h-4 mr-2" /> Régénérer ce test
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 4: REVIEW & PUBLISH */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 relative z-10"
                            >
                                <div className="space-y-2 text-center mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Vérification & Publication</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Préparez la visibilité de votre programme pour les étudiants.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                    <div className="space-y-6">
                                        <Card className="border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-3xl p-6">
                                            <h4 className="font-black text-slate-900 dark:text-white uppercase text-lg mb-4">Résumé du Cours</h4>
                                            <div className="space-y-4 text-sm">
                                                <div className="flex justify-between border-b border-emerald-200/50 dark:border-emerald-800/30 pb-2">
                                                    <span className="text-slate-500">Titre</span>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100 max-w-[200px] truncate text-right">{courseData.title || "-"}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-emerald-200/50 dark:border-emerald-800/30 pb-2">
                                                    <span className="text-slate-500">Domaine</span>
                                                    <Badge className="bg-emerald-100 text-emerald-800 border-0">{courseData.domain || "-"}</Badge>
                                                </div>
                                                <div className="flex justify-between border-b border-emerald-200/50 dark:border-emerald-800/30 pb-2">
                                                    <span className="text-slate-500">Modules</span>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{sections.length}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-emerald-200/50 dark:border-emerald-800/30 pb-2">
                                                    <span className="text-slate-500">Durée Totale</span>
                                                    <span className="font-bold text-emerald-600">{formatDuration(totalDuration)}</span>
                                                </div>
                                            </div>
                                        </Card>

                                        <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-bold uppercase tracking-wider">Publication Immédiate</Label>
                                                    <p className="text-xs text-slate-500">Rendre ce cours visible par les étudiants liés à l'école.</p>
                                                </div>
                                                <Switch
                                                    checked={courseData.isPublished}
                                                    onCheckedChange={(c) => setCourseData({ ...courseData, isPublished: c })}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Creator Card */}
                                        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600">
                                                <UserCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Vous</p>
                                                <Badge variant="outline" className="mt-1 bg-white dark:bg-slate-950 text-[10px] text-emerald-600 border-emerald-200">Formateur</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Image de Couverture (Optionnel)</Label>
                                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl h-48 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer transition-all">
                                                <ImageIcon className="w-10 h-10 mb-3" />
                                                <span className="text-sm font-bold uppercase tracking-widest text-center px-4">Glissez une image ou cliquez pour parcourir</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Global Navigation Actions */}
                <div className="flex justify-between items-center bg-transparent mt-8 z-50">
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={currentStep === 1 || isSubmitting || isGenerating}
                        className="rounded-2xl h-12 px-6 font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                    </Button>

                    {currentStep < 4 ? (
                        <Button
                            onClick={handleNext}
                            disabled={isSubmitting || isGenerating}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20"
                        >
                            Suivant <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-lg shadow-emerald-600/30"
                        >
                            {isSubmitting ? "Sauvegarde..." : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> {courseData.isPublished ? "Publier le Cours" : "Enregistrer Brouillon"}
                                </>
                            )}
                        </Button>
                    )}
                </div>

            </div>
        </div>
    )
}
