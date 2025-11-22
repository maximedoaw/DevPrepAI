/**
 * Script pour générer tous les matchings candidat-entreprise en arrière-plan
 * Ce script calcule les matchings pour tous les postes actifs et les stocke en base de données
 * Usage: npx tsx scripts/generate-matchings.ts
 */

import prisma from "@/db/prisma"
import { Role } from "@prisma/client"
import { GoogleGenAI } from "@google/genai"

// Fonction pour calculer les stats de quiz d'un candidat et récupérer les feedbacks des recruteurs
async function getCandidateStats(candidateId: string, requiredDomains: string[]) {
  // Récupérer les résultats de quiz d'entraînement
  const quizResults = await prisma.quizResult.findMany({
    where: {
      userId: candidateId,
      quiz: {
        type: {
          in: ["QCM", "TECHNICAL", "MOCK_INTERVIEW"],
        },
        domain: {
          in: requiredDomains as any[],
        },
      },
    },
    include: {
      quiz: {
        select: {
          type: true,
          domain: true,
          difficulty: true,
        },
      },
    },
    orderBy: {
      completedAt: "asc",
    },
  })

  // Récupérer les feedbacks des recruteurs (JobQuizResult)
  const recruiterFeedbacks = await prisma.jobQuizResult.findMany({
    where: {
      userId: candidateId,
      feedbackVisibleToCandidate: true,
      jobQuiz: {
        domain: {
          in: requiredDomains as any[],
        },
      },
    },
    include: {
      jobQuiz: {
        select: {
          title: true,
          type: true,
          domain: true,
          difficulty: true,
          company: true,
        },
      },
      skillAnalysis: {
        select: {
          aiFeedback: true,
          improvementTips: true,
          analyzedAt: true,
        },
        orderBy: {
          analyzedAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      completedAt: "desc",
    },
    take: 10,
  })

  const progressionByType: Record<string, {
    firstScores: number[],
    recentScores: number[],
    averageFirst: number,
    averageRecent: number,
    improvement: number,
    totalCount: number,
  }> = {
    QCM: { firstScores: [], recentScores: [], averageFirst: 0, averageRecent: 0, improvement: 0, totalCount: 0 },
    TECHNICAL: { firstScores: [], recentScores: [], averageFirst: 0, averageRecent: 0, improvement: 0, totalCount: 0 },
    MOCK_INTERVIEW: { firstScores: [], recentScores: [], averageFirst: 0, averageRecent: 0, improvement: 0, totalCount: 0 },
  }

  quizResults.forEach((result) => {
    const type = result.quiz.type
    if (progressionByType[type]) {
      progressionByType[type].totalCount++
      if (progressionByType[type].firstScores.length < 3) {
        progressionByType[type].firstScores.push(result.score)
      }
      progressionByType[type].recentScores.push(result.score)
      if (progressionByType[type].recentScores.length > 3) {
        progressionByType[type].recentScores.shift()
      }
    }
  })

  Object.keys(progressionByType).forEach((type) => {
    const stats = progressionByType[type]
    if (stats.firstScores.length > 0) {
      stats.averageFirst = stats.firstScores.reduce((sum, score) => sum + score, 0) / stats.firstScores.length
    }
    if (stats.recentScores.length > 0) {
      stats.averageRecent = stats.recentScores.reduce((sum, score) => sum + score, 0) / stats.recentScores.length
    }
    if (stats.averageFirst > 0) {
      stats.improvement = ((stats.averageRecent - stats.averageFirst) / stats.averageFirst) * 100
    }
  })

  const totalQuizzes = quizResults.length
  const averageScore = totalQuizzes > 0
    ? quizResults.reduce((sum, r) => sum + r.score, 0) / totalQuizzes
    : 0
  const perfectScores = quizResults.filter(r => r.score >= 95).length

  const badges: string[] = []
  if (totalQuizzes >= 10) badges.push("📝 Quiz Master (10+ quiz)")
  if (totalQuizzes >= 50) badges.push("🏆 Quiz Champion (50+ quiz)")
  if (totalQuizzes >= 100) badges.push("👑 Quiz Légende (100+ quiz)")
  if (perfectScores >= 5) badges.push("✨ Perfectionniste (5+ scores ≥95%)")
  if (perfectScores >= 20) badges.push("💎 Maître de la Perfection (20+ scores ≥95%)")
  if (averageScore >= 80 && totalQuizzes >= 5) badges.push("🎯 Excellent (moyenne ≥80%)")
  if (averageScore >= 90 && totalQuizzes >= 5) badges.push("🏅 Exceptionnel (moyenne ≥90%)")

  const hasImprovement = Object.values(progressionByType).some(
    (stats) => stats.improvement > 10 && stats.totalCount >= 3
  )
  if (hasImprovement) badges.push("📈 En Progression (amélioration significative)")

  // Traiter les feedbacks des recruteurs
  const recruiterFeedbacksFormatted = recruiterFeedbacks.map((feedback) => ({
    quizTitle: feedback.jobQuiz.title,
    quizType: feedback.jobQuiz.type,
    score: feedback.score,
    reviewScore: feedback.reviewScore,
    finalScore: feedback.finalScore || feedback.score,
    analysis: feedback.analysis,
    aiFeedback: feedback.skillAnalysis?.[0]?.aiFeedback,
    improvementTips: feedback.skillAnalysis?.[0]?.improvementTips || [],
    completedAt: feedback.completedAt,
    company: feedback.jobQuiz.company,
    domain: feedback.jobQuiz.domain,
  }))

  // Calculer la moyenne des feedbacks des recruteurs
  const averageRecruiterScore = recruiterFeedbacks.length > 0
    ? recruiterFeedbacks.reduce((sum, f) => sum + (f.finalScore || f.reviewScore || f.score || 0), 0) / recruiterFeedbacks.length
    : 0

  return {
    totalQuizzes,
    averageScore: Math.round(averageScore * 10) / 10,
    perfectScores,
    progressionByType,
    badges,
    recruiterFeedbacks: recruiterFeedbacksFormatted,
    averageRecruiterScore: Math.round(averageRecruiterScore * 10) / 10,
    recruiterFeedbacksCount: recruiterFeedbacks.length,
  }
}

// Fonction principale pour générer les matchings
async function generateMatchings() {
  console.log("🚀 Démarrage de la génération des matchings...")

  try {
    // Récupérer tous les postes actifs
    const activeJobPostings = await prisma.jobPosting.findMany({
      where: {
        isActive: true,
      },
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

    console.log(`📋 ${activeJobPostings.length} poste(s) actif(s) trouvé(s)`)

    if (activeJobPostings.length === 0) {
      console.log("⚠️  Aucun poste actif trouvé. Fin du script.")
      return
    }

    // Vérifier la clé API Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY non configurée")
    }

    const ai = new GoogleGenAI({ apiKey })

    // Pour chaque poste, générer les matchings
    for (const jobPosting of activeJobPostings) {
      console.log(`\n🔄 Traitement du poste: ${jobPosting.title} (${jobPosting.id})`)

      const requiredDomains = jobPosting.domains
      const requiredSkills = jobPosting.skills.map(s => s.toLowerCase())

      // Récupérer les candidats avec filtre strict par domaines ET compétences
      const dbCandidates = await prisma.user.findMany({
        where: {
          role: Role.CANDIDATE,
          domains: {
            hasSome: requiredDomains,
          },
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

      // Filtrer strictement par compétences
      const filteredCandidates = dbCandidates.filter(candidate => {
        const candidateSkills = candidate.skills.map(s => s.toLowerCase())
        const hasMatchingSkill = requiredSkills.some(reqSkill => 
          candidateSkills.some(candSkill => 
            candSkill.includes(reqSkill) || reqSkill.includes(candSkill)
          )
        )
        const hasMatchingDomain = requiredDomains.some(reqDomain => 
          candidate.domains.includes(reqDomain)
        )
        return hasMatchingSkill && hasMatchingDomain
      })

      console.log(`  👥 ${filteredCandidates.length} candidat(s) correspondant(s) trouvé(s)`)

      if (filteredCandidates.length === 0) {
        console.log("  ⚠️  Aucun candidat correspondant. Passage au poste suivant.")
        // Supprimer les anciens matchings pour ce poste
        await prisma.candidateMatching.deleteMany({
          where: { jobPostingId: jobPosting.id },
        })
        continue
      }

      // Récupérer les stats de quiz et feedbacks pour chaque candidat
      const candidatesWithStats = await Promise.all(
        filteredCandidates.map(async (c) => {
          const stats = await getCandidateStats(c.id, requiredDomains)
          return {
            ...c,
            portfolio: c.portfolio?.[0] || null,
            quizStats: {
              totalQuizzes: stats.totalQuizzes,
              averageScore: stats.averageScore,
              perfectScores: stats.perfectScores,
              progressionByType: stats.progressionByType,
              badges: stats.badges,
            },
            recruiterFeedbacks: stats.recruiterFeedbacks,
            averageRecruiterScore: stats.averageRecruiterScore,
            recruiterFeedbacksCount: stats.recruiterFeedbacksCount,
          }
        })
      )

      // Préparer le prompt pour Gemini
      const prompt = `Tu es un expert en recrutement et matching candidat-entreprise.

POSTE À POURVOIR:
- Titre: ${jobPosting.title}
- Description: ${jobPosting.description}
- Domaines requis: ${jobPosting.domains.join(", ")} (Total: ${requiredDomains.length} domaines)
- Compétences requises: ${jobPosting.skills.join(", ")} (Total: ${requiredSkills.length} compétences)
- Niveau d'expérience: ${jobPosting.experienceLevel || "Non spécifié"}
- Type: ${jobPosting.type}
- Mode de travail: ${jobPosting.workMode}
- Localisation: ${jobPosting.location || "Non spécifiée"}

CANDIDATS À ÉVALUER:
${candidatesWithStats.map((candidate, index) => {
  const portfolio = candidate.portfolio
  const quizStats = candidate.quizStats
  const recruiterFeedbacks = (candidate as any).recruiterFeedbacks || []
  const averageRecruiterScore = (candidate as any).averageRecruiterScore || 0
  const recruiterFeedbacksCount = (candidate as any).recruiterFeedbacksCount || 0
  
  const matchingDomains = candidate.domains.filter((d: string) => requiredDomains.includes(d as any)).length
  const matchingSkills = candidate.skills.filter(s => 
    requiredSkills.some(req => 
      s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase())
    )
  ).length

  // Format des feedbacks des recruteurs
  let recruiterFeedbacksInfo = ""
  if (recruiterFeedbacks.length > 0) {
    recruiterFeedbacksInfo = `
- Feedbacks des recruteurs (${recruiterFeedbacksCount} feedbacks):
  * Score moyen des recruteurs: ${averageRecruiterScore}%
  * Derniers feedbacks:
${recruiterFeedbacks.slice(0, 3).map((fb: any) => `
    - ${fb.quizTitle} (${fb.company}): Score ${Math.round(fb.finalScore || fb.reviewScore || fb.score || 0)}%
      ${fb.aiFeedback ? `Feedback: ${fb.aiFeedback.substring(0, 200)}` : ""}`).join("")}`
  }

  const quizInfo = `
- Résultats de quiz d'entraînement:
  * Total de quiz: ${quizStats.totalQuizzes}
  * Score moyen: ${quizStats.averageScore}%
  * Scores parfaits (≥95%): ${quizStats.perfectScores}
  * Progression QCM: ${quizStats.progressionByType.QCM.improvement > 0 ? `+${Math.round(quizStats.progressionByType.QCM.improvement)}%` : "Stable"} (${quizStats.progressionByType.QCM.totalCount} quiz)
  * Progression TECHNICAL: ${quizStats.progressionByType.TECHNICAL.improvement > 0 ? `+${Math.round(quizStats.progressionByType.TECHNICAL.improvement)}%` : "Stable"} (${quizStats.progressionByType.TECHNICAL.totalCount} quiz)
  * Progression MOCK_INTERVIEW: ${quizStats.progressionByType.MOCK_INTERVIEW.improvement > 0 ? `+${Math.round(quizStats.progressionByType.MOCK_INTERVIEW.improvement)}%` : "Stable"} (${quizStats.progressionByType.MOCK_INTERVIEW.totalCount} quiz)
  * Badges obtenus: ${quizStats.badges.length > 0 ? quizStats.badges.join(", ") : "Aucun"}${recruiterFeedbacksInfo}`

  return `
Candidat ${index + 1} (ID: ${candidate.id}):
- Nom: ${candidate.firstName} ${candidate.lastName}
- Email: ${candidate.email}
- Compétences: ${candidate.skills.join(", ")} (Total: ${candidate.skills.length} compétences)
- Domaines: ${candidate.domains.join(", ")} (Total: ${candidate.domains.length} domaines)
- Nombre de domaines correspondants: ${matchingDomains} sur ${requiredDomains.length}
- Nombre de compétences correspondantes: ${matchingSkills} sur ${requiredSkills.length}
- Headline: ${portfolio?.headline || "Non spécifié"}
- Bio: ${portfolio?.bio || "Non spécifiée"}
- Expériences: ${portfolio?.experiences ? (typeof portfolio.experiences === 'string' ? portfolio.experiences.substring(0, 300) : JSON.stringify(portfolio.experiences).substring(0, 300)) : "Non spécifiées"}
- Formation: ${portfolio?.education ? (typeof portfolio.education === 'string' ? portfolio.education.substring(0, 300) : JSON.stringify(portfolio.education).substring(0, 300)) : "Non spécifiée"}${quizInfo}
`
}).join("\n")}

TÂCHE:
Pour chaque candidat, calcule un score de matching (0-100) basé sur:
1. Correspondance des compétences (25%)
   - Nombre de compétences du poste: ${jobPosting.skills.length}
   - Plus le candidat a de compétences correspondantes, plus le score est élevé
   - Bonus si le candidat a plus de compétences que requises (expertise approfondie)
2. Correspondance des domaines (20%)
   - Nombre de domaines du poste: ${jobPosting.domains.length}
   - Plus le candidat travaille dans de domaines correspondants, plus le score est élevé
   - Bonus si le candidat couvre tous les domaines du poste
3. Portfolio et expérience (15%)
   - Qualité et pertinence du portfolio
   - Expériences professionnelles pertinentes
   - Formation et certifications
4. Performance aux tests techniques - Feedback des recruteurs (15%)
   - Score moyen des recruteurs sur les tests techniques passés
   - Nombre et qualité des feedbacks des recruteurs
   - Analyse des feedbacks (points forts, axes d'amélioration)
5. Performance aux tests d'entraînement (QCM, TECHNICAL, MOCK_INTERVIEW) - score moyen et nombre de quiz (10%)
6. Amélioration des scores dans le temps - progression positive (8%)
7. Badges obtenus - reconnaissance de l'excellence (4%)
8. Pertinence globale du profil (3%)

IMPORTANT:
- ACCORDE UN POIDS TRÈS IMPORTANT aux feedbacks des recruteurs : un candidat avec de bons feedbacks des recruteurs doit être favorisé
- Donne plus de poids aux candidats avec des scores élevés aux tests techniques passés pour d'autres entreprises
- Valorise les badges obtenus comme signe d'engagement et d'excellence
- Prends en compte le nombre de quiz comme indicateur de motivation
- Prends en compte le nombre de domaines/compétences : plus un candidat a de domaines/compétences correspondants, meilleur est le score
- Un candidat qui couvre tous les domaines du poste doit avoir un bonus
- Un candidat qui a plus de compétences que requises doit avoir un bonus
- Un portfolio riche et détaillé augmente significativement le score

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
- Retourne les 50 meilleurs matchings triés par score décroissant.`

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

      // Limiter à 50 meilleurs matchings
      const topMatchings = parsedResult.matches
        .filter((match: any) => {
          const candidate = candidatesWithStats.find((c) => c.id === match.candidateId)
          return candidate !== undefined
        })
        .sort((a: any, b: any) => b.matchScore - a.matchScore)
        .slice(0, 50)

      // Supprimer les anciens matchings pour ce job posting
      await prisma.candidateMatching.deleteMany({
        where: { jobPostingId: jobPosting.id },
      })

      // Créer les nouveaux matchings
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

      if (matchingsToCreate.length > 0) {
        await prisma.candidateMatching.createMany({
          data: matchingsToCreate,
          skipDuplicates: true,
        })
        console.log(`  ✅ ${matchingsToCreate.length} matching(s) créé(s) pour ce poste`)
      } else {
        console.log("  ⚠️  Aucun matching créé pour ce poste")
      }
    }

    console.log("\n✅ Génération des matchings terminée avec succès!")
  } catch (error) {
    console.error("❌ Erreur lors de la génération des matchings:", error)
    throw error
  }
}

// Exécuter le script
if (require.main === module) {
  generateMatchings()
    .then(() => {
      console.log("🎉 Script terminé")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Erreur fatale:", error)
      process.exit(1)
    })
}

export { generateMatchings }

