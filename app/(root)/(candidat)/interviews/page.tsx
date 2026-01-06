"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Code2,
  MessageSquare,
  Brain,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Search,
  Play,
  Briefcase,
  Filter,
  Sparkles,
  Trophy,
  Target,
  Users,
  LayoutGrid,
  List,
  MoreHorizontal
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getInterviews, getUserStats } from "@/actions/interview.action";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CustomizeInterviewDialog } from "./components/customize-interview-dialog";

// Configuration des difficultés
const DIFFICULTY_CONFIG = {
  JUNIOR: {
    label: "Débutant",
    color: "emerald",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    textColor: "text-emerald-700 dark:text-emerald-400",
    badgeColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  MID: {
    label: "Intermédiaire",
    color: "blue",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-400",
    badgeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  SENIOR: {
    label: "Avancé",
    color: "purple",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-400",
    badgeColor: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
};

const INTERVIEW_TYPES = {
  QCM: {
    icon: CheckCircle,
    label: "Quiz Rapide",
    description: "Testez vos connaissances en 5 min",
  },
  TECHNICAL: {
    icon: Code2,
    label: "Technique",
    description: "Résolution de problèmes & algo",
  },
  MOCK_INTERVIEW: {
    icon: MessageSquare,
    label: "Simulation",
    description: "Entraînement en conditions réelles",
  },
  SOFT_SKILLS: {
    icon: Brain,
    label: "Soft Skills",
    description: "Communication & comportement",
  },
};

const COMPANY_LOGOS: Record<string, string> = {
  "Google": "/covers/google.png",
  "Meta": "/covers/facebook.png",
  "Amazon": "/covers/amazon.png",
  "Netflix": "/covers/netflix.png",
  "Apple": "/covers/apple.png",
  "Microsoft": "/covers/microsoft.png",
  "Spotify": "/covers/spotify.png",
  "Uber": "/covers/uber.png",
  "Airbnb": "/covers/airbnb.png",
  "Twitter": "/covers/twitter.png",
  "LinkedIn": "/covers/linkedin.png",
  "Adobe": "/covers/adobe.png",
  "Tiktok": "/covers/tiktok.png",
  "Pinterest": "/covers/pinterest.png",
  "Reddit": "/covers/reddit.png",
  "Quora": "/covers/quora.png",
  "Yahoo": "/covers/yahoo.png",
  "Skype": "/covers/skype.png",
  "Telegram": "/covers/telegram.png",
  "Hostinger": "/covers/hostinger.png",
};

const getCompanyLogo = (companyName: string) => {
  if (!companyName) return null;
  const key = Object.keys(COMPANY_LOGOS).find(k => k.toLowerCase() === companyName.toLowerCase());
  return key ? COMPANY_LOGOS[key] : null;
};

type InterviewType = keyof typeof INTERVIEW_TYPES;

export default function InterviewsHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlPage = parseInt(searchParams?.get("page") || "1");
  const urlTab = (searchParams?.get("tab") as InterviewType) || "ALL";
  const urlDifficulty = searchParams?.get("difficulty") || "";

  const [difficulty, setDifficulty] = useState(urlDifficulty);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>(urlTab);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const itemsPerPage = viewMode === "grid" ? 9 : 12;

  useEffect(() => {
    const savedView = localStorage.getItem("interviewsViewMode");
    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }
  }, []);

  const toggleView = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("interviewsViewMode", mode);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    if (activeTab !== "ALL") params.set("tab", activeTab);
    if (difficulty) params.set("difficulty", difficulty);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [currentPage, activeTab, difficulty, router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, difficulty, searchTerm]);

  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: getInterviews,
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
  });

  const filteredInterviews = useMemo(() => {
    const items = Array.isArray(interviewsData) ? interviewsData : [];
    return items
      .filter((it: any) => (activeTab !== "ALL" ? it.type === activeTab : true))
      .filter((it: any) => (difficulty && difficulty !== "all" ? it.difficulty === difficulty : true))
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

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Banner Section - Simplifiée */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-emerald-600 dark:bg-emerald-900/40 p-8 md:p-10 text-white shadow-xl shadow-emerald-500/10"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Target className="w-64 h-64 rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Préparez votre avenir <br />
                <span className="text-emerald-200">dès aujourd'hui</span>
              </h1>

              {/* Stats Rapides - Design minimaliste intégré */}
              {!statsLoading && (
                <div className="flex items-center gap-8 pt-6">
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                      <Trophy className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold tracking-tight">{userStats?.averageScore || 0}%</div>
                      <div className="text-xs text-emerald-100/80 font-medium">Réussite moyenne</div>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-emerald-500/30" />
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                      <Clock className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold tracking-tight">{userStats?.totalInterviews || 0}</div>
                      <div className="text-xs text-emerald-100/80 font-medium">Sessions complétées</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>

        {/* Filters & Controls */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/50 p-2 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto p-1 scrollbar-hide">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === "ALL"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
              >
                Tout voir
              </button>
              {(Object.keys(INTERVIEW_TYPES) as InterviewType[]).map((type) => {
                const isActive = activeTab === type;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                  >
                    {INTERVIEW_TYPES[type].label}
                  </button>
                );
              })}
            </div>

            {/* View & Search Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto px-2">
              {/* Customize Button moved to Banner */}
              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2">
                <button
                  onClick={() => toggleView("grid")}
                  className={`p-2 rounded-md transition-all ${viewMode === "grid"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  title="Vue grille"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleView("list")}
                  className={`p-2 rounded-md transition-all ${viewMode === "list"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  title="Vue liste"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="relative flex-1 lg:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 ring-1 ring-slate-200/50 dark:ring-slate-700/50 focus-visible:ring-emerald-500 transition-all"
                />
              </div>
              <Select value={difficulty || "all"} onValueChange={(value) => setDifficulty(value === "all" ? "" : value)}>
                <SelectTrigger className="w-[140px] h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  {Object.entries(DIFFICULTY_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full bg-${config.color}-500`} />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customization CTA - Below widgets */}
          <div className="flex justify-end">
            <CustomizeInterviewDialog />
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {interviewsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-[280px] border-none shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader className="space-y-4">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardHeader>
                  </Card>
                ))
                : paginatedInterviews.map((interview: any, index: number) => {
                  const diffConfig = DIFFICULTY_CONFIG[interview.difficulty as keyof typeof DIFFICULTY_CONFIG];
                  const logo = getCompanyLogo(interview.company);

                  return (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className="group h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/20 transition-all duration-300 overflow-hidden cursor-pointer"
                        onClick={() => router.push(`/interviews/${interview.id}`)}
                      >
                        <CardHeader className="p-6 pb-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="relative h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 p-2 ring-1 ring-slate-100 dark:ring-slate-700/50 group-hover:scale-105 transition-transform">
                              {logo ? (
                                <Image
                                  src={logo}
                                  alt={interview.company}
                                  fill
                                  className="object-contain p-1"
                                />
                              ) : (
                                <Briefcase className="w-full h-full text-slate-300" />
                              )}
                            </div>
                            <Badge variant="outline" className={`${diffConfig?.badgeColor} border font-medium`}>
                              {diffConfig?.label}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {interview.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 mt-1.5 text-sm">
                            {interview.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="px-6 py-2 flex-1">
                          <div className="flex flex-wrap gap-2">
                            {(interview.technology || []).slice(0, 3).map((tech: string, i: number) => (
                              <span key={i} className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 rounded-md font-medium uppercase tracking-wide">
                                {tech}
                              </span>
                            ))}
                            {(interview.technology?.length || 0) > 3 && (
                              <span className="text-[10px] px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 rounded-md">
                                +{interview.technology.length - 3}
                              </span>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {Math.round((interview.duration || 0) / 60)} min
                            </span>
                            <span className="flex -space-x-1.5">
                              {[1, 2, 3].map((_, i) => (
                                <div key={i} className="w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                  {["JD", "AB", "MK"][i]}
                                </div>
                              ))}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {interviewsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 w-full rounded-2xl bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
                ))
                : paginatedInterviews.map((interview: any, index: number) => {
                  const diffConfig = DIFFICULTY_CONFIG[interview.difficulty as keyof typeof DIFFICULTY_CONFIG];
                  const logo = getCompanyLogo(interview.company);

                  return (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="group flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl hover:border-emerald-500/30 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => router.push(`/interviews/${interview.id}`)}
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800 p-1.5 ring-1 ring-slate-100 dark:ring-slate-700/50 mr-4">
                        {logo ? (
                          <Image
                            src={logo}
                            alt={interview.company}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <Briefcase className="w-full h-full text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 mr-6">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {interview.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none">
                            {diffConfig?.label}
                          </Badge>
                          <span className="text-slate-300">|</span>
                          <p className="text-sm text-slate-500 truncate max-w-[300px]">
                            {interview.description}
                          </p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-4 mr-8">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.round((interview.duration || 0) / 60)}m
                        </div>
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">
                              {["JD", "AB", "MK"][i]}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                      >
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </Button>
                    </motion.div>
                  );
                })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!interviewsLoading && paginatedInterviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Aucun résultat
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6 text-sm">
              Essayez de modifier vos filtres pour trouver ce que vous cherchez.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setDifficulty("");
                setActiveTab("ALL");
              }}
            >
              Réinitialiser
            </Button>
          </div>
        )}

        {/* Pagination - Minimalist */}
        {!interviewsLoading && totalPages > 1 && (
          <div className="flex justify-center pt-8">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 p-0 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 px-2">
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
                      variant={currentPage === pageNumber ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 p-0 rounded-lg text-xs font-medium transition-all ${currentPage === pageNumber
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 scale-110"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
                        }`}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 p-0 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
