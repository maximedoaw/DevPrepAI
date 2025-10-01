"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Sparkles, Mic, Code2, MessageSquare, Brain, Filter, 
  ChevronLeft, ChevronRight, CheckCircle, Clock, Trophy, 
  Target, Calendar, Plus, Lightbulb, TrendingUp, BookOpen, 
  Award, Users, Zap, Star, Search, Play, Timer,
  BarChart3, Rocket, Crown, ArrowUpRight, TrendingDown
} from 'lucide-react';

const PROFESSIONS = [
  'Développement Fullstack', 'Data Science', 'Analyse Financière', 'Stratégie Business', 'Ingénierie Logicielle', 
  'Design UX/UI', 'DevOps & Cloud', 'Cybersécurité', 'Marketing Digital', 'Product Management', 
  'Architecture Cloud', 'Développement Mobile', 'Développement Web', 'Communication', 'Management', 
  'Formation', 'Santé Digitale'
] as const;

const DIFFICULTY_LEVELS = [
  { value: 'JUNIOR', label: 'Débutant', color: 'from-green-500 to-emerald-500' },
  { value: 'MID', label: 'Intermédiaire', color: 'from-blue-500 to-cyan-500' },
  { value: 'SENIOR', label: 'Avancé', color: 'from-purple-500 to-pink-500' }
] as const;

const INTERVIEW_TYPES = {
  QCM: {
    icon: CheckCircle,
    label: 'Quiz Rapide',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500',
    description: 'Questions à choix multiples pour valider vos connaissances fondamentales',
    badge: '15-25 min',
    difficulty: 'accessible',
    successRate: 78,
    questions: '20 questions',
    skills: ['Connaissances théoriques', 'Rapidité', 'Précision']
  },
  TECHNICAL: {
    icon: Code2,
    label: 'Exercices Techniques',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500',
    description: 'Résolution de problèmes et exercices de programmation en temps limité',
    badge: '45-60 min',
    difficulty: 'intermédiaire',
    successRate: 65,
    questions: '3-5 problèmes',
    skills: ['Résolution de problèmes', 'Optimisation', 'Best practices']
  },
  MOCK_INTERVIEW: {
    icon: MessageSquare,
    label: 'Simulation Complète',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500',
    description: 'Entretien réaliste avec feedback détaillé sur vos compétences techniques et comportementales',
    badge: '60-90 min',
    difficulty: 'avancé',
    successRate: 52,
    questions: 'Session complète',
    skills: ['Communication', 'Présentation', 'Gestion du stress']
  },
  SOFT_SKILLS: {
    icon: Brain,
    label: 'Compétences Comportementales',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-500',
    description: 'Évaluation de vos aptitudes relationnelles et de collaboration en milieu professionnel',
    badge: '30-45 min',
    difficulty: 'essentiel',
    successRate: 82,
    questions: 'Scénarios pratiques',
    skills: ['Leadership', 'Collaboration', 'Adaptabilité']
  }
};

const AI_RECOMMENDATIONS = [
  {
    id: 1,
    icon: TrendingUp,
    title: 'Perfectionnez vos compétences JavaScript',
    description: 'Vos résultats montrent un fort potentiel en JavaScript. Approfondissez les concepts avancés.',
    category: 'TECHNICAL',
    priority: 'high',
    progress: 70,
    actionLabel: 'Commencer les exercices',
    metrics: { completion: 65, improvement: 15 }
  },
  {
    id: 2,
    icon: BookOpen,
    title: 'Développez votre communication technique',
    description: 'Améliorez votre capacité à expliquer des concepts complexes lors des entretiens.',
    category: 'SOFT_SKILLS',
    priority: 'medium',
    progress: 45,
    actionLabel: 'Pratiquer maintenant',
    metrics: { completion: 45, improvement: 25 }
  },
  {
    id: 3,
    icon: Award,
    title: 'Préparez-vous pour un entretien senior',
    description: 'Vous êtes prêt pour des simulations complètes avec des questions de haut niveau.',
    category: 'MOCK_INTERVIEW',
    priority: 'high',
    progress: 80,
    actionLabel: 'Planifier une session',
    metrics: { completion: 80, improvement: 8 }
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Maîtrisez les systèmes distribués',
    description: 'Approfondissez vos connaissances en architecture cloud et microservices.',
    category: 'TECHNICAL',
    priority: 'medium',
    progress: 35,
    actionLabel: 'Explorer le module',
    metrics: { completion: 35, improvement: 40 }
  }
];

type InterviewType = keyof typeof INTERVIEW_TYPES;

export default function InterviewsHubPage() {
  const [profession, setProfession] = useState('Développement Fullstack');
  const [difficulty, setDifficulty] = useState('MID');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<InterviewType>('QCM');
  const [currentPage, setCurrentPage] = useState(1);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleType, setScheduleType] = useState<InterviewType>('QCM');
  const [showRecommendations, setShowRecommendations] = useState(true);
  const itemsPerPage = 6;

  const filteredProfessions = useMemo(() => {
    return PROFESSIONS.filter(profession =>
      profession.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(filteredProfessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProfessions = filteredProfessions.slice(startIndex, startIndex + itemsPerPage);

  const currentType = INTERVIEW_TYPES[activeTab];
  const Icon = currentType.icon;
  const currentDifficulty = DIFFICULTY_LEVELS.find(d => d.value === difficulty);

  const handleScheduleSession = () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Veuillez sélectionner une date et une heure');
      return;
    }
    alert(`Session ${scheduleType} programmée le ${scheduleDate} à ${scheduleTime}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Principal - Amélioré */}
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
                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Centre d'Entretiens IA
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-base mt-2">
                  Préparez-vous avec des simulations réalistes et boostez vos compétences
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">1,248</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">sessions/semaine</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">87%</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">taux de réussite</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Layout Principal avec Sidebar Sticky */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Contenu Principal */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Navigation par Type d'Interview - Redesignée */}
            <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
              <CardContent className="p-6 relative">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as InterviewType)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-3 p-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl backdrop-blur-xl">
                    {(Object.keys(INTERVIEW_TYPES) as InterviewType[]).map((type) => {
                      const config = INTERVIEW_TYPES[type];
                      const TypeIcon = config.icon;
                      return (
                        <TabsTrigger 
                          key={type} 
                          value={type} 
                          className="flex flex-col sm:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-xl transition-all duration-300 rounded-xl"
                        >
                          <TypeIcon className="w-5 h-5" />
                          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{config.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>

                {/* En-tête du Type Sélectionné - Amélioré */}
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50/80 to-blue-50/80 dark:from-slate-800/80 dark:to-blue-900/30 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${currentType.color} rounded-2xl blur-lg opacity-50`} />
                      <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${currentType.color} text-white shadow-2xl`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {currentType.label}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {currentType.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-sm px-3 py-1">
                            <Timer className="w-4 h-4 mr-1" />
                            {currentType.badge}
                          </Badge>
                          <Badge className={`bg-gradient-to-r ${currentType.color} text-white border-0 px-3 py-1 shadow-lg`}>
                            {currentType.difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">Réussite</p>
                            <p className="font-bold text-slate-900 dark:text-white">{currentType.successRate}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">Format</p>
                            <p className="font-bold text-slate-900 dark:text-white">{currentType.questions}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommandations IA - Design gaming */}
            {showRecommendations && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    Recommandations IA
                  </h2>
                  <Switch
                    checked={showRecommendations}
                    onCheckedChange={setShowRecommendations}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {AI_RECOMMENDATIONS.map((recommendation) => {
                    const RecIcon = recommendation.icon;
                    const typeConfig = INTERVIEW_TYPES[recommendation.category as InterviewType];
                    
                    return (
                      <Card 
                        key={recommendation.id} 
                        className="relative overflow-hidden border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${typeConfig.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                        
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${typeConfig.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <RecIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                  {recommendation.title}
                                </CardTitle>
                                <CardDescription className="text-sm leading-relaxed">
                                  {recommendation.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge className={
                              recommendation.priority === 'high' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0 shadow-sm' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 shadow-sm'
                            }>
                              {recommendation.priority === 'high' ? 'Prioritaire' : 'Suggéré'}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400 font-medium">Progression</span>
                              <span className="font-bold text-slate-900 dark:text-white">{recommendation.progress}%</span>
                            </div>
                            <Progress value={recommendation.progress} className="h-3 shadow-inner" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                              <div className="text-lg font-bold text-slate-900 dark:text-white">{recommendation.metrics.completion}%</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Complétion</div>
                            </div>
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-700/50">
                              <div className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                <ArrowUpRight className="w-4 h-4" />
                                +{recommendation.metrics.improvement}%
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Amélioration</div>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter>
                          <Button 
                            className={`w-full bg-gradient-to-r ${typeConfig.color} hover:shadow-xl text-white font-semibold group-hover:scale-[1.02] transition-transform`}
                            onClick={() => setActiveTab(recommendation.category as InterviewType)}
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
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  Sessions Disponibles
                  <Badge variant="outline" className="text-sm font-semibold">
                    {filteredProfessions.length} domaines
                  </Badge>
                </h2>
                
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un domaine..."
                    className="pl-12 w-full sm:w-80 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProfessions.map((profession) => (
                  <Card 
                    key={profession}
                    className="group relative overflow-hidden border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentType.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <CardHeader className="pb-4 relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${currentType.color} text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="secondary" className="text-xs font-semibold shadow-sm">
                            {currentDifficulty?.label}
                          </Badge>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <Crown className="w-3 h-3" />
                            <span className="text-xs font-bold">+{Math.floor(Math.random() * 50) + 100} XP</span>
                          </div>
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                        {profession}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed line-clamp-2">
                        {currentType.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 relative">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Intensité</span>
                          <span className="font-bold text-slate-900 dark:text-white">{currentType.successRate}%</span>
                        </div>
                        <Progress value={currentType.successRate} className="h-2.5 shadow-inner" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{currentType.badge}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-semibold text-xs">IA Adaptive</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {currentType.skills.slice(0, 2).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs font-medium">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="relative">
                      <Button 
                        className={`w-full h-12 bg-gradient-to-r ${currentType.color} hover:shadow-2xl text-white font-bold group-hover:scale-[1.03] transition-all`}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Démarrer la Session
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination - Améliorée */}
              {totalPages > 1 && (
                <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Affichage <span className="font-bold text-slate-900 dark:text-white">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProfessions.length)}</span> sur <span className="font-bold text-slate-900 dark:text-white">{filteredProfessions.length}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-10 w-10 p-0 shadow-sm"
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
                              onClick={() => handlePageChange(pageNumber)}
                              className={`h-10 w-10 shadow-sm ${
                                currentPage === pageNumber 
                                  ? `bg-gradient-to-br ${currentType.color} text-white border-0 shadow-lg` 
                                  : ''
                              }`}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-10 w-10 p-0 shadow-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* État Vide - Redesigné */}
              {paginatedProfessions.length === 0 && (
                <Card className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                  <CardContent>
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6 shadow-inner">
                      <Search className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      Aucun domaine trouvé
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                      Aucun domaine ne correspond à votre recherche. Essayez d'ajuster vos critères ou explorez d'autres catégories.
                    </p>
                    <Button 
                      onClick={() => setSearchTerm('')} 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl text-white font-semibold"
                    >
                      Réinitialiser la recherche
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar Droite - Sticky Fixé */}
          <div className="xl:w-80 xl:flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* Filtres Rapides - Améliorés */}
              <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <Filter className="w-5 h-5 text-white" />
                    </div>
                    Filtres & Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                  {/* Filtre Métier */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Domaine professionnel</Label>
                    <Select value={profession} onValueChange={setProfession}>
                      <SelectTrigger className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
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
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Niveau de difficulté</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${level.color} shadow-sm`} />
                              <span className="font-medium">{level.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="my-6" />

                  {/* Planificateur - Amélioré */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Planifier une session</Label>
                    </div>
                    
                    <div className="space-y-3">
                      <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as InterviewType)}>
                        <SelectTrigger className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(INTERVIEW_TYPES).map((type) => (
                            <SelectItem key={type} value={type}>
                              {INTERVIEW_TYPES[type as InterviewType].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Date</Label>
                          <Input 
                            type="date" 
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Heure</Label>
                          <Input 
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleScheduleSession}
                        className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-xl text-white font-semibold"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Programmer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques Rapides - Redesignées */}
              <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    Mes Performances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 relative">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="text-3xl font-black text-blue-600 dark:text-blue-400">24</div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">Sessions</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50">
                      <div className="text-3xl font-black text-green-600 dark:text-green-400">78%</div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">Réussite</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progression globale</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">65%</span>
                    </div>
                    <Progress value={65} className="h-3 shadow-inner" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Objectif: 85%</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +12%
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full h-11 font-semibold shadow-sm hover:shadow-lg transition-shadow">
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