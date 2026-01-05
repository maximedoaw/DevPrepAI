"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Question {
    id: string;
    question: string;
    options?: string[];
    type?: string;
}

interface QuizViewProps {
    question: Question;
    answer: any;
    onAnswer: (answer: any) => void;
    currentIndex: number;
    totalQuestions: number;
    onNext: () => void;
    onPrevious: () => void;
    isSaving?: boolean;
}

export function QuizView({
    question,
    answer,
    onAnswer,
    currentIndex,
    totalQuestions,
    onNext,
    onPrevious,
    isSaving = false,
}: QuizViewProps) {
    // Convertir l'index alphanumérique (A, B, C...) en index numérique si nécessaire
    const getOptionLabel = (index: number) => {
        return String.fromCharCode(65 + index); // A, B, C...
    };

    const handleOptionSelect = (option: string, index: number) => {
        // On sauvegarde l'index si validation attend un nombre, ou le texte si validation attend un texte.
        // Pour l'uniformité, sauvegardons l'index, mais l'API peut attendre le texte.
        // Basé sur le code existant qui attend souvent l'index :
        onAnswer(index);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Progress Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Question {currentIndex + 1}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {totalQuestions} questions
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    {/* Question Card */}
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                            {question.question}
                        </h2>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                        {question.options?.map((option, index) => {
                            const isSelected = answer === index;
                            return (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => handleOptionSelect(option, index)}
                                    className={cn(
                                        "relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group flex items-center gap-5",
                                        isSelected
                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm"
                                            : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 border",
                                            isSelected
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 group-hover:border-emerald-300 dark:group-hover:border-emerald-700 group-hover:text-emerald-600"
                                        )}
                                    >
                                        {getOptionLabel(index)}
                                    </div>
                                    <div className="flex-1">
                                        <span
                                            className={cn(
                                                "text-lg font-medium transition-colors",
                                                isSelected
                                                    ? "text-emerald-900 dark:text-emerald-100"
                                                    : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                                            )}
                                        >
                                            {option}
                                        </span>
                                    </div>
                                    <div className="w-6 flex justify-center">
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            >
                                                <Check className="w-6 h-6 text-emerald-500" />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-800/50 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={onPrevious}
                        disabled={currentIndex === 0 || isSaving}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Précédent
                    </Button>

                    <Button
                        onClick={onNext}
                        disabled={isSaving}
                        className={cn(
                            "px-8 rounded-full shadow-lg shadow-emerald-500/20 transition-all",
                            isSaving
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105"
                        )}
                    >
                        {currentIndex === totalQuestions - 1 ? "Terminer" : "Suivant"}
                        {!isSaving && <ChevronRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </div>

            {/* Spacer for fixed footer */}
            <div className="h-24" />
        </div>
    );
}
