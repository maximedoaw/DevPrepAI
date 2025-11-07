"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Star,
  FileText,
  ChevronRight,
  Building,
  Briefcase,
  Download,
  Eye,
  MessageSquare,
  Users,
  ArrowLeft,
  Clock,
  Plus,
  TrendingUp,
  FileCheck,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  FileText as FileTextIcon,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Edit,
  Save,
  X,
  Code,
  AlertTriangle,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserJobQueries, useApplicationQueries } from "@/hooks/use-job-queries";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApplicationQuizResults, getQuizResultForReview, saveQuizResultReview } from "@/actions/jobInterview.action";
import { updateApplicationReview } from "@/actions/application.action";
import { getUserQuizResults } from "@/actions/interview.action";
import { getPortfolioById, getPortfolioByUserId } from "@/actions/portfolio.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
type ApplicationStatus = "pending" | "reviewed" | "interview" | "accepted" | "rejected";
type TestStatus = "not_started" | "in_progress" | "completed" | "expired";

interface TestResult {
  id: string;
  testName: string;
  quizType?: string;
  score: number;
  maxScore: number;
  status: TestStatus;
  completedAt?: string;
  duration: number;
  skills: {
    name: string;
    score: number;
    maxScore: number;
  }[];
  aiFeedback?: string;
  improvementTips?: string[];
  videoUrl?: string;
  imageUrls?: string[];
  answers?: any;
  technology?: string[];
  domain?: string;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  resumeUrl: string;
  experience: string;
  education: string;
  skills: string[];
}

interface Application {
  id: string;
  candidate: Candidate;
  status: ApplicationStatus;
  coverLetter?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  testResults: TestResult[];
  notes?: string;
  appliedAt: string;
  lastUpdated: string;
  score?: number | null;
}

interface JobOffer {
  id: string;
  title: string;
  companyName: string;
  location: string;
  type: string;
  applications: Application[];
  totalApplications: number;
  newApplications: number;
  createdAt?: string;
  skills?: string[]; // Compétences techniques demandées pour le poste
}

// Fonctions de mapping avec vérifications de sécurité
const mapStatusToUI = (status: string): ApplicationStatus => {
  const statusMap: Record<string, ApplicationStatus> = {
    'pending': 'pending',
    'reviewed': 'reviewed',
    'reviewing': 'reviewed', // REVIEWING de Prisma correspond à 'reviewed' en UI
    'interview': 'interview',
    'interviewing': 'interview', // INTERVIEWING de Prisma correspond à 'interview' en UI
    'accepted': 'accepted',
    'hired': 'accepted', // HIRED de Prisma correspond à 'accepted' en UI
    'rejected': 'rejected',
    'PENDING': 'pending',
    'REVIEWING': 'reviewed', // REVIEWING de Prisma correspond à 'reviewed' en UI
    'INTERVIEWING': 'interview', // INTERVIEWING de Prisma correspond à 'interview' en UI
    'HIRED': 'accepted', // HIRED de Prisma correspond à 'accepted' en UI
    'REJECTED': 'rejected',
    'REVIEWED': 'reviewed', // Pour compatibilité si jamais utilisé
    'INTERVIEW': 'interview', // Pour compatibilité si jamais utilisé
    'ACCEPTED': 'accepted' // Pour compatibilité si jamais utilisé
  };
  return statusMap[status] || 'pending';
};

const calculateNewApplications = (applications: any[]): number => {
  if (!applications || !Array.isArray(applications)) return 0;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return applications.filter(app => app?.createdAt && new Date(app.createdAt) > oneWeekAgo).length;
};

const mapApplicationToUI = (app: any): Application => {
  if (!app) {
    return createDefaultApplication();
  }

  const user = app.user || {};
  
  return {
    id: app.id || `app-${Date.now()}`,
    candidate: {
      id: user.id || `user-${Date.now()}`,
      firstName: user.firstName || "Prénom",
      lastName: user.lastName || "Nom",
      email: user.email || "email@exemple.com",
      phone: user.phone,
      location: user.location,
      avatar: user.avatar,
      resumeUrl: app.resumeUrl || user.resumeUrl || "/cv/default.pdf",
      experience: user.experience || "Non spécifié",
      education: user.education || "Non spécifié",
      skills: user.skills || []
    },
    status: mapStatusToUI(app.status || 'pending'),
    coverLetter: app.coverLetter,
    portfolioUrl: app.portfolioUrl,
    resumeUrl: app.resumeUrl || user.resumeUrl || "/cv/default.pdf",
    appliedAt: app.createdAt || new Date().toISOString(),
    lastUpdated: app.updatedAt || new Date().toISOString(),
    testResults: app.testResults || [],
    score: app.score ?? null
  };
};

const createDefaultApplication = (): Application => ({
  id: `default-app-${Date.now()}`,
  candidate: {
    id: `default-candidate-${Date.now()}`,
    firstName: "Candidat",
    lastName: "Non disponible",
    email: "non-disponible@exemple.com",
    resumeUrl: "/cv/default.pdf",
    experience: "Non spécifié",
    education: "Non spécifié",
    skills: []
  },
  status: "pending",
  appliedAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  testResults: []
});

const mapJobToJobOffer = (job: any): JobOffer => {
  if (!job) {
    return createDefaultJobOffer();
  }

  const applications = job.applications || [];
  const validApplications = applications.filter((app: any) => app && app.user);
  const uiApplications = validApplications.map(mapApplicationToUI);
  
  return {
    id: job.id || `job-${Date.now()}`,
    title: job.title || "Titre non disponible",
    companyName: job.companyName || "Entreprise non disponible",
    location: job.location || "Non spécifié",
    type: job.type || "CDI",
    applications: uiApplications,
    totalApplications: validApplications.length,
    newApplications: calculateNewApplications(validApplications),
    createdAt: job.createdAt,
    skills: job.skills || [] // Ajouter les compétences techniques
  };
};

const createDefaultJobOffer = (): JobOffer => ({
  id: `default-job-${Date.now()}`,
  title: "Poste non disponible",
  companyName: "Entreprise non disponible",
  location: "Non spécifié",
  type: "CDI",
  applications: [],
  totalApplications: 0,
  newApplications: 0,
  skills: []
});

// Composants Skeleton améliorés
const JobCardSkeleton = () => (
  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-lg" />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </CardContent>
  </Card>
);

const ApplicationCardSkeleton = () => (
  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Skeleton className="h-4 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CandidateDetailSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-3">
    <div className="lg:col-span-1 space-y-6">
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-7 w-40 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <div className="lg:col-span-2 space-y-6">
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="text-center sm:text-right space-y-1">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="p-6">
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Composant Modal de Review pour QCM et TECHNICAL
interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizResult: any;
  reviewedAnswers: any[];
  setReviewedAnswers: (answers: any[]) => void;
  reviewedScore: number;
  setReviewedScore: (score: number) => void;
  reviewerNotes: string;
  setReviewerNotes: (notes: string) => void;
  manualCorrections: Record<string, { isValid: boolean; points: number; note?: string }>;
  setManualCorrections: (corrections: Record<string, { isValid: boolean; points: number; note?: string }>) => void;
  onSave: () => void;
  isLoading: boolean;
  calculateScore: () => number;
}

const ReviewModal = ({
  open,
  onOpenChange,
  quizResult,
  reviewedAnswers,
  setReviewedAnswers,
  reviewedScore,
  setReviewedScore,
  reviewerNotes,
  setReviewerNotes,
  manualCorrections,
  setManualCorrections,
  onSave,
  isLoading,
  calculateScore
}: ReviewModalProps) => {
  if (!quizResult) return null;

  const questions = Array.isArray(quizResult.questions) ? quizResult.questions : [];
  const quizType = quizResult.quizType;

  const handleToggleAnswer = (questionId: string, questionIndex: number) => {
    const question = questions[questionIndex];
    const currentCorrection = manualCorrections[questionId];
    const isCurrentlyValid = currentCorrection?.isValid ?? reviewedAnswers[questionIndex]?.isCorrect ?? false;
    
    const newCorrections = {
      ...manualCorrections,
      [questionId]: {
        isValid: !isCurrentlyValid,
        points: !isCurrentlyValid ? (question.points || 0) : 0,
        note: currentCorrection?.note || ""
      }
    };
    
    setManualCorrections(newCorrections);
    
    // Mettre à jour le score recalculé
    const newScore = calculateScore();
    setReviewedScore(newScore);
  };

  const handlePointsChange = (questionId: string, points: number) => {
    const currentCorrection = manualCorrections[questionId] || { isValid: true, points: 0 };
    setManualCorrections({
      ...manualCorrections,
      [questionId]: {
        ...currentCorrection,
        points: Math.max(0, Math.min(points, questions.find((q: any) => (q.id || questions.indexOf(q).toString()) === questionId)?.points || 100))
      }
    });
    
    const newScore = calculateScore();
    setReviewedScore(newScore);
  };

  const handleNoteChange = (questionId: string, note: string) => {
    const currentCorrection = manualCorrections[questionId] || { isValid: true, points: 0 };
    setManualCorrections({
      ...manualCorrections,
      [questionId]: {
        ...currentCorrection,
        note
      }
    });
  };

  const calculatedScore = calculateScore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Révision du test : {quizResult.quizTitle}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Réviser manuellement les réponses du candidat et ajuster les scores si nécessaire
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Summary */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Score original</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{quizResult.originalScore}/{quizResult.totalPoints}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Score révisé</p>
                <p className={`text-2xl font-bold ${
                  calculatedScore >= quizResult.originalScore 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {calculatedScore}/{quizResult.totalPoints}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Différence</p>
                <p className={`text-2xl font-bold ${
                  calculatedScore - quizResult.originalScore >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {calculatedScore - quizResult.originalScore >= 0 ? '+' : ''}{calculatedScore - quizResult.originalScore}
                </p>
              </div>
            </div>
          </div>

          {/* Questions et Réponses */}
          <div className="space-y-4">
            {questions.map((question: any, index: number) => {
              const questionId = question.id || index.toString();
              const answer = reviewedAnswers.find((a: any) => a.questionId === questionId || a.questionId === question.id) || reviewedAnswers[index];
              const correction = manualCorrections[questionId];
              const isValid = correction ? correction.isValid : (answer?.isCorrect ?? false);
              const points = correction ? correction.points : (isValid ? (question.points || 0) : 0);

              return (
                <div 
                  key={questionId} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isValid 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-white dark:bg-slate-800">
                          Question {index + 1}
              </Badge>
                        <Badge variant="outline" className="bg-white dark:bg-slate-800">
                          {question.points || 0} point{question.points !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white mb-3">
                        {question.question || question.text}
                      </p>
                    </div>
                  </div>

                  {/* Affichage selon le type de quiz */}
                  {quizType === 'QCM' && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Réponse du candidat :</p>
                      <div className="space-y-2">
                        {question.options?.map((option: string, optIndex: number) => {
                          const isSelected = answer?.selectedAnswer === optIndex || (typeof answer?.selectedAnswer === 'number' && answer.selectedAnswer === optIndex);
                          const isCorrect = question.correctAnswer === optIndex || question.correctAnswer === optIndex.toString();
                          return (
                            <div
                              key={optIndex}
                              className={cn(
                                "p-3 rounded-lg border transition-all",
                                isSelected && isCorrect
                                  ? "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700"
                                  : isSelected && !isCorrect
                                  ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700"
                                  : isCorrect
                                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "font-bold",
                                  isSelected ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                                )}>
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <span className={cn(
                                  isSelected ? "font-medium text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                                )}>
                                  {option}
                                </span>
                                {isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />
                                )}
                                {isSelected && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 ml-auto" />
            )}
          </div>
        </div>
                          );
                        })}
        </div>
      </div>
                  )}

                  {quizType === 'TECHNICAL' && (
                    <div className="space-y-3 mb-4">
                      {answer?.videoUrl ? (
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Vidéo de présentation :</p>
                          <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-lg border border-slate-700">
                            <video
                              src={answer.videoUrl}
                              controls
                              className="w-full rounded-lg max-h-[400px]"
                              preload="metadata"
                            >
                              Votre navigateur ne supporte pas la lecture de vidéos.
                            </video>
                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                              <Video className="w-3 h-3" />
                              <span>Vidéo hébergée sur Uploadcare</span>
                            </div>
                          </div>
                        </div>
                      ) : answer?.imageUrls && Array.isArray(answer.imageUrls) && answer.imageUrls.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Catalogue d'images ({answer.imageUrls.length}) :</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {answer.imageUrls.map((url: string, imgIdx: number) => (
                              <div key={imgIdx} className="relative group">
                                <img
                                  src={url}
                                  alt={`Preuve ${imgIdx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(url, '_blank')}
                                />
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                  {imgIdx + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                            <FileTextIcon className="w-3 h-3" />
                            <span>Images hébergées sur Uploadcare</span>
                          </div>
                        </div>
                      ) : answer?.answer && answer.type === 'technical_text' ? (
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Réponse textuelle :</p>
                          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {answer.answer}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Code soumis :</p>
                          <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-lg border border-slate-700">
                            <pre className="text-green-400 dark:text-green-300 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                              {answer?.code || answer?.answer || "Aucun code soumis"}
                            </pre>
                          </div>
                        </div>
                      )}
                      {question.codeSnippet && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contexte fourni :</p>
                          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-300 dark:border-slate-700">
                            <pre className="text-slate-700 dark:text-slate-300 text-sm font-mono whitespace-pre-wrap">
                              {question.codeSnippet}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contrôles de review */}
                  <div className="flex items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant={isValid ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleAnswer(questionId, index)}
                      className={cn(
                        isValid 
                          ? "bg-green-600 hover:bg-green-700 text-white" 
                          : "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
                      )}
                    >
                      {isValid ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Validée
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Invalidée
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`points-${questionId}`} className="text-sm text-slate-600 dark:text-slate-400">
                        Points :
                      </Label>
                      <Input
                        id={`points-${questionId}`}
                        type="number"
                        min={0}
                        max={question.points || 100}
                        value={points}
                        onChange={(e) => handlePointsChange(questionId, parseInt(e.target.value) || 0)}
                        className="w-20 h-9"
                      />
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        / {question.points || 0}
                      </span>
                    </div>
                  </div>

                  {/* Note pour cette question */}
                  <div className="mt-3">
                    <Textarea
                      placeholder="Note optionnelle pour cette question..."
                      value={correction?.note || ""}
                      onChange={(e) => handleNoteChange(questionId, e.target.value)}
                      className="min-h-20 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes générales */}
          <div className="space-y-2">
            <Label htmlFor="reviewer-notes" className="text-base font-semibold text-slate-900 dark:text-white">
              Notes générales de révision
            </Label>
            <Textarea
              id="reviewer-notes"
              placeholder="Ajoutez vos notes générales sur la performance du candidat..."
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              className="min-h-32 bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={onSave} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder la révision
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ApplicationsTab = () => {
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"jobs" | "candidates" | "results">("jobs");

  const { user } = useKindeBrowserClient();
  const { jobs: userJobs, loadingJobs } = useUserJobQueries(user?.id);
  const { useJobApplications } = useApplicationQueries();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // États pour la review
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingQuizResult, setReviewingQuizResult] = useState<any>(null);
  const [reviewedAnswers, setReviewedAnswers] = useState<any[]>([]);
  const [reviewedScore, setReviewedScore] = useState<number>(0);
  const [reviewerNotes, setReviewerNotes] = useState<string>("");
  const [manualCorrections, setManualCorrections] = useState<Record<string, { isValid: boolean; points: number; note?: string }>>({});
  const [reviewingSkillIndex, setReviewingSkillIndex] = useState<number | null>(null);
  const [skillReviewNotes, setSkillReviewNotes] = useState<Record<number, string>>({});
  const [skillReviewScores, setSkillReviewScores] = useState<Record<number, number>>({});
  const [applicationReviewScore, setApplicationReviewScore] = useState<number | null>(null);
  const [applicationReviewStatus, setApplicationReviewStatus] = useState<string>("pending");
  // États pour l'évaluation sémantique des tests TECHNICAL
  const [semanticEvaluations, setSemanticEvaluations] = useState<Record<string, any>>({});
  const [loadingSemanticEvaluation, setLoadingSemanticEvaluation] = useState<Record<string, boolean>>({});
  // États pour l'évaluation des MOCK_INTERVIEW
  const [mockInterviewEvaluations, setMockInterviewEvaluations] = useState<Record<string, any>>({});
  const [loadingMockInterviewEvaluation, setLoadingMockInterviewEvaluation] = useState<Record<string, boolean>>({});
  
  // Récupérer les applications détaillées pour le job sélectionné avec realtime
  const { data: jobApplications, isLoading: loadingJobApplications, refetch: refetchJobApplications } = useJobApplications(selectedJob?.id || "");
  
  // Récupérer les résultats de quiz pour l'application sélectionnée - avec staleTime pour éviter les rafraîchissements constants
  const { data: quizResultsData, isLoading: loadingQuizResults } = useQuery({
    queryKey: ["application-quiz-results", selectedApplication?.id, selectedJob?.id],
    queryFn: () => getApplicationQuizResults(selectedApplication?.id || "", selectedJob?.id || ""),
    enabled: !!selectedApplication?.id && !!selectedJob?.id,
    refetchOnWindowFocus: false, // Désactiver le rafraîchissement au focus pour améliorer l'UX
    refetchOnReconnect: false, // Désactiver le rafraîchissement à la reconnexion
    staleTime: 60000, // Considérer les données fraîches pendant 60 secondes
    gcTime: 300000, // Garder les données en cache pendant 5 minutes
  });
  
  // Récupérer les résultats de Quiz (entrainements) du candidat
  const { data: trainingQuizResults, isLoading: loadingTrainingResults } = useQuery({
    queryKey: ["user-quiz-results", selectedApplication?.candidate?.id],
    queryFn: () => getUserQuizResults(selectedApplication?.candidate?.id || ""),
    enabled: !!selectedApplication?.candidate?.id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60000,
    gcTime: 300000,
  });

  // Récupérer le portfolio du candidat
  const { data: candidatePortfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["candidate-portfolio", selectedApplication?.candidate?.id, selectedApplication?.portfolioUrl],
    queryFn: async () => {
      if (!selectedApplication?.candidate?.id) return null;
      
      // Méthode 1: Si portfolioUrl est directement dans l'application avec l'ID du portfolio
      if (selectedApplication.portfolioUrl) {
        // Extraire l'ID du portfolio depuis l'URL (format: /portfolio/[id])
        const portfolioId = selectedApplication.portfolioUrl.split('/portfolio/')[1]?.split('?')[0];
        if (portfolioId && portfolioId.length > 0) {
          const portfolio = await getPortfolioById(portfolioId);
          if (portfolio) return portfolio;
        }
      }
      
      // Méthode 2: Récupérer directement depuis l'ID du candidat
      // Utiliser getPortfolioByUserId avec l'ID du candidat
      if (selectedApplication.candidate.id) {
        return await getPortfolioByUserId(selectedApplication.candidate.id);
      }
      
      return null;
    },
    enabled: !!selectedApplication?.candidate?.id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60000,
  });

  // Combiner les résultats de JobQuiz et Quiz (entrainements)
  const allQuizResults = useMemo(() => {
    const jobResults = quizResultsData?.data || [];
    const trainingResults = trainingQuizResults || [];
    
    // Combiner les deux types de résultats avec un identifiant de type
    return [
      ...jobResults.map((qr: any) => ({ ...qr, source: 'job', isJobQuiz: true })),
      ...trainingResults.map((qr: any) => ({ ...qr, source: 'training', isJobQuiz: false }))
    ];
  }, [quizResultsData?.data, trainingQuizResults]);

  const quizResults = allQuizResults;

  // Transformer les jobs de l'utilisateur en format UI
  const jobOffers = useMemo(() => {
    if (!userJobs || !Array.isArray(userJobs)) return [];
    
    return userJobs
      .filter(job => job && job.id)
      .map(job => {
        const mappedJob = mapJobToJobOffer(job);
        // S'assurer que totalApplications est bien défini depuis les applications du job
        // Si le job a déjà des applications incluses, les utiliser
        if (job.applications && Array.isArray(job.applications) && job.applications.length > 0) {
          const validApplications = job.applications.filter((app: any) => app && app.user);
          mappedJob.totalApplications = validApplications.length;
          mappedJob.applications = validApplications.map(mapApplicationToUI);
          mappedJob.newApplications = calculateNewApplications(validApplications);
        }
        return mappedJob;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [userJobs]);

  // Mettre à jour les applications du job sélectionné quand les données arrivent
  useEffect(() => {
    if (selectedJob && jobApplications && Array.isArray(jobApplications)) {
      const updatedJob = {
        ...selectedJob,
        applications: jobApplications.map(app => {
          const mappedApp = mapApplicationToUI(app);
          // Les résultats de quiz seront récupérés séparément pour chaque application
          return mappedApp;
        }),
        totalApplications: jobApplications.length, // Utiliser la longueur réelle du tableau
        newApplications: calculateNewApplications(jobApplications)
      };
      setSelectedJob(updatedJob);
    }
  }, [jobApplications, selectedJob?.id]); // Ajouter selectedJob?.id pour éviter les mises à jour inutiles

  // Calculer les statistiques globales
  const stats = useMemo(() => {
    const totalJobs = jobOffers.length;
    const totalApplications = jobOffers.reduce((sum, job) => sum + job.totalApplications, 0);
    const totalNewApplications = jobOffers.reduce((sum, job) => sum + job.newApplications, 0);
    const interviewApplications = jobOffers.reduce((sum, job) => 
      sum + job.applications.filter(app => app.status === 'interview').length, 0
    );

    return {
      totalJobs,
      totalApplications,
      totalNewApplications,
      interviewApplications
    };
  }, [jobOffers]);

  // Navigation handlers
  const handleJobSelect = (job: JobOffer) => {
    if (!job) return;
    setSelectedJob(job);
    setSelectedApplication(null);
    setViewMode("candidates");
  };

  const handleApplicationSelect = (application: Application) => {
    if (!application) return;
    setSelectedApplication(application);
    setViewMode("results");
  };

  const handleBackToJobs = () => {
    setSelectedJob(null);
    setSelectedApplication(null);
    setViewMode("jobs");
  };

  const handleBackToCandidates = () => {
    setSelectedApplication(null);
    setViewMode("candidates");
  };

  const handleScheduleInterview = (candidate: Candidate, job: JobOffer) => {
    console.log("Planifier entretien pour:", candidate.firstName, candidate.lastName, "pour le poste:", job.title);
    // Implémentation réelle à ajouter ici
  };

  // Filtrage des candidatures avec vérifications de sécurité
  const filteredApplications = useMemo(() => {
    if (!selectedJob || !Array.isArray(selectedJob.applications)) return [];
    
    return selectedJob.applications.filter(app => {
      if (!app || !app.candidate) return false;
      
      const matchesSearch = 
        searchTerm === "" ||
        (app.candidate.firstName && app.candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.candidate.lastName && app.candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.candidate.email && app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (Array.isArray(app.candidate.skills) && app.candidate.skills.some(skill => 
          skill && skill.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      const matchesStatus = 
        statusFilter === "all" || 
        app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [selectedJob, searchTerm, statusFilter]);

  // Fonctions utilitaires
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "reviewed":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "interview":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "accepted":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800";
      case "rejected":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-800/20 dark:text-slate-300 border-slate-200 dark:border-slate-800";
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case "pending": return "En attente";
      case "reviewed": return "Consultée";
      case "interview": return "Entretien";
      case "accepted": return "Acceptée";
      case "rejected": return "Rejetée";
      default: return status;
    }
  };

  const formatDomainLabel = (domain?: string | null) => {
    if (!domain) return "Domaine";
    return domain
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/(^|\s)\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "Date invalide";
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  // Composant Breadcrumb amélioré pour la navigation
  const Breadcrumb = () => (
    <nav className="flex items-center gap-2 mb-8 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToJobs}
        className="flex items-center gap-2 h-9 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
      >
        <Briefcase className="w-4 h-4" />
        <span className="font-medium">Postes</span>
      </Button>
      
      {selectedJob && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToCandidates}
            className="flex items-center gap-2 h-9 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            <span className="font-medium max-w-[200px] truncate">{selectedJob.title}</span>
          </Button>
        </>
      )}
      
      {selectedApplication && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 h-9 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="font-medium max-w-[150px] truncate">
              {selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName}
            </span>
          </Button>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="flex items-center gap-2 px-4 text-slate-900 dark:text-white font-semibold text-sm">
            <FileTextIcon className="w-4 h-4" />
            Résultats & Portfolio
          </span>
        </>
      )}
    </nav>
  );

  // Vue : Liste des postes avec statistiques
  const JobsView = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Candidatures
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Gérez et suivez les candidatures pour vos offres d'emploi
        </p>
      </div>


      {loadingJobs ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {jobOffers.map((job) => (
              <Card 
                key={job.id} 
                className="group cursor-pointer bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                onClick={() => handleJobSelect(job)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {job.companyName}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0">
                      {job.type}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-slate-900 dark:text-white">{job.totalApplications}</span>
                        <span className="text-slate-500">candidatures</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Voir les candidatures
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {jobOffers.length === 0 && !loadingJobs && (
        <Card className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
          <CardContent>
            <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Aucun poste créé
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              Vous n'avez pas encore créé d'offres d'emploi. Commencez par créer votre première offre pour recevoir des candidatures.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Vue : Liste des candidatures pour un poste
  const CandidatesView = () => {
    if (loadingJobApplications) {
      return (
        <div className="space-y-8">
          <Breadcrumb />
          
          {/* En-tête Skeleton */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>

          {/* Barre de filtres Skeleton */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[180px]" />
              </div>
            </CardContent>
          </Card>

          {/* Liste des candidatures Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <ApplicationCardSkeleton key={i} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <Breadcrumb />

        {/* En-tête */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {selectedJob?.title}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {selectedJob?.companyName} • {selectedJob?.applications.length} candidature(s)
            </p>
          </div>
        </div>

        {/* Barre de filtres */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher un candidat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="reviewed">Consultée</SelectItem>
                      <SelectItem value="interview">Entretien</SelectItem>
                      <SelectItem value="accepted">Acceptée</SelectItem>
                      <SelectItem value="rejected">Rejetée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des candidatures */}
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card 
              key={application.id} 
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-lg cursor-pointer group transition-all duration-200"
              onClick={() => handleApplicationSelect(application)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Avatar et informations principales */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 group-hover:border-green-200 dark:group-hover:border-green-800 transition-colors">
                      <AvatarImage src={application.candidate.avatar} />
                      <AvatarFallback className="text-sm font-medium bg-slate-100 dark:bg-slate-800">
                        {application.candidate.firstName?.[0]}{application.candidate.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate">
                          {application.candidate.firstName} {application.candidate.lastName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(application.status)} border`}>
                            {getStatusText(application.status)}
                          </Badge>
                          {application.testResults.length > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 text-amber-500" />
                              <span className={getScoreColor(
                                application.testResults[0].score,
                                application.testResults[0].maxScore
                              )}>
                                {application.testResults[0].score}/{application.testResults[0].maxScore}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{application.candidate.email}</span>
                        </div>
                        {application.candidate.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{application.candidate.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(application.appliedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(application.candidate.resumeUrl, '_blank');
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedJob) {
                          handleScheduleInterview(application.candidate, selectedJob);
                        }
                      }}
                    >
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all ml-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <Card className="text-center py-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
            <CardContent>
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Aucun test complété
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Ce candidat n&apos;a pas encore complété de test technique pour ce poste.
              </p>
              <Button variant="outline" className="rounded-lg">
                Assigner un test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // État pour la simulation d'évaluation IA des compétences
  const [isEvaluatingSkills, setIsEvaluatingSkills] = useState(false);
  const [evaluatedSkills, setEvaluatedSkills] = useState<Record<string, { score: number; maxScore: number; mastery: string }>>({});

  // Fonction pour simuler l'évaluation IA des compétences techniques du poste
  // IMPORTANT: Utilise SEULEMENT les résultats des tests techniques liés au poste (JobQuizResults)
  const simulateSkillEvaluation = useMemo(() => {
    if (!selectedJob || !selectedApplication || loadingQuizResults) return null;
    
    // Récupérer les compétences techniques demandées pour le poste
    const jobFromUserJobs = userJobs?.find(j => j.id === selectedJob.id);
    const jobSkills = selectedJob.skills || jobFromUserJobs?.skills || [];
    
    if (jobSkills.length === 0) return null;

    // Utiliser SEULEMENT les JobQuizResults (tests techniques du poste) pour les progress bars
    const jobResultsOnly = quizResultsData?.data || [];
    
    // Calculer les stats basées sur les résultats de quiz (UNIQUEMENT les tests du poste)
    const skillStats: Record<string, { totalPoints: number; earnedPoints: number; maxPoints: number }> = {};
    
    // Parcourir SEULEMENT les résultats de JobQuiz
    jobResultsOnly.forEach((qr: any) => {
      if (qr.skills && Array.isArray(qr.skills)) {
        qr.skills.forEach((skill: any) => {
          const skillName = skill.name || skill.skill || '';
          if (jobSkills.some((js: string) => js.toLowerCase().includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(js.toLowerCase()))) {
            if (!skillStats[skillName]) {
              skillStats[skillName] = { totalPoints: 0, earnedPoints: 0, maxPoints: 0 };
            }
            skillStats[skillName].earnedPoints += skill.score || 0;
            skillStats[skillName].maxPoints += skill.maxScore || 100;
            skillStats[skillName].totalPoints += skill.maxScore || 100;
          }
        });
      }
    });

    // Pour les compétences du job sans résultats de quiz, estimer basé sur le score global (des tests du poste uniquement)
    const globalScore = jobResultsOnly.length > 0 
      ? jobResultsOnly.reduce((sum: number, qr: any) => sum + (qr.percentage || ((qr.score / qr.totalPoints) * 100) || 0), 0) / jobResultsOnly.length 
      : 0;

    return jobSkills.map((skill: string) => {
      if (skillStats[skill]) {
        const percentage = (skillStats[skill].earnedPoints / skillStats[skill].maxPoints) * 100;
        return {
          name: skill,
          score: Math.round(skillStats[skill].earnedPoints),
          maxScore: skillStats[skill].maxPoints,
          percentage: Math.round(percentage),
          mastery: percentage >= 80 ? 'Expert' : percentage >= 60 ? 'Intermédiaire' : percentage >= 40 ? 'Débutant' : 'Novice'
        };
      } else {
        // Estimation basée sur le score global
        const estimatedScore = Math.round((globalScore / 100) * 100);
        return {
          name: skill,
          score: estimatedScore,
          maxScore: 100,
          percentage: estimatedScore,
          mastery: estimatedScore >= 80 ? 'Expert' : estimatedScore >= 60 ? 'Intermédiaire' : estimatedScore >= 40 ? 'Débutant' : 'Novice'
        };
      }
    });
  }, [selectedJob, selectedApplication, quizResultsData?.data, loadingQuizResults, userJobs]);

  // Simuler le chargement de l'évaluation IA - Utiliser un ref pour éviter les re-déclenchements
  const hasEvaluatedRef = useRef<Record<string, boolean>>({});
  
  useEffect(() => {
    const evaluationKey = `${selectedApplication?.id}-${selectedJob?.id}`;
    
    // Ne faire l'évaluation qu'une seule fois par combinaison application/job
    if (selectedApplication && selectedJob && !loadingQuizResults && !hasEvaluatedRef.current[evaluationKey]) {
      setIsEvaluatingSkills(true);
      hasEvaluatedRef.current[evaluationKey] = true;
      
      const timer = setTimeout(() => {
        setIsEvaluatingSkills(false);
        if (simulateSkillEvaluation) {
          const skillsMap: Record<string, { score: number; maxScore: number; mastery: string }> = {};
          simulateSkillEvaluation.forEach((skill: any) => {
            skillsMap[skill.name] = {
              score: skill.score,
              maxScore: skill.maxScore,
              mastery: skill.mastery
            };
          });
          setEvaluatedSkills(skillsMap);
        }
      }, 2000); // Simulation de 2 secondes
      
      return () => clearTimeout(timer);
    } else if (!selectedApplication || !selectedJob) {
      // Réinitialiser le flag quand on change d'application/job
      hasEvaluatedRef.current = {};
    }
  }, [selectedApplication?.id, selectedJob?.id, loadingQuizResults]); // Retirer simulateSkillEvaluation des dépendances

  // Vue : Détails d'une candidature avec résultats
  const ResultsView = () => {
    const router = useRouter();
    const [conversationDialog, setConversationDialog] = useState<{
      testId: string;
      testName: string;
      messages: Array<{ id: string; author: 'ai' | 'user'; content: string; timestamp?: Date }>;
      feedback?: any;
      callDuration?: number;
      technologies: string[];
    } | null>(null);
    const [isConversationDialogOpen, setIsConversationDialogOpen] = useState(false);

    const formatCallDuration = (seconds?: number) => {
      if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
        return "—";
      }
      const totalSeconds = Math.max(0, Math.round(seconds));
      const minutes = Math.floor(totalSeconds / 60);
      const remainingSeconds = totalSeconds % 60;
      if (minutes === 0) {
        return `${remainingSeconds}s`;
      }
      return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    };
    
    // Calculer les statistiques des tests
    const testStatistics = useMemo(() => {
      if (!quizResults || quizResults.length === 0) {
        return {
          totalTests: 0,
          averageScore: 0,
          testsByType: [],
          averageByType: [],
          typeDistribution: [],
          scoreEvolution: [],
          skillsRadarData: []
        };
      }

      // Grouper par type de test
      const testsByTypeMap: Record<string, { count: number; scores: number[]; totalPoints: number[] }> = {};
      
      quizResults.forEach((qr: any) => {
        const type = qr.quizType || 'UNKNOWN';
        if (!testsByTypeMap[type]) {
          testsByTypeMap[type] = { count: 0, scores: [], totalPoints: [] };
        }
        testsByTypeMap[type].count += 1;
        testsByTypeMap[type].scores.push(qr.score);
        testsByTypeMap[type].totalPoints.push(qr.totalPoints);
      });

      // Calculer les moyennes par type
      const testsByType = Object.entries(testsByTypeMap).map(([type, data]) => ({
        type,
        count: data.count,
        averageScore: data.scores.reduce((sum, score, idx) => sum + (score / data.totalPoints[idx]) * 100, 0) / data.count
      }));

      const averageByType = Object.entries(testsByTypeMap).map(([type, data]) => {
        const avgScore = data.scores.reduce((sum, score, idx) => sum + (score / data.totalPoints[idx]) * 100, 0) / data.count;
        return {
          type: type === 'QCM' ? 'QCM' : type === 'TECHNICAL' ? 'Technique' : type === 'MOCK_INTERVIEW' ? 'Entretien' : type === 'SOFT_SKILLS' ? 'Soft Skills' : type,
          moyenne: Math.round(avgScore * 10) / 10,
          count: data.count
        };
      });

      // Distribution par type (pour PieChart)
      const typeDistribution = Object.entries(testsByTypeMap).map(([type, data]) => ({
        name: type === 'QCM' ? 'QCM' : type === 'TECHNICAL' ? 'Technique' : type === 'MOCK_INTERVIEW' ? 'Entretien' : type === 'SOFT_SKILLS' ? 'Soft Skills' : type,
        value: data.count,
        type: type
      }));

      // Score global moyen
      const totalScore = quizResults.reduce((sum: number, qr: any) => {
        const percentage = qr.totalPoints > 0 ? (qr.score / qr.totalPoints) * 100 : 0;
        return sum + percentage;
      }, 0);
      const averageScore = Math.round((totalScore / quizResults.length) * 10) / 10;

      // Évolution des scores dans le temps (pour LineChart)
      const scoreEvolution = quizResults
        .map((qr: any, idx: number) => ({
          name: `Test ${idx + 1}`,
          score: Math.round((qr.score / qr.totalPoints) * 100),
          date: qr.completedAt ? new Date(qr.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '',
          testName: qr.quizTitle
        }))
        .reverse(); // Du plus ancien au plus récent

      // Données pour RadarChart des compétences
      const skillsMap: Record<string, { total: number; earned: number; count: number }> = {};
      quizResults.forEach((qr: any) => {
        if (qr.skills && Array.isArray(qr.skills)) {
          qr.skills.forEach((skill: any) => {
            const skillName = skill.name || skill.skill || 'Compétence';
            if (!skillsMap[skillName]) {
              skillsMap[skillName] = { total: 0, earned: 0, count: 0 };
            }
            skillsMap[skillName].total += skill.maxScore || 100;
            skillsMap[skillName].earned += skill.score || 0;
            skillsMap[skillName].count += 1;
          });
        }
      });

      const skillsRadarData = Object.entries(skillsMap)
        .map(([name, data]) => ({
          skill: name.length > 15 ? name.substring(0, 15) + '...' : name,
          fullName: name,
          score: Math.round((data.earned / data.total) * 100),
          count: data.count
        }))
        .slice(0, 8); // Limiter à 8 compétences pour la lisibilité

      return {
        totalTests: quizResults.length,
        averageScore,
        testsByType,
        averageByType,
        typeDistribution,
        scoreEvolution,
        skillsRadarData
      };
    }, [quizResults]);

    // Mettre à jour les testResults avec SEULEMENT les JobQuizResults (tests techniques du poste)
    // Les graphiques utilisent allQuizResults (entrainements + tests du job)
    // Mais la section des résultats individuels utilise seulement les tests du job
    const jobQuizResultsOnly = quizResultsData?.data || [];
    
    const updatedApplication = useMemo(() => {
      if (!selectedApplication) return null;
      
      if (jobQuizResultsOnly && jobQuizResultsOnly.length > 0) {
        return {
          ...selectedApplication,
          testResults: jobQuizResultsOnly.map((qr: any) => {
            // Extraire l'URL de la vidéo et les images depuis le schema (champs directs) ou les réponses (fallback)
            let videoUrl = qr.videoUrl || '';
            let imageUrls: string[] = [];
            
            // Si imageUrls est dans le schema (JSON)
            if (qr.imageUrls) {
              try {
                if (typeof qr.imageUrls === 'string') {
                  imageUrls = JSON.parse(qr.imageUrls);
                } else if (Array.isArray(qr.imageUrls)) {
                  imageUrls = qr.imageUrls;
                }
              } catch (e) {
                console.error("Error parsing imageUrls:", e);
              }
            }
            
            // Fallback : chercher dans les réponses si pas dans le schema
            if (!videoUrl || imageUrls.length === 0) {
              if (qr.answers && Array.isArray(qr.answers)) {
                const videoAnswer = qr.answers.find((a: any) => a.videoUrl || a.type === 'technical_video');
                if (!videoUrl) videoUrl = videoAnswer?.videoUrl || '';
                const imagesAnswer = qr.answers.find((a: any) => a.imageUrls || a.type === 'technical_images');
                if (imageUrls.length === 0) imageUrls = imagesAnswer?.imageUrls || [];
              } else if (qr.answers && typeof qr.answers === 'object') {
                const answersArray = Object.values(qr.answers) as any[];
                const videoAnswer = answersArray.find((a: any) => a.videoUrl || a.type === 'technical_video');
                if (!videoUrl) videoUrl = videoAnswer?.videoUrl || '';
                const imagesAnswer = answersArray.find((a: any) => a.imageUrls || a.type === 'technical_images');
                if (imageUrls.length === 0) imageUrls = imagesAnswer?.imageUrls || [];
              }
            }
            
            return {
              id: qr.id,
              testName: qr.quizTitle,
              quizType: qr.quizType,
              score: qr.score,
              maxScore: qr.totalPoints,
              status: 'completed' as TestStatus,
              completedAt: qr.completedAt,
              duration: qr.duration || 0,
              skills: qr.skills || [],
              aiFeedback: qr.aiFeedback,
              improvementTips: qr.improvementTips || [],
              videoUrl: videoUrl,
              imageUrls: imageUrls,
              answers: qr.answers,
              technology: Array.isArray(qr.technology) ? qr.technology : Array.isArray((qr as any)?.quizTechnology) ? (qr as any).quizTechnology : [],
              domain: qr.domain || (qr as any)?.quizDomain || null
            };
          })
        };
      }
      return selectedApplication;
    }, [selectedApplication, jobQuizResultsOnly]);

    // Initialiser le statut et le score de review avec les valeurs actuelles de l'application
    useEffect(() => {
      if (updatedApplication) {
        setApplicationReviewStatus(updatedApplication.status);
        // Initialiser le score avec celui de l'application ou calculer depuis les tests
        if (updatedApplication.score !== null && updatedApplication.score !== undefined) {
          setApplicationReviewScore(updatedApplication.score);
        } else if (updatedApplication.testResults.length > 0) {
          const averageScore = Math.round(
            updatedApplication.testResults.reduce((sum: number, t: TestResult) => sum + (t.score / t.maxScore) * 100, 0) / updatedApplication.testResults.length
          );
          setApplicationReviewScore(averageScore);
        }
      }
    }, [updatedApplication?.status, updatedApplication?.score]);

    if (!updatedApplication) {
      return (
        <div className="space-y-8">
          <Breadcrumb />
          <CandidateDetailSkeleton />
        </div>
      );
    }

    const openConversationDialog = (test: TestResult) => {
      let rawAnswers: any = test.answers;
      if (typeof rawAnswers === "string") {
        try {
          rawAnswers = JSON.parse(rawAnswers);
        } catch (error) {
          rawAnswers = {};
        }
      }

      const sessionData = rawAnswers && typeof rawAnswers === "object" ? rawAnswers : {};
      let messageEntries: any[] = Array.isArray(sessionData.messages) ? sessionData.messages : [];
      const transcriptionEntries: any[] = Array.isArray(sessionData.transcription) ? sessionData.transcription : [];

      if ((!messageEntries || messageEntries.length === 0) && Array.isArray(test.answers)) {
        messageEntries = test.answers as any[];
      }

      const baseEntries = messageEntries.length > 0 ? messageEntries : transcriptionEntries;

      const normalizedMessages = Array.isArray(baseEntries)
        ? baseEntries
            .map((entry: any, index: number) => {
              const role = entry.author || entry.type || entry.speaker;
              const author: 'ai' | 'user' = role === 'user' ? 'user' : 'ai';
              const text = entry.content ?? entry.text ?? entry.message ?? '';
              if (!text) {
                return null;
              }
              const timestampRaw = entry.timestamp || entry.createdAt;
              const timestampDate = timestampRaw ? new Date(timestampRaw) : undefined;
              const timestamp = timestampDate && !Number.isNaN(timestampDate.getTime()) ? timestampDate : undefined;
              return {
                id: entry.id || `message-${index}`,
                author,
                content: text,
                timestamp,
              };
            })
            .filter(Boolean) as Array<{ id: string; author: 'ai' | 'user'; content: string; timestamp?: Date }>
        : [];

      const combinedTechnologies = new Set<string>();
      (selectedJob?.skills || []).forEach((skill: string) => {
        if (skill) combinedTechnologies.add(skill);
      });
      if (Array.isArray(test.skills)) {
        test.skills.forEach((skill: any) => {
          if (skill?.name) {
            combinedTechnologies.add(skill.name);
          }
        });
      }
      if (Array.isArray(sessionData.feedback?.skillsAnalysis?.matched)) {
        sessionData.feedback.skillsAnalysis.matched.forEach((skill: string) => combinedTechnologies.add(skill));
      }
      if (Array.isArray(sessionData.feedback?.skillsAnalysis?.missing)) {
        sessionData.feedback.skillsAnalysis.missing.forEach((skill: string) => combinedTechnologies.add(skill));
      }

      const durationValue = typeof sessionData.callDuration === 'number'
        ? sessionData.callDuration
        : typeof sessionData.duration === 'number'
        ? sessionData.duration
        : undefined;

      setConversationDialog({
        testId: test.id,
        testName: test.testName,
        messages: normalizedMessages,
        feedback: sessionData.feedback || mockInterviewEvaluations[test.id] || null,
        callDuration: durationValue,
        technologies: Array.from(combinedTechnologies),
      });
      setIsConversationDialogOpen(true);
    };

    const handleConversationDialogChange = (open: boolean) => {
      setIsConversationDialogOpen(open);
      if (!open) {
        setConversationDialog(null);
      }
    };

    return (
      <>
        <div className="space-y-8">
          <Breadcrumb />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Colonne gauche : Informations du candidat */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800">
                      <AvatarImage src={updatedApplication.candidate.avatar} />
                      <AvatarFallback className="text-xl font-medium bg-slate-100 dark:bg-slate-800">
                        {updatedApplication.candidate.firstName?.[0]}{updatedApplication.candidate.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {updatedApplication.candidate.firstName} {updatedApplication.candidate.lastName}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        {updatedApplication.candidate.education}
                      </p>
                    </div>

                    <Badge className={`text-sm ${getStatusColor(updatedApplication.status)} border`}>
                      {getStatusText(updatedApplication.status)}
                    </Badge>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="break-all">{updatedApplication.candidate.email}</span>
                      </div>
                      {updatedApplication.candidate.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <span>{updatedApplication.candidate.phone}</span>
                        </div>
                      )}
                      {updatedApplication.candidate.location && (
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <span>{updatedApplication.candidate.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span>{updatedApplication.candidate.experience}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full rounded-lg bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          // Rediriger vers le portfolio si disponible
                          if (candidatePortfolio?.id) {
                            router.push(`/portfolio/${candidatePortfolio.id}`);
                          } else if (updatedApplication.resumeUrl || updatedApplication.candidate.resumeUrl) {
                            // Sinon ouvrir le CV en nouvel onglet
                            window.open(updatedApplication.resumeUrl || updatedApplication.candidate.resumeUrl, '_blank');
                          }
                        }}
                      >
                        <FileTextIcon className="w-4 h-4 mr-2" />
                        {candidatePortfolio ? "Voir le Portfolio" : "Voir le CV"}
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                      {updatedApplication.portfolioUrl && (
                        <Button size="sm" variant="outline" className="w-full rounded-lg" asChild>
                          <a href={updatedApplication.portfolioUrl} target="_blank" rel="noopener noreferrer">
                            <FileTextIcon className="w-4 h-4 mr-2" />
                            Voir le Portfolio
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne droite : Résultats des tests */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section : Statistiques et Graphiques des Tests */}
              {quizResults && quizResults.length > 0 && (
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Statistiques des Tests Techniques
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Vue d'ensemble des performances aux différents types de tests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Statistiques résumées */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Total de tests</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{testStatistics.totalTests}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Moyenne globale</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{testStatistics.averageScore}%</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">Types de tests</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{testStatistics.averageByType.length}</p>
                      </div>
                    </div>

                    {/* Graphiques - Responsive */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Graphique en barres : Moyenne par type */}
                      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                            Moyenne par type de test
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                            Score moyen en % pour chaque catégorie
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {testStatistics.averageByType.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={testStatistics.averageByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis 
                                  dataKey="type" 
                                  stroke="#64748b"
                                  className="text-xs"
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis 
                                  stroke="#64748b"
                                  className="text-xs"
                                  domain={[0, 100]}
                                  label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', className: 'text-xs fill-slate-600 dark:fill-slate-400' }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    color: '#1e293b'
                                  }}
                                  formatter={(value: number) => [`${value}%`, 'Moyenne']}
                                />
                                <Bar 
                                  dataKey="moyenne" 
                                  fill="#3b82f6"
                                  radius={[8, 8, 0, 0]}
                                  label={{ position: 'top', formatter: (v: number) => `${v}%`, fill: '#64748b', fontSize: 12 }}
                                >
                                  {testStatistics.averageByType.map((entry: { type: string; moyenne: number; count: number }, index: number) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={
                                        entry.moyenne >= 80 ? '#10b981' :
                                        entry.moyenne >= 60 ? '#3b82f6' :
                                        entry.moyenne >= 40 ? '#f59e0b' : '#ef4444'
                                      }
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-[250px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                              <p className="text-sm">Aucune donnée disponible</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Graphique en camembert : Distribution par type */}
                      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                            Répartition par type
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                            Nombre de tests par catégorie
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {testStatistics.typeDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={testStatistics.typeDistribution}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  className="text-xs"
                                >
                                  {testStatistics.typeDistribution.map((entry: { name: string; value: number; type: string }, index: number) => {
                                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                  })}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-[250px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                              <p className="text-sm">Aucune donnée disponible</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Graphique linéaire : Évolution des scores */}
                    {testStatistics.scoreEvolution.length > 1 && (
                      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                            Évolution des scores
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                            Progression des performances au fil des tests
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={testStatistics.scoreEvolution}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                              <XAxis 
                                dataKey="date" 
                                stroke="#64748b"
                                className="text-xs"
                              />
                              <YAxis 
                                stroke="#64748b"
                                className="text-xs"
                                domain={[0, 100]}
                                label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', className: 'text-xs fill-slate-600 dark:fill-slate-400' }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px'
                                }}
                                formatter={(value: number, name: string, props: any) => [
                                  `${value}% - ${props.payload.testName}`,
                                  'Score'
                                ]}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Score (%)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Graphique Radar : Compétences techniques */}
                    {testStatistics.skillsRadarData.length > 0 && (
                      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                            Niveau de maîtrise des compétences
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                            Évaluation sur 100 points
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={testStatistics.skillsRadarData}>
                              <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-700" />
                              <PolarAngleAxis 
                                dataKey="skill" 
                                stroke="#64748b"
                                className="text-xs"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                              />
                              <PolarRadiusAxis 
                                angle={90} 
                                domain={[0, 100]}
                                stroke="#64748b"
                                className="text-xs"
                              />
                              <Radar
                                name="Score"
                                dataKey="score"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px'
                                }}
                                formatter={(value: number, name: string, props: any) => [
                                  `${value}% - ${props.payload.fullName}`,
                                  'Maîtrise'
                                ]}
                              />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Détails par type */}
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                        Détails par type de test
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {testStatistics.averageByType.map((item: { type: string; moyenne: number; count: number }, index: number) => (
                          <div 
                            key={index}
                            className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {item.type}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  item.moyenne >= 80 ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                  item.moyenne >= 60 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                  item.moyenne >= 40 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                  'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}
                              >
                                {item.moyenne}%
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <FileCheck className="w-3 h-3" />
                              <span>{item.count} test{item.count > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section Review et Evaluation - Nouvelle section */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Évaluation et Review
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                    Évaluez le candidat et définissez le statut de sa candidature
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="app-review-score" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Score global (0-100)
                      </Label>
                      <Input
                        id="app-review-score"
                        type="number"
                        min={0}
                        max={100}
                        value={applicationReviewScore ?? (updatedApplication.testResults.length > 0 
                          ? Math.round(updatedApplication.testResults.reduce((sum: number, t: TestResult) => sum + (t.score / t.maxScore) * 100, 0) / updatedApplication.testResults.length)
                          : 0)}
                        onChange={(e) => setApplicationReviewScore(parseInt(e.target.value) || 0)}
                        className="bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="app-review-status" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Statut de candidature
                      </Label>
                      <Select
                        value={applicationReviewStatus}
                        onValueChange={setApplicationReviewStatus}
                      >
                        <SelectTrigger id="app-review-status" className="bg-white dark:bg-slate-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="reviewed">En cours d'examen</SelectItem>
                          <SelectItem value="interview">Entretien programmé</SelectItem>
                          <SelectItem value="accepted">Acceptée</SelectItem>
                          <SelectItem value="rejected">Rejetée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reviewer-notes-general" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Notes générales de review
                    </Label>
                    <Textarea
                      id="reviewer-notes-general"
                      placeholder="Ajoutez vos notes générales sur le candidat..."
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      className="min-h-24 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      if (!updatedApplication) return;
                      try {
                        await updateApplicationReviewMutation.mutateAsync({
                          applicationId: updatedApplication.id,
                          data: {
                            status: applicationReviewStatus,
                            score: applicationReviewScore || undefined,
                            reviewerNotes: reviewerNotes
                          }
                        });
                        toast.success("Évaluation sauvegardée avec succès");
                      } catch (error) {
                        console.error("Error updating application review:", error);
                        toast.error("Erreur lors de la sauvegarde de l'évaluation");
                      }
                    }}
                    disabled={updateApplicationReviewMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {updateApplicationReviewMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder l'évaluation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              {loadingQuizResults ? (
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ) : updatedApplication.testResults.length > 0 ? (
                updatedApplication.testResults.map((test) => (
                  <Card key={test.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {test.testName}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Complété le {formatDate(test.completedAt!)} • Durée: {test.duration} min
                          </p>
                        </div>
                        <div className="text-center sm:text-right">
                          <div className={`text-3xl font-bold ${getScoreColor(test.score, test.maxScore)}`}>
                            {test.score}/{test.maxScore}
                          </div>
                          <div className="text-sm text-slate-500">
                            {Math.round((test.score / test.maxScore) * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Score par compétence - Amélioré avec affichage sur 100 */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                            Compétences techniques évaluées
                        </h4>
                          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">
                            {test.skills.length} compétence{test.skills.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {test.skills && test.skills.length > 0 ? (
                            test.skills.map((skill : { name: string; score: number; maxScore: number }, index: number) => {
                            const percentage = (skill.score / skill.maxScore) * 100;
                              const normalizedScore = Math.round((skill.score / skill.maxScore) * 100);
                            return (
                                <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{skill.name}</span>
                                    <Badge className={`${getScoreColor(skill.score, skill.maxScore)} border-0 font-bold`}>
                                      {normalizedScore}/100
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                      <span>Score: {skill.score}/{skill.maxScore}</span>
                                      <span>{normalizedScore}%</span>
                                </div>
                                <Progress 
                                  value={percentage} 
                                      className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full"
                                />
                                  </div>
                              </div>
                            );
                            })
                          ) : (
                            <div className="col-span-2 text-center py-8 text-slate-500 dark:text-slate-400">
                              <FileTextIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>Aucune compétence évaluée</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Réponses textuelles, Vidéo ou Images de présentation pour TECHNICAL */}
                      {test.quizType === 'TECHNICAL' && (
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          {/* Réponses textuelles */}
                          {test.answers && Array.isArray(test.answers) && test.answers.some((a: any) => a.answer && a.type === 'technical_text') && (
                            <>
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                  <FileTextIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                  Réponses textuelles
                                </h4>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div className="mb-3">
                                  <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-2">
                                    Le candidat a soumis des réponses textuelles pour ce test technique.
                                  </p>
                                </div>
                                <div className="space-y-4">
                                  {test.answers
                                    .filter((a: any) => a.answer && a.type === 'technical_text')
                                    .map((answer: any, idx: number) => (
                                      <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                        <div className="mb-2">
                                          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                            Question {idx + 1}: {answer.questionText || 'Question non spécifiée'}
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                            {answer.answer}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Vidéo ou Images (si présentes) */}
                          {((test as any).videoUrl || ((test as any).imageUrls && (test as any).imageUrls.length > 0)) && (
                            <>
                              {/* Vidéo */}
                              {(test as any).videoUrl && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                      <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                      Vidéo de présentation du test technique
                                    </h4>
                                  </div>
                                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="mb-3">
                                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                                        Le candidat a soumis une vidéo résumant son approche et sa solution pour ce test technique.
                                      </p>
                                    </div>
                                    <div className="relative w-full rounded-lg overflow-hidden bg-slate-900">
                                      <video
                                        src={(test as any).videoUrl}
                                        controls
                                        className="w-full h-auto max-h-[600px]"
                                        preload="metadata"
                                      >
                                        Votre navigateur ne supporte pas la lecture de vidéos.
                                      </video>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                                      <Video className="w-4 h-4" />
                                      <span>Vidéo hébergée sur Uploadcare</span>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Images */}
                              {(test as any).imageUrls && (test as any).imageUrls.length > 0 && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                      <FileTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                      Catalogue d'images ({((test as any).imageUrls as string[]).length})
                                    </h4>
                                  </div>
                                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <div className="mb-3">
                                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                                        Le candidat a soumis un catalogue d'images comme preuve de son travail pour ce test technique.
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                      {((test as any).imageUrls as string[]).map((url: string, index: number) => (
                                        <div key={index} className="relative group">
                                          <img
                                            src={url}
                                            alt={`Preuve ${index + 1}`}
                                            className="w-full h-40 object-cover rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(url, '_blank')}
                                          />
                                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                            Image {index + 1}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
                                      <FileTextIcon className="w-4 h-4" />
                                      <span>Images hébergées sur Uploadcare</span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* Évaluation IA pour MOCK_INTERVIEW */}
                      {test.quizType === 'MOCK_INTERVIEW' && (
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              Évaluation IA de l'entretien
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openConversationDialog(test)}
                                className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Voir la conversation
                              </Button>
                              {!mockInterviewEvaluations[test.id] && !loadingMockInterviewEvaluation[test.id] && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      setLoadingMockInterviewEvaluation(prev => ({ ...prev, [test.id]: true }));
                                      
                                      // Récupérer les détails du test pour obtenir la transcription
                                      const result = await getQuizResultForReview(test.id);
                                      if (result.success && result.data) {
                                        const answers = result.data.answers as any;
                                        const questions = result.data.questions as any[];
                                        
                                        // Extraire la transcription depuis answers
                                        let transcription = answers;
                                        if (Array.isArray(answers)) {
                                          transcription = answers;
                                        } else if (typeof answers === 'object' && answers.transcription) {
                                          transcription = answers.transcription;
                                        } else if (typeof answers === 'object' && answers.messages) {
                                          transcription = answers.messages;
                                        }
                                        
                                        // Récupérer les informations du poste depuis selectedJob
                                        const combinedSkills = new Set<string>();
                                        (selectedJob?.skills || []).forEach((skill: string) => skill && combinedSkills.add(skill));
                                        if (Array.isArray(test.skills)) {
                                          test.skills.forEach((skill: any) => skill?.name && combinedSkills.add(skill.name));
                                        }
                                        const requirementDomain = (result.data as any)?.domain || (test as any)?.domain || (selectedJob as any)?.domain || 'DEVELOPMENT';
                                        const jobRequirements = selectedJob ? {
                                          title: selectedJob.title,
                                          description: selectedJob.companyName,
                                          skills: Array.from(combinedSkills),
                                          experienceLevel: 'MID',
                                          domain: requirementDomain
                                        } : {
                                          title: 'Poste non spécifié',
                                          description: '',
                                          skills: Array.from(combinedSkills),
                                          experienceLevel: 'MID',
                                          domain: requirementDomain
                                        };
                                        
                                        // Appeler l'API pour l'évaluation MOCK_INTERVIEW
                                        const evalResponse = await fetch('/api/gemini', {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                          },
                                          body: JSON.stringify({
                                            type: 'evaluate-mock-interview',
                                            transcription: transcription,
                                            jobRequirements: jobRequirements,
                                            questions: questions || []
                                          })
                                        });
                                        
                                        if (evalResponse.ok) {
                                          const evalResult = await evalResponse.json();
                                          if (evalResult.success && evalResult.data) {
                                            setMockInterviewEvaluations(prev => ({
                                              ...prev,
                                              [test.id]: evalResult.data
                                            }));
                                            toast.success("Évaluation de l'entretien terminée");
                                          }
                                        } else {
                                          const errorData = await evalResponse.json();
                                          toast.error(errorData.error || "Erreur lors de l'évaluation");
                                        }
                                      }
                                    } catch (error) {
                                      console.error("Error evaluating mock interview:", error);
                                      toast.error("Erreur lors de l'évaluation de l'entretien");
                                    } finally {
                                      setLoadingMockInterviewEvaluation(prev => ({ ...prev, [test.id]: false }));
                                    }
                                  }}
                                  className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                >
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Évaluer avec l'IA
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {loadingMockInterviewEvaluation[test.id] && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <div>
                                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Évaluation en cours...</p>
                                  <p className="text-xs text-blue-700 dark:text-blue-400">Comparaison des réponses aux exigences du poste</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {mockInterviewEvaluations[test.id] && (
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Score global</p>
                                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    {mockInterviewEvaluations[test.id].overallScore}/100
                                  </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Adéquation au poste</p>
                                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                    {mockInterviewEvaluations[test.id].jobMatch?.percentage || 0}%
                                  </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Compétences</p>
                                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                    {mockInterviewEvaluations[test.id].criteriaScores?.technicalSkills || 0}/25
                                  </p>
                                </div>
                              </div>
                              
                              {/* Scores par critère */}
                              {mockInterviewEvaluations[test.id].criteriaScores && (
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-slate-900 dark:text-white text-sm">Scores par critère</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Adéquation au poste</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                          {mockInterviewEvaluations[test.id].criteriaScores.jobFit}/25
                                        </span>
                                      </div>
                                      <Progress 
                                        value={(mockInterviewEvaluations[test.id].criteriaScores.jobFit / 25) * 100} 
                                        className="h-2"
                                      />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Compétences techniques</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                          {mockInterviewEvaluations[test.id].criteriaScores.technicalSkills}/25
                                        </span>
                                      </div>
                                      <Progress 
                                        value={(mockInterviewEvaluations[test.id].criteriaScores.technicalSkills / 25) * 100} 
                                        className="h-2"
                                      />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Communication</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                          {mockInterviewEvaluations[test.id].criteriaScores.communication}/20
                                        </span>
                                      </div>
                                      <Progress 
                                        value={(mockInterviewEvaluations[test.id].criteriaScores.communication / 20) * 100} 
                                        className="h-2"
                                      />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Expérience</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                          {mockInterviewEvaluations[test.id].criteriaScores.experience}/15
                                        </span>
                                      </div>
                                      <Progress 
                                        value={(mockInterviewEvaluations[test.id].criteriaScores.experience / 15) * 100} 
                                        className="h-2"
                                      />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Soft Skills</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                          {mockInterviewEvaluations[test.id].criteriaScores.softSkills}/15
                                        </span>
                                      </div>
                                      <Progress 
                                        value={(mockInterviewEvaluations[test.id].criteriaScores.softSkills / 15) * 100} 
                                        className="h-2"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-semibold text-slate-900 dark:text-white mb-2">Évaluation détaillée</h5>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {mockInterviewEvaluations[test.id].evaluation}
                                  </p>
                                </div>
                                
                                {mockInterviewEvaluations[test.id].jobMatch && (
                                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                    <p className="text-xs font-medium text-indigo-900 dark:text-indigo-300 mb-1">Adéquation au poste:</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                      {mockInterviewEvaluations[test.id].jobMatch.analysis}
                                    </p>
                                    <div className="mt-2">
                                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                                        <span>Correspondance</span>
                                        <span>{mockInterviewEvaluations[test.id].jobMatch.percentage}%</span>
                                      </div>
                                      <Progress 
                                        value={mockInterviewEvaluations[test.id].jobMatch.percentage} 
                                        className="h-2"
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {mockInterviewEvaluations[test.id].strengths && mockInterviewEvaluations[test.id].strengths.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4" />
                                      Points forts
                                    </h5>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                      {mockInterviewEvaluations[test.id].strengths.map((strength: string, idx: number) => (
                                        <li key={idx}>{strength}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {mockInterviewEvaluations[test.id].weaknesses && mockInterviewEvaluations[test.id].weaknesses.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" />
                                      Points à améliorer
                                    </h5>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                      {mockInterviewEvaluations[test.id].weaknesses.map((weakness: string, idx: number) => (
                                        <li key={idx}>{weakness}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {mockInterviewEvaluations[test.id].skillsAnalysis && (
                                  <div>
                                    <h5 className="font-semibold text-slate-900 dark:text-white mb-2">Analyse des compétences</h5>
                                    <div className="space-y-2">
                                      {mockInterviewEvaluations[test.id].skillsAnalysis.matched && mockInterviewEvaluations[test.id].skillsAnalysis.matched.length > 0 && (
                                        <div>
                                          <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">✅ Compétences correspondantes:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {mockInterviewEvaluations[test.id].skillsAnalysis.matched.map((skill: string, idx: number) => (
                                              <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                                                {skill}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {mockInterviewEvaluations[test.id].skillsAnalysis.missing && mockInterviewEvaluations[test.id].skillsAnalysis.missing.length > 0 && (
                                        <div>
                                          <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">⚠️ Compétences manquantes:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {mockInterviewEvaluations[test.id].skillsAnalysis.missing.map((skill: string, idx: number) => (
                                              <Badge key={idx} variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                                                {skill}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {mockInterviewEvaluations[test.id].skillsAnalysis.exceeds && mockInterviewEvaluations[test.id].skillsAnalysis.exceeds.length > 0 && (
                                        <div>
                                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">⭐ Compétences supérieures:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {mockInterviewEvaluations[test.id].skillsAnalysis.exceeds.map((skill: string, idx: number) => (
                                              <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                                {skill}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {mockInterviewEvaluations[test.id].recommendations && (
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-medium text-slate-900 dark:text-white mb-1">Recommandations:</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                      {mockInterviewEvaluations[test.id].recommendations}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Évaluation sémantique IA pour TECHNICAL */}
                      {test.quizType === 'TECHNICAL' && (
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              Évaluation sémantique IA
                            </h4>
                            {!semanticEvaluations[test.id] && !loadingSemanticEvaluation[test.id] && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    setLoadingSemanticEvaluation(prev => ({ ...prev, [test.id]: true }));
                                    
                                    // Récupérer les détails du test pour obtenir les réponses
                                    const result = await getQuizResultForReview(test.id);
                                    if (result.success && result.data) {
                                      const answers = result.data.answers as any[];
                                      const questions = result.data.questions as any[];
                                      
                                      if (answers.length > 0 && questions.length > 0) {
                                        const answer = answers[0];
                                        const question = questions[0];
                                        
                                        // Déterminer le type d'évaluation selon le type de réponse
                                        const isTextAnswer = answer.type === 'technical_text' || (answer.answer && !answer.code);
                                        
                                        if (isTextAnswer) {
                                          // Évaluation pour réponses textuelles
                                          const textAnswers = answers
                                            .filter(a => a.answer && (a.type === 'technical_text' || !a.code))
                                            .map(a => ({
                                              questionId: a.questionId,
                                              questionText: a.questionText || question.text || question.question,
                                              answer: a.answer,
                                              points: a.points || question.points
                                            }));
                                          
                                          if (textAnswers.length > 0) {
                                            const evalResponse = await fetch('/api/gemini', {
                                              method: 'POST',
                                              headers: {
                                                'Content-Type': 'application/json',
                                              },
                                              body: JSON.stringify({
                                                type: 'evaluate-technical-text',
                                                textAnswers: textAnswers,
                                                domain: (result.data as any)?.domain || (test as any)?.domain || 'DESIGN'
                                              })
                                            });
                                            
                                            if (evalResponse.ok) {
                                              const evalResult = await evalResponse.json();
                                              if (evalResult.success && evalResult.data) {
                                                setSemanticEvaluations(prev => ({
                                                  ...prev,
                                                  [test.id]: evalResult.data
                                                }));
                                              }
                                            }
                                          }
                                        } else {
                                          // Évaluation pour code (domaines techniques)
                                          const evalResponse = await fetch('/api/gemini', {
                                            method: 'POST',
                                            headers: {
                                              'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                              type: 'evaluate-code',
                                              userCode: answer.code || answer.answer || '',
                                              expectedSolution: question.correctAnswer || '',
                                              problemDescription: question.text || question.question || '',
                                              codeSnippet: question.codeSnippet || ''
                                            })
                                          });
                                          
                                          if (evalResponse.ok) {
                                            const evalResult = await evalResponse.json();
                                            if (evalResult.success && evalResult.data) {
                                              setSemanticEvaluations(prev => ({
                                                ...prev,
                                                [test.id]: evalResult.data
                                              }));
                                            }
                                          }
                                        }
                                      }
                                    }
                                  } catch (error) {
                                    console.error("Error evaluating code semantically:", error);
                                    toast.error("Erreur lors de l'évaluation sémantique");
                                  } finally {
                                    setLoadingSemanticEvaluation(prev => ({ ...prev, [test.id]: false }));
                                  }
                                }}
                                className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analyser avec l'IA
                              </Button>
                            )}
                          </div>
                          
                          {loadingSemanticEvaluation[test.id] && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                              <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                <div>
                                  <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Analyse sémantique en cours...</p>
                                  <p className="text-xs text-purple-700 dark:text-purple-400">Évaluation du code, best practices et qualité du travail</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {semanticEvaluations[test.id] && (
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Score sémantique</p>
                                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                    {semanticEvaluations[test.id].score}/100
                                  </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Problème résolu</p>
                                  <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                                    {semanticEvaluations[test.id].solvesProblem ? '✅ Oui' : '⚠️ Partiellement'}
                                  </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Travail effectué</p>
                                  <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                                    {semanticEvaluations[test.id].workDone ? '✅ Oui' : '⚠️ Non'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-semibold text-slate-900 dark:text-white mb-2">Évaluation détaillée</h5>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {semanticEvaluations[test.id].evaluation}
                                  </p>
                                </div>
                                
                                {semanticEvaluations[test.id].strengths && semanticEvaluations[test.id].strengths.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4" />
                                      Points forts
                                    </h5>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                      {semanticEvaluations[test.id].strengths.map((strength: string, idx: number) => (
                                        <li key={idx}>{strength}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {semanticEvaluations[test.id].weaknesses && semanticEvaluations[test.id].weaknesses.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" />
                                      Points à améliorer
                                    </h5>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                      {semanticEvaluations[test.id].weaknesses.map((weakness: string, idx: number) => (
                                        <li key={idx}>{weakness}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {semanticEvaluations[test.id].bestPractices && (
                                  <div>
                                    <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                                      <Star className="w-4 h-4" />
                                      Best Practices
                                    </h5>
                                    <div className="space-y-2">
                                      {semanticEvaluations[test.id].bestPractices.followed && semanticEvaluations[test.id].bestPractices.followed.length > 0 && (
                                        <div>
                                          <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">✅ Suivies:</p>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                            {semanticEvaluations[test.id].bestPractices.followed.map((bp: string, idx: number) => (
                                              <li key={idx}>{bp}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {semanticEvaluations[test.id].bestPractices.missing && semanticEvaluations[test.id].bestPractices.missing.length > 0 && (
                                        <div>
                                          <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">⚠️ Manquantes:</p>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                            {semanticEvaluations[test.id].bestPractices.missing.map((bp: string, idx: number) => (
                                              <li key={idx}>{bp}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {semanticEvaluations[test.id].bestPractices.review && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                          <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">Review détaillée:</p>
                                          <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {semanticEvaluations[test.id].bestPractices.review}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {semanticEvaluations[test.id].suggestions && (
                                  <div>
                                    <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                      <MessageSquare className="w-4 h-4" />
                                      Suggestions d'amélioration
                                    </h5>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                      {semanticEvaluations[test.id].suggestions}
                                    </p>
                                  </div>
                                )}
                                
                                {semanticEvaluations[test.id].workQuality && (
                                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-xs font-medium text-emerald-900 dark:text-emerald-300 mb-1">Qualité du travail:</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                      {semanticEvaluations[test.id].workQuality}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions avec Review */}
                      <div className="flex gap-2 pt-6 border-t border-slate-100 dark:border-slate-800">
                        {(test.quizType === 'QCM' || test.quizType === 'TECHNICAL') ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            onClick={() => handleOpenReviewModal(test)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Réviser le test
                          </Button>
                        ) : (
                        <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir les détails
                        </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Notes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Aucun test complété
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                      Ce candidat n&apos;a pas encore complété de test technique pour ce poste.
                    </p>
                    <Button variant="outline" className="rounded-lg">
                      Assigner un test
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Section : Analyse IA des compétences techniques du poste */}
              {selectedJob && (
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Analyse IA des compétences techniques
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Évaluation du niveau de maîtrise par rapport aux compétences demandées pour le poste
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEvaluatingSkills ? (
                      <div className="space-y-4 py-8">
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Analyse en cours...</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Évaluation des compétences techniques par IA</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-2 flex-1" />
                              <Skeleton className="h-6 w-16" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : simulateSkillEvaluation && simulateSkillEvaluation.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Basé sur {jobQuizResultsOnly.length} test{jobQuizResultsOnly.length > 1 ? 's' : ''} technique{jobQuizResultsOnly.length > 1 ? 's' : ''} du poste complété{jobQuizResultsOnly.length > 1 ? 's' : ''}
                          </p>
                          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Évaluation IA
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {simulateSkillEvaluation.map((skill: any, index: number) => {
                            const masteryColor = skill.percentage >= 80 
                              ? 'text-green-600 dark:text-green-400' 
                              : skill.percentage >= 60 
                              ? 'text-blue-600 dark:text-blue-400'
                              : skill.percentage >= 40
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400';
                            
                            const masteryBg = skill.percentage >= 80 
                              ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800' 
                              : skill.percentage >= 60 
                              ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                              : skill.percentage >= 40
                              ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                              : 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';

                            const isReviewing = reviewingSkillIndex === index;
                            const reviewScore = skillReviewScores[index] ?? skill.score;
                            const reviewNote = skillReviewNotes[index] || "";

                            return (
                              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-slate-900 dark:text-white">{skill.name}</span>
                                      <Badge className={`${masteryBg} ${masteryColor} border-0 text-xs`}>
                                        {skill.mastery}
                                      </Badge>
                                      {/* Trouver les tests MOCK_INTERVIEW ou SOFT_SKILLS pour cette compétence */}
                                      {updatedApplication?.testResults?.some((t: TestResult) => 
                                        (t.quizType === 'MOCK_INTERVIEW' || t.quizType === 'SOFT_SKILLS') && 
                                        t.skills?.some((s: any) => s.name === skill.name)
                                      ) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setReviewingSkillIndex(isReviewing ? null : index)}
                                          className="h-6 px-2 text-xs ml-2"
                                        >
                                          <Edit className="w-3 h-3 mr-1" />
                                          {isReviewing ? "Annuler" : "Réviser"}
                                        </Button>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                      <TrendingUpIcon className="w-3 h-3" />
                                      <span>{reviewScore} points sur {skill.maxScore} possibles</span>
                                      {reviewScore !== skill.score && (
                                        <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                          Révisé
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${masteryColor}`}>
                                      {Math.round((reviewScore / skill.maxScore) * 100)}%
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      Niveau de maîtrise
                                    </div>
                                  </div>
                                </div>
                                <Progress 
                                  value={Math.round((reviewScore / skill.maxScore) * 100)} 
                                  className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full"
                                />
                                <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                  <span>Points obtenus: {reviewScore}/{skill.maxScore}</span>
                                  <span>Répartition basée sur le total du test</span>
                                </div>

                                {/* Section de review inline pour MOCK_INTERVIEW et SOFT_SKILLS */}
                                {isReviewing && updatedApplication?.testResults?.some((t: TestResult) => 
                                  (t.quizType === 'MOCK_INTERVIEW' || t.quizType === 'SOFT_SKILLS') && 
                                  t.skills?.some((s: any) => s.name === skill.name)
                                ) && (
                                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">
                                        Review manuelle pour {skill.name}
                                      </p>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Label htmlFor={`review-score-${index}`} className="text-xs text-slate-700 dark:text-slate-300 w-20">
                                            Score :
                                          </Label>
                                          <Input
                                            id={`review-score-${index}`}
                                            type="number"
                                            min={0}
                                            max={skill.maxScore}
                                            value={reviewScore}
                                            onChange={(e) => setSkillReviewScores({
                                              ...skillReviewScores,
                                              [index]: Math.max(0, Math.min(parseInt(e.target.value) || 0, skill.maxScore))
                                            })}
                                            className="h-8 w-24 text-sm"
                                          />
                                          <span className="text-xs text-slate-500 dark:text-slate-400">/ {skill.maxScore}</span>
                                        </div>
                                        <div>
                                          <Label htmlFor={`review-note-${index}`} className="text-xs text-slate-700 dark:text-slate-300">
                                            Notes de review :
                                          </Label>
                                          <Textarea
                                            id={`review-note-${index}`}
                                            placeholder="Ajoutez vos notes sur cette compétence..."
                                            value={reviewNote}
                                            onChange={(e) => setSkillReviewNotes({
                                              ...skillReviewNotes,
                                              [index]: e.target.value
                                            })}
                                            className="min-h-20 mt-1 bg-white dark:bg-slate-800 text-sm"
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={async () => {
                                              // Trouver le test qui correspond à cette compétence
                                              const relevantTest = updatedApplication.testResults.find((t: TestResult) => 
                                                (t.quizType === 'MOCK_INTERVIEW' || t.quizType === 'SOFT_SKILLS') && 
                                                t.skills?.some((s: any) => s.name === skill.name)
                                              );
                                              if (relevantTest) {
                                                try {
                                                  const result = await getQuizResultForReview(relevantTest.id);
                                                  if (result.success && result.data) {
                                                    // Créer une correction manuelle pour cette compétence
                                                    const skillCorrection = {
                                                      skillName: skill.name,
                                                      originalScore: skill.score,
                                                      reviewedScore: reviewScore,
                                                      note: reviewNote
                                                    };
                                                    
                                                    await saveQuizReviewMutation.mutateAsync({
                                                      quizResultId: relevantTest.id,
                                                      data: {
                                                        reviewedAnswers: result.data.answers || [],
                                                        reviewedScore: result.data.score, // Score global du test
                                                        reviewerNotes: reviewNote || "",
                                                        manualCorrections: {
                                                          [skill.name]: skillCorrection
                                                        }
                                                      }
                                                    });
                                                    
                                                    setReviewingSkillIndex(null);
                                                  }
                                                } catch (error) {
                                                  console.error("Error saving skill review:", error);
                                                }
                                              }
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                                          >
                                            <Save className="w-3 h-3 mr-1" />
                                            Sauvegarder
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setReviewingSkillIndex(null);
                                              setSkillReviewScores({ ...skillReviewScores, [index]: skill.score });
                                              setSkillReviewNotes({ ...skillReviewNotes, [index]: "" });
                                            }}
                                            className="h-8"
                                          >
                                            <X className="w-3 h-3 mr-1" />
                                            Annuler
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Aucune compétence technique spécifiée pour ce poste</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* CV et Portfolio - Section améliorée */}
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5" />
                    Documents du candidat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {updatedApplication.resumeUrl && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <FileTextIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">CV / Curriculum Vitae</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Document PDF</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Rediriger vers le portfolio si disponible, sinon ouvrir le CV
                          if (candidatePortfolio?.id) {
                            router.push(`/portfolio/${candidatePortfolio.id}`);
                          } else if (updatedApplication.resumeUrl || updatedApplication.candidate.resumeUrl) {
                            window.open(updatedApplication.resumeUrl || updatedApplication.candidate.resumeUrl, '_blank');
                          }
                        }}
                      >
                        {candidatePortfolio ? (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Voir le portfolio
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* Portfolio avec aperçu */}
                  {loadingPortfolio ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : candidatePortfolio ? (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-4 mb-4">
                        {candidatePortfolio.avatarUrl && (
                          <Avatar className="h-16 w-16 border-2 border-white dark:border-slate-800">
                            <AvatarImage src={candidatePortfolio.avatarUrl} />
                            <AvatarFallback className="text-lg font-medium bg-blue-100 dark:bg-blue-900/30">
                              {candidatePortfolio.user?.firstName?.[0] || candidatePortfolio.user?.email?.[0] || 'P'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                              {candidatePortfolio.title}
                            </h4>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`/portfolio/${candidatePortfolio.id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Voir le portfolio complet
                              </a>
                            </Button>
                          </div>
                          {candidatePortfolio.headline && (
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2 font-medium">
                              {candidatePortfolio.headline}
                            </p>
                          )}
                          {candidatePortfolio.bio && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                              {candidatePortfolio.bio}
                            </p>
                          )}
                          {candidatePortfolio.skills && candidatePortfolio.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {candidatePortfolio.skills.slice(0, 6).map((skill: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-white dark:bg-slate-800">
                                  {skill}
                                </Badge>
                              ))}
                              {candidatePortfolio.skills.length > 6 && (
                                <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800">
                                  +{candidatePortfolio.skills.length - 6}
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                            {candidatePortfolio.projects && Array.isArray(candidatePortfolio.projects) && candidatePortfolio.projects.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Code className="w-3 h-3" />
                                {candidatePortfolio.projects.length} projet{candidatePortfolio.projects.length > 1 ? 's' : ''}
                              </span>
                            )}
                            {candidatePortfolio.experiences && Array.isArray(candidatePortfolio.experiences) && candidatePortfolio.experiences.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {candidatePortfolio.experiences.length} expérience{candidatePortfolio.experiences.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : updatedApplication.portfolioUrl ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Portfolio</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Lien vers le portfolio</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={updatedApplication.portfolioUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ) : null}

                  {!updatedApplication.resumeUrl && !updatedApplication.portfolioUrl && !candidatePortfolio && (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                      Aucun document disponible
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Lettre de motivation */}
              {updatedApplication.coverLetter && (
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                      Lettre de motivation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {updatedApplication.coverLetter}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        <Dialog open={isConversationDialogOpen} onOpenChange={handleConversationDialogChange}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            {conversationDialog ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                    Conversation – {conversationDialog.testName}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    Transcription complète de l&apos;entretien vocal.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Durée : {formatCallDuration(conversationDialog.callDuration)}
                    </div>
                    {conversationDialog.feedback?.overallScore !== undefined && (
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        Score IA {conversationDialog.feedback.overallScore}/100
                      </Badge>
                    )}
                    {conversationDialog.technologies.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Compétences clés</span>
                        {conversationDialog.technologies.map((tech: string) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <div className="max-h-[60vh] overflow-y-auto pr-3 space-y-4">
                        {conversationDialog.messages.length > 0 ? (
                          conversationDialog.messages.map((message: { id: string; author: 'ai' | 'user'; content: string; timestamp?: Date }) => (
                            <div
                              key={message.id}
                              className={cn(
                                "flex gap-3",
                                message.author === 'user' ? 'justify-end' : 'justify-start'
                              )}
                            >
                              {message.author === 'ai' && (
                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30">
                                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                </div>
                              )}
                              <div
                                className={cn(
                                  "max-w-[75%] rounded-2xl border p-4 text-sm leading-relaxed shadow-sm",
                                  message.author === 'user'
                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                    : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
                                )}
                              >
                                <p>{message.content}</p>
                                {message.timestamp && (
                                  <span
                                    className={cn(
                                      "mt-2 block text-xs",
                                      message.author === 'user'
                                        ? 'text-emerald-100/80'
                                        : 'text-slate-500 dark:text-slate-400'
                                    )}
                                  >
                                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                              {message.author === 'user' && (
                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30">
                                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                            Aucune transcription disponible pour cette session.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="lg:col-span-1 space-y-4">
                      {conversationDialog.feedback ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">Synthèse IA</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                              {conversationDialog.feedback.overallScore}/100
                            </p>
                          </div>
                          {conversationDialog.feedback.criteriaScores && (
                            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                              <p className="font-semibold text-slate-900 dark:text-white">Critères</p>
                              <ul className="space-y-1">
                                <li>Adéquation : {conversationDialog.feedback.criteriaScores.jobFit}/25</li>
                                <li>Technique : {conversationDialog.feedback.criteriaScores.technicalSkills}/25</li>
                                <li>Communication : {conversationDialog.feedback.criteriaScores.communication}/20</li>
                                <li>Expérience : {conversationDialog.feedback.criteriaScores.experience}/15</li>
                                <li>Soft skills : {conversationDialog.feedback.criteriaScores.softSkills}/15</li>
                              </ul>
                            </div>
                          )}
                          {conversationDialog.feedback.strengths && conversationDialog.feedback.strengths.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase mb-1">Points forts</p>
                              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                {conversationDialog.feedback.strengths.map((item: string, idx: number) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {conversationDialog.feedback.weaknesses && conversationDialog.feedback.weaknesses.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase mb-1">Points à améliorer</p>
                              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                {conversationDialog.feedback.weaknesses.map((item: string, idx: number) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {conversationDialog.feedback.recommendations && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Recommandations</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {conversationDialog.feedback.recommendations}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Aucun feedback IA enregistré pour cette session.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                Aucune conversation disponible.
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  };

  // Mutation pour sauvegarder la review d'un quiz
  const saveQuizReviewMutation = useMutation({
    mutationFn: ({ quizResultId, data }: { quizResultId: string; data: any }) => 
      saveQuizResultReview(quizResultId, data),
    onSuccess: () => {
      toast.success("Review sauvegardée avec succès");
      queryClient.invalidateQueries({ queryKey: ["application-quiz-results"] });
      setReviewModalOpen(false);
      setReviewingQuizResult(null);
      setReviewedAnswers([]);
      setReviewedScore(0);
      setReviewerNotes("");
      setManualCorrections({});
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erreur lors de la sauvegarde de la review");
    }
  });

  // Mutation pour mettre à jour le statut et le score de l'application
  const updateApplicationReviewMutation = useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: any }) =>
      updateApplicationReview(applicationId, data),
    onSuccess: () => {
      toast.success("Statut de candidature mis à jour");
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-quiz-results"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erreur lors de la mise à jour");
    }
  });

  // Ouvrir le modal de review pour QCM ou TECHNICAL
  const handleOpenReviewModal = async (testResult: TestResult) => {
    try {
      const result = await getQuizResultForReview(testResult.id);
      if (result.success && result.data) {
        setReviewingQuizResult(result.data);
        // Initialiser les réponses révisées depuis les réponses existantes
        const answers = result.data.answers as any;
        if (Array.isArray(answers)) {
          setReviewedAnswers([...answers]);
        } else if (typeof answers === 'object' && answers !== null) {
          // Si answers est un objet avec des propriétés
          const answersArray = Object.values(answers);
          setReviewedAnswers(answersArray);
        } else {
          setReviewedAnswers([]);
        }
        setReviewedScore(result.data.score);
        setReviewModalOpen(true);
      } else {
        toast.error(result.message || "Impossible de charger les détails du test");
      }
    } catch (error) {
      console.error("Error loading quiz result:", error);
      toast.error("Erreur lors du chargement des détails");
    }
  };

  // Sauvegarder la review
  const handleSaveReview = async () => {
    if (!reviewingQuizResult) return;

    try {
      const finalScore = calculateReviewedScore();
      await saveQuizReviewMutation.mutateAsync({
        quizResultId: reviewingQuizResult.id,
        data: {
          reviewedAnswers,
          reviewedScore: finalScore,
          reviewerNotes,
          manualCorrections
        }
      });
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  // Calculer le score total basé sur les corrections manuelles
  const calculateReviewedScore = () => {
    if (!reviewingQuizResult) return reviewedScore;
    
    const questions = reviewingQuizResult.questions as any[];
    if (!Array.isArray(questions)) return reviewedScore;
    
    let totalScore = 0;
    questions.forEach((q, index) => {
      const questionId = q.id || index.toString();
      const correction = manualCorrections[questionId];
      if (correction) {
        totalScore += correction.points;
      } else {
        // Utiliser le score original de la réponse
        const originalAnswer = reviewedAnswers.find((a: any) => a.questionId === questionId || a.questionId === q.id);
        if (originalAnswer?.isCorrect) {
          totalScore += q.points || 0;
        }
      }
    });
    
    return totalScore;
  };

  // Rendu principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      {viewMode === "jobs" && <JobsView />}
      {viewMode === "candidates" && <CandidatesView />}
      {viewMode === "results" && <ResultsView />}
      {/* Modal de Review pour QCM et TECHNICAL */}
      

      <ReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        quizResult={reviewingQuizResult}
        reviewedAnswers={reviewedAnswers}
        setReviewedAnswers={setReviewedAnswers}
        reviewedScore={reviewedScore}
        setReviewedScore={setReviewedScore}
        reviewerNotes={reviewerNotes}
        setReviewerNotes={setReviewerNotes}
        manualCorrections={manualCorrections}
        setManualCorrections={setManualCorrections}
        onSave={handleSaveReview}
        isLoading={saveQuizReviewMutation.isPending}
        calculateScore={calculateReviewedScore}
      />
    </div>
  );
};