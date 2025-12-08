"use server"

import prisma from "@/db/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

// Types simples pour transport
export interface CareerTestAnswer {
  questionId: string
  answer: string
}

export interface CareerProfileResult {
  summary: string
  persona: {
    title: string
    tags: string[]
  }
  recommendations: string[]
}

// TODO: brancher Gemini et ElevenLabs réelles. Ici stubs.
async function callGeminiMock(_answers: CareerTestAnswer[], _onboarding?: any): Promise<CareerProfileResult> {
  return {
    summary: "Profil synthétique généré (stub).",
    persona: { title: "Ingénieur logiciel en reconversion", tags: ["Fullstack", "Remote", "TypeScript"] },
    recommendations: [
      "Renforcer les bases en system design.",
      "Travailler des katas d'algorithme 20 min/jour.",
      "Construire un mini projet portfolio avec Next.js + Prisma."
    ]
  }
}

export async function startCareerTest() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      careerProfileTestStatus: "PENDING"
    }
  })

  return { success: true }
}

export async function refuseCareerTest() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      careerProfileTestStatus: "REFUSED"
    }
  })
  return { success: true }
}

export async function submitCareerTest(answers: CareerTestAnswer[], onboardingContext?: any) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  // Appel Gemini (stub pour l’instant)
  const profile = await callGeminiMock(answers, onboardingContext)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      careerProfile: profile as any,
      careerProfileUpdatedAt: new Date(),
      careerProfileTestStatus: "DONE"
    }
  })

  return { success: true, data: profile }
}

export async function getCareerProfile() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      careerProfile: true,
      careerProfileUpdatedAt: true,
      careerProfileTestStatus: true
    }
  })

  if (!dbUser) return { success: false, error: "Utilisateur introuvable" }
  return { success: true, data: dbUser }
}

