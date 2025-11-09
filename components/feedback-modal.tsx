"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { MOCK_CRITERIA_DEFINITIONS } from "@/lib/feedback-constants";
import { formatDateLabel } from "@/lib/feedback-utils";

export interface FeedbackModalDetails {
  testName?: string;
  source?: string;
  score?: number | null;
  initialScore?: number | null;
  reviewScore?: number | null;
  finalScore?: number | null;
  feedback?: any;
  skills?: Array<{ name: string; score: number; maxScore: number }>;
  releasedAt?: string | Date | null;
  questions?: Array<{ id?: string; text?: string }>;
}

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  details?: FeedbackModalDetails | null;
}

const clampEvaluation = (text: string, expanded: boolean) => {
  if (!text) return "";
  if (expanded || text.length <= 420) return text;
  return `${text.slice(0, 420)}…`;
};

export const FeedbackModal = ({
  open,
  onOpenChange,
  isLoading = false,
  details,
}: FeedbackModalProps) => {
  const [showFullEvaluation, setShowFullEvaluation] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowFullEvaluation(false);
    }
  }, [open, details?.testName]);

  const feedback = details?.feedback;
  const releaseLabel = useMemo(
    () => formatDateLabel(details?.releasedAt),
    [details?.releasedAt]
  );

  const finalScoreValue =
    typeof details?.finalScore === "number"
      ? details.finalScore
      : typeof details?.score === "number"
      ? details.score
      : typeof feedback?.overallScore === "number"
      ? feedback.overallScore
      : null;
  const reviewScoreValue =
    typeof details?.reviewScore === "number"
      ? details.reviewScore
      : typeof feedback?.reviewScore === "number"
      ? feedback.reviewScore
      : null;
  const initialScoreValue =
    typeof details?.initialScore === "number"
      ? details.initialScore
      : typeof feedback?.initialScore === "number"
      ? feedback.initialScore
      : null;

  const criteriaEntries = useMemo(() => {
    if (!feedback?.criteriaScores) return [];
    return Object.entries(feedback.criteriaScores).map(([key, rawValue]) => {
      const def = MOCK_CRITERIA_DEFINITIONS[key] || { label: key, max: 20 };
      const numericValue =
        typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
      const ratio = def.max > 0 ? (numericValue / def.max) * 100 : 0;
      return {
        key,
        label: def.label,
        value: numericValue,
        max: def.max,
        ratio: Math.max(0, Math.min(ratio, 100)),
      };
    });
  }, [feedback?.criteriaScores]);

  const evaluationText = feedback?.evaluation || "";
  const displayedEvaluation = clampEvaluation(
    evaluationText,
    showFullEvaluation
  );
  const showEvaluationToggle = evaluationText.length > 420;

  const strengths: string[] = Array.isArray(feedback?.strengths)
    ? feedback.strengths
    : [];
  const weaknesses: string[] = Array.isArray(feedback?.weaknesses)
    ? feedback.weaknesses
    : [];

  const jobMatchPercentage =
    typeof feedback?.jobMatch?.percentage === "number"
      ? Math.max(0, Math.min(feedback.jobMatch.percentage, 100))
      : null;
  const jobMatchAnalysis =
    typeof feedback?.jobMatch?.analysis === "string"
      ? feedback.jobMatch.analysis
      : "";

  const recommendationList = Array.isArray(feedback?.recommendations)
    ? feedback.recommendations
    : null;
  const recommendationText =
    !recommendationList && typeof feedback?.recommendations === "string"
      ? feedback.recommendations
      : "";

  const skills =
    details?.skills?.filter(
      (skill) =>
        skill &&
        typeof skill.name === "string" &&
        typeof skill.score === "number" &&
        typeof skill.maxScore === "number"
    ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex flex-col">
        <DialogHeader className="shrink-0 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              {details?.testName
                ? `Feedback – ${details.testName}`
                : "Feedback de l'entretien"}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {releaseLabel && <span>Partagé le {releaseLabel}</span>}
              {details?.source && (
                <Badge variant="outline" className="text-xs capitalize">
                  Source : {details.source}
                </Badge>
              )}
            </div>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Analyse détaillée de la performance du candidat lors de la
              simulation d'entretien.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-4 py-10">
              <Skeleton className="h-5 w-48 mx-auto" />
              <Skeleton className="h-3 w-3/4 mx-auto" />
              <Skeleton className="h-3 w-2/3 mx-auto" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : feedback ? (
            <div className="space-y-6 py-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
                  <p className="text-xs font-medium uppercase text-blue-700 dark:text-blue-300">
                    Score global
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {Math.round(finalScoreValue ?? 0)}
                    /100
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/30">
                  <p className="text-xs font-medium uppercase text-emerald-700 dark:text-emerald-300">
                    Adéquation au poste
                  </p>
                  <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    {jobMatchPercentage ?? 0}%
                  </p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/30">
                  <p className="text-xs font-medium uppercase text-amber-700 dark:text-amber-300">
                    Communication
                  </p>
                  <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                    {feedback?.criteriaScores?.communication ?? 0}/20
                  </p>
                </div>
              </div>

              {(initialScoreValue !== null || reviewScoreValue !== null) && (
                <div className="grid gap-3 md:grid-cols-2">
                  {initialScoreValue !== null && (
                    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase text-slate-600 dark:text-slate-400">
                        Score test initial
                      </p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {Math.round(initialScoreValue)}/100
                      </p>
                    </div>
                  )}
                  {reviewScoreValue !== null && (
                    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase text-slate-600 dark:text-slate-400">
                        Score review
                      </p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {Math.round(reviewScoreValue)}/100
                      </p>
                    </div>
                  )}
                </div>
              )}

              {criteriaEntries.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {criteriaEntries.map((entry) => (
                    <div
                      key={entry.key}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
                    >
                      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{entry.label}</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-300">
                          {entry.value}/{entry.max}
                        </span>
                      </div>
                      <Progress
                        value={entry.ratio}
                        className="h-2 bg-slate-100 dark:bg-slate-700"
                      />
                    </div>
                  ))}
                </div>
              )}

              {skills.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Compétences techniques évaluées
                  </h5>
                  <div className="grid gap-3 md:grid-cols-2">
                    {skills.map((skill, index) => {
                      const ratio =
                        skill.maxScore > 0
                          ? Math.max(
                              0,
                              Math.min((skill.score / skill.maxScore) * 100, 100)
                            )
                          : 0;
                      return (
                        <div
                          key={`${skill.name}-${index}`}
                          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
                        >
                          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                            <span>{skill.name}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                              {Math.round(ratio)}%
                            </span>
                          </div>
                          <Progress
                            value={ratio}
                            className="h-2 bg-slate-100 dark:bg-slate-700"
                          />
                          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {skill.score}/{skill.maxScore}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {evaluationText && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 leading-relaxed dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="mb-2 flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Évaluation globale
                    </h5>
                    {showEvaluationToggle && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          setShowFullEvaluation((previous) => !previous)
                        }
                      >
                        {showFullEvaluation ? "Voir moins" : "Voir plus"}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {displayedEvaluation}
                  </p>
                </div>
              )}

              {jobMatchAnalysis && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    Analyse de l'adéquation au poste
                  </p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {jobMatchAnalysis}
                  </p>
                </div>
              )}

              {(strengths.length > 0 || weaknesses.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {strengths.length > 0 && (
                    <div>
                      <h6 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-300">
                        <TrendingUp className="h-4 w-4" />
                        Points forts
                      </h6>
                      <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        {strengths.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {weaknesses.length > 0 && (
                    <div>
                      <h6 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-4 w-4" />
                        Axes d'amélioration
                      </h6>
                      <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        {weaknesses.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {(recommendationList?.length ?? 0) > 0 || recommendationText ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Recommandations
                  </p>
                  {recommendationList?.length ? (
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      {recommendationList.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap">{recommendationText}</p>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2 py-12 text-center text-slate-600 dark:text-slate-400">
              <Sparkles className="mx-auto h-6 w-6 text-slate-400" />
              <p className="text-sm">Aucun feedback disponible pour cet entretien.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

