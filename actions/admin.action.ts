"use server"

import prisma from "@/db/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const ADMIN_EMAIL = "maximedoaw204@gmail.com"

// Vérifier si l'utilisateur est administrateur
export async function isAdmin() {
  try {
    const { getUser } = await getKindeServerSession()
    const user = await getUser()
    
    if (!user || user.email !== ADMIN_EMAIL) {
      return false
    }
    
    return true
  } catch (error) {
    console.error("Erreur lors de la vérification admin:", error)
    return false
  }
}

// Récupérer les statistiques globales
export async function getAdminStats() {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  try {
    const [
      totalUsers,
      totalQuizzes,
      totalQuizResults,
      totalSubscriptions,
      recentUsers,
      recentQuizResults,
      subscriptionStats,
      quizTypeStats
    ] = await Promise.all([
      // Nombre total d'utilisateurs
      prisma.user.count(),
      
      // Nombre total de quiz
      prisma.quiz.count(),
      
      // Nombre total de résultats
      prisma.quizResult.count(),
      
      // Nombre total d'abonnements
      prisma.subscription.count(),
      
      // Utilisateurs récents (7 derniers jours)
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          credits: true,
          subscription: {
            select: {
              tier: true,
              isActive: true
            }
          }
        }
      }),
      
      // Résultats récents
      prisma.quizResult.findMany({
        orderBy: { completedAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          },
          quiz: {
            select: {
              title: true,
              type: true,
              company: true
            }
          }
        }
      }),
      
      // Statistiques des abonnements
      prisma.subscription.groupBy({
        by: ['tier'],
        _count: {
          tier: true
        },
        where: {
          isActive: true
        }
      }),
      
      // Statistiques par type de quiz
      prisma.quiz.groupBy({
        by: ['type'],
        _count: {
          type: true
        }
      })
    ])

    return {
      totalUsers,
      totalQuizzes,
      totalQuizResults,
      totalSubscriptions,
      recentUsers,
      recentQuizResults,
      subscriptionStats,
      quizTypeStats
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des stats admin:", error)
    throw new Error("Impossible de récupérer les statistiques")
  }
}

// Gérer les utilisateurs
export async function getUsers(page = 1, limit = 20, search = "") {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  try {
    const skip = (page - 1) * limit
    
    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: true,
          _count: {
            select: {
              quizResults: true,
              skillAnalyses: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    throw new Error("Impossible de récupérer les utilisateurs")
  }
}

// Gérer les quiz
export async function getQuizzes(page = 1, limit = 20, search = "", type?: string) {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  try {
    const skip = (page - 1) * limit
    
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { company: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(type && { type: type as any })
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              results: true
            }
          }
        }
      }),
      prisma.quiz.count({ where })
    ])

    return {
      quizzes,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des quiz:", error)
    throw new Error("Impossible de récupérer les quiz")
  }
}

// Créer un nouveau quiz (exposé pour le front)
export async function createQuiz(data: {
  title: string
  description?: string
  type: string
  questions: any
  difficulty: string
  company: string
  technology: string[]
  domain: string
  duration: number
  totalPoints: number
}) {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  // Validation basique
  if (!data.title || !data.type || !data.questions || !data.difficulty || !data.company || !data.technology || !data.duration || !data.totalPoints) {
    throw new Error("Champs requis manquants")
  }

  try {
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type as any,
        questions: data.questions,
        difficulty: data.difficulty as any,
        company: data.company,
        technology: data.technology,
        domain: data.domain as any,
        duration: data.duration,
        totalPoints: data.totalPoints
      }
    })
    revalidatePath('/admin')
    return quiz
  } catch (error) {
    console.error("Erreur lors de la création du quiz:", error)
    throw new Error("Impossible de créer le quiz")
  }
}

// Mettre à jour un quiz
export async function updateQuiz(id: string, data: Partial<{
  title: string
  description: string
  type: string
  questions: any
  difficulty: string
  company: string
  technology: string[]
  domain: string
  duration: number
  totalPoints: number
}>) {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  try {
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        ...data,
        ...(data.type && { type: data.type as any }),
        ...(data.difficulty && { difficulty: data.difficulty as any }),
        ...(data.domain && { domain: data.domain as any })
      }
    })

    revalidatePath('/admin')
    return quiz
  } catch (error) {
    console.error("Erreur lors de la mise à jour du quiz:", error)
    throw new Error("Impossible de mettre à jour le quiz")
  }
}

// Supprimer un quiz
export async function deleteQuiz(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  try {
    await prisma.quiz.delete({
      where: { id }
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la suppression du quiz:", error)
    throw new Error("Impossible de supprimer le quiz")
  }
}

// Gérer les abonnements
export async function getSubscriptions(page = 1, limit = 20) {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  try {
    const skip = (page - 1) * limit

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.subscription.count()
    ])

    return {
      subscriptions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des abonnements:", error)
    throw new Error("Impossible de récupérer les abonnements")
  }
}

// Mettre à jour un abonnement
export async function updateSubscription(id: string, data: {
  tier: string
  isActive: boolean
  endDate?: Date
}) {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  try {
    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        tier: data.tier as any,
        isActive: data.isActive,
        endDate: data.endDate
      }
    })

    revalidatePath('/admin')
    return subscription
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'abonnement:", error)
    throw new Error("Impossible de mettre à jour l'abonnement")
  }
}

// Gérer les résultats de quiz
export async function getQuizResults(page = 1, limit = 20, userId?: string) {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  try {
    const skip = (page - 1) * limit
    
    const where = userId ? { userId } : {}

    const [results, total] = await Promise.all([
      prisma.quizResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { completedAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          },
          quiz: {
            select: {
              title: true,
              type: true,
              company: true
            }
          }
        }
      }),
      prisma.quizResult.count({ where })
    ])

    return {
      results,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des résultats:", error)
    throw new Error("Impossible de récupérer les résultats")
  }
}

// Supprimer un résultat de quiz
export async function deleteQuizResult(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }

  try {
    await prisma.quizResult.delete({
      where: { id }
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la suppression du résultat:", error)
    throw new Error("Impossible de supprimer le résultat")
  }
}

// Rediriger vers l'admin si autorisé
export async function redirectToAdmin() {
  if (await isAdmin()) {
    redirect('/admin')
  } else {
    redirect('/')
  }
} 

// Calculer le revenu total des abonnements payants sur le dernier mois
export async function getMonthlySubscriptionRevenue() {
  if (!(await isAdmin())) {
    throw new Error("Accès non autorisé")
  }
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(now.getDate() - 30);

  // On ne compte que les abonnements payants créés dans le mois
  const premiumSubs = await prisma.subscription.count({
    where: {
      tier: "PREMIUM",
      startDate: { gte: oneMonthAgo },
    },
  });
  const expertSubs = await prisma.subscription.count({
    where: {
      tier: "EXPERT",
      startDate: { gte: oneMonthAgo },
    },
  });
  // Prix fixes
  const PREMIUM_PRICE = 5000;
  const EXPERT_PRICE = 9000;
  const total = premiumSubs * PREMIUM_PRICE + expertSubs * EXPERT_PRICE;
  return {
    total,
    premium: premiumSubs,
    expert: expertSubs,
    premiumAmount: premiumSubs * PREMIUM_PRICE,
    expertAmount: expertSubs * EXPERT_PRICE,
  };
} 