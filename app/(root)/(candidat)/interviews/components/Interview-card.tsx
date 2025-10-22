"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Crown, Play } from "lucide-react";

type QuizItem = {
  id: string;
  title: string;
  description?: string | null;
  type: "QCM" | "TECHNICAL" | "MOCK_INTERVIEW" | "SOFT_SKILLS";
  difficulty: "JUNIOR" | "MID" | "SENIOR";
  company: string;
  technology: string[];
  duration: number;
  totalPoints: number;
};

export default function InterviewCard({
  quiz,
  gradient,
  onStart,
}: {
  quiz: QuizItem;
  gradient: string;
  onStart: (id: string) => void;
}) {
  return (
    <Card
      className="group relative overflow-hidden border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300`}
          >
            <span className="text-xs font-bold uppercase">{quiz.type}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="text-xs font-semibold shadow-sm">
              {quiz.difficulty}
            </Badge>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              <Crown className="w-3 h-3" />
              <span className="text-xs font-bold">{quiz.totalPoints} points</span>
            </div>
          </div>
        </div>

        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 line-clamp-2">
          {quiz.title}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed line-clamp-2">
          {quiz.description || "Préparez-vous avec une session ciblée."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 relative">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{Math.round((quiz.duration || 0) / 60)} min</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="text-xs uppercase font-semibold">{quiz.company || "DevPrepAI"}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(quiz.technology || []).slice(0, 3).map((tech, idx) => (
            <Badge key={idx} variant="outline" className="text-xs font-medium">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="relative">
        <Button
          className={`w-full h-11 bg-gradient-to-r ${gradient} hover:shadow-lg text-white font-bold text-sm group-hover:scale-[1.02] transition-all`}
          onClick={() => onStart(quiz.id)}
        >
          <Play className="w-4 h-4 mr-2" />
          Démarrer la Session
        </Button>
      </CardFooter>
    </Card>
  );
}


