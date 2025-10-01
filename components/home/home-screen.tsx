// home-screen.tsx - Version complète et optimisée
"use client";

import React, { JSX, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, Line, AreaChart, Area, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Zap, Target, Trophy, Rocket, TrendingUp, 
  Brain, Code, Video, Award,
  Flame, Crown, Sparkles, Play,
  Users, Briefcase, Star, RefreshCw
} from 'lucide-react';
import { getDailyMissions, getUserAchievements, getUserDashboardData, getFullUserData } from '@/actions/user.action';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

// Types optimisés
interface DashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    domains: string[];
    credits: number;
    matchingJobs: number;
    createdAt: string;
  };
  stats: {
    totalQuizzes: number;
    averageScore: number;
    bestScore: number;
    streak: number;
    level: number;
  };
  recentQuizzes: Array<{
    id: string;
    title: string;
    technology: string[];
    type: string;
    score: number;
    duration?: number;
    completedAt: string;
    xp: number;
  }>;
  skills: Array<{
    id: string;
    skill: string;
    current: number;
    target: number;
  }>;
  progress: Array<{
    date: string;
    metric: string;
    value: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    type: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    createdAt: string;
  }>;
}

interface Mission {
  id: number;
  title: string;
  xp: number;
  progress: number;
  total: number;
  type: 'quiz' | 'interview' | 'skill';
}

interface Achievement {
  id: number;
  title: string;
  icon: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Hooks TanStack Query optimisés avec prévention du lag
function useDashboardData(userId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', userId],
    enabled: !!userId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      const data = await getUserDashboardData(userId);
      if (!data) throw new Error('No dashboard data');
      return data;
    },
  });
}

function useDailyMissions(userId: string | undefined) {
  return useQuery({
    queryKey: ['missions', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return getDailyMissions(userId);
    },
  });
}

function useUserAchievements(userId: string | undefined) {
  return useQuery({
    queryKey: ['achievements', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return getUserAchievements(userId);
    },
  });
}

function useFullUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['full-user', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return getFullUserData(userId);
    },
  });
}

// Composants Skeleton optimisés
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    {/* Header Skeleton */}
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-24 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full rounded-full" />
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Missions */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 p-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-[250px] w-full rounded-lg" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28 mb-2" />
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

const HomeScreenContent: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useKindeBrowserClient();
  const userId = user?.id;

  // Utilisation des hooks TanStack Query avec optimisation des performances
  const dashboard = useDashboardData(userId);
  const missions = useDailyMissions(userId);
  const achievements = useUserAchievements(userId);
  const fullUser = useFullUser(userId);

  // Mutation pour rafraîchir les données
  const refreshData = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID required');
      // On vide d'abord le cache serveur pour forcer une reconstruction côté action
      const actions = await import('@/actions/user.action');
      await actions.clearUserCache(userId);
      // Puis on recharge
      return await getUserDashboardData(userId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['dashboard', userId], data);
      queryClient.invalidateQueries({ queryKey: ['missions', userId] });
      queryClient.invalidateQueries({ queryKey: ['achievements', userId] });
    },
  });

  // États combinés avec useMemo pour éviter les recalculs inutiles
  const isLoading = useMemo(() => 
    dashboard.isLoading && !dashboard.data, 
    [dashboard.isLoading, dashboard.data]
  );

  const isError = useMemo(() => 
    dashboard.isError || missions.isError || achievements.isError || fullUser.isError,
    [dashboard.isError, missions.isError, achievements.isError, fullUser.isError]
  );

  const data = dashboard.data;

  // Données transformées avec useMemo pour optimiser les performances
  const transformedData = useMemo(() => {
    if (!data) return null;

    const userData = data.user;
    const stats = data.stats;
    const levelProgress = Math.min((stats.averageScore / 100) * 100, 100);

    // Transformer les données de progression pour le graphique
    const progressData = data.progress
      .filter((p: { metric: string; value: number; }) => p.metric === 'quizzes_completed' || p.metric === 'xp_earned')
      .slice(-7) // 7 derniers jours
      .map((p: {metric: string, value: number}, index : number) => ({
        day: `J-${6 - index}`,
        quizzes: p.metric === 'quizzes_completed' ? p.value : 0,
        xp: p.metric === 'xp_earned' ? p.value : 0,
      }));

    // Transformer l'activité récente
    const recentActivity = data.recentQuizzes.map((quiz: {id: string, title: string, score: number, xp: number}, index: number) => ({
      id: quiz.id,
      type: 'quiz' as const,
      title: quiz.title,
      score: quiz.score,
      xp: quiz.xp,
      time: index === 0 ? "Aujourd'hui" : 
            index === 1 ? "Hier" : 
            `Il y a ${index + 1}j`,
    }));

    return {
      userData,
      stats,
      levelProgress,
      progressData,
      recentActivity,
      skills: data.skills,
      recommendations: data.recommendations,
    };
  }, [data]);

  // Fonctions utilitaires mémoïsées
  const getRarityColor = React.useCallback((rarity: Achievement['rarity']): string => {
    const colors = {
      common: 'bg-slate-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    };
    return colors[rarity] || colors.common;
  }, []);

  const getTypeIcon = React.useCallback((type: string): JSX.Element => {
    const icons = {
      quiz: <Brain className="w-4 h-4" />,
      interview: <Video className="w-4 h-4" />,
      skill: <Code className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <Star className="w-4 h-4" />;
  }, []);

  const getActivityBgColor = React.useCallback((type: string): string => {
    const colors = {
      quiz: 'bg-blue-500',
      interview: 'bg-purple-500',
      skill: 'bg-green-500',
    };
    return colors[type as keyof typeof colors] || 'bg-slate-500';
  }, []);

  const getPriorityColor = React.useCallback((priority: string): string => {
    const colors = {
      HIGH: 'bg-red-500',
      MEDIUM: 'bg-yellow-500',
      LOW: 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-slate-500';
  }, []);

  // Affichage du skeleton pendant le chargement
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Gestion des erreurs
  if (isError || !data || !transformedData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Données indisponibles
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Nous rencontrons un problème pour charger vos données.
          </p>
          <Button 
            onClick={() => refreshData.mutate()}
            disabled={refreshData.isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshData.isPending ? 'animate-spin' : ''}`} />
            {refreshData.isPending ? "Rechargement..." : "Réessayer"}
          </Button>
        </div>
      </div>
    );
  }

  const { userData, stats, levelProgress, progressData, recentActivity, skills, recommendations } = transformedData;
  const subscription = fullUser.data?.subscription;

  return (
<div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
  {/* En-tête avec indicateurs de performance */}
  <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Informations du profil */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {userData.firstName[0]}{userData.lastName[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
              <span className="text-xs font-bold text-white">{stats.level}</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Bienvenue, {userData.firstName} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {userData.matchingJobs > 0 
                ? `${userData.matchingJobs} opportunités correspondent à votre profil` 
                : "Développez vos compétences pour accéder à de nouvelles opportunités"}
            </p>
          </div>
        </div>

        {/* Indicateurs de performance avec actualisation */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshData.mutate()}
            disabled={refreshData.isPending}
            className="hidden sm:flex"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshData.isPending ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          <div className="flex gap-3">
            {subscription ? (
              <Card className="flex-1 sm:flex-none bg-gradient-to-br from-sky-500 to-blue-600 border-0 shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-white text-xs font-medium">Formule</span>
                  <div className="text-white text-sm font-bold capitalize">
                    {subscription.tier.toLowerCase()} {!subscription.isActive && '(inactif)'}
                  </div>
                </CardContent>
              </Card>
            ) : null}
            
            <Card className="flex-1 sm:flex-none bg-gradient-to-br from-orange-500 to-red-500 border-0 shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <Flame className="w-8 h-8 text-white" />
                <div>
                  <p className="text-white/80 text-xs font-medium">Engagement</p>
                  <p className="text-white text-xl font-bold">{stats.streak} jours</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex-1 sm:flex-none bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <Zap className="w-8 h-8 text-white" />
                <div>
                  <p className="text-white/80 text-xs font-medium">Crédits</p>
                  <p className="text-white text-xl font-bold">{userData.credits}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 sm:flex-none bg-gradient-to-br from-green-500 to-emerald-500 border-0 shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-white" />
                <div>
                  <p className="text-white/80 text-xs font-medium">Correspondances</p>
                  <p className="text-white text-xl font-bold">{userData.matchingJobs}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Barre de progression du niveau */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Niveau {stats.level}
            </span>
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Performance moyenne : {stats.averageScore.toFixed(1)}%
          </span>
        </div>
        <div className="relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${levelProgress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Contenu principal */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne de gauche - Objectifs & Activité */}
      <div className="lg:col-span-2 space-y-6">
        {/* Objectifs quotidiens */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-slate-900 dark:text-white">Objectifs du Jour</CardTitle>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                {(missions.data?.filter((m: {progress: number; total: number}) => m.progress === m.total).length) || 0}/{missions.data?.length || 0} ✓
              </Badge>
            </div>
            <CardDescription className="dark:text-slate-400">
              Atteignez vos objectifs quotidiens pour optimiser votre progression
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {missions.isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : missions.data && missions.data.length > 0 ? (
              missions.data.map((mission: {id: number; title: string; xp: number; progress: number; total: number; type: string}) => (
                <div 
                  key={mission.id}
                  className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white">
                      {getTypeIcon(mission.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                          {mission.title}
                        </h4>
                        <Badge className="bg-yellow-400 text-yellow-900 border-0 ml-2">
                          +{mission.xp} points
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            Avancement
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {mission.progress}/{mission.total}
                          </span>
                        </div>
                        <Progress 
                          value={(mission.progress / mission.total) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                Aucun objectif défini pour aujourd'hui
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analyse de progression */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <CardTitle className="text-slate-900 dark:text-white">Évolution des Performances</CardTitle>
            </div>
            <CardDescription className="dark:text-slate-400">
              Votre activité sur les 7 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorXp)"
                    name="Points acquis"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="quizzes" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorQuizzes)"
                    name="Évaluations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                Aucune donnée d'activité disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historique récent */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <CardTitle className="text-slate-900 dark:text-white">Activité Récente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity: {id: string, title: string, score: number, xp: number, type: string, time: string}) => (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl ${getActivityBgColor(activity.type)} flex items-center justify-center shadow-lg text-white`}>
                      {getTypeIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span>Résultat : {activity.score}%</span>
                        <span>•</span>
                        <span className="text-yellow-600 dark:text-yellow-500 font-semibold">
                          +{activity.xp} points
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {activity.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Aucune activité récente enregistrée
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colonne de droite - Compétences & Réalisations */}
      <div className="space-y-6">
        {/* Profil de compétences */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              <CardTitle className="text-slate-900 dark:text-white">Profil de Compétences</CardTitle>
            </div>
            <CardDescription className="dark:text-slate-400">
              Analyse de vos compétences techniques actuelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={skills}>
                    <PolarGrid stroke="#64748b" />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar 
                      name="Niveau actuel" 
                      dataKey="current" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6} 
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
                
                <div className="mt-4 space-y-2">
                  {skills.slice(0, 3).map((skill: {id: string, skill: string, current: number}) => (
                    <div key={skill.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {skill.skill}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {skill.current}%
                        </span>
                      </div>
                      <Progress value={skill.current} className="h-2" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Évaluation des compétences en cours
              </div>
            )}
          </CardContent>
        </Card>

        {/* Réalisations professionnelles */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <CardTitle className="text-slate-900 dark:text-white">Réalisations</CardTitle>
            </div>
            <CardDescription className="dark:text-slate-400">
              Jalons atteints dans votre parcours professionnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {achievements.isLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            ) : achievements.data && achievements.data.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {achievements.data.map((achievement: {id: number; icon: string; title: string; unlocked: boolean; rarity: Achievement['rarity']}) => (
                  <div 
                    key={achievement.id}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-3 transition-all cursor-pointer
                      ${achievement.unlocked 
                        ? `${getRarityColor(achievement.rarity)} shadow-lg hover:scale-105` 
                        : 'bg-slate-200 dark:bg-slate-800 opacity-50 grayscale'
                      }`}
                  >
                    {achievement.unlocked && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-3xl mb-1">{achievement.icon}</span>
                    <span className={`text-[10px] text-center font-medium leading-tight
                      ${achievement.unlocked ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {achievement.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Aucune réalisation enregistrée
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommandations stratégiques */}
        {recommendations.length > 0 ? (
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-green-500" />
                <CardTitle className="text-slate-900 dark:text-white">Recommandations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec: {id: string, title: string, description: string, priority: string}) => (
                  <div 
                    key={rec.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getPriorityColor(rec.priority)}`}></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <div className="text-slate-700 dark:text-slate-300 font-semibold">Analyse en cours</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">Vos recommandations personnalisées seront disponibles prochainement</div>
            </CardContent>
          </Card>
        )}

        {/* Actions rapides */}
        <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Rocket className="w-6 h-6" />
              Démarrez Votre Session
            </h3>
            <div className="space-y-3">
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-semibold">
                <Play className="w-4 h-4 mr-2" />
                Nouvelle Évaluation
              </Button>
              <Button className="w-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xl border border-white/30 font-semibold">
                <Video className="w-4 h-4 mr-2" />
                Simulation d'Entretien
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</div>
  );
};

export default HomeScreenContent;