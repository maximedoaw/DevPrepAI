import { NextRequest, NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/db/prisma"
import { Role } from "@prisma/client"

/**
 * API Route pour récupérer les matchings depuis le cache (base de données)
 * Cette route retourne les matchings pré-calculés pour éviter de recalculer à chaque fois
 */
export async function GET(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est une entreprise
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (dbUser?.role !== Role.ENTERPRISE) {
      return NextResponse.json(
        { error: "Accès réservé aux entreprises" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jobPostingId = searchParams.get("jobPostingId")

    if (!jobPostingId) {
      return NextResponse.json(
        { error: "jobPostingId est requis" },
        { status: 400 }
      )
    }

    // Vérifier que le job posting appartient à l'utilisateur
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      select: { userId: true, isActive: true },
    })

    if (!jobPosting || jobPosting.userId !== user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer les matchings depuis le cache (base de données)
    const matchings = await prisma.candidateMatching.findMany({
      where: { jobPostingId },
      include: {
        candidate: {
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
        },
      },
      orderBy: { matchScore: "desc" },
      take: 50, // Limiter à 50 matchings
    })

    // Formater les matchings pour la réponse
    const matches = matchings.map(m => ({
      id: m.id,
      matchScore: m.matchScore,
      skillsMatch: m.skillsMatch,
      domainMatch: m.domainMatch,
      experienceMatch: m.experienceMatch,
      aiReason: m.aiReason,
      candidate: {
        id: m.candidate.id,
        firstName: m.candidate.firstName,
        lastName: m.candidate.lastName,
        email: m.candidate.email,
        skills: m.candidate.skills,
        domains: m.candidate.domains,
        matchingJobs: m.candidate.matchingJobs,
        portfolio: m.candidate.portfolio?.[0] ? {
          id: m.candidate.portfolio[0].id,
          avatarUrl: m.candidate.portfolio[0].avatarUrl,
          headline: m.candidate.portfolio[0].headline,
          bio: m.candidate.portfolio[0].bio,
          skills: m.candidate.portfolio[0].skills || [],
        } : null,
      },
    }))

    return NextResponse.json({
      success: true,
      matches,
      total: matches.length,
      fromCache: true,
      cachedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erreur lors de la récupération des matchings:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des matchings",
        message: error.message || "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}

