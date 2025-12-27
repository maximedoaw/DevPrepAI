"use server"

import prisma from "@/db/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { GoogleGenAI } from "@google/genai"

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

  const prompt = `
Tu es un career coach senior. À partir des réponses ci-dessous et des informations d'onboarding, produis un profil de carrière concis.

ONBOARDING:
${onboardingText}

RÉPONSES:
${answersText}

Retourne un JSON strict:
{
  "summary": "3-4 phrases synthétiques en français, ton positif et concret",
  "persona": {
    "title": "Titre court (rôle/position visée)",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "recommendations": ["Action courte 1", "Action courte 2", "Action courte 3"]
}
`

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
    // Note: Si l'appel fetch interne échoue (ex: environnement local sans URL absolue correcte),
    // on bascule sur le fallback SDK direct.
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
              careerProfile: responseData.data,
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

    // Prompt identique à celui de l'API Route pour cohérence
    const prompt = `Tu es un expert senior en développement de carrière et en RH. Ta mission est de créer un plan de carrière ultra-personnalisé pour un candidat, basé sur ses réponses détaillées et son profil d'onboarding.

PROFIL DU CANDIDAT:
- Rôle visé/actuel: ${role}
- Domaines d'intérêt: ${domains}
- Détails Onboarding: ${JSON.stringify(onboardingDetails, null, 2)}
- Objectifs Onboarding: ${JSON.stringify(onboardingGoals, null, 2)}

RÉPONSES AU QUESTIONNAIRE DE CARRIÈRE:
${answersText}

OBJECTIF:
Génère une feuille de route structurée, inspirante et réaliste. Ton ton doit être professionnel mais encourageant, comme un mentor bienveillant.

Format JSON STRICT attendu (ne retourne rien d'autre que ce JSON):
{
  "summary": "Résumé exécutif du profil du candidat (3-4 phrases percutantes qui synthétisent ses forces et son potentiel)",
  "persona": {
    "type": "Titre professionnel synthétique (ex: 'Futur Lead Developer' ou 'Expert Data en devenir')",
    "tags": ["Tag1", "Tag2", "Tag3", "Tag4"] (4-5 mots-clés forts définissant son identité pro)
  },
  "currentSituation": {
    "role": "Position actuelle identifiée",
    "skills": ["Compétence 1", "Compétence 2", "Compétence 3"] (Top 3-5 compétences détectées),
    "experience": "Analyse brève de son niveau d'expérience actuel",
    "strengths": ["Force 1", "Force 2", "Force 3"] (3 atouts majeurs),
    "areasForImprovement": ["Axe 1", "Axe 2"] (2 axes de progression principaux)
  },
  "careerGoals": {
    "shortTerm": ["Objectif 1", "Objectif 2"] (Actions concrètes à 3-6 mois),
    "mediumTerm": ["Objectif 1", "Objectif 2"] (Évolution à 6-12 mois),
    "longTerm": ["Objectif 1", "Objectif 2"] (Vision à 12-18 mois et plus)
  },
  "recommendedPath": {
    "nextSteps": [
      {
        "step": "Titre de l'étape",
        "description": "Description de l'action à entreprendre",
        "timeline": "Estimation de temps (ex: 'Semaine 1-2')",
        "priority": "high" // ou "medium", "low"
      }
    ] (Liste de 3 à 5 étapes clés),
    "skillsToAcquire": [
      {
        "skill": "Nom de la compétence",
        "importance": "high", // ou "medium", "low"
        "resources": ["Livre X", "Cours Y", "Projet Z"] (Suggestions concrètes d'apprentissage)
      }
    ],
    "certifications": [
      {
        "name": "Nom de la certification recommandée",
        "provider": "Organisme (AWS, Google, Coursera...)",
        "relevance": "Pourquoi cette certif est utile pour lui"
      }
    ]
  },
  "matchingOpportunities": {
    "jobTypes": [
      {
        "title": "Intitulé de poste cible",
        "description": "Pourquoi ce poste lui correspond",
        "matchScore": 85 // Estimation du % de correspondance
      }
    ],
    "companies": ["Type d'entreprise 1", "Type d'entreprise 2"] (Startup, Grand Groupe, Agence...),
    "industries": ["Secteur 1", "Secteur 2"],
    "workPreferences": {
       "remote": "Remote/Hybride/Sur site recommandé",
       "teamSize": "Petite/Moyenne/Grande équipe",
       "companyStage": "Early Stage/Growth/Established"
    }
  },
  "actionPlan": {
    "week1": ["Action immédiate 1", "Action immédiate 2"],
    "month1": ["Objectif à fin de mois 1", "Objectif à fin de mois 2"],
    "month3": ["Jalon trimestriel 1"],
    "month6": ["Vision semestrielle"]
  },
  "motivationalMessage": "Un message de fin inspirant et personnalisé pour motiver le candidat à passer à l'action."
}`;

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
        careerProfile: careerPlan,
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
      careerProfileUpdatedAt: true,
      careerProfileTestStatus: true
    }
  })

  if (!dbUser) return { success: false, error: "Utilisateur introuvable" }
  return { success: true, data: dbUser }
}
