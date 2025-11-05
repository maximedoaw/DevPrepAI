// user-data.action.ts
"use server"

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * Récupérer le portfolio et CV d'un utilisateur
 */
export async function getUserPortfolioAndResume() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    return {
      success: false,
      portfolio: null,
      resumeUrl: null,
      portfolioUrl: null
    };
  }

  try {
    // Récupérer le portfolio de l'utilisateur
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        userId: user.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Récupérer les applications pour obtenir le resumeUrl et portfolioUrl
    const application = await prisma.application.findFirst({
      where: {
        userId: user.id
      },
      select: {
        resumeUrl: true,
        portfolioUrl: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return {
      success: true,
      portfolio: portfolio ? {
        id: portfolio.id,
        title: portfolio.title,
        bio: portfolio.bio,
        headline: portfolio.headline,
        avatarUrl: portfolio.avatarUrl,
        bannerUrl: portfolio.bannerUrl,
        publishedAt: portfolio.publishedAt,
        url: portfolio.publishedAt ? `/portfolio/${portfolio.id}` : null
      } : null,
      resumeUrl: application?.resumeUrl || null,
      portfolioUrl: application?.portfolioUrl || (portfolio?.publishedAt ? `/portfolio/${portfolio.id}` : null)
    };
  } catch (error) {
    console.error("Error fetching user portfolio and resume:", error);
    return {
      success: false,
      portfolio: null,
      resumeUrl: null,
      portfolioUrl: null
    };
  }
}

/**
 * Vérifier si l'utilisateur a complété tous les tests techniques pour un job
 */
export async function checkJobQuizCompletion(jobId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    return {
      allCompleted: false,
      completedQuizzes: [],
      pendingQuizzes: [],
      totalQuizzes: 0
    };
  }

  try {
    // Récupérer tous les quizzes du job
    const jobQuizzes = await prisma.jobQuiz.findMany({
      where: {
        jobPostingId: jobId
      },
      select: {
        id: true,
        title: true,
        type: true,
        questions: true,
        technology: true,
        totalPoints: true,
        duration: true
      }
    });

    if (jobQuizzes.length === 0) {
      return {
        allCompleted: true, // Pas de tests requis
        completedQuizzes: [],
        pendingQuizzes: [],
        totalQuizzes: 0
      };
    }

    // Récupérer les résultats de l'utilisateur pour ces quizzes
    const quizResults = await prisma.jobQuizResult.findMany({
      where: {
        userId: user.id,
        jobQuizId: {
          in: jobQuizzes.map(q => q.id)
        }
      },
      select: {
        jobQuizId: true,
        score: true,
        completedAt: true
      }
    });

    const completedQuizIds = new Set(quizResults.map(r => r.jobQuizId));
    
    const completedQuizzes = jobQuizzes
      .filter(q => completedQuizIds.has(q.id))
      .map(q => ({
        id: q.id,
        title: q.title,
        type: q.type,
        questions: Array.isArray(q.questions) ? q.questions.length : (typeof q.questions === 'object' && q.questions !== null ? Object.keys(q.questions).length : 0),
        technology: q.technology,
        totalPoints: q.totalPoints,
        duration: q.duration,
        score: quizResults.find(r => r.jobQuizId === q.id)?.score || 0,
        completedAt: quizResults.find(r => r.jobQuizId === q.id)?.completedAt || null
      }));

    const pendingQuizzes = jobQuizzes
      .filter(q => !completedQuizIds.has(q.id))
      .map(q => ({
        id: q.id,
        title: q.title,
        type: q.type,
        questions: Array.isArray(q.questions) ? q.questions.length : (typeof q.questions === 'object' && q.questions !== null ? Object.keys(q.questions).length : 0),
        technology: q.technology,
        totalPoints: q.totalPoints,
        duration: q.duration
      }));

    return {
      allCompleted: pendingQuizzes.length === 0,
      completedQuizzes,
      pendingQuizzes,
      totalQuizzes: jobQuizzes.length
    };
  } catch (error) {
    console.error("Error checking job quiz completion:", error);
    return {
      allCompleted: false,
      completedQuizzes: [],
      pendingQuizzes: [],
      totalQuizzes: 0
    };
  }
}

