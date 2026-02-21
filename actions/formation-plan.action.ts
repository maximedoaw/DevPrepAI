"use server"

import prisma from "@/db/prisma"
import { Prisma } from "@prisma/client"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { GoogleGenAI } from "@google/genai"
import { PROMPTS } from "@/lib/prompts"
import { inngest } from "@/lib/inngest"

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export interface FormationTestAnswer {
  questionId: string
  answer: string
}

export async function startFormationTest() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      formationProfileTestStatus: "PENDING"
    }
  })

  return { success: true }
}

export async function submitFormationTest(answers: FormationTestAnswer[], onboardingContext?: any) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Vous devez être connecté pour générer votre plan d'apprentissage." }

  try {
    const baseUrl = getBaseUrl()
    
    // Attempt via API Route first
    try {
      const res = await fetch(`${baseUrl}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'generate-formation-plan',
          answers,
          onboardingContext
        })
      })

      if (res.ok) {
        const responseData = await res.json()
        if (responseData.success && responseData.data) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              formationProfile: responseData.data as unknown as Prisma.InputJsonValue,
              formationProfileAnswers: answers as unknown as Prisma.InputJsonValue,
              formationProfileUpdatedAt: new Date(),
              formationProfileTestStatus: "DONE"
            }
          })

          return { success: true, data: responseData.data }
        }
      }
    } catch (apiError) {
      console.warn("⚠️ API Route call failed for formation plan, falling back to direct SDK usage.", apiError)
    }

    // Fallback: SDK Direct
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("Configuration serveur incomplète (API Key manquante).")

    const ai = new GoogleGenAI({ apiKey })

    const processedAnswers = [...answers]
    const otherAnswer = answers.find(a => a.questionId === "target_market" && a.answer === "other")
    const customValue = answers.find(a => a.questionId === "target_market_custom")?.answer

    const finalAnswers = processedAnswers.map(a => {
      if (a.questionId === "target_market" && a.answer === "other" && customValue) {
        return { ...a, answer: `Autre: ${customValue}` }
      }
      return a
    }).filter(a => a.questionId !== "target_market_custom")

    const answersText = finalAnswers
        .map((a, idx) => `Question ${idx + 1} (${a.questionId}): ${a.answer}`)
        .join('\n\n')

    const role = onboardingContext?.role || 'Étudiant'
    const domains = Array.isArray(onboardingContext?.domains) 
      ? onboardingContext.domains.join(', ') 
      : 'Général'
    
    const onboardingDetails = onboardingContext?.onboardingDetails || {}
    const onboardingGoals = onboardingContext?.onboardingGoals || {}

    const prompt = PROMPTS.generateFormationPlan({
      answersText,
      role,
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

    const formationPlan = JSON.parse(jsonText)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        formationProfile: formationPlan as unknown as Prisma.InputJsonValue,
        formationProfileAnswers: answers as unknown as Prisma.InputJsonValue,
        formationProfileUpdatedAt: new Date(),
        formationProfileTestStatus: "DONE"
      }
    })

    return { success: true, data: formationPlan }

  } catch (error: any) {
    console.error("Erreur génération plan formation:", error)
    return { success: false, error: "Oups ! Une erreur est survenue lors de la création de votre plan d'apprentissage." }
  }
}

export async function getFormationProfile() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      formationProfile: true,
      formationProfileAnswers: true,
      formationProfileUpdatedAt: true,
      formationProfileTestStatus: true
    }
  })

  if (!dbUser) return { success: false, error: "Utilisateur introuvable" }
  return { success: true, data: dbUser }
}

export async function deleteFormationProfile() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        formationProfile: Prisma.JsonNull,
        formationProfileAnswers: Prisma.JsonNull,
        formationProfileUpdatedAt: null,
        formationProfileTestStatus: "NOT_STARTED"
      }
    })
    return { success: true }
  } catch (error) {
    console.error("Erreur suppression plan formation:", error)
    return { success: false, error: "Impossible de supprimer le plan." }
  }
}
