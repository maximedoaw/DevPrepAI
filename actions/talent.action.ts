"use server"

import prisma from "@/db/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

export interface CandidateProfile {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  skills: string[]
  domains: string[]
  matchingJobs: number
  portfolio?: {
    id: string
    avatarUrl: string | null
    headline: string | null
    bio: string | null
    skills: string[]
  } | null
}

export async function getAllCandidates(filters?: {
  search?: string
  domains?: string[]
  skills?: string[]
  page?: number
  limit?: number
}) {
  try {
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const skip = (page - 1) * limit

    const where: any = {
      role: Role.CANDIDATE,
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" as const } },
        { lastName: { contains: filters.search, mode: "insensitive" as const } },
        { email: { contains: filters.search, mode: "insensitive" as const } },
      ]
    }

    if (filters?.domains && filters.domains.length > 0) {
      where.domains = {
        hasSome: filters.domains,
      }
    }

    if (filters?.skills && filters.skills.length > 0) {
      where.skills = {
        hasSome: filters.skills,
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { matchingJobs: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          skills: true,
          domains: true,
          matchingJobs: true,
          portfolio: {
            select: {
              id: true,
              avatarUrl: true,
              headline: true,
              bio: true,
              skills: true,
            },
            take: 1,
            orderBy: { updatedAt: "desc" },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    const candidates: CandidateProfile[] = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      skills: user.skills,
      domains: user.domains.map(d => d.toString()),
      matchingJobs: user.matchingJobs,
      portfolio: user.portfolio[0] || null,
    }))

    return {
      candidates,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des candidats:", error)
    throw new Error("Impossible de récupérer les candidats")
  }
}
