"use server"

import prisma from "@/db/prisma"
import { Difficulty, Domain, QuizType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Types pour les données d'entrée
export interface CreateJobQuizInput {
  title: string
  description?: string
  image?: string
  type: "QCM" | "MOCK_INTERVIEW" | "SOFT_SKILLS" | "TECHNICAL"
  domain: "MACHINE_LEARNING" | "DEVELOPMENT" | "DATA_SCIENCE" | "FINANCE" | "BUSINESS" | "ENGINEERING" | "DESIGN" | "DEVOPS" | "CYBERSECURITY" | "MARKETING" | "PRODUCT" | "ARCHITECTURE" | "MOBILE" | "WEB" | "COMMUNICATION" | "MANAGEMENT" | "EDUCATION" | "HEALTH"
  questions: any // JSON des questions
  difficulty: "JUNIOR" | "MID" | "SENIOR"
  duration: number
  totalPoints: number
  company: string
  technology: string[]
  jobPostingId: string
}

export interface UpdateJobQuizInput {
  title?: string
  description?: string
  jobPostingId?: string
  image?: string
  type?: QuizType
  domain?: Domain
  questions?: any
  difficulty?: Difficulty
  duration?: number
  totalPoints?: number
  company?: string
  technology?: string[]
  settings?: {
    shuffleQuestions?: boolean
    showResults?: boolean
    allowRetry?: boolean
    timeLimit?: number
    passingScore?: number
  }
}

export interface CreateJobQuizResultInput {
  userId: string
  jobQuizId: string
  score: number
  answers: any
  analysis: string
  duration?: number
}

/**
 * Créer un nouveau JobQuiz
 */
export async function createJobQuiz(data: CreateJobQuizInput) {
  try {
    // Validation des données
    if (!data.title || !data.jobPostingId) {
     throw new Error("Le titre et l'ID du job posting sont requis")
    }

    if (data.duration <= 0) {
      throw new Error("La durée doit être supérieure à 0")
    }

    if (data.totalPoints <= 0) {
      throw new Error("Le total des points doit être supérieur à 0")
    }

    // Vérifier que le job posting existe
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: data.jobPostingId }
    })

    if (!jobPosting) {
      throw new Error("Job posting non trouvé")
    }

    // Créer le JobQuiz
    const jobQuiz = await prisma.jobQuiz.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        type: data.type,
        domain: data.domain,
        questions: data.questions,
        difficulty: data.difficulty,
        duration: data.duration,
        totalPoints: data.totalPoints,
        company: data.company,
        technology: data.technology,
        jobPostingId: data.jobPostingId
      },
      include: {
        jobPosting: {
          select: {
            title: true,
            companyName: true
          }
        }
      }
    })

  //  revalidatePath(`/enterprise/jobs/${data.jobPostingId}`)
  //  revalidatePath("/enterprise/quizzes")

    return {
      success: true,
      message: "Quiz créé avec succès",
      data: jobQuiz
    }
  } catch (error) {
    console.error("Erreur lors de la création du quiz:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la création du quiz",
      data: null
    }
  }
}

/**
 * Récupérer tous les JobQuizzes d'un job posting
 */
export async function getJobQuizzesByJobPosting(jobPostingId: string) {
  try {
    const jobQuizzes = await prisma.jobQuiz.findMany({
      where: {
        jobPostingId: jobPostingId
      },
      include: {
        jobPosting: {
          select: {
            title: true,
            companyName: true
          }
        },
        results: {
          select: {
            id: true,
            score: true,
            completedAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          },
          take: 5 // Derniers 5 résultats
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      data: jobQuizzes
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des quizzes:", error)
    return {
      success: false,
      message: "Erreur lors de la récupération des quizzes",
      data: []
    }
  }
}

/**
 * Récupérer un JobQuiz par son ID
 */
export async function getJobQuizById(id: string) {
  try {
    const jobQuiz = await prisma.jobQuiz.findUnique({
      where: { id },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            companyName: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        results: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          }
        }
      }
    })

    if (!jobQuiz) {
      return {
        success: false,
        message: "Quiz non trouvé",
        data: null
      }
    }

    return {
      success: true,
      data: jobQuiz
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du quiz:", error)
    return {
      success: false,
      message: "Erreur lors de la récupération du quiz",
      data: null
    }
  }
}

/**
 * Récupérer tous les JobQuizzes d'un utilisateur (par job postings)
 */
export async function getJobQuizzesByUser(userId: string) {
  try {
    // Récupérer tous les job postings de l'utilisateur avec leurs quizzes
    const jobPostingsWithQuizzes = await prisma.jobPosting.findMany({
      where: {
        userId: userId
      },
      include: {
        jobQuizzes: {
          include: {
            results: {
              select: {
                id: true,
                score: true,
                completedAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Aplatir tous les quizzes
    const allQuizzes = jobPostingsWithQuizzes.flatMap(jobPosting => 
      jobPosting.jobQuizzes.map(quiz => ({
        ...quiz,
        jobPostingTitle: jobPosting.title,
        jobPostingCompany: jobPosting.companyName
      }))
    )

    return {
      success: true,
      data: allQuizzes
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des quizzes utilisateur:", error)
    return {
      success: false,
      message: "Erreur lors de la récupération des quizzes",
      data: []
    }
  }
}

/**
 * Mettre à jour un JobQuiz
 */
export async function updateJobQuiz(id: string, data: UpdateJobQuizInput) {
  try {
    const existingQuiz = await prisma.jobQuiz.findUnique({
      where: { id }
    })

    if (!existingQuiz) {
      throw new Error("Quiz non trouvé")
    }

    // Extraire jobPostingId et les autres données
    const { jobPostingId, settings, ...updateData } = data

    // Préparer les données de mise à jour
    const updatePayload: any = {
      ...updateData,
      updatedAt: new Date()
    }

    // Gérer la relation jobPosting si jobPostingId est fourni
    if (jobPostingId) {
      updatePayload.jobPosting = {
        connect: { id: jobPostingId }
      }
    }

    // Ajouter les settings s'ils sont fournis
    if (settings) {
      updatePayload.shuffleQuestions = settings.shuffleQuestions
      updatePayload.showResults = settings.showResults
      updatePayload.allowRetry = settings.allowRetry
      updatePayload.timeLimit = settings.timeLimit
      updatePayload.passingScore = settings.passingScore
    }

    const updatedQuiz = await prisma.jobQuiz.update({
      where: { id },
      data: updatePayload,
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            companyName: true
          }
        }
      }
    })

    revalidatePath(`/enterprise/quizzes/${id}`)
    revalidatePath(`/enterprise/jobs/${updatedQuiz.jobPostingId}`)

    return {
      success: true,
      message: "Quiz mis à jour avec succès",
      data: updatedQuiz
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du quiz:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la mise à jour du quiz",
      data: null
    }
  }
}

/**
 * Supprimer un JobQuiz
 */
export async function deleteJobQuiz(id: string) {
  try {
    // Vérifier que le quiz existe
    const existingQuiz = await prisma.jobQuiz.findUnique({
      where: { id },
      include: {
        jobPosting: {
          select: {
            id: true
          }
        }
      }
    })

    if (!existingQuiz) {
      throw new Error("Quiz non trouvé")
    }

    const jobPostingId = existingQuiz.jobPostingId

    // Supprimer le quiz (les JobQuizResult seront supprimés en cascade)
    await prisma.jobQuiz.delete({
      where: { id }
    })

    revalidatePath(`/enterprise/jobs/${jobPostingId}`)
    revalidatePath("/enterprise/quizzes")

    return {
      success: true,
      message: "Quiz supprimé avec succès"
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du quiz:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la suppression du quiz"
    }
  }
}

/**
 * Créer un résultat de JobQuiz
 */
export async function createJobQuizResult(data: CreateJobQuizResultInput) {
  try {
    // Validation des données
    if (!data.userId || !data.jobQuizId) {
      throw new Error("L'ID utilisateur et l'ID du quiz sont requis")
    }

    // Vérifier que le quiz existe
    const jobQuiz = await prisma.jobQuiz.findUnique({
      where: { id: data.jobQuizId }
    })

    if (!jobQuiz) {
      throw new Error("Quiz non trouvé")
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    })

    if (!user) {
      throw new Error("Utilisateur non trouvé")
    }

    // Créer le résultat
    const quizResult = await prisma.jobQuizResult.create({
      data: {
        userId: data.userId,
        jobQuizId: data.jobQuizId,
        score: data.score,
        answers: data.answers,
        analysis: data.analysis,
        duration: data.duration,
        completedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        jobQuiz: {
          select: {
            title: true,
            totalPoints: true
          }
        }
      }
    })

    revalidatePath(`/quizzes/${data.jobQuizId}/results`)
    revalidatePath(`/enterprise/quizzes/${data.jobQuizId}`)

    return {
      success: true,
      message: "Résultat enregistré avec succès",
      data: quizResult
    }
  } catch (error) {
    console.error("Erreur lors de la création du résultat:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de l'enregistrement du résultat",
      data: null
    }
  }
}

/**
 * Récupérer les résultats d'un JobQuiz
 */
export async function getJobQuizResults(jobQuizId: string) {
  try {
    const results = await prisma.jobQuizResult.findMany({
      where: {
        jobQuizId: jobQuizId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            skills: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    return {
      success: true,
      data: results
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des résultats:", error)
    return {
      success: false,
      message: "Erreur lors de la récupération des résultats",
      data: []
    }
  }
}

/**
 * Récupérer les résultats d'un utilisateur pour un JobQuiz spécifique
 */
export async function getUserJobQuizResults(userId: string, jobQuizId: string) {
  try {
    const results = await prisma.jobQuizResult.findMany({
      where: {
        userId: userId,
        jobQuizId: jobQuizId
      },
      include: {
        jobQuiz: {
          select: {
            title: true,
            totalPoints: true,
            difficulty: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    return {
      success: true,
      data: results
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des résultats utilisateur:", error)
    return {
      success: false,
      message: "Erreur lors de la récupération des résultats",
      data: []
    }
  }
}

/**
 * Récupérer les statistiques d'un JobQuiz
 */
export async function getJobQuizStats(jobQuizId: string) {
  try {
    const results = await prisma.jobQuizResult.findMany({
      where: {
        jobQuizId: jobQuizId
      },
      select: {
        score: true,
        duration: true,
        completedAt: true
      }
    })

    if (results.length === 0) {
      return {
        success: true,
        data: {
          totalAttempts: 0,
          averageScore: 0,
          averageDuration: 0,
          highestScore: 0,
          lowestScore: 0
        }
      }
    }

    const scores = results.map(r => r.score)
    const durations = results.map(r => r.duration || 0)

    const stats = {
      totalAttempts: results.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    }

    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return {
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      data: null
    }
  }
}

/**
 * Dupliquer un JobQuiz
 */
export async function duplicateJobQuiz(id: string, newJobPostingId?: string) {
  try {
    const originalQuiz = await prisma.jobQuiz.findUnique({
      where: { id }
    })

    if (!originalQuiz) {
      throw new Error("Quiz original non trouvé")
    }

    const duplicatedQuiz = await prisma.jobQuiz.create({
      data: {
        title: `${originalQuiz.title} (Copie)`,
        description: originalQuiz.description,
        image: originalQuiz.image,
        type: originalQuiz.type,
        domain: originalQuiz.domain,
        questions: originalQuiz.questions as any,
        difficulty: originalQuiz.difficulty,
        duration: originalQuiz.duration,
        totalPoints: originalQuiz.totalPoints,
        company: originalQuiz.company,
        technology: originalQuiz.technology,
        jobPostingId: newJobPostingId || originalQuiz.jobPostingId
      },
      include: {
        jobPosting: {
          select: {
            title: true,
            companyName: true
          }
        }
      }
    })

    revalidatePath("/enterprise/quizzes")
    if (newJobPostingId) {
      revalidatePath(`/enterprise/jobs/${newJobPostingId}`)
    }

    return {
      success: true,
      message: "Quiz dupliqué avec succès",
      data: duplicatedQuiz
    }
  } catch (error) {
    console.error("Erreur lors de la duplication du quiz:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la duplication du quiz",
      data: null
    }
  }
}