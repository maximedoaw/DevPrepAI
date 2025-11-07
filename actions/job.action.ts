// actions/job.action.ts
"use server"

import prisma from "@/db/prisma"
import { revalidatePath } from "next/cache"
import { Domain, JobType, WorkMode, Difficulty, QuizType } from "@prisma/client"
import { mockJobs } from "@/data/mockJobs"

// Types pour les filtres
export interface JobFilters {
  search?: string
  domains?: Domain[]
  skills?: string[]
  workMode?: WorkMode[]
  type?: JobType[]
  location?: string
  experienceLevel?: Difficulty[]
  minSalary?: number
  maxSalary?: number
}

// Types pour les quizzes
export interface JobQuizSubmission {
  jobQuizId: string
  userId: string
  answers: any[]
  score: number
  analysis: string
  duration?: number
  videoUrl?: string | null
  imageUrls?: string[] | null
}

// Récupérer tous les jobs avec filtres
export async function getJobs(filters?: JobFilters) {

  const jobs = await prisma.jobPosting.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      applications: {
        select: {
          id: true,
          status: true,
          createdAt: true
        }
      },
      jobQuizzes: {
        where: {
          jobPostingId: { not: undefined }
        },
        select: {
          id: true,
          title: true,
          type: true,
          difficulty: true,
          duration: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return jobs
}

// Récupérer les jobs d'un utilisateur
export async function getJobsByUser(userId: string) {
  try {
    // Récupérer TOUS les jobs de l'utilisateur sans limite ni filtre sur isActive
    // Cela garantit que tous les jobs (actifs, inactifs, etc.) sont récupérés
    const jobs = await prisma.jobPosting.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        applications: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                skills: true
              }
            }
          }
        },
        jobQuizzes: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      },
      // Ne pas limiter le nombre de résultats pour récupérer TOUS les jobs
      // Si vous avez beaucoup de jobs, vous pouvez ajouter une pagination si nécessaire
    })

    // Logger pour debug - à retirer en production si trop verbeux
    console.log(`[getJobsByUser] Récupéré ${jobs.length} job(s) pour l'utilisateur ${userId}`)

    // Mapper les jobs avec les informations calculées
    const mappedJobs = jobs.map(job => ({
      ...job,
      applicants: job.applications.length,
      quizCount: job.jobQuizzes.length,
      // S'assurer que le statut est correctement mappé
      status: job.isActive ? "active" : "paused" as "active" | "paused" | "closed"
    }))

    return mappedJobs
  } catch (error) {
    console.error("Error fetching user jobs:", error)
    // Lancer une erreur descriptive pour aider au debug
    throw new Error(`Erreur lors de la récupération des jobs pour l'utilisateur ${userId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

// Récupérer un job par son ID
export async function getJobById(id: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      applications: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      jobQuizzes: {
        include: {
          results: {
            where: {
              jobQuizId: { not: undefined }
            },
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
    }
  })

  return job
}

// Créer un nouveau job
export async function createJob(data: {
  companyName: string
  title: string
  description: string
  location?: string
  domains: Domain[]
  skills: string[]
  salaryMin?: number
  salaryMax?: number
  currency?: string
  type: JobType
  workMode: WorkMode
  experienceLevel?: Difficulty
  metadata?: any
  userId: string
}) {
  const job = await prisma.jobPosting.create({
    data: {
      companyName: data.companyName,
      title: data.title,
      description: data.description,
      location: data.location,
      domains: data.domains,
      skills: data.skills,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      currency: data.currency || "FCFA",
      type: data.type, 
      workMode: data.workMode,
      experienceLevel: data.experienceLevel,
      metadata: data.metadata,
      isActive: true, 
      userId: data.userId
    }
  })

  revalidatePath("/jobs")
  return job
}

// Mettre à jour un job
export async function updateJob(id: string, data: Partial<{
  companyName: string
  title: string
  description: string
  location: string
  domains: Domain[]
  skills: string[]
  salaryMin: number
  salaryMax: number
  currency: string
  type: JobType
  workMode: WorkMode
  experienceLevel: Difficulty
  metadata: any
  isActive: boolean
  userId: string
}>) {
  const job = await prisma.jobPosting.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  })

  revalidatePath("/jobs")
  revalidatePath(`/jobs/${id}`)
  return job
}

// Supprimer un job (soft delete)
export async function deleteJob(id: string) {
  const job = await prisma.jobPosting.update({
    where: { id },
    data: {
      isActive: false,
      updatedAt: new Date()
    }
  })

  revalidatePath("/jobs")
  return job
}

// GESTION DES JOB QUIZZES

// Récupérer un quiz par son ID
export async function getJobQuizById(id: string) {
  try {
    const quiz = await prisma.jobQuiz.findUnique({
      where: { id },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            companyName: true,
            skills: true,
            domains: true
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
          },
          take: 10
        }
      }
    })

    return quiz
  } catch (error) {
    console.error("Error fetching job quiz:", error)
    throw new Error("Erreur lors de la récupération du quiz")
  }
}

// Récupérer les quizzes d'un job
export async function getJobQuizzesByJobId(jobId: string) {
  try {
    const quizzes = await prisma.jobQuiz.findMany({
      where: { jobPostingId: jobId },
      include: {
        results: {
          select: {
            id: true,
            score: true,
            completedAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return quizzes
  } catch (error) {
    console.error("Error fetching job quizzes:", error)
    throw new Error("Erreur lors de la récupération des quizzes du job")
  }
}

// Créer un quiz pour un job
export async function createJobQuiz(data: {
  jobPostingId: string
  title: string
  description?: string
  image?: string
  type: QuizType
  domain: Domain
  questions: any[]
  difficulty: Difficulty
  duration: number
  totalPoints: number
  company: string
  technology: string[]
  settings?: any
}) {
  try {
    const quiz = await prisma.jobQuiz.create({
      data: {
        jobPostingId: data.jobPostingId,
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
        settings: data.settings
      }
    })

    revalidatePath(`/jobs/${data.jobPostingId}`)
    revalidatePath(`/jobs/${data.jobPostingId}`)
    return quiz
  } catch (error) {
    console.error("Error creating job quiz:", error)
    throw new Error("Erreur lors de la création du quiz")
  }
}

// Soumettre les réponses d'un quiz
export async function submitJobQuiz(data: JobQuizSubmission) {
  try {
    // Récupérer le jobQuiz pour obtenir jobPostingId
    const jobQuiz = await prisma.jobQuiz.findUnique({
      where: { id: data.jobQuizId },
      select: { jobPostingId: true, title: true, totalPoints: true }
    });

    if (!jobQuiz) {
      throw new Error("Quiz non trouvé");
    }

    const result = await prisma.jobQuizResult.create({
      data: {
        userId: data.userId,
        jobQuizId: data.jobQuizId,
        score: data.score,
        answers: data.answers,
        analysis: data.analysis,
        duration: data.duration,
        videoUrl: data.videoUrl || null,
        imageUrls: data.imageUrls ? data.imageUrls : undefined,
        completedAt: new Date()
      }
    })

    // Revalider les pages concernées
    revalidatePath(`/jobs/${jobQuiz.jobPostingId}`)
    revalidatePath(`/quizzes/${data.jobQuizId}`)
    revalidatePath(`/profile/quizzes`)

    return { ...result, jobQuiz }
  } catch (error) {
    console.error("Error submitting job quiz:", error)
    throw new Error("Erreur lors de la soumission du quiz")
  }
}

// Récupérer les résultats d'un utilisateur pour un quiz
export async function getUserJobQuizResult(userId: string, jobQuizId: string) {
  try {
    const result = await prisma.jobQuizResult.findFirst({
      where: {
        userId,
        jobQuizId
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

    return result
  } catch (error) {
    console.error("Error fetching user quiz result:", error)
    throw new Error("Erreur lors de la récupération du résultat")
  }
}

// Récupérer tous les résultats d'un utilisateur
export async function getUserJobQuizResults(userId: string) {
  try {
    const results = await prisma.jobQuizResult.findMany({
      where: { userId },
      include: {
        jobQuiz: {
          select: {
            title: true,
            type: true,
            domain: true,
            difficulty: true,
            jobPosting: {
              select: {
                title: true,
                companyName: true
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    return results
  } catch (error) {
    console.error("Error fetching user quiz results:", error)
    throw new Error("Erreur lors de la récupération des résultats")
  }
}

// Récupérer les statistiques d'un quiz
export async function getJobQuizStats(jobQuizId: string) {
  try {
    const [results, averageScore, bestScore] = await Promise.all([
      prisma.jobQuizResult.findMany({
        where: { jobQuizId },
        select: {
          score: true,
          completedAt: true
        },
        orderBy: {
          completedAt: 'desc'
        }
      }),
      prisma.jobQuizResult.aggregate({
        where: { jobQuizId },
        _avg: { score: true }
      }),
      prisma.jobQuizResult.aggregate({
        where: { jobQuizId },
        _max: { score: true }
      })
    ])

    return {
      totalSubmissions: results.length,
      averageScore: averageScore._avg.score || 0,
      bestScore: bestScore._max.score || 0,
      recentResults: results.slice(0, 10)
    }
  } catch (error) {
    console.error("Error fetching quiz stats:", error)
    throw new Error("Erreur lors de la récupération des statistiques")
  }
}

// Peupler la base avec des jobs de démonstration
export async function seedJobs() {
  // Vérifier si des jobs existent déjà
  const existingJobs = await prisma.jobPosting.count()
  if (existingJobs > 0) {
    await prisma.jobPosting.deleteMany({})
  }

  // Récupérer un utilisateur existant pour associer les jobs
  const existingUser = await prisma.user.findFirst({
    select: { id: true }
  })

  if (!existingUser) {
    throw new Error("Aucun utilisateur trouvé pour associer les jobs de démonstration")
  }

  // Préparer les données pour Prisma avec userId
  const jobsForPrisma = mockJobs.map((job, index) => ({
    companyName: job.companyName,
    title: job.title,
    description: job.description,
    location: job.location,
    domains: job.domains,
    skills: job.skills,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency,
    type: job.type as JobType,
    workMode: job.workMode as WorkMode,
    experienceLevel: job.experienceLevel as Difficulty,
    isActive: true,
    userId: existingUser.id,
    createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
  }))

  const createdJobs = await prisma.jobPosting.createMany({
    data: jobsForPrisma
  })

  revalidatePath("/jobs")
  return createdJobs
}

// Obtenir les statistiques des jobs
export async function getJobStats() {
  const [totalJobs, byType, byWorkMode, byExperience] = await Promise.all([
    prisma.jobPosting.count({
      where: { isActive: true }
    }),
    prisma.jobPosting.groupBy({
      by: ['type'],
      where: { isActive: true },
      _count: { id: true }
    }),
    prisma.jobPosting.groupBy({
      by: ['workMode'],
      where: { isActive: true },
      _count: { id: true }
    }),
    prisma.jobPosting.groupBy({
      by: ['experienceLevel'],
      where: { 
        isActive: true,
        experienceLevel: { not: null }
      },
      _count: { id: true }
    })
  ])

  return {
    totalJobs,
    byType,
    byWorkMode,
    byExperience
  }
}

// Obtenir les domaines et compétences uniques pour les filtres
export async function getJobFilters() {
  const jobs = await prisma.jobPosting.findMany({
    where: { isActive: true },
    select: {
      domains: true,
      skills: true,
      location: true,
      experienceLevel: true
    }
  })

  // Extraire les valeurs uniques
  const domains = Array.from(new Set(jobs.flatMap(job => job.domains))).sort()
  const skills = Array.from(new Set(jobs.flatMap(job => job.skills))).sort()
  const locations = Array.from(new Set(jobs.map(job => job.location).filter(Boolean))).sort() as string[]
  const experienceLevels = Array.from(new Set(jobs.map(job => job.experienceLevel).filter(Boolean))).sort() as Difficulty[]

  return {
    domains,
    skills,
    locations,
    experienceLevels
  }
}

export async function getJobApplications(jobId: string) {
  try {
    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return applications
  } catch (error) {
    console.error("Error fetching job applications:", error)
    throw new Error("Erreur lors de la récupération des candidatures")
  }
}

// Récupérer toutes les applications avec filtres
export async function getAllApplications(filters?: {
  search?: string;
  status?: string;
  jobId?: string;
}) {
  try {
    const applications = await prisma.application.findMany({
      where: {
        ...(filters?.jobId && { jobId: filters.jobId }),
        ...(filters?.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters?.search && {
          OR: [
            { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
            { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
            { user: { email: { contains: filters.search, mode: 'insensitive' } } },
            { user: { skills: { has: filters.search } } }
          ]
        })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return applications
  } catch (error) {
    console.error("Error fetching applications:", error)
    throw new Error("Erreur lors de la récupération des candidatures")
  }
}

// Récupérer les statistiques des applications par job
export async function getApplicationStats() {
  try {
    const stats = await prisma.jobPosting.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            applications: true
          }
        },
        applications: {
          select: {
            status: true,
            createdAt: true
          }
        }
      }
    })

    return stats.map(job => {
      const newApplications = job.applications.filter(app => {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return app.createdAt > oneWeekAgo
      }).length

      return {
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        location: job.location,
        type: job.type,
        totalApplications: job._count.applications,
        newApplications
      }
    })
  } catch (error) {
    console.error("Error fetching application stats:", error)
    throw new Error("Erreur lors de la récupération des statistiques")
  }
}