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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Code2,
  MessageSquare,
  Brain,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Calendar,
  Plus,
  Lightbulb,
  Search,
  Play,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getInterviews, getUserStats } from "@/actions/interview.action";
import { Skeleton } from "@/components/ui/skeleton";

const DIFFICULTY_CONFIG = {
  JUNIOR: {
    label: "Débutant",
    color: "green",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-700 dark:text-green-400",
    badgeColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    buttonColor: "bg-green-600 hover:bg-green-700 dark:bg-green-900 dark:hover:bg-green-800 text-white",
    topBarColor: "bg-green-200 dark:bg-green-800",
  },
  MID: {
    label: "Intermédiaire",
    color: "orange",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    textColor: "text-orange-700 dark:text-orange-400",
    badgeColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    buttonColor: "bg-orange-600 hover:bg-orange-700 dark:bg-orange-900 dark:hover:bg-orange-800 text-white",
    topBarColor: "bg-orange-200 dark:bg-orange-800",
  },
  SENIOR: {
    label: "Avancé",
    color: "red",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-400",
    badgeColor: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    buttonColor: "bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white",
    topBarColor: "bg-red-200 dark:bg-red-800",
  },
};

const INTERVIEW_TYPES = {
  QCM: {
    icon: CheckCircle,
    label: "Quiz Rapide",
  },
  TECHNICAL: {
    icon: Code2,
    label: "Exercices Techniques",
  },
  MOCK_INTERVIEW: {
    icon: MessageSquare,
    label: "Simulation Complète",
  },
  SOFT_SKILLS: {
    icon: Brain,
    label: "Compétences Comportementales",
  },
};

type InterviewType = keyof typeof INTERVIEW_TYPES;

export default function InterviewsHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlPage = parseInt(searchParams?.get("page") || "1");
  const urlTab = (searchParams?.get("tab") as InterviewType) || "QCM";
  const urlDifficulty = searchParams?.get("difficulty") || "";

  const [difficulty, setDifficulty] = useState(urlDifficulty);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<InterviewType>(urlTab);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const itemsPerPage = 12;

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("tab", activeTab);
    if (difficulty) params.set("difficulty", difficulty);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [currentPage, activeTab, difficulty, router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, difficulty, searchTerm]);

  // Charger les interviews et stats
  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: getInterviews,
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
  });

  // Générer des recommandations basées sur les vraies données
  const recommendations = useMemo(() => {
    if (!userStats || !interviewsData || !Array.isArray(interviewsData)) {
      return [];
    }

    const { statsByType, statsByDifficulty, recentInterviews } = userStats;
    const recs = [];

    // Recommandation 1: Type avec faible score
    const lowScoringType = Object.entries(statsByType || {})
      .sort((a, b) => (a[1]?.averageScore || 0) - (b[1]?.averageScore || 0))[0];
    
    if (lowScoringType && lowScoringType[1]?.count > 0) {
      const matchingInterview = interviewsData.find(
        (it: any) => it.type === lowScoringType[0] && !recentInterviews?.some((ri: any) => ri.title === it.title)
      );
      if (matchingInterview) {
        recs.push({
          id: matchingInterview.id,
          title: `Améliorez vos compétences en ${INTERVIEW_TYPES[lowScoringType[0] as InterviewType]?.label}`,
          description: `Votre moyenne est de ${lowScoringType[1].averageScore}% dans ce domaine. Pratiquez cet exercice pour progresser.`,
          interview: matchingInterview,
          priority: "high",
          reason: "score_faible",
        });
      }
    }

    // Recommandation 2: Type avec bon score (défi supérieur)
    const highScoringType = Object.entries(statsByType || {})
      .filter(([_, stats]) => (stats?.averageScore || 0) >= 70 && (stats?.count || 0) > 0)
      .sort((a, b) => (b[1]?.averageScore || 0) - (a[1]?.averageScore || 0))[0];

    if (highScoringType) {
      const harderInterview = interviewsData.find(
        (it: any) => it.type === highScoringType[0] && 
        it.difficulty === "SENIOR" &&
        !recentInterviews?.some((ri: any) => ri.title === it.title)
      );
      if (harderInterview) {
        recs.push({
          id: harderInterview.id,
          title: `Passez au niveau supérieur`,
          description: `Excellent travail ! Passez à un niveau avancé pour continuer à progresser.`,
          interview: harderInterview,
          priority: "medium",
          reason: "progression",
        });
      }
    }

    // Recommandation 3: Difficulté non explorée
    const exploredDifficulties = new Set(
      recentInterviews?.map((ri: any) => ri.difficulty) || []
    );
    const unexploredDifficulty = ["JUNIOR", "MID", "SENIOR"].find(
      (d) => !exploredDifficulties.has(d)
    );

    if (unexploredDifficulty) {
      const newDifficultyInterview = interviewsData.find(
        (it: any) => it.difficulty === unexploredDifficulty &&
        !recentInterviews?.some((ri: any) => ri.title === it.title)
      );
      if (newDifficultyInterview) {
        recs.push({
          id: newDifficultyInterview.id,
          title: `Découvrez le niveau ${DIFFICULTY_CONFIG[unexploredDifficulty as keyof typeof DIFFICULTY_CONFIG].label}`,
          description: `Explorez de nouveaux défis avec ce niveau de difficulté.`,
          interview: newDifficultyInterview,
          priority: "medium",
          reason: "decouverte",
        });
      }
    }

    // Recommandation 4: Type non essayé
    const exploredTypes = new Set(recentInterviews?.map((ri: any) => ri.type) || []);
    const unexploredType = Object.keys(INTERVIEW_TYPES).find(
      (t) => !exploredTypes.has(t)
    );

    if (unexploredType) {
      const newTypeInterview = interviewsData.find((it: any) => it.type === unexploredType);
      if (newTypeInterview) {
        recs.push({
          id: newTypeInterview.id,
          title: `Essayez ${INTERVIEW_TYPES[unexploredType as InterviewType].label}`,
          description: `Diversifiez vos compétences avec ce nouveau type d'exercice.`,
          interview: newTypeInterview,
          priority: "high",
          reason: "nouveau_type",
        });
      }
    }

    return recs.slice(0, 4);
  }, [userStats, interviewsData]);

  // Filtrage des interviews
  const filteredInterviews = useMemo(() => {
    const items = Array.isArray(interviewsData) ? interviewsData : [];
    return items
      .filter((it: any) => (activeTab ? it.type === activeTab : true))
      .filter((it: any) => (difficulty ? it.difficulty === difficulty : true))
      .filter((it: any) =>
        searchTerm
          ? it.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            it.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (it.technology || []).some((tech: string) =>
              tech.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : true
      );
  }, [interviewsData, activeTab, difficulty, searchTerm]);

  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInterviews = filteredInterviews.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const currentType = INTERVIEW_TYPES[activeTab];
  const TypeIcon = currentType.icon;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Entraînement aux entretiens
                </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Préparez-vous avec des simulations réalistes
                </p>
            </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Contenu Principal */}
          <div className="flex-1 space-y-6">
            {/* Filtres et Types */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(INTERVIEW_TYPES) as InterviewType[]).map((type) => {
                    const TypeIcon = INTERVIEW_TYPES[type].icon;
                          const isActive = activeTab === type;
                          return (
                            <button
                              key={type}
                              onClick={() => setActiveTab(type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isActive
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                            : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <TypeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{INTERVIEW_TYPES[type].label}</span>
                            </button>
                          );
                  })}
                    </div>
                  </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par titre, entreprise ou technologie..."
                    className="pl-10 bg-white dark:bg-slate-950"
                  />
                      </div>
                <Select value={difficulty || "all"} onValueChange={(value) => setDifficulty(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-slate-950">
                    <SelectValue placeholder="Toutes difficultés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes difficultés</SelectItem>
                    {Object.entries(DIFFICULTY_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                        </div>
                      </div>

            {/* Recommandations */}
            {showRecommendations && recommendations.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recommandations</h2>
                          </div>
                  <Switch
                    checked={showRecommendations}
                    onCheckedChange={setShowRecommendations}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, index) => {
                    const diffConfig = DIFFICULTY_CONFIG[rec.interview.difficulty as keyof typeof DIFFICULTY_CONFIG];
                    return (
                      <div
                        key={`rec-${rec.id}-${index}`}
                        className={`p-4 rounded-lg ${diffConfig.bgColor} hover:shadow-md transition-all duration-300`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {rec.title}
                          </h3>
                          <Badge className={rec.priority === "high" ? diffConfig.badgeColor : "bg-slate-100 dark:bg-slate-800"}>
                            {rec.priority === "high" ? "Prioritaire" : "Suggéré"}
                            </Badge>
                          </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {rec.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {rec.interview.title}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/interviews/${rec.interview.id}`)}
                          >
                            Commencer <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Liste des Interviews */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Sessions disponibles
                  <Badge variant="outline" className="ml-2">
                    {filteredInterviews.length}
                  </Badge>
                </h2>
              </div>

              {interviewsLoading ? (
                <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Titre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Difficulté</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Durée</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entreprise</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-6 w-20" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-24" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                          </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Titre
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Difficulté
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Durée
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Entreprise
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInterviews.map((quiz: any, index: number) => {
                        const diffConfig = DIFFICULTY_CONFIG[quiz.difficulty as keyof typeof DIFFICULTY_CONFIG];
                        return (
                          <tr
                            key={`table-quiz-${quiz.id}-${index}`}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/interviews/${quiz.id}`)}
                          >
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                          {quiz.title}
                          </div>
                                {quiz.description && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                    {quiz.description}
                        </div>
                                )}
                          </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${diffConfig.badgeColor} font-medium text-xs px-2 py-0.5`}>
                                {diffConfig.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                              {Math.round((quiz.duration || 0) / 60)} min
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                              {quiz.company || "DevPrepAI"}
                            </td>
                            <td className="px-4 py-3">
                        <Button
                                size="sm"
                                className={`${diffConfig.buttonColor} font-medium text-xs`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/interviews/${quiz.id}`);
                                }}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Démarrer
                        </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              </div>
              )}

              {/* Pagination */}
              {!interviewsLoading && totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredInterviews.length)} sur {filteredInterviews.length}
                      </div>
                  <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          variant={currentPage === pageNumber ? "default" : "outline"}
                                size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                              >
                                {pageNumber}
                              </Button>
                            );
                    })}
                        <Button
                          variant="outline"
                          size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
              )}

              {!interviewsLoading && paginatedInterviews.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-lg py-12 text-center">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Aucun résultat trouvé
                    </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Aucune session ne correspond à vos critères de recherche.
                    </p>
                    <Button
                    variant="outline"
                    className="bg-white dark:bg-slate-950"
                    onClick={() => {
                      setSearchTerm("");
                      setDifficulty("");
                    }}
                  >
                    Réinitialiser les filtres
                    </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-4">
            <div className="sticky top-6 space-y-4">
              {/* Statistiques */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Mes Performances</h2>
                    </div>
                <div className="space-y-4">
                  {statsLoading ? (
                  <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                  </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {userStats?.totalInterviews || 0}
                            </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Sessions
                  </div>
                      </div>
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {userStats?.averageScore || 0}%
                    </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Moyenne
                        </div>
                        </div>
                      </div>
                      {userStats?.statsByDifficulty && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Par difficulté
                    </div>
                          {Object.entries(userStats.statsByDifficulty).map(
                            ([diff, stats]: [string, any]) => {
                              const config = DIFFICULTY_CONFIG[diff as keyof typeof DIFFICULTY_CONFIG];
                              if (!stats.count) return null;
                              return (
                                <div key={diff} className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className={config.textColor}>{config.label}</span>
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {stats.averageScore}%
                                    </span>
                  </div>
                                  <Progress
                                    value={stats.averageScore}
                                    className="h-1.5"
                                  />
                    </div>
                              );
                            }
                          )}
                      </div>
                      )}
                    </>
                  )}
                    </div>
                  </div>

              {/* Planification */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Planifier</h2>
                    </div>
                <div className="space-y-3">
                  <Input type="date" className="bg-white dark:bg-slate-950" />
                  <Input type="time" className="bg-white dark:bg-slate-950" />
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Programmer
                  </Button>
                    </div>
                  </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
