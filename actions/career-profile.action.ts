"use server"

import prisma from "@/db/prisma"
import { Prisma } from "@prisma/client"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { GoogleGenAI } from "@google/genai"
import { PROMPTS } from "@/lib/prompts"

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

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

export async function callGeminiProfile(answers: CareerTestAnswer[], onboarding?: any): Promise<CareerProfileResult> {
  const baseUrl = getBaseUrl()
  const onboardingText = JSON.stringify(onboarding ?? {}, null, 2)
  const answersText = answers
    .map((a, idx) => `Q${idx + 1} (${a.questionId}): ${a.answer || "Non renseigné"}`)
    .join("\n")

  const prompt = PROMPTS.careerMiniProfile({ onboardingText, answersText })

  const res = await fetch(`${baseUrl}/api/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "simple-prompt",
      prompt
    })
  })

  if (!res.ok) {
    throw new Error("Gemini a renvoyé une erreur")
  }

  const data = await res.json()
  // si la route renvoie {text: "..."} on essaie de parser
  const raw = data?.text || data
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as CareerProfileResult
    } catch (e) {
      // fallback minimal
      return {
        summary: raw.slice(0, 400),
        persona: { title: "Profil", tags: [] },
        recommendations: []
      }
    }
  }
  return raw as CareerProfileResult
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
  if (!user?.id) return { success: false, error: "Vous devez être connecté pour générer votre plan." }

  try {
    // --------------------------------------------------------
    // TENTATIVE 1: Appel via API Route (standard)
    // --------------------------------------------------------
    const baseUrl = getBaseUrl()
    try {
      const res = await fetch(`${baseUrl}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'generate-career-plan',
          answers,
          onboardingContext
        })
      })

      if (res.ok) {
        const responseData = await res.json()
        if (responseData.success && responseData.data) {
          // Sauvegarde DB
          await prisma.user.update({
            where: { id: user.id },
            data: {
              careerProfile: responseData.data as unknown as Prisma.InputJsonValue,
              careerProfileAnswers: answers as unknown as Prisma.InputJsonValue,
              careerProfileUpdatedAt: new Date(),
              careerProfileTestStatus: "DONE"
            }
          })
          return { success: true, data: responseData.data }
        }
      }
    } catch (apiError) {
      console.warn("⚠️ API Route call failed, falling back to direct SDK usage.", apiError)
    }

    // --------------------------------------------------------
    // TENTATIVE 2: Fallback SDK Direct (si API route inaccessible)
    // --------------------------------------------------------
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("Configuration serveur incomplète (API Key manquante).")

    const ai = new GoogleGenAI({ apiKey })

    const answersText = answers
        .map((a, idx) => `Question ${idx + 1} (${a.questionId}): ${a.answer}`)
        .join('\n\n')

    const role = onboardingContext?.role || 'Non spécifié'
    const domains = Array.isArray(onboardingContext?.domains) 
      ? onboardingContext.domains.join(', ') 
      : 'Non spécifié'
    
    const onboardingDetails = onboardingContext?.onboardingDetails || {}
    const onboardingGoals = onboardingContext?.onboardingGoals || {}

    const userRole = onboardingContext?.role || 'CANDIDATE'
    const prompt = userRole === 'CAREER_CHANGER' 
      ? PROMPTS.generateCareerPlan({
          answersText,
          role: userRole,
          domains,
          onboardingDetails,
          onboardingGoals
        })
      : PROMPTS.generateCareerLaunchPlan({
          answersText,
          role: userRole,
          domains,
          onboardingDetails,
          onboardingGoals
        });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })

    const generatedText = response.text
    if (!generatedText) throw new Error("L'IA n'a pas renvoyé de réponse exploitable.")

    let jsonText = generatedText.trim()
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonMatch) jsonText = jsonMatch[1].trim()

    const careerPlan = JSON.parse(jsonText)

    if (!careerPlan.summary || !careerPlan.careerGoals) {
      throw new Error("Le format du plan généré est incomplet.")
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        careerProfile: careerPlan as unknown as Prisma.InputJsonValue,
        careerProfileAnswers: answers as unknown as Prisma.InputJsonValue,
        careerProfileUpdatedAt: new Date(),
        careerProfileTestStatus: "DONE"
      }
    })

    return { success: true, data: careerPlan }

  } catch (error: any) {
    console.error("Erreur génération plan:", error)
    // Message d'erreur User-Friendly
    let message = "Oups ! Une erreur est survenue lors de la création de votre plan."
    if (error.message.includes("API Key")) message = "Problème de configuration serveur (Clé API)."
    if (error.message.includes("JSON")) message = "L'IA a généré une réponse invalide, veuillez réessayer."
    
    return { success: false, error: message }
  }
}

export async function getCareerProfile() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      careerProfile: true,
      careerProfileAnswers: true,
      careerProfileUpdatedAt: true,
      careerProfileTestStatus: true
    }
  })

  if (!dbUser) return { success: false, error: "Utilisateur introuvable" }
  return { success: true, data: dbUser }
}
