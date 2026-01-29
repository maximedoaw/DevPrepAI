"use server"

import prisma from "@/db/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { GoogleGenAI } from "@google/genai"

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

export async function saveAiMatchedTalents(jobPostingId: string) {
  try {
    const matches = await getAiMatchedTalents("system", jobPostingId); // CompanyID unused in current impl
    
    if (!matches || matches.length === 0) return { success: false, count: 0 };

    const results = await Promise.all(
      matches.map(async (match: any) => {
        return prisma.candidateMatching.upsert({
          where: {
            jobPostingId_candidateId: {
              candidateId: match.id,
              jobPostingId: jobPostingId,
            },
          },
          update: {
            matchScore: match.matchScore,
            aiReason: match.aiReason,
            skillsMatch: match.skillsMatch,
            domainMatch: match.domainMatch,
          },
          create: {
            candidateId: match.id,
            jobPostingId: jobPostingId,
            matchScore: match.matchScore,
            aiReason: match.aiReason,
            skillsMatch: match.skillsMatch,
            domainMatch: match.domainMatch,
            status: "PENDING", // Default status
          },
        });
      })
    );

    revalidatePath(`/talent-matching`);
    return { success: true, count: results.length };
  } catch (error) {
    console.error("Error saving AI matches:", error);
    return { success: false, error };
  }
}

export async function getAiMatchedTalents(companyId: string, jobPostingId: string) {
  try {
    // 1. Récupérer les détails du Job
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      select: {
        title: true,
        description: true,
        skills: true,
        domains: true,
        experienceLevel: true,
      }
    })

    if (!job) throw new Error("Job not found")

    // 2. Récupérer les candidats avec leurs données pertinentes (Badges, Quiz, Skills)
    const candidates = await prisma.user.findMany({
      where: { role: Role.CANDIDATE },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        skills: true,
        domains: true,
        matchingJobs: true,
        imageUrl: true,
        portfolio: {
          select: { id: true, avatarUrl: true, headline: true, bio: true, skills: true },
          take: 1
        },
        // Récupérer les badges via l'inscription au bootcamp
        bootcampEnrollments: {
          select: { badges: true, progress: true },
          take: 1
        },
        // Récupérer les résultats de quiz pour le score d'employabilité
        quizResults: {
          select: { score: true },
          take: 20, // Plus de précision
          orderBy: { completedAt: 'desc' }
        }
      },
      take: 50 // Limiter pour l'IA
    })

    // 3. Préparer le context pour l'IA
    const candidatesContext = candidates.map(c => {
      // Calcul du score d'employabilité
      const avgQuizScore = c.quizResults.length > 0
        ? c.quizResults.reduce((acc, curr) => acc + curr.score, 0) / c.quizResults.length
        : 0;
      
      const badges = c.bootcampEnrollments[0]?.badges || [];
      
      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        skills: c.skills,
        domains: c.domains,
        badges: badges,
        employabilityScore: Math.round(avgQuizScore),
      }
    })

    // 4. Appeler Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    
    // Initialisation du client
    const genAI = new GoogleGenAI({ apiKey });
    
    const PROMPT = `
      Tu es un expert en recrutement IA. Analyse les candidats suivants pour le poste ci-dessous.
      
      POSTE:
      Titre: ${job.title}
      Description: ${job.description.substring(0, 300)}...
      Compétences requises: ${job.skills.join(", ")}
      Domaines: ${job.domains.join(", ")}
      Niveau: ${job.experienceLevel}

      CANDIDATS (Format JSON simplifié pour analyse):
      ${JSON.stringify(candidatesContext)}

      TACHE:
      Classe les candidats du meilleur au moins bon matching.
      
      CRITÈRES DE CLASSEMENT ET DE SCORE:
      1. **Badges obtenus (CRITICAL)**: Si un candidat a des badges pertinents, augmente considérablement son score. Mentionne-les explicitement dans la raison.
      2. **Score d'employabilité**: Utilise le score fourni (basé sur les quiz). Un score élevé (>80) est un très bon signal.
      3. **Skills Match**: Correspondance des compétences techniques.
      
      Retourne un JSON STRICT (Array d'objets) sous ce format:
      [
        {
          "candidateId": "id du candidat",
          "matchScore": number (0-100),
          "aiReason": "Feedback concis (1 phrase). Mentionne OBLIGATOIREMENT les badges s'il en a, et le score d'employabilité s'il est bon.",
          "skillsMatch": number (0-100),
          "domainMatch": number (0-100)
        }
      ]
    `;

    // Appel à l'API via generateContent
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: PROMPT
    });
    
    const responseText = response.text;
    
    if (!responseText) throw new Error("No response from AI");

    // Nettoyage JSON
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : responseText;
    
    let aiMatches = [];
    try {
      aiMatches = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI response", e);
      return [];
    }

    // 5. Fusionner avec les données complètes des candidats
    const formattedMatches = aiMatches.map((match: any) => {
      const candidate = candidates.find(c => c.id === match.candidateId);
      if (!candidate) return null;
      
      const avgScore = candidate.quizResults.length > 0
            ? candidate.quizResults.reduce((acc, curr) => acc + curr.score, 0) / candidate.quizResults.length
            : 0;
            
      return {
        id: match.candidateId,
        matchScore: match.matchScore,
        skillsMatch: match.skillsMatch,
        domainMatch: match.domainMatch,
        experienceMatch: null,
        aiReason: match.aiReason,
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          skills: candidate.skills,
          domains: candidate.domains.map(d => d.toString()),
          matchingJobs: candidate.matchingJobs,
          imageUrl: candidate.imageUrl,
          portfolio: candidate.portfolio[0] || null,
          // Badge et Score
          badges: candidate.bootcampEnrollments[0]?.badges || [],
          employabilityScore: Math.round(avgScore)
        }
      };
    }).filter(Boolean); // Filtrer les nulls

    // Trier par score décroissant
    return formattedMatches.sort((a: any, b: any) => b.matchScore - a.matchScore);

  } catch (error) {
    console.error("Error in AI Talent Matching:", error);
    return [];
  }
}
