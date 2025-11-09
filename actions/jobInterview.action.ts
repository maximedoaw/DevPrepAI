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

    // Préparer les données de mise à jour - ne garder que les champs valides du modèle Prisma
    const updatePayload: any = {
      updatedAt: new Date()
    }

    // Ajouter uniquement les champs qui existent dans le modèle Prisma
    if (updateData.title !== undefined) updatePayload.title = updateData.title
    if (updateData.description !== undefined) updatePayload.description = updateData.description
    if (updateData.image !== undefined) updatePayload.image = updateData.image
    if (updateData.type !== undefined) updatePayload.type = updateData.type
    if (updateData.domain !== undefined) updatePayload.domain = updateData.domain
    if (updateData.questions !== undefined) updatePayload.questions = updateData.questions
    if (updateData.difficulty !== undefined) updatePayload.difficulty = updateData.difficulty
    if (updateData.duration !== undefined) updatePayload.duration = updateData.duration
    if (updateData.totalPoints !== undefined) updatePayload.totalPoints = updateData.totalPoints
    if (updateData.company !== undefined) updatePayload.company = updateData.company
    if (updateData.technology !== undefined) updatePayload.technology = updateData.technology

    // Gérer la relation jobPosting si jobPostingId est fourni
    if (jobPostingId) {
      updatePayload.jobPosting = {
        connect: { id: jobPostingId }
      }
    }

    // Ajouter les settings dans le champ JSON settings (pas comme champs séparés)
    if (settings) {
      updatePayload.settings = {
        shuffleQuestions: settings.shuffleQuestions ?? false,
        showResults: settings.showResults ?? true,
        allowRetry: settings.allowRetry ?? false,
        timeLimit: settings.timeLimit ?? 0,
        passingScore: settings.passingScore ?? 70
      }
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

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

const looksLikeJson = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return false
  const first = trimmed[0]
  return first === "{" || first === "["
}

const parseJsonField = <T = any>(value: any): T | null => {
  if (!value) return null
  if (typeof value === "string") {
    if (!looksLikeJson(value)) {
      return null
    }
    try {
      return JSON.parse(value) as T
    } catch (error) {
      console.error("Error parsing JSON field:", error)
      return null
    }
  }
  if (typeof value === "object") {
    return value as T
  }
  return null
}

const extractInterviewTranscription = (answers: any) => {
  if (!answers) {
    return {
      transcription: [],
      messages: [],
    }
  }

  if (Array.isArray(answers.transcription)) {
    return {
      transcription: answers.transcription,
      messages: Array.isArray(answers.messages) ? answers.messages : answers.transcription,
    }
  }

  if (Array.isArray(answers)) {
    return {
      transcription: answers,
      messages: answers,
    }
  }

  if (Array.isArray(answers.messages)) {
    return {
      transcription: answers.messages,
      messages: answers.messages,
    }
  }

  return {
    transcription: [],
    messages: [],
  }
}

const buildMockInterviewRequirements = (jobQuiz: any) => {
  const jobPosting = jobQuiz.jobPosting
  return {
    title: jobPosting?.title || jobQuiz.title || "Poste non spécifié",
    description: jobPosting?.description || "",
    skills: jobPosting?.skills || jobQuiz.technology || [],
    experienceLevel: jobQuiz.difficulty || jobPosting?.type || "",
    domain: jobPosting?.domains?.[0] || jobQuiz.domain || "DEVELOPMENT",
  }
}

const parseQuizQuestions = (questions: any) => {
  if (!questions) return []
  if (Array.isArray(questions)) return questions
  if (typeof questions === "string") {
    try {
      return JSON.parse(questions)
    } catch (error) {
      console.error("Error parsing quiz questions:", error)
      return []
    }
  }
  return []
}

async function generateMockInterviewAnalysis(result: any, jobQuiz: any, parsedQuestions: any[]) {
  if (result.analysis) {
    try {
      return typeof result.analysis === "string" ? JSON.parse(result.analysis) : result.analysis
    } catch (error) {
      console.error("Error parsing stored analysis:", error)
      return null
    }
  }

  const parsedAnswers = parseJsonField(result.answers)
  const { transcription } = extractInterviewTranscription(parsedAnswers)

  if (!transcription || transcription.length === 0) {
    return null
  }

  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/gemini`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "evaluate-mock-interview",
        transcription,
        jobRequirements: buildMockInterviewRequirements(jobQuiz),
        questions: parsedQuestions,
      }),
    })

    const payload = await response.json()
    if (!response.ok || !payload.success || !payload.data) {
      console.error("Failed to evaluate mock interview:", payload.error || response.statusText)
      return null
    }

    const analysisData = payload.data

    await prisma.jobQuizResult.update({
      where: { id: result.id },
      data: {
        analysis: JSON.stringify(analysisData),
        score: analysisData.overallScore ?? result.score,
      },
    })

    return analysisData
  } catch (error) {
    console.error("Error generating mock interview analysis:", error)
    return null
  }
}

/**
 * Récupérer les résultats de quiz d'une application avec skill analysis
 */
export async function getApplicationQuizResults(applicationId: string, jobId: string) {
  try {
    // Récupérer l'application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!application) {
      return {
        success: false,
        message: "Application non trouvée",
        data: []
      }
    }

    // Récupérer tous les quizzes liés au job
    const jobQuizzes = await prisma.jobQuiz.findMany({
      where: { jobPostingId: jobId }
    })

    // Récupérer tous les résultats de quiz pour cet utilisateur et ces quizzes
    const quizResults = await prisma.jobQuizResult.findMany({
      where: {
        userId: application.userId,
        jobQuizId: { in: jobQuizzes.map(q => q.id) }
      },
      include: {
        jobQuiz: {
          select: {
            id: true,
            title: true,
            type: true,
            totalPoints: true,
            technology: true,
            difficulty: true,
            domain: true,
            questions: true,
            jobPosting: {
              select: {
                title: true,
                description: true,
                skills: true,
                type: true,
                domains: true
              }
            }
          }
        },
        skillAnalysis: {
          select: {
            id: true,
            skills: true,
            aiFeedback: true,
            improvementTips: true
          },
          orderBy: {
            analyzedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    // Formater les résultats avec les compétences et générer les feedbacks si nécessaire
    const formattedResults = []

    for (const result of quizResults) {
      const skillAnalysis = result.skillAnalysis[0]
      const skills = skillAnalysis?.skills ? (typeof skillAnalysis.skills === 'string' ? JSON.parse(skillAnalysis.skills) : skillAnalysis.skills) : []

      const parsedAnswers = parseJsonField(result.answers)
      const parsedQuestions = parseQuizQuestions(result.jobQuiz.questions)

      let analysisData = result.analysis ? parseJsonField(result.analysis) : null

      if (!analysisData && result.jobQuiz.type === "MOCK_INTERVIEW") {
        analysisData = await generateMockInterviewAnalysis(result, result.jobQuiz, parsedQuestions)
      }

      const reviewScore =
        typeof result.reviewScore === "number" ? result.reviewScore : null
      const finalScore =
        typeof result.finalScore === "number" ? result.finalScore : null
      const baseScore =
        typeof finalScore === "number"
          ? finalScore
          : typeof result.score === "number"
          ? result.score
          : 0

      formattedResults.push({
        id: result.id,
        quizId: result.jobQuizId,
        quizTitle: result.jobQuiz.title,
        quizType: result.jobQuiz.type,
        totalPoints: result.jobQuiz.totalPoints,
        score: baseScore,
        originalScore: result.score,
        reviewScore,
        finalScore,
        percentage:
          result.jobQuiz.totalPoints > 0
            ? (baseScore / result.jobQuiz.totalPoints) * 100
            : 0,
        completedAt: result.completedAt,
        duration: result.duration,
        technology: result.jobQuiz.technology,
        skills: skills.map((skill: any) => ({
          name: skill.name || skill.skill || 'Compétence',
          score: skill.score || skill.points || 0,
          maxScore: skill.maxScore || 100,
          percentage: skill.maxScore ? (skill.score / skill.maxScore) * 100 : (skill.score || 0)
        })),
        aiFeedback: skillAnalysis?.aiFeedback,
        improvementTips: skillAnalysis?.improvementTips || [],
        analysis: analysisData ? JSON.stringify(analysisData) : result.analysis,
        answers: parsedAnswers ?? result.answers,
        feedbackVisibleToCandidate: result.feedbackVisibleToCandidate,
        feedbackReleasedAt: result.feedbackReleasedAt
      })
    }

    return {
      success: true,
      data: formattedResults
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des résultats de quiz:", error)
    return {
      success: false,
      message: "Erreur lors de la récupération des résultats",
      data: []
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

// Récupérer les détails complets d'un résultat de quiz pour la review
export async function getQuizResultForReview(quizResultId: string) {
  try {
    const result = await prisma.jobQuizResult.findUnique({
      where: { id: quizResultId },
      include: {
        jobQuiz: {
          select: {
            id: true,
            title: true,
            type: true,
            questions: true,
            totalPoints: true,
            technology: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!result) {
      return {
        success: false,
        message: "Résultat de quiz non trouvé",
        data: null
      };
    }

    return {
      success: true,
      data: {
        id: result.id,
        quizId: result.jobQuizId,
        quizTitle: result.jobQuiz.title,
        quizType: result.jobQuiz.type,
        questions: result.jobQuiz.questions,
        answers: result.answers,
        score: result.score,
        originalScore: result.score,
        totalPoints: result.jobQuiz.totalPoints,
        analysis: result.analysis,
        duration: result.duration,
        completedAt: result.completedAt,
        technology: result.jobQuiz.technology,
        user: result.user
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du résultat de quiz:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération",
      data: null
    };
  }
}

// Sauvegarder la review humaine d'un résultat de quiz
export async function saveQuizResultReview(quizResultId: string, data: {
  reviewedAnswers: any[];
  reviewedScore: number;
  reviewerNotes?: string;
  manualCorrections?: Record<string, { isValid: boolean; points: number; note?: string }>;
}) {
  try {
    // Récupérer le résultat existant
    const existingResult = await prisma.jobQuizResult.findUnique({
      where: { id: quizResultId },
      include: {
        jobQuiz: {
          select: {
            totalPoints: true
          }
        }
      }
    });

    if (!existingResult) {
      return {
        success: false,
        message: "Résultat de quiz non trouvé"
      };
    }

    // Mettre à jour le résultat avec la review
    const baseTestScore =
      typeof existingResult.score === "number" ? existingResult.score : 0
    const reviewScore = data.reviewedScore ?? 0
    const finalScore = Number(((baseTestScore + reviewScore) / 2).toFixed(2))

    const existingAnswers =
      typeof existingResult.answers === "object" && existingResult.answers !== null
        ? (existingResult.answers as any)
        : {}

    const updatedResult = await prisma.jobQuizResult.update({
      where: { id: quizResultId },
      data: {
        reviewScore,
        finalScore,
        answers: {
          ...existingAnswers,
          reviewedAnswers: data.reviewedAnswers,
          manualCorrections: data.manualCorrections || {},
          reviewerNotes: data.reviewerNotes,
          reviewedAt: new Date().toISOString(),
          reviewedScore: reviewScore,
          finalScore,
          isReviewed: true,
        } as any,
      },
    });

    revalidatePath("/enterprise/enterprise-interviews");
    revalidatePath("/");
    
    return {
      success: true,
      message: "Review sauvegardée avec succès",
      data: updatedResult
    };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la review:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
    };
  }
}

export async function saveQuizResultAnalysis(
  quizResultId: string,
  analysis: any,
  options?: { score?: number | null }
) {
  try {
    const payload =
      analysis === null || analysis === undefined
        ? null
        : typeof analysis === "string"
        ? analysis
        : JSON.stringify(analysis);

    const updatedResult = await prisma.jobQuizResult.update({
      where: { id: quizResultId },
      data: {
        analysis: payload,
        ...(options?.score !== undefined && options.score !== null
          ? { score: options.score }
          : {}),
      },
    });

    revalidatePath("/enterprise/enterprise-interviews");
    revalidatePath("/");

    return {
      success: true,
      data: updatedResult,
    };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'analyse du quiz:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de l'enregistrement de l'analyse",
    };
  }
}

export async function shareQuizResultFeedback(
  quizResultId: string,
  applicationId: string,
  options?: { visible?: boolean }
) {
  const visible = options?.visible ?? true;

  try {
    const updatedResult = await prisma.jobQuizResult.update({
      where: { id: quizResultId },
      data: {
        feedbackVisibleToCandidate: visible,
        feedbackReleasedAt: visible ? new Date() : null,
      },
      select: {
        id: true,
        feedbackVisibleToCandidate: true,
        feedbackReleasedAt: true,
      },
    });

    if (applicationId) {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    revalidatePath("/enterprise/enterprise-interviews");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/home");

    return {
      success: true,
      data: updatedResult,
    };
  } catch (error) {
    console.error("Erreur lors du partage du feedback:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Impossible de partager le feedback",
    };
  }
}