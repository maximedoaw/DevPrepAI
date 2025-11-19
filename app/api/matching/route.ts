import { NextRequest, NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { GoogleGenAI } from "@google/genai"
import prisma from "@/db/prisma"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { jobPostingId } = body

    if (!jobPostingId) {
      return NextResponse.json(
        { error: "jobPostingId est requis" },
        { status: 400 }
      )
    }

    // Récupérer le job posting
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId, userId: user.id, isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        domains: true,
        skills: true,
        experienceLevel: true,
        location: true,
        type: true,
        workMode: true,
      },
    })

    if (!jobPosting) {
      return NextResponse.json(
        { error: "Poste introuvable ou inactif" },
        { status: 404 }
      )
    }

    // Vérifier d'abord si des matchings existent déjà pour ce job posting
    const existingMatchings = await prisma.candidateMatching.findMany({
      where: { jobPostingId: jobPosting.id },
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
      take: 20, // Limiter à 20 candidats
    })

    // Si des matchings existent déjà, les retourner directement
    if (existingMatchings.length > 0) {
      const matches = existingMatchings.map(m => ({
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
      })
    }

    // Si aucun matching n'existe, générer avec Gemini
    // Récupérer tous les vrais candidats
    const dbCandidates = await prisma.user.findMany({
      where: {
        role: Role.CANDIDATE,
      },
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
            experiences: true,
            education: true,
          },
          take: 1,
          orderBy: { updatedAt: "desc" },
        },
      },
    })

    if (dbCandidates.length === 0) {
      return NextResponse.json(
        { error: "Aucun candidat trouvé dans la base de données" },
        { status: 404 }
      )
    }

    // Préparer les candidats pour Gemini
    const candidates = dbCandidates.map(c => ({
      ...c,
      portfolio: c.portfolio?.[0] || null,
    }))

    // Vérifier la clé API Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY non configurée" },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    // Préparer le prompt pour Gemini
    const prompt = `Tu es un expert en recrutement et matching candidat-entreprise.

POSTE À POURVOIR:
- Titre: ${jobPosting.title}
- Description: ${jobPosting.description}
- Domaines requis: ${jobPosting.domains.join(", ")}
- Compétences requises: ${jobPosting.skills.join(", ")}
- Niveau d'expérience: ${jobPosting.experienceLevel || "Non spécifié"}
- Type: ${jobPosting.type}
- Mode de travail: ${jobPosting.workMode}
- Localisation: ${jobPosting.location || "Non spécifiée"}

CANDIDATS À ÉVALUER:
${candidates.map((candidate, index) => {
  const portfolio = candidate.portfolio
  return `
Candidat ${index + 1} (ID: ${candidate.id}):
- Nom: ${candidate.firstName} ${candidate.lastName}
- Email: ${candidate.email}
- Compétences: ${candidate.skills.join(", ")}
- Domaines: ${candidate.domains.join(", ")}
- Headline: ${portfolio?.headline || "Non spécifié"}
- Bio: ${portfolio?.bio || "Non spécifiée"}
- Expériences: ${portfolio?.experiences ? JSON.stringify(portfolio.experiences).substring(0, 300) : "Non spécifiées"}
- Formation: ${portfolio?.education ? JSON.stringify(portfolio.education).substring(0, 300) : "Non spécifiée"}
`
}).join("\n")}

TÂCHE:
Pour chaque candidat, calcule un score de matching (0-100) basé sur:
1. Correspondance des compétences (40%)
2. Correspondance des domaines (30%)
3. Correspondance de l'expérience et du profil (20%)
4. Pertinence globale du profil (10%)

Retourne UNIQUEMENT un JSON valide avec ce format:
{
  "matches": [
    {
      "candidateId": "id_exact_du_candidat",
      "matchScore": 85.5,
      "skillsMatch": 90,
      "domainMatch": 80,
      "experienceMatch": 85,
      "reason": "Explication détaillée en 2-3 phrases du pourquoi ce candidat correspond au poste"
    }
  ]
}

IMPORTANT: 
- Retourne uniquement le JSON, sans texte avant ou après.
- Utilise les IDs exacts des candidats fournis.
- Retourne les 20 meilleurs matchings triés par score décroissant.`

    // Appeler Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const generatedText = response.text
    if (!generatedText) {
      throw new Error("Aucune réponse de Gemini")
    }

    // Parser la réponse JSON
    let jsonText = generatedText.trim()
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim()
    }

    const parsedResult = JSON.parse(jsonText)

    if (!parsedResult.matches || !Array.isArray(parsedResult.matches)) {
      throw new Error("Format de réponse invalide")
    }

    // Limiter à 20 meilleurs matchings
    const topMatchings = parsedResult.matches
      .filter((match: any) => {
        const candidate = candidates.find((c) => c.id === match.candidateId)
        return candidate !== undefined
      })
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 20)

    // Sauvegarder les matchings dans la base de données
    const matchingsToCreate = topMatchings.map((match: any) => ({
      jobPostingId: jobPosting.id,
      candidateId: match.candidateId,
      matchScore: match.matchScore,
      aiReason: match.reason || null,
      skillsMatch: match.skillsMatch || 0,
      domainMatch: match.domainMatch || 0,
      experienceMatch: match.experienceMatch || null,
      status: "PENDING",
    }))

    // Supprimer les anciens matchings pour ce job posting
    if (matchingsToCreate.length > 0) {
      await prisma.candidateMatching.deleteMany({
        where: { jobPostingId: jobPosting.id },
      })

      // Créer les nouveaux matchings
      await prisma.candidateMatching.createMany({
        data: matchingsToCreate,
        skipDuplicates: true,
      })
    }

    // Récupérer les matchings avec les données des candidats
    const savedMatchings = await prisma.candidateMatching.findMany({
      where: { jobPostingId: jobPosting.id },
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
      take: 20,
    })

    // Construire la réponse
    const matches = savedMatchings.map(m => ({
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
      fromCache: false,
    })
  } catch (error: any) {
    console.error("Erreur lors du matching:", error)
    return NextResponse.json(
      {
        error: "Erreur lors du matching",
        message: error.message || "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}

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
      select: { userId: true },
    })

    if (!jobPosting || jobPosting.userId !== user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer les matchings
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
      take: 20,
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
      matches: matchings,
      total: matchings.length,
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
