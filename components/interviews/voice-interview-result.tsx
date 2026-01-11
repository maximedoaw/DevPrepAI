"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, MessageSquare, ChevronDown, ChevronUp, Star, ArrowLeft, Download, Award, Target, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface VoiceInterviewResultProps {
    data: {
        id: string;
        title: string;
        score: number;
        duration: number;
        feedback: {
            note: number;
            explication_note: string;
            points_forts: string[];
            points_faibles: string[];
        };
        transcription: Array<{ speaker: string; text: string }>;
        date: Date;
    };
}

export default function VoiceInterviewResult({ data }: VoiceInterviewResultProps) {
    const router = useRouter();
    const [showTranscript, setShowTranscript] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-200 ring-emerald-500/20";
        if (score >= 50) return "text-amber-500 bg-amber-50 border-amber-200 ring-amber-500/20";
        return "text-red-500 bg-red-50 border-red-200 ring-red-500/20";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Très bon";
        if (score >= 60) return "Bon";
        if (score >= 40) return "Moyen";
        return "À améliorer";
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Navigation */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/interviews?tab=HISTORY')}
                    className="group pl-0 hover:pl-2 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Retour à l'historique
                </Button>

                {/* Hero Score Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-800 overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl rounded-full translate-x-1/2 -translate-y-1/2`} />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                        {/* Score Circle */}
                        <div className="relative flex-shrink-0">
                            <div className={cn("w-40 h-40 rounded-full flex flex-col items-center justify-center border-4 ring-4 transition-all duration-1000", getScoreColor(data.score))}>
                                <span className="text-5xl font-bold tracking-tighter">{data.score}</span>
                                <span className="text-sm font-medium uppercase tracking-widest mt-1 opacity-80">/ 100</span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{data.title}</h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-2">
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{getScoreLabel(data.score)}</span>
                                    <span>•</span>
                                    <span>{new Date(data.date).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </p>
                            </div>
                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                                {data.feedback.explication_note}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Strengths */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="h-full border-none shadow-md bg-emerald-50/50 dark:bg-emerald-950/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Points Forts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {data.feedback.points_forts.map((point, i) => (
                                        <li key={i} className="flex gap-3 bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Weaknesses */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="h-full border-none shadow-md bg-amber-50/50 dark:bg-amber-950/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <Target className="w-5 h-5" />
                                    Axes d'amélioration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {data.feedback.points_faibles.map((point, i) => (
                                        <li key={i} className="flex gap-3 bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Transcript Accordion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800">
                        <div
                            onClick={() => setShowTranscript(!showTranscript)}
                            className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Transcription complète</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Revoir les échanges de l'entretien</p>
                                </div>
                            </div>
                            {showTranscript ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </div>

                        {showTranscript && (
                            <div className="px-6 pb-6 pt-0 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30">
                                <div className="space-y-4 pt-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data.transcription && data.transcription.length > 0 ? (
                                        data.transcription.map((seg: any, i: number) => (
                                            <div key={i} className={cn("flex gap-3", seg.speaker === 'user' ? "flex-row-reverse" : "flex-row")}>
                                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                                                    seg.speaker === 'user' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300")}>
                                                    {seg.speaker === 'user' ? "Moi" : "IA"}
                                                </div>
                                                <div className={cn("p-3 rounded-2xl max-w-[80%] text-sm",
                                                    seg.speaker === 'user' ? "bg-emerald-50 dark:bg-emerald-900/20 text-slate-800 dark:text-slate-200 rounded-tr-sm" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-tl-sm")}>
                                                    {seg.text}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-slate-400 py-8 italic">Transcription non disponible.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
