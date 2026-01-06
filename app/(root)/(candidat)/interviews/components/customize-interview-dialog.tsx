"use client";

import React, { useState, useEffect } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
    Wand2,
    Sparkles,
    Loader2,
    Clock,
    Target,
    Briefcase,
    Layers,
    MessageSquare,
    Mic,
    MicOff,
    X,
    Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import AIVocalInterview from "@/components/interviews/ai-vocal-interview";
import { createVoiceInterview } from "@/actions/ai.action";

export function CustomizeInterviewDialog() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [topicInput, setTopicInput] = useState("");

    // Voice recognition
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const [config, setConfig] = useState({
        topics: [] as string[],
        role: "",
        difficulty: "MID",
        focus: "mixed", // technical, behavioral, mixed
        duration: 30, // minutes
        description: ""
    });

    // Transcript handling
    // We use a ref to store the description value at the start of recording
    // so we can append the transcript to it without duplication loops.
    const baseDescriptionRef = React.useRef("");

    useEffect(() => {
        if (listening) {
            // While listening, show base + current transcript
            setConfig(prev => ({
                ...prev,
                description: baseDescriptionRef.current + (baseDescriptionRef.current && transcript ? " " : "") + transcript
            }));
        }
    }, [transcript, listening]);

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            // Start listening
            baseDescriptionRef.current = config.description;
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true, language: 'fr-FR' });
        }
    };

    const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (topicInput.trim()) {
                if (!config.topics.includes(topicInput.trim())) {
                    setConfig(prev => ({ ...prev, topics: [...prev.topics, topicInput.trim()] }));
                }
                setTopicInput("");
            }
        }
    };

    const removeTopic = (topicToRemove: string) => {
        setConfig(prev => ({
            ...prev,
            topics: prev.topics.filter(t => t !== topicToRemove)
        }));
    };

    const handleStart = async () => {
        if (config.topics.length === 0 && !config.role) {
            toast.error("Veuillez indiquer un sujet ou un rôle cible");
            return;
        }

        setLoading(true);

        try {
            // Créer l'entretien vocal via l'action serveur
            const result = await createVoiceInterview({
                technologies: config.topics,
                context: `${config.role} - ${config.description || "Pas de description"}. Niv: ${config.difficulty}. Focus: ${config.focus}`,
                duration: config.duration
            });

            if (result.success && result.voiceInterview) {
                toast.success("Session préparée ! Redirection...");
                setOpen(false);
                router.push(`/interviews/${result.voiceInterview.id}`);
            } else {
                toast.error(result.error || "Erreur lors de la création de la session");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Une erreur est survenue");
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                SpeechRecognition.stopListening();
            }
            setOpen(val);
        }}>
            <DialogTrigger asChild>
                <Button
                    className="w-full md:w-auto bg-emerald-600 dark:bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] font-medium"
                >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Personnaliser une session
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 p-0 gap-0 overflow-hidden transition-all duration-500 sm:max-w-[600px] max-h-[90vh]">
                <DialogHeader className="p-6 pb-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">
                            Créer une session sur mesure
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-500 ml-12">
                        Configurez votre simulation d'entretien idéale.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                    {/* Single Column Layout */}

                    {/* Rôle cible */}
                    <div className="space-y-2.5">
                        <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Briefcase className="w-4 h-4 text-emerald-500" />
                            Rôle visé
                        </Label>
                        <Input
                            placeholder="Ex: Frontend Developer, Product Manager..."
                            value={config.role}
                            onChange={(e) => setConfig({ ...config, role: e.target.value })}
                            className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>

                    {/* Sujet spécifique (Tags) */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Target className="w-4 h-4 text-emerald-500" />
                            Sujet / Technologies (Optionnel)
                        </Label>
                        <div className="min-h-[44px] rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 flex flex-wrap gap-2 p-2 transition-all">
                            {config.topics.map((topic, i) => (
                                <div key={i} className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg text-sm font-medium animate-in zoom-in duration-200">
                                    {topic}
                                    <button
                                        onClick={() => removeTopic(topic)}
                                        className="hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <input
                                placeholder={config.topics.length === 0 ? "Ex: React, System Design... (Entrée pour ajouter)" : ""}
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                onKeyDown={handleTopicKeyDown}
                                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] h-7 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Description Vocale */}
                    <div className="space-y-2.5">
                        <Label className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-emerald-500" />
                                Contexte & Description
                            </span>
                            {browserSupportsSpeechRecognition && (
                                <Button
                                    type="button"
                                    variant={listening ? "default" : "outline"}
                                    size="sm"
                                    onClick={toggleListening}
                                    className={cn(
                                        "h-7 px-3 text-xs rounded-full transition-all border-slate-200 dark:border-slate-800",
                                        listening ? "bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 hover:border-emerald-200"
                                    )}
                                >
                                    {listening ? (
                                        <>
                                            <MicOff className="w-3 h-3 mr-1.5" />
                                            Arrêter
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-3 h-3 mr-1.5" />
                                            Dicter
                                        </>
                                    )}
                                </Button>
                            )}
                        </Label>
                        <div className="relative">
                            <Textarea
                                placeholder="Décrivez le contexte spécifique, ce que vous voulez travailler, ou collez une offre d'emploi..."
                                value={config.description}
                                onChange={(e) => {
                                    setConfig({ ...config, description: e.target.value });
                                    // Update base ref if user edits manually while not listening
                                    if (!listening) baseDescriptionRef.current = e.target.value;
                                }}
                                className="min-h-[100px] rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none p-4"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Utilisez le micro pour décrire l'entretien idéal rapidement.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Difficulté */}
                        <div className="space-y-2.5">
                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <Layers className="w-4 h-4 text-emerald-500" />
                                Niveau
                            </Label>
                            <Select
                                value={config.difficulty}
                                onValueChange={(val) => setConfig({ ...config, difficulty: val })}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="JUNIOR">Junior (Débutant)</SelectItem>
                                    <SelectItem value="MID">Intermédiaire</SelectItem>
                                    <SelectItem value="SENIOR">Senior (Expert)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type de questions */}
                        <div className="space-y-2.5">
                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <Wand2 className="w-4 h-4 text-emerald-500" />
                                Focus
                            </Label>
                            <Select
                                value={config.focus}
                                onValueChange={(val) => setConfig({ ...config, focus: val })}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="technical">Technique</SelectItem>
                                    <SelectItem value="behavioral">Comportemental</SelectItem>
                                    <SelectItem value="mixed">Mixte</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Durée */}
                    <div className="space-y-4 pt-2">
                        <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            Durée (minutes)
                        </Label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Slider
                                    defaultValue={[30]}
                                    max={90}
                                    min={15}
                                    step={15}
                                    value={[config.duration]}
                                    onValueChange={(vals) => setConfig({ ...config, duration: vals[0] })}
                                    className="py-2"
                                />
                                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium px-1">
                                    <span>15m</span>
                                    <span>30m</span>
                                    <span>45m</span>
                                    <span>60m</span>
                                    <span>90m</span>
                                </div>
                            </div>
                            <div className="w-20">
                                <Input
                                    type="number"
                                    value={config.duration}
                                    onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) || 15 })}
                                    className="h-9 text-center rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                    min={5}
                                    max={180}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="mr-auto">
                        Annuler
                    </Button>
                    <Button
                        onClick={handleStart}
                        disabled={loading}
                        className="rounded-xl px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 w-full sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Préparation...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Démarrer la session
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
