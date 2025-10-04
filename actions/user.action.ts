// app/actions/user-actions.ts
"use server";

import prisma from "@/db/prisma";
import { Role, Domain } from "@prisma/client";

export async function getUserRoleAndDomains(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, domains: true }
    });
    
    return user ? { 
      role: user.role as string, 
      domains: user.domains as string[] 
    } : null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

export async function createOrUpdateUserWithRole(
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  domains: string[]
) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          role: role as Role,
          domains: {
            set: domains as Domain[]
          }
        },
        select: {
          id: true,
          role: true,
          domains: true
        }
      });
      
      return { 
        success: true, 
        user: {
          ...updatedUser,
          role: updatedUser.role as string,
          domains: updatedUser.domains as string[]
        } 
      };
    } else {
      // Créer un nouvel utilisateur
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: role as Role,
          domains: {
            set: domains as Domain[]
          }
        },
        select: {
          id: true,
          role: true,
          domains: true
        }
      });

      return { 
        success: true, 
        user: {
          ...newUser,
          role: newUser.role as string,
          domains: newUser.domains as string[]
        } 
      };
    }
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return { success: false, error: "Failed to create/update user" };
  }
}

// Récupère l'utilisateur avec ses principales relations (sélections limitées)
export async function getFullUserData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        domains: true,
        credits: true,
        matchingJobs: true,
        createdAt: true,
        subscription: {
          select: { tier: true, isActive: true, endDate: true }
        },
        quizResults: {
          take: 5,
          orderBy: { completedAt: 'desc' },
          select: {
            id: true,
            score: true,
            completedAt: true,
            quiz: { select: { title: true, type: true } }
          }
        },
        skillAnalyses: {
          take: 1,
          orderBy: { analyzedAt: 'desc' },
          select: { skills: true, analyzedAt: true }
        },
        progressTracking: {
          where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          orderBy: { date: 'asc' },
          take: 50,
          select: { metric: true, value: true, date: true }
        },
        recommendations: {
          where: { viewed: false },
          orderBy: { weight: 'desc' },
          take: 5,
          select: { id: true, content: true, source: true, weight: true, createdAt: true }
        },
        voiceInterviews: {
          take: 3,
          orderBy: { startedAt: 'desc' },
          select: { id: true, technologies: true, status: true, startedAt: true }
        },
        interviewRooms: {
          take: 3,
          orderBy: { startedAt: 'desc' },
          select: { id: true, roomType: true, startedAt: true, endedAt: true }
        },
        chatSessions: {
          take: 3,
          orderBy: { lastActivity: 'desc' },
          select: { id: true, sessionType: true, startedAt: true, lastActivity: true }
        },
      }
    });
    return user;
  } catch (error) {
    console.error('Error fetching full user data:', error);
    return null;
  }
}

// ---- Dashboard et utilitaires (cache + actions dérivées) ----
const dashboardCache = new Map<string, { data: any; timestamp: number }>();

export async function clearUserCache(userId: string) {
  const cacheKey = `dashboard-${userId}`;
  dashboardCache.delete(cacheKey);
}

function calculateStreakFromDates(completedDates: Date[]): number {
  if (!completedDates || completedDates.length === 0) return 0;
  let streak = 0;
  let currentDate = new Date();
  for (let i = 0; i < completedDates.length; i++) {
    const quizDate = new Date(completedDates[i]);
    const diffTime = Math.abs(currentDate.getTime() - quizDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      streak++;
      currentDate = quizDate;
    } else {
      break;
    }
  }
  return Math.min(streak, 7);
}

function calculateUserLevel(totalQuizzes: number, averageScore: number): number {
  const baseLevel = Math.floor(totalQuizzes / 3);
  const scoreBonus = Math.floor(averageScore / 25);
  return Math.max(1, baseLevel + scoreBonus);
}

function getPriorityFromWeight(weight: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (weight >= 0.8) return 'HIGH';
  if (weight >= 0.5) return 'MEDIUM';
  return 'LOW';
}

export async function getUserDashboardData(userId: string) {
  const cacheKey = `dashboard-${userId}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30000) {
    return cached.data;
  }
  try {
    const [
      user,
      quizResults,
      skillAnalyses,
      progressData,
      recommendations,
      quizStats,
      recentQuizDates
    ] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          domains: true,
          credits: true,
          matchingJobs: true,
          createdAt: true,
        }
      }),
      prisma.quizResult.findMany({
        where: { userId },
        take: 5,
        orderBy: { completedAt: 'desc' },
        select: {
          id: true,
          score: true,
          completedAt: true,
          duration: true,
          quiz: { select: { title: true, technology: true, type: true } }
        }
      }),
      prisma.skillAnalysis.findFirst({
        where: { userId },
        orderBy: { analyzedAt: 'desc' },
        select: { skills: true }
      }),
      prisma.progressTracking.findMany({
        where: { 
          userId,
          date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          metric: { in: ['quizzes_completed', 'xp_earned'] }
        },
        orderBy: { date: 'asc' },
        select: { metric: true, value: true, date: true }
      }),
      prisma.recommendation.findMany({
        where: { userId, viewed: false },
        take: 5,
        orderBy: { weight: 'desc' },
        select: { id: true, content: true, source: true, weight: true, createdAt: true }
      }),
      prisma.quizResult.aggregate({
        where: { userId },
        _count: { id: true },
        _avg: { score: true },
        _max: { score: true },
      }),
      prisma.quizResult.findMany({
        where: { userId, completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { completedAt: true },
        orderBy: { completedAt: 'desc' }
      })
    ]);

    if (!user) return null;

    const streakData = calculateStreakFromDates(recentQuizDates.map(q => q.completedAt));
    const skills = (skillAnalyses?.skills as Record<string, number>) || {};
    const formattedSkills = Object.entries(skills)
      .slice(0, 6)
      .map(([skill, current]) => ({ id: `${skill}-${current}`, skill, current, target: 100 }));

    const result = {
      user: {
        id: user.id,
        firstName: user.firstName || 'Utilisateur',
        lastName: user.lastName || '',
        email: user.email,
        role: user.role,
        domains: user.domains,
        credits: user.credits,
        matchingJobs: user.matchingJobs,
        createdAt: user.createdAt,
      },
      stats: {
        totalQuizzes: quizStats._count.id,
        averageScore: quizStats._avg.score || 0,
        bestScore: quizStats._max.score || 0,
        streak: streakData,
        level: calculateUserLevel(quizStats._count.id, quizStats._avg.score || 0),
      },
      recentQuizzes: quizResults.map((quiz) => ({
        id: quiz.id,
        title: quiz.quiz?.title || 'Quiz',
        technology: quiz.quiz?.technology || [],
        type: quiz.quiz?.type || 'QCM',
        score: quiz.score,
        duration: quiz.duration,
        completedAt: quiz.completedAt,
        xp: Math.round(quiz.score * 10),
      })),
      skills: formattedSkills,
      progress: progressData.map(progress => ({
        date: progress.date.toISOString().split('T')[0],
        metric: progress.metric,
        value: progress.value,
      })),
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        title: rec.content.substring(0, 50) + (rec.content.length > 50 ? '...' : ''),
        type: rec.source,
        priority: getPriorityFromWeight(rec.weight),
        description: rec.content,
        createdAt: rec.createdAt,
      })),
    };

    dashboardCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    return null;
  }
}

export async function getDailyMissions(userId: string) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const [todayQuizzes, skillAnalysis, userStats] = await Promise.all([
      prisma.quizResult.count({ where: { userId, completedAt: { gte: startOfDay } } }),
      prisma.skillAnalysis.findFirst({ where: { userId }, orderBy: { analyzedAt: 'desc' }, select: { skills: true } }),
      prisma.quizResult.aggregate({ where: { userId }, _avg: { score: true } })
    ]);
    const currentSkills = (skillAnalysis?.skills as Record<string, number>) || {};
    const skillCount = Object.keys(currentSkills).length;
    const averageScore = userStats._avg.score || 0;
    return [
      { id: 1, title: "Complète un quiz aujourd'hui", xp: 100, progress: Math.min(todayQuizzes, 1), total: 1, type: 'quiz' as const },
      { id: 2, title: 'Améliore 3 compétences', xp: 150, progress: Math.min(skillCount, 3), total: 3, type: 'skill' as const },
      { id: 3, title: 'Atteins 75% de score moyen', xp: 200, progress: Math.min(Math.floor(averageScore / 25), 3), total: 3, type: 'skill' as const },
    ];
  } catch (error) {
    console.error('Error fetching daily missions:', error);
    return [];
  }
}

export async function getUserAchievements(userId: string) {
  try {
    const [userStats, skillAnalysis, quizCount] = await Promise.all([
      prisma.quizResult.aggregate({ where: { userId }, _count: { id: true }, _avg: { score: true }, _max: { score: true } }),
      prisma.skillAnalysis.findFirst({ where: { userId }, orderBy: { analyzedAt: 'desc' }, select: { skills: true } }),
      prisma.quizResult.count({ where: { userId } })
    ]);
    const totalQuizzes = userStats._count.id;
    const averageScore = userStats._avg.score || 0;
    const bestScore = userStats._max.score || 0;
    const currentSkills = (skillAnalysis?.skills as Record<string, number>) || {};
    const maxSkill = Object.values(currentSkills).length > 0 ? Math.max(...Object.values(currentSkills)) : 0;
    return [
      { id: 1, title: 'Premier Quiz', icon: '🎯', unlocked: totalQuizzes > 0, rarity: 'common' as const },
      { id: 2, title: 'Score Parfait', icon: '💯', unlocked: bestScore >= 95, rarity: 'rare' as const },
      { id: 3, title: 'Expert Technique', icon: '⚛️', unlocked: maxSkill >= 85, rarity: 'epic' as const },
      { id: 4, title: 'Marathonien', icon: '🏃', unlocked: totalQuizzes >= 10, rarity: 'legendary' as const },
      { id: 5, title: 'Consistance', icon: '📊', unlocked: averageScore >= 75, rarity: 'rare' as const },
      { id: 6, title: 'Rapidité', icon: '⚡', unlocked: quizCount >= 5, rarity: 'epic' as const },
    ];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}