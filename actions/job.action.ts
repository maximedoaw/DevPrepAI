// actions/job.action.ts
"use server"

import prisma from "@/db/prisma"
import { revalidatePath } from "next/cache"
import { Domain, JobType, WorkMode, Difficulty } from "@prisma/client"
import { mockJobs } from "@/data/mockJobs"

// Types pour les filtres
export interface JobFilters {
  search?: string
  domains?: Domain[] // Corrigé : Domain[] au lieu de string[]
  skills?: string[]
  workMode?: WorkMode[]
  type?: JobType[]
  location?: string
  experienceLevel?: Difficulty[] // Corrigé : Difficulty[] au lieu de string[]
  minSalary?: number
  maxSalary?: number
}

// Récupérer tous les jobs avec filtres
export async function getJobs(filters?: JobFilters) {
  const where = {
    isActive: true,
    ...(filters?.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { companyName: { contains: filters.search, mode: 'insensitive' } }
      ]
    }),
    ...(filters?.domains && { domains: { hasSome: filters.domains } }),
    ...(filters?.skills && { skills: { hasSome: filters.skills } }),
    ...(filters?.workMode && { workMode: { in: filters.workMode } }),
    ...(filters?.type && { type: { in: filters.type } }),
    ...(filters?.location && { location: { contains: filters.location, mode: 'insensitive' } }),
    ...(filters?.experienceLevel && { experienceLevel: { in: filters.experienceLevel } }),
    ...(filters?.minSalary !== undefined && { salaryMin: { gte: filters.minSalary } }),
    ...(filters?.maxSalary !== undefined && { salaryMax: { lte: filters.maxSalary } })
  }

  const jobs = await prisma.jobPosting.findMany({
    include: {
      applications: {
        select: {
          id: true,
          status: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return jobs
}

// Récupérer un job par son ID
export async function getJobById(id: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
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
  experienceLevel?: Difficulty // Corrigé : Difficulty au lieu de string
  metadata?: any
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
  domains: Domain[] // Corrigé : Domain[] au lieu de string[]
  skills: string[]
  salaryMin: number
  salaryMax: number
  currency: string
  type: JobType
  workMode: WorkMode
  experienceLevel: Difficulty // Corrigé : Difficulty au lieu de string
  metadata: any
  isActive: boolean
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

// Peupler la base avec des jobs de démonstration
export async function seedJobs() {
  // Vérifier si des jobs existent déjà
  const existingJobs = await prisma.jobPosting.count()
  if (existingJobs > 0) {
    await prisma.jobPosting.deleteMany({})
  }

  // Préparer les données pour Prisma
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
    type: job.type as JobType, // Assurer que c'est bien JobType
    workMode: job.workMode as WorkMode, // Assurer que c'est bien WorkMode
    experienceLevel: job.experienceLevel as Difficulty, // Assurer que c'est bien Difficulty
    isActive: true,
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