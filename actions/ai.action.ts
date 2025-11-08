"use server"

import prisma from "@/db/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export interface VoiceInterviewData {
  technologies: string[]
  context: string
  duration: number
}

export async function createVoiceInterview(data: VoiceInterviewData) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return { success: false, error: "Utilisateur non authentifié" }
    }

    const voiceInterview = await prisma.voiceInterview.create({
      data: {
        userId: user.id,
        technologies: data.technologies,
        context: data.context,
        duration: data.duration,
        status: "pending"
      }
    })

    console.log("Entretien vocal créé:", voiceInterview.id)
    return { 
      success: true, 
      voiceInterview
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'entretien vocal:", error)
    return { success: false, error: "Erreur lors de la création de l'entretien" }
  }
}

export async function updateVoiceInterviewStatus(
  interviewId: string,
  status: "active" | "completed" | "failed",
  conversationId?: string
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return { success: false, error: "Utilisateur non authentifié" }
    }

    const updateData: any = {
      status,
      ...(status === "completed" && { endedAt: new Date() })
    }

    if (conversationId) {
      updateData.conversationId = conversationId
    }

    const voiceInterview = await prisma.voiceInterview.update({
      where: {
        id: interviewId,
        userId: user.id // Sécurité : l'utilisateur ne peut modifier que ses propres entretiens
      },
      data: updateData
    })

    console.log("Statut de l'entretien mis à jour:", { interviewId, status, conversationId })
    return { success: true, voiceInterview }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entretien vocal:", error)
    return { success: false, error: "Erreur lors de la mise à jour de l'entretien" }
  }
}

export async function saveVoiceInterviewTranscription(
  interviewId: string,
  transcription: any,
  actualDuration: number,
  feedback?: any,
  score?: number
) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return { success: false, error: "Utilisateur non authentifié" }
    }

    const voiceInterview = await prisma.voiceInterview.update({
      where: {
        id: interviewId,
        userId: user.id // Sécurité : l'utilisateur ne peut modifier que ses propres entretiens
      },
      data: {
        transcription,
        actualDuration,
        feedback,
        score,
        status: "completed",
        endedAt: new Date()
      }
    })

    console.log("Transcription sauvegardée:", {
      interviewId,
      transcriptionLength: transcription.length,
      actualDuration,
      score
    })
    return { success: true, voiceInterview }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la transcription:", error)
    return { success: false, error: "Erreur lors de la sauvegarde de la transcription" }
  }
}

export async function getUserVoiceInterviews() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return { success: false, error: "Utilisateur non authentifié" }
    }

    const voiceInterviews = await prisma.voiceInterview.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        startedAt: 'desc'
      },
      select: {
        id: true,
        technologies: true,
        context: true,
        duration: true,
        actualDuration: true,
        status: true,
        startedAt: true,
        endedAt: true,
        score: true,
        conversationId: true
      }
    })

    console.log("Entretiens vocaux récupérés:", voiceInterviews.length)
    return { success: true, voiceInterviews }
  } catch (error) {
    console.error("Erreur lors de la récupération des entretiens vocaux:", error)
    return { success: false, error: "Erreur lors de la récupération des entretiens" }
  }
}

export async function getVoiceInterviewById(interviewId: string) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return { success: false, error: "Utilisateur non authentifié" }
    }

    const voiceInterview = await prisma.voiceInterview.findFirst({
      where: {
        id: interviewId,
        userId: user.id // Sécurité : l'utilisateur ne peut voir que ses propres entretiens
      }
    })

    if (!voiceInterview) {
      return { success: false, error: "Entretien non trouvé" }
    }

    return { success: true, voiceInterview }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entretien vocal:", error)
    return { success: false, error: "Erreur lors de la récupération de l'entretien" }
  }
}

/**
 * Analyse la transcription d'un entretien vocal avec Gemini, enregistre le résultat dans QuizResult,
 * génère des exercices de renforcement et les enregistre dans Quiz.
 * @param {string} interviewId - L'ID de l'entretien vocal (VoiceInterview)
 * @param {any[]} transcription - La transcription complète (array d'objets ou texte)
 * @param {number} actualDuration - Durée réelle de l'appel
 * @returns {Promise<{success: boolean, feedback?: any, generatedQuizzes?: any[], error?: string}>}
 */
export async function analyzeAndSaveVoiceInterview(
  interviewId: string,
  transcription: any[],
  actualDuration: number
): Promise<{ success: boolean; feedback?: any; generatedQuizzes?: any[]; error?: string }> {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    // 1. Récupérer l'entretien vocal
    const voiceInterview = await prisma.voiceInterview.findFirst({
      where: { id: interviewId, userId: user.id },
    });
    if (!voiceInterview) {
      return { success: false, error: "Entretien vocal non trouvé" };
    }

    // 2. Construire le prompt Gemini
    const transcriptText = Array.isArray(transcription)
      ? transcription.map(seg => seg.text).join('\n')
      : String(transcription);
    const prompt = `Tu es un expert en évaluation d'entretiens techniques pour développeurs.\nAnalyse la conversation suivante entre un candidat et un interviewer pour un poste de développeur.\nTon objectif est de :\n1.  Attribuer une note sur 100 à la performance globale du candidat.\n2.  Identifier les 3 points faibles majeurs du candidat.\n3.  Identifier les 3 points forts majeurs du candidat.\n4.  Fournir une explication générale de la note.\n\nLe résultat doit être formaté comme un objet JSON strict pour faciliter l'extraction des données.\n\nVoici le transcript de la conversation :\n---\n${transcriptText}\n---\n\nFormat de sortie attendu (JSON):\n{\n  "note": INTEGER_VALUE,\n  "explication_note": "STRING_VALUE",\n  "points_faibles": [\n    "STRING_VALUE_1",\n    "STRING_VALUE_2",\n    "STRING_VALUE_3"\n  ],\n  "points_forts": [\n    "STRING_VALUE_1",\n    "STRING_VALUE_2",\n    "STRING_VALUE_3"\n  ]\n}`;

    // 3. Appeler l'API Gemini
    const baseUrl = getBaseUrl()

    const geminiRes = await fetch(`${baseUrl}/api/gemini`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ prompt }),
    });
    const geminiData = await geminiRes.json();
    if (!geminiRes.ok || !geminiData.text) {
      return { success: false, error: geminiData.error || "Erreur Gemini" };
    }
    let feedback;
    try {
      feedback = JSON.parse(geminiData.text);
    } catch (e) {
      return { success: false, error: "Réponse Gemini non JSON" };
    }

    // 4. Enregistrer le résultat dans QuizResult (type MOCK_INTERVIEW)
    // Créer un quiz pour cet entretien si besoin
    const quiz = await prisma.quiz.create({
      data: {
        title: `Entretien vocal du ${new Date().toLocaleDateString('fr-FR')}`,
        description: voiceInterview.context,
        type: "MOCK_INTERVIEW",
        questions: JSON.stringify([{ question: "Entretien vocal IA", type: "open-ended", points: 100 }]),
        company: "DevPrepAI",
        technology: voiceInterview.technologies,
        difficulty: "JUNIOR",
        duration: voiceInterview.duration,
        totalPoints: 100,
      },
    });
    const quizResult = await prisma.quizResult.create({
      data: {
        quizId: quiz.id,
        userId: user.id,
        score: feedback.note,
        answers: transcription,
        analysis: feedback.explication_note,
        duration: actualDuration,
      },
    });

    // 5. Générer des exercices de renforcement pour chaque point faible
    const reinforcementPrompt = `Pour chaque point faible suivant, génère un exercice technique (QCM ou question ouverte) pour un développeur, en précisant le niveau (JUNIOR, MID ou SENIOR) selon la difficulté du point. Format de sortie: tableau JSON d'objets {\n  "titre": "...",\n  "type": "QCM" ou "open-ended",\n  "question": "...",\n  "options": ["...", "...", ...] (si QCM),\n  "bonne_reponse": "..." (si QCM),\n  "niveau": "JUNIOR"|"MID"|"SENIOR"\n}\n\nPoints faibles:\n${(feedback.points_faibles as string[]).map((p: string, i: number) => `${i+1}. ${p}`).join("\n")}`;
    const reinforceRes = await fetch(`${baseUrl}/api/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: reinforcementPrompt }),
    });
    const reinforceData = await reinforceRes.json();
    let generatedQuizzes = [];
    if (reinforceRes.ok && reinforceData.text) {
      try {
        const exercises = JSON.parse(reinforceData.text);
        // Créer un quiz pour chaque exercice
        for (const ex of exercises) {
          const quiz = await prisma.quiz.create({
            data: {
              title: ex.titre || "Exercice de renforcement IA",
              description: ex.question,
              type: ex.type === "QCM" ? "QCM" : "MOCK_INTERVIEW",
              questions: JSON.stringify([ex]),
              company: "DevPrepAI",
              technology: voiceInterview.technologies,
              difficulty: ex.niveau || "JUNIOR",
              duration: 10,
              totalPoints: 10,
            },
          });
          generatedQuizzes.push(quiz);
        }
      } catch (e) {
        // ignore parsing error
      }
    }

    // 6. Mettre à jour l'entretien vocal avec le feedback et le score
    await prisma.voiceInterview.update({
      where: { id: interviewId },
      data: {
        feedback,
        score: feedback.note,
        status: "completed",
        endedAt: new Date(),
      },
    });

    return { success: true, feedback, generatedQuizzes };
  } catch (error) {
    console.error("Erreur analyse Gemini:", error);
    return { success: false, error: "Erreur analyse Gemini" };
  }
}
