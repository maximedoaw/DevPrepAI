"use server"

import prisma from "@/db/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

const getBaseUrl = () => {
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

export async function getUserHistory() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    // 1. Récupérer les entretiens vocaux
    const voiceInterviews = await prisma.voiceInterview.findMany({
      where: { userId: user.id, status: "completed" },
      orderBy: { startedAt: "desc" },
    });

    // 2. Récupérer les résultats de quiz (QCM, Coding)
    // On exclut le type MOCK_INTERVIEW car ils sont déjà dans VoiceInterview (normalement)
    // ou alors on les garde si on veut tout unifié via QuizResult.
    // L'analyse et enregistrement de VoiceInterview crée déjà un QuizResult.
    const quizResults = await prisma.quizResult.findMany({
      where: { userId: user.id },
      include: {
        quiz: true,
      },
      orderBy: { completedAt: "desc" },
    });

    // 3. Normalisation et Fusion
    const history = [
      ...voiceInterviews.map((vi) => ({
        id: vi.id,
        type: "MOCK_INTERVIEW",
        title: `Entretien Vocal: ${vi.technologies[0] || "Général"}`,
        context: vi.context,
        technologies: vi.technologies,
        score: vi.score,
        date: vi.startedAt,
        duration: Math.round((vi.actualDuration || 0) / 60),
        status: vi.status,
        feedback: vi.feedback,
        isHistory: true,
        domain: "DEVELOPMENT", // Default for now
      })),
      ...quizResults
        .filter((qr) => qr.quiz.type !== "MOCK_INTERVIEW") // Éviter les doublons si déjà géré
        .map((qr) => ({
          id: qr.id,
          type: qr.quiz.type,
          title: qr.quiz.title,
          description: qr.quiz.description,
          technologies: qr.quiz.technology,
          score: qr.score,
          date: qr.completedAt,
          duration: Math.round((qr.duration ?? 0) / 60),
          status: "completed",
          isHistory: true,
          difficulty: qr.quiz.difficulty,
          domain: qr.quiz.domain
        })),
    ];

    // Tri par date décroissante
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { success: true, history };
  } catch (error) {
    console.error("Erreur getUserHistory:", error);
    return { success: false, error: "Erreur lors de la récupération de l'historique", history: [] };
  }
}

export async function getUserVoiceInterviews() {
  const result = await getUserHistory();
  if (result.success && result.history) {
    return { 
      success: true, 
      voiceInterviews: result.history.filter(h => h.type === "MOCK_INTERVIEW") 
    };
  }
  return { success: false, error: result.error || "Erreur", voiceInterviews: [] };
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

    // 2. Construire le prompt Gemini avec une transcription formatée proprement
    let transcriptText = "";
    if (Array.isArray(transcription)) {
        transcriptText = transcription.map((seg: any) => {
            const speaker = seg.speaker === 'user' ? 'Candidat' : 'Interviewer (IA)';
            return `${speaker}: ${seg.text}`;
        }).join('\n');
    } else {
        transcriptText = String(transcription);
    }
    
    // Si la transcription est vide, on ne peut pas analyser
    if (!transcriptText || transcriptText.trim().length < 10) {
         // On sauvegarde quand même la session comme "completed" mais sans score
         await prisma.voiceInterview.update({
            where: { id: interviewId },
            data: {
                transcription,
                actualDuration,
                status: "completed",
                endedAt: new Date()
            }
         });
         return { success: false, error: "Transcription trop courte pour être analysée." };
    }

    const prompt = `Tu es un expert senior en recrutement technique et évaluation de développeurs.
Analyse la conversation d'entretien suivante pour le poste/contexte : "${voiceInterview.context}".
Technologies ciblées : ${voiceInterview.technologies.join(", ")}.

TRANSCRIPTION DE L'ENTRETIEN :
---
${transcriptText}
---

Tâche :
1. Évalue la performance du candidat sur 100 (sois objectif, note sévèrement si les réponses sont vagues).
2. Identifie 3 points forts précis.
3. Identifie 3 points faibles précis.
4. Donne une appréciation générale constructive.

Format de réponse attendu (JSON, sans markdown) :
{
  "note": number, // Score sur 100
  "explication_note": "string", // Appréciation générale
  "points_faibles": ["string", "string", "string"],
  "points_forts": ["string", "string", "string"]
}`;

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
        console.error("Gemini API Error:", geminiData);
        // Sauvegarde de secours sans analyse
        await prisma.voiceInterview.update({
            where: { id: interviewId },
            data: { transcription, actualDuration, status: "completed", endedAt: new Date() }
        });
        return { success: false, error: geminiData.error || "Erreur lors de l'analyse IA" };
    }

    let feedback;
    try {
      // Nettoyage basique si markdown présent
      let jsonStr = geminiData.text.trim();
      if (jsonStr.startsWith("```json")) jsonStr = jsonStr.replace("```json", "").replace("```", "");
      else if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace("```", "").replace("```", "");
      
      feedback = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON Parse Error:", e, geminiData.text);
      return { success: false, error: "Format de réponse IA invalide" };
    }

    // 4. Enregistrer le résultat dans QuizResult (pour l'historique unifié)
        const quiz = await prisma.quiz.create({
          data: {
            title: `Entretien Vocal: ${voiceInterview.technologies[0] || 'Général'}`,
            description: voiceInterview.context,
            type: "MOCK_INTERVIEW",
            domain: "DEVELOPMENT", // Default domain for voice interviews
            questions: JSON.stringify([{ question: "Analyse entretien vocal", type: "open-ended", points: 100 }]),
            company: "DevPrepAI",
            technology: voiceInterview.technologies,
            difficulty: "MID", // À ajuster selon le contexte si disponible
            duration: Math.round(actualDuration / 60), // en minutes
            totalPoints: 100,
          },
        });

    await prisma.quizResult.create({
      data: {
        quizId: quiz.id,
        userId: user.id,
        score: feedback.note,
        answers: transcription, // On stocke la transcription brute ici
        analysis: feedback.explication_note,
        duration: actualDuration,
      },
    });

    // 5. Génération d'exercices (Optionnel, on log juste l'erreur si ça rate pour ne pas bloquer)
    let generatedQuizzes = [];
    try {
        if (feedback.points_faibles?.length > 0) {
            const reinforcementPrompt = `Génère 1 exercice technique (QCM niveau JUNIOR/MID) pour un développeur voulant s'améliorer sur ce point faible : "${feedback.points_faibles[0]}".
Format JSON:
[{
  "title": "Titre",
  "question": "Question",
  "type": "QCM",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "Exp"
}]`;
            
            const reinforceRes = await fetch(`${baseUrl}/api/gemini`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: reinforcementPrompt }),
            });
            const reinforceData = await reinforceRes.json();
            if (reinforceRes.ok && reinforceData.text) {
                let exerJson = reinforceData.text.replace(/```json|```/g, "").trim();
                const exercises = JSON.parse(exerJson);
                // Création rapide du quiz
                 for (const ex of exercises) {
                    const q = await prisma.quiz.create({
                        data: {
                            title: `Renforcement: ${ex.title}`,
                            description: "Exercice généré suite à votre entretien vocal",
                            type: "QCM",
                            domain: "DEVELOPMENT", 
                            questions: JSON.stringify([ex]),
                            company: "DevPrepAI",
                            technology: voiceInterview.technologies,
                            difficulty: "JUNIOR",
                            duration: 5,
                            totalPoints: 10
                        }
                    });
                    generatedQuizzes.push(q);
                 }
            }
        }
    } catch (err) {
        console.warn("Erreur génération exercices renforcement:", err);
    }

    // 6. Mise à jour finale de l'entretien
    await prisma.voiceInterview.update({
      where: { id: interviewId },
      data: {
        feedback,
        score: feedback.note,
        status: "completed",
        transcription: transcription, // Ensure explicit save
        actualDuration,
        endedAt: new Date(),
      },
    });

    return { success: true, feedback, generatedQuizzes };
  } catch (error) {
    console.error("Erreur critique analyzeAndSaveVoiceInterview:", error);
    return { success: false, error: "Erreur serveur interne lors de l'analyse" };
  }
}
