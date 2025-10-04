"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  Mic,
  Code2,
  MessageSquare,
  Brain,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Trophy,
  Target,
  Calendar,
  Plus,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Award,
  Users,
  Zap,
  Star,
  Search,
  Play,
  Timer,
  BarChart3,
  Rocket,
  Crown,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getInterviews } from "@/actions/interview.action";
import { Skeleton } from "@/components/ui/skeleton";

const PROFESSIONS = [
  "Développement Fullstack",
  "Data Science",
  "Analyse Financière",
  "Stratégie Business",
  "Ingénierie Logicielle",
  "Design UX/UI",
  "DevOps & Cloud",
  "Cybersécurité",
  "Marketing Digital",
  "Product Management",
  "Architecture Cloud",
  "Développement Mobile",
  "Développement Web",
  "Communication",
  "Management",
  "Formation",
  "Santé Digitale",
] as const;

const DIFFICULTY_LEVELS = [
  {
    value: "JUNIOR",
    label: "Débutant",
    color: "from-green-500 to-emerald-500",
  },
  { value: "MID", label: "Intermédiaire", color: "from-blue-500 to-cyan-500" },
  { value: "SENIOR", label: "Avancé", color: "from-purple-500 to-pink-500" },
] as const;

const INTERVIEW_TYPES = {
  QCM: {
    icon: CheckCircle,
    label: "Quiz Rapide",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500",
    description:
      "Questions à choix multiples pour valider vos connaissances fondamentales",
    badge: "15-25 min",
    difficulty: "accessible",
    successRate: 78,
    questions: "20 questions",
    skills: ["Connaissances théoriques", "Rapidité", "Précision"],
  },
  TECHNICAL: {
    icon: Code2,
    label: "Exercices Techniques",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-500",
    description:
      "Résolution de problèmes et exercices de programmation en temps limité",
    badge: "45-60 min",
    difficulty: "intermédiaire",
    successRate: 65,
    questions: "3-5 problèmes",
    skills: ["Résolution de problèmes", "Optimisation", "Best practices"],
  },
  MOCK_INTERVIEW: {
    icon: MessageSquare,
    label: "Simulation Complète",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500",
    description:
      "Entretien réaliste avec feedback détaillé sur vos compétences techniques et comportementales",
    badge: "60-90 min",
    difficulty: "avancé",
    successRate: 52,
    questions: "Session complète",
    skills: ["Communication", "Présentation", "Gestion du stress"],
  },
  SOFT_SKILLS: {
    icon: Brain,
    label: "Compétences Comportementales",
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-500",
    description:
      "Évaluation de vos aptitudes relationnelles et de collaboration en milieu professionnel",
    badge: "30-45 min",
    difficulty: "essentiel",
    successRate: 82,
    questions: "Scénarios pratiques",
    skills: ["Leadership", "Collaboration", "Adaptabilité"],
  },
};

const AI_RECOMMENDATIONS = [
  {
    id: 1,
    icon: TrendingUp,
    title: "Perfectionnez vos compétences JavaScript",
    description:
      "Vos résultats montrent un fort potentiel en JavaScript. Approfondissez les concepts avancés.",
    category: "TECHNICAL",
    priority: "high",
    progress: 70,
    actionLabel: "Commencer les exercices",
    metrics: { completion: 65, improvement: 15 },
  },
  {
    id: 2,
    icon: BookOpen,
    title: "Développez votre communication technique",
    description:
      "Améliorez votre capacité à expliquer des concepts complexes lors des entretiens.",
    category: "SOFT_SKILLS",
    priority: "medium",
    progress: 45,
    actionLabel: "Pratiquer maintenant",
    metrics: { completion: 45, improvement: 25 },
  },
  {
    id: 3,
    icon: Award,
    title: "Préparez-vous pour un entretien senior",
    description:
      "Vous êtes prêt pour des simulations complètes avec des questions de haut niveau.",
    category: "MOCK_INTERVIEW",
    priority: "high",
    progress: 80,
    actionLabel: "Planifier une session",
    metrics: { completion: 80, improvement: 8 },
  },
  {
    id: 4,
    icon: Rocket,
    title: "Maîtrisez les systèmes distribués",
    description:
      "Approfondissez vos connaissances en architecture cloud et microservices.",
    category: "TECHNICAL",
    priority: "medium",
    progress: 35,
    actionLabel: "Explorer le module",
    metrics: { completion: 35, improvement: 40 },
  },
];

type InterviewType = keyof typeof INTERVIEW_TYPES;

export default function InterviewsHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Récupération des paramètres d'URL avec valeurs par défaut
  const urlPage = parseInt(searchParams?.get("page") || "1");
  const urlTab = (searchParams?.get("tab") as InterviewType) || "QCM";
  const urlProfession =
    searchParams?.get("profession") || "Développement Fullstack";
  const urlDifficulty = searchParams?.get("difficulty") || "MID";

  const [profession, setProfession] = useState(urlProfession);
  const [difficulty, setDifficulty] = useState(urlDifficulty);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<InterviewType>(urlTab);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleType, setScheduleType] = useState<InterviewType>("QCM");
  const [showRecommendations, setShowRecommendations] = useState(true);

  const itemsPerPage = 4; // Réduit pour moins de saturation

  // Mise à jour des URL params quand les états changent
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("tab", activeTab);
    params.set("profession", profession);
    params.set("difficulty", difficulty);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [currentPage, activeTab, profession, difficulty, router]);

  // Scroll vers le haut quand la page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Charger les interviews depuis la base
  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: getInterviews
  //  staleTime: 60 * 1000,
   // refetchOnWindowFocus: false,
  });

  // Filtrage des interviews selon l'onglet (type), difficulté et recherche
  const filteredInterviews = useMemo(() => {
    const items = Array.isArray(interviewsData) ? interviewsData : [];
    return items
      .filter((it: any) => (activeTab ? it.type === activeTab : true))
      .filter((it: any) => (difficulty ? it.difficulty === difficulty : true))
      .filter((it: any) =>
        searchTerm
          ? it.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            it.company?.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      );
  }, [interviewsData, activeTab, difficulty, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInterviews = filteredInterviews.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const currentType = INTERVIEW_TYPES[activeTab];
  const Icon = currentType.icon;
  const currentDifficulty = DIFFICULTY_LEVELS.find(
    (d) => d.value === difficulty
  );

  const handleScheduleSession = () => {
    if (!scheduleDate || !scheduleTime) {
      alert("Veuillez sélectionner une date et une heure");
      return;
    }
    alert(
      `Session ${scheduleType} programmée le ${scheduleDate} à ${scheduleTime}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Principal - Simplifié */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Entrainement aux entretiens
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base mt-2 max-w-2xl">
                  Préparez-vous avec des simulations réalistes et boostez vos
                  compétences
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-lg">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      1,248
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      sessions/semaine
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-lg">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      87%
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      taux de réussite
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Layout Principal amélioré */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Contenu Principal - Plus large */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Navigation par Type d'Interview - Simplifiée */}
            <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-xl">
              <CardContent className="p-4 lg:p-6">
                <div className="relative w-full">
                  {/* Tabs Glass Morphism */}
                  <div className="relative bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-slate-700/30 p-3 shadow-2xl">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {(Object.keys(INTERVIEW_TYPES) as InterviewType[]).map(
                        (type) => {
                          const config = INTERVIEW_TYPES[type];
                          const TypeIcon = config.icon;
                          const isActive = activeTab === type;

                          return (
                            <button
                              key={type}
                              onClick={() => setActiveTab(type)}
                              className={`
              relative group flex flex-col items-center justify-center p-3 rounded-2xl
              transition-all duration-500 ease-out backdrop-blur-lg
              ${
                isActive
                  ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-200/50 dark:border-blue-500/30 text-blue-600 dark:text-blue-400"
                  : "bg-white/30 dark:bg-slate-700/30 border border-white/20 dark:border-slate-600/30 text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-600/40"
              }
            `}
                            >
                              {/* Effet de brillance */}
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              <div className="relative z-10 flex flex-col items-center gap-2">
                                <div
                                  className={`
                p-2 rounded-xl transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-500/10"
                    : "bg-white/50 dark:bg-slate-600/50 group-hover:bg-blue-500/10"
                }
              `}
                                >
                                  <TypeIcon
                                    className={`
                  w-4 h-4 transition-all duration-300
                  ${
                    isActive
                      ? "text-blue-500 scale-110"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-blue-400 group-hover:scale-105"
                  }
                `}
                                  />
                                </div>

                                <span
                                  className={`
                text-xs font-semibold text-center leading-tight
                ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                }
              `}
                                >
                                  {config.label}
                                </span>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* En-tête du Type Sélectionné - Plus épuré */}
                <div className="mt-4 p-4 lg:p-6 rounded-xl bg-gradient-to-br from-slate-50/80 to-blue-50/80 dark:from-slate-800/80 dark:to-blue-900/30 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${currentType.color} rounded-xl blur-lg opacity-50`}
                      />
                      <div
                        className={`relative p-3 rounded-xl bg-gradient-to-br ${currentType.color} text-white shadow-xl`}
                      >
                        <Icon className="w-6 h-6 lg:w-8 lg:h-8" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {currentType.label}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            {currentType.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1"
                          >
                            <Timer className="w-3 h-3 mr-1" />
                            {currentType.badge}
                          </Badge>
                          <Badge
                            className={`bg-gradient-to-r ${currentType.color} text-white border-0 px-2 py-1 text-xs shadow-lg`}
                          >
                            {currentType.difficulty}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              Réussite
                            </p>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {currentType.successRate}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              Format
                            </p>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {currentType.questions}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommandations IA - Design amélioré */}
            {showRecommendations && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    Recommandations IA
                  </h2>
                  <Switch
                    checked={showRecommendations}
                    onCheckedChange={setShowRecommendations}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {AI_RECOMMENDATIONS.map((recommendation) => {
                    const RecIcon = recommendation.icon;
                    const typeConfig =
                      INTERVIEW_TYPES[recommendation.category as InterviewType];

                    return (
                      <Card
                        key={recommendation.id}
                        className="relative overflow-hidden border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${typeConfig.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                        />

                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.color} text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}
                              >
                                <RecIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                                  {recommendation.title}
                                </CardTitle>
                                <CardDescription className="text-sm leading-relaxed line-clamp-2">
                                  {recommendation.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge
                              className={
                                recommendation.priority === "high"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0 shadow-sm text-xs"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 shadow-sm text-xs"
                              }
                            >
                              {recommendation.priority === "high"
                                ? "Prioritaire"
                                : "Suggéré"}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400 font-medium">
                                Progression
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {recommendation.progress}%
                              </span>
                            </div>
                            <Progress
                              value={recommendation.progress}
                              className="h-2 shadow-inner"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                              <div className="text-base font-bold text-slate-900 dark:text-white">
                                {recommendation.metrics.completion}%
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                Complétion
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-700/50">
                              <div className="text-base font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" />+
                                {recommendation.metrics.improvement}%
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                Amélioration
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter>
                          <Button
                            className={`w-full bg-gradient-to-r ${typeConfig.color} hover:shadow-lg text-white font-semibold text-sm group-hover:scale-[1.02] transition-transform`}
                            onClick={() =>
                              setActiveTab(
                                recommendation.category as InterviewType
                              )
                            }
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {recommendation.actionLabel}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grille des Sessions - Améliorée */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  Sessions Disponibles
                  <Badge
                    variant="outline"
                    className="text-sm font-semibold ml-2"
                  >
                    {filteredInterviews.length} interviews
                  </Badge>
                </h2>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un domaine..."
                    className="pl-10 w-full h-11 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-lg"
                  />
                </div>
              </div>

              {/* Grille responsive améliorée */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-1 gap-4">
                {interviewsLoading && (
                  <>
                    {Array.from({ length: itemsPerPage }).map((_, i) => (
                      <Card
                        key={`skeleton-${i}`}
                        className="border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-3">
                            <Skeleton className="h-6 w-6 rounded-lg" />
                            <div className="flex flex-col items-end gap-2">
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-5 w-2/3 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-10 w-full" />
                        </CardFooter>
                      </Card>
                    ))}
                  </>
                )}
                {!interviewsLoading &&
                  paginatedInterviews.map((quiz: any) => (
                    <Card
                      key={quiz.id}
                      className="group relative overflow-hidden border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${currentType.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      />

                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${currentType.color} text-white shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant="secondary"
                              className="text-xs font-semibold shadow-sm"
                            >
                              {quiz.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                              <Crown className="w-3 h-3" />
                              <span className="text-xs font-bold">
                                {quiz.totalPoints} points
                              </span>
                            </div>
                          </div>
                        </div>

                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 line-clamp-2">
                          {quiz.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed line-clamp-2">
                          {quiz.description || currentType.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3 relative">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">
                              Durée
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {Math.round((quiz.duration || 0) / 60)} min
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {quiz.company || "DevPrepAI"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <span className="text-xs uppercase font-semibold">
                              {quiz.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {(quiz.technology || [])
                            .slice(0, 3)
                            .map((tech: string, idx: number) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs font-medium"
                              >
                                {tech}
                              </Badge>
                            ))}
                        </div>
                      </CardContent>

                      <CardFooter className="relative">
                        <Button
                          className={`w-full h-11 bg-gradient-to-r ${currentType.color} hover:shadow-lg text-white font-bold text-sm group-hover:scale-[1.02] transition-all`}
                          onClick={() => router.push(`/interviews/${quiz.id}`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Démarrer la Session
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>

              {/* Pagination - Améliorée */}
              {!interviewsLoading && totalPages > 1 && (
                <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Affichage{" "}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {startIndex + 1}-
                          {Math.min(
                            startIndex + itemsPerPage,
                            filteredInterviews.length
                          )}
                        </span>{" "}
                        sur{" "}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {filteredInterviews.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-9 w-9 p-0 shadow-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNumber}
                                variant={
                                  currentPage === pageNumber
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNumber)}
                                className={`h-9 w-9 shadow-sm text-xs ${
                                  currentPage === pageNumber
                                    ? `bg-gradient-to-br ${currentType.color} text-white border-0 shadow-md`
                                    : ""
                                }`}
                              >
                                {pageNumber}
                              </Button>
                            );
                          }
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-9 w-9 p-0 shadow-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* État Vide - Redesigné */}
              {!interviewsLoading && paginatedInterviews.length === 0 && (
                <Card className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                  <CardContent>
                    <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-4 shadow-inner">
                      <Search className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Aucun domaine trouvé
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto leading-relaxed text-sm">
                      Aucun domaine ne correspond à votre recherche. Essayez
                      d'ajuster vos critères ou explorez d'autres catégories.
                    </p>
                    <Button
                      onClick={() => setSearchTerm("")}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg text-white font-semibold text-sm"
                    >
                      Réinitialiser la recherche
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar Droite - Améliorée pour la visibilité */}
          <div className="xl:w-96 xl:flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Filtres Rapides - Plus compact */}
              <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <Filter className="w-4 h-4 text-white" />
                    </div>
                    Filtres & Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  {/* Filtre Métier */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Domaine professionnel
                    </Label>
                    <Select value={profession} onValueChange={setProfession}>
                      <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFESSIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtre Difficulté */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Niveau de difficulté
                    </Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full bg-gradient-to-r ${level.color} shadow-sm`}
                              />
                              <span className="font-medium text-sm">
                                {level.label}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="my-4" />

                  {/* Planificateur - Plus compact */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Planifier une session
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Select
                        value={scheduleType}
                        onValueChange={(v) =>
                          setScheduleType(v as InterviewType)
                        }
                      >
                        <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(INTERVIEW_TYPES).map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="text-sm"
                            >
                              {INTERVIEW_TYPES[type as InterviewType].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Date
                          </Label>
                          <Input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Heure
                          </Label>
                          <Input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleScheduleSession}
                        className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg text-white font-semibold text-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Programmer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques Rapides - Plus compact */}
              <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    Mes Performances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        24
                      </div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                        Sessions
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50">
                      <div className="text-2xl font-black text-green-600 dark:text-green-400">
                        78%
                      </div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                        Réussite
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Progression globale
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        65%
                      </span>
                    </div>
                    <Progress value={65} className="h-2 shadow-inner" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Objectif: 85%
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +12%
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-10 font-semibold shadow-sm hover:shadow-lg transition-shadow text-sm"
                  >
                    Voir le détail complet
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
