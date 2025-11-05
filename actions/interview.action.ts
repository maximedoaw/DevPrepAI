"use server"

import { MOCK_INTERVIEWS } from "@/constants"
import prisma from "@/db/prisma"
import { nanoid } from "nanoid"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { GoogleGenAI } from "@google/genai"
import { getAllQuizzes as getAllPractiseQuizzes } from "@/constants/practise"
import { Domain } from "@prisma/client";



export async function getInterviews() {
  try {
    // Fallback: appelle directement la DB côté serveur; compatible avec appel client via route API
    const interviews = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        questions: true,
        type: true,
        difficulty: true,
        createdAt: true,
        updatedAt: true,
        company: true,
        technology: true,
        duration: true,
        totalPoints: true,
      }
    }) 
    return interviews
  } catch (error) {
    console.error("Error fetching interviews:", error)
    return []
  }
}

export async function getInterviewById(id: string) {
  try {
    const interview = await prisma.quiz.findUnique({
      where: { id },
    })
    return interview
  } catch (error) {
    console.error("Error fetching interview:", error)
    return null
  }
}

export async function quizSaveAnswer(data: {
  quizId: string
  answers: Record<string, any>
  timeSpent: number
  score: number
}) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user) {
      throw new Error("User not found")
    }

    // Créer un nouvel enregistrement QuizResult
    const quizResult = await prisma.quizResult.create({
      data: {
        quizId: data.quizId,
        userId: user.id,
        score: data.score,
        answers: data.answers,
        analysis: "Analyse en cours...", // TODO: Implémenter une analyse plus détaillée
        duration: data.timeSpent,
      },
    })

    // Créer une analyse de compétences associée
    await prisma.skillAnalysis.create({
      data: {
        userId: user.id,
        quizResultId: quizResult.id,
        skills: {}, // TODO: Implémenter l'analyse des compétences
        improvementTips: [],
      },
    })

    return { success: true, quizResult }
  } catch (error) {
    console.error("Error saving answers:", error)
    return { success: false, error }
  }
}

export async function getRecentInterviews(page: number = 1, limit: number = 5) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user) {
      throw new Error("User not found")
    }

    const interviews = await prisma.quizResult.findMany({
      where: {
        userId: user.id
      },
      include: {
        quiz: {
          select: {
            title: true,
            company: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.quizResult.count({
      where: {
        userId: user.id
      }
    })

    return {
      interviews: interviews.map(result => ({
        id: result.id,
        title: result.quiz.title,
        company: result.quiz.company,
        score: result.score,
        date: result.completedAt.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        analysis: result.analysis
      })),
      hasMore: total > page * limit
    }
  } catch (error) {
    console.error("Error fetching recent interviews:", error)
    return { interviews: [], hasMore: false }
  }
}

export async function getWeeklyQuizData() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user) {
      throw new Error("User not found")
    }

    // Récupérer les résultats des 7 derniers jours
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const results = await prisma.quizResult.findMany({
      where: {
        userId: user.id,
        completedAt: {
          gte: sevenDaysAgo
        }
      },
      include: {
        quiz: {
          select: {
            type: true
          }
        }
      },
      orderBy: {
        completedAt: 'asc'
      }
    })

    // Créer un tableau pour les 7 derniers jours
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        score: 0,
        interviewCount: 0,
        scoresByType: {
          CODING: { score: 0, count: 0 },
          QCM: { score: 0, count: 0 },
          MOCK_INTERVIEW: { score: 0, count: 0 },
          SOFT_SKILLS: { score: 0, count: 0 }
        } as Record<string, { score: number; count: number }>
      }
    })

    // Grouper les résultats par jour et par type
    const dailyScores: Record<string, { general: number[]; byType: Record<string, number[]> }> = {}
    
    results.forEach(result => {
      const resultDate = result.completedAt.toISOString().split('T')[0]
      const quizType = result.quiz.type
      
      if (!dailyScores[resultDate]) {
        dailyScores[resultDate] = {
          general: [],
          byType: {
            CODING: [],
            QCM: [],
            MOCK_INTERVIEW: [],
            SOFT_SKILLS: []
          }
        }
      }
      
      // Ajouter au score général
      dailyScores[resultDate].general.push(result.score)
      
      // Ajouter au score par type
      if (dailyScores[resultDate].byType[quizType]) {
        dailyScores[resultDate].byType[quizType].push(result.score)
      }
    })

    // Calculer les moyennes pour chaque jour
    days.forEach(day => {
      const dayData = dailyScores[day.date]
      
      if (dayData) {
        // Moyenne générale
        if (dayData.general.length > 0) {
          const averageScore = dayData.general.reduce((sum, score) => sum + score, 0) / dayData.general.length
          day.score = Math.round(averageScore * 10) / 10
          day.interviewCount = dayData.general.length
        }
        
        // Moyennes par type
        Object.keys(dayData.byType).forEach(type => {
          const typeScores = dayData.byType[type]
          if (typeScores.length > 0) {
            const averageTypeScore = typeScores.reduce((sum, score) => sum + score, 0) / typeScores.length
            day.scoresByType[type] = {
              score: Math.round(averageTypeScore * 10) / 10,
              count: typeScores.length
            }
          }
        })
      }
    })

    return days
  } catch (error) {
    console.error("Error fetching weekly quiz data:", error)
    return []
  }
}

export async function getUserStats() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user) {
      throw new Error("User not found")
    }

    // Récupérer tous les résultats de quiz de l'utilisateur
    const quizResults = await prisma.quizResult.findMany({
      where: {
        userId: user.id
      },
      include: {
        quiz: {
          select: {
            title: true,
            type: true,
            difficulty: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    // Calculer les statistiques
    const totalInterviews = quizResults.length
    const totalTime = quizResults.reduce((sum, result) => sum + (result.duration || 0), 0)
    const averageScore = totalInterviews > 0 
      ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / totalInterviews)
      : 0

    // Calculer la série actuelle (jours consécutifs)
    const streak = calculateStreak(quizResults)

    // Calculer la moyenne sur 7 jours
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentResults = quizResults.filter(result => 
      result.completedAt >= sevenDaysAgo
    )
    
    const weeklyAverage = recentResults.length > 0
      ? Math.round(recentResults.reduce((sum, result) => sum + result.score, 0) / recentResults.length)
      : 0

    // Statistiques par type d'interview
    const statsByType: Record<string, { count: number; averageScore: number }> = {
      QCM: { count: 0, averageScore: 0 },
      CODING: { count: 0, averageScore: 0 },
      MOCK_INTERVIEW: { count: 0, averageScore: 0 },
      SOFT_SKILLS: { count: 0, averageScore: 0 }
    }

    quizResults.forEach(result => {
      const type = result.quiz.type
      if (statsByType[type]) {
        statsByType[type].count++
        statsByType[type].averageScore += result.score
      }
    })

    // Calculer les moyennes par type
    Object.keys(statsByType).forEach(type => {
      if (statsByType[type].count > 0) {
        statsByType[type].averageScore = Math.round(statsByType[type].averageScore / statsByType[type].count)
      }
    })

    // Statistiques par difficulté
    const statsByDifficulty: Record<string, { count: number; averageScore: number }> = {
      JUNIOR: { count: 0, averageScore: 0 },
      MID: { count: 0, averageScore: 0 },
      SENIOR: { count: 0, averageScore: 0 }
    }

    quizResults.forEach(result => {
      const difficulty = result.quiz.difficulty
      if (statsByDifficulty[difficulty]) {
        statsByDifficulty[difficulty].count++
        statsByDifficulty[difficulty].averageScore += result.score
      }
    })

    // Calculer les moyennes par difficulté
    Object.keys(statsByDifficulty).forEach(difficulty => {
      if (statsByDifficulty[difficulty].count > 0) {
        statsByDifficulty[difficulty].averageScore = Math.round(statsByDifficulty[difficulty].averageScore / statsByDifficulty[difficulty].count)
      }
    })

    return {
      totalInterviews,
      averageScore,
      weeklyAverage,
      totalTime,
      streak,
      statsByType,
      statsByDifficulty,
      recentInterviews: quizResults.map(result => ({
        id: result.id,
        title: result.quiz.title,
        score: result.score,
        date: result.completedAt.toLocaleDateString('fr-FR'),
        type: result.quiz.type,
        difficulty: result.quiz.difficulty
      }))
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      totalInterviews: 0,
      averageScore: 0,
      weeklyAverage: 0,
      totalTime: 0,
      streak: 0,
      statsByType: {},
      statsByDifficulty: {},
      recentInterviews: []
    }
  }
}

// Fonction pour calculer la série de jours consécutifs
function calculateStreak(quizResults: any[]) {
  if (quizResults.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dates = quizResults.map(result => {
    const date = new Date(result.completedAt)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  })

  // Trier les dates et supprimer les doublons
  const uniqueDates = [...new Set(dates)].sort((a, b) => b - a)
  
  let streak = 0
  let currentDate = today.getTime()
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const quizDate = uniqueDates[i]
    const diffDays = Math.floor((currentDate - quizDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}


export async function seedPractiseFromConstants() {
  try {
    const quizzes = getAllPractiseQuizzes()
    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      return { success: false, error: "Aucune donnée de practise disponible" }
    }

    for (const quiz of quizzes) {
      await prisma.quiz.create({
        data: {
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          domain: quiz.domain as Domain,
          questions: JSON.parse(JSON.stringify(quiz.questions)),
          company: quiz.company,
          technology: quiz.technology || [],
          difficulty: quiz.difficulty,
          duration: quiz.duration,
          totalPoints: quiz.totalPoints,
        },
      })
    }
    return { success: true, count: quizzes.length }
  } catch (e: any) {
    return { success: false, error: e.message || "Erreur serveur" }
  }
}

export async function getGeminiRecommendations({ stats, interviews }: { stats: any, interviews: any[] }) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id) throw new Error("Utilisateur non authentifié");
    const ai = new GoogleGenAI({ apiKey: String(process.env.GEMINI_API_KEY || "") })
    // Préparer le prompt
    const prompt = `Tu es un assistant IA expert en préparation d'entretiens techniques.\nVoici le profil utilisateur :\n${JSON.stringify(stats, null, 2)}\n\nVoici la liste des interviews disponibles :\n${JSON.stringify(interviews.map(i => ({ id: i.id, title: i.title, type: i.type, difficulty: i.difficulty, technology: i.technology, company: i.company, description: i.description })), null, 2)}\n\nEn te basant sur le profil, la courbe de progression et les interviews disponibles, recommande 5 exercices de renforcement (parmi les interviews) les plus pertinents pour ce profil.\nPour chaque recommandation, retourne un objet JSON strict : { id, title, type, difficulty, technology, company, description, raison, correspondance }.\nLa clé 'raison' doit expliquer pourquoi tu recommandes cet exercice à ce profil. La clé 'correspondance' est un pourcentage (0-100) de pertinence.\nFormat de sortie : tableau JSON de 5 objets.`
    // Gemini Embedded ne retourne que des embeddings, il faut utiliser generateContent pour du texte
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    let recommendations = []
    try {
      recommendations = JSON.parse(response.text as string)
    } catch (e) {
      return { success: false, error: "Réponse Gemini non JSON" }
    }
    // Enregistrer dans la table Recommendation
    for (const rec of recommendations) {
      const weight = rec.correspondance ? Number(rec.correspondance) / 100 : 1.0
      await prisma.recommendation.create({
        data: {
          userId: user.id,
          source: "gemini",
          content: JSON.stringify(rec),
          relatedItems: [rec.id],
          weight,
        }
      })
      console.log(`% de correspondance pour ${rec.title} (${rec.id}) : ${rec.correspondance || 100}%`)
    }
    return { success: true, recommendations }
  } catch (e: any) {
    return { success: false, error: e.message || "Erreur Gemini" }
  }
}

export async function getUserReputation(userId: string) {
  try {
    // Récupérer tous les résultats de quiz de l'utilisateur
    const quizResults = await prisma.quizResult.findMany({
      where: {
        userId: userId
      },
      include: {
        quiz: {
          select: {
            title: true,
            type: true,
            difficulty: true,
            company: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    if (quizResults.length === 0) {
      return {
        user: null,
        stats: {
          totalQuizzes: 0,
          averageScore: 0,
          totalScore: 0,
          streak: 0,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100
        },
        badges: [],
        recentActivity: [],
        achievements: []
      }
    }

    // Récupérer les informations utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        credits: true
      }
    })

    // Calculer les statistiques
    const totalQuizzes = quizResults.length
    const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0)
    const averageScore = Math.round(totalScore / totalQuizzes)
    
    // Calculer l'expérience et le niveau (système inspiré de Duolingo)
    const experience = totalScore * 10 // 10 XP par point de score
    const level = Math.floor(experience / 1000) + 1
    const experienceToNextLevel = 1000 - (experience % 1000)

    // Calculer la série actuelle
    const streak = calculateStreak(quizResults)

    // Statistiques par type
    const statsByType: Record<string, { count: number; averageScore: number; totalScore: number }> = {
      QCM: { count: 0, averageScore: 0, totalScore: 0 },
      CODING: { count: 0, averageScore: 0, totalScore: 0 },
      MOCK_INTERVIEW: { count: 0, averageScore: 0, totalScore: 0 },
      SOFT_SKILLS: { count: 0, averageScore: 0, totalScore: 0 }
    }

    quizResults.forEach(result => {
      const type = result.quiz.type
      if (statsByType[type]) {
        statsByType[type].count++
        statsByType[type].totalScore += result.score
      }
    })

    // Calculer les moyennes par type
    Object.keys(statsByType).forEach(type => {
      if (statsByType[type].count > 0) {
        statsByType[type].averageScore = Math.round(statsByType[type].totalScore / statsByType[type].count)
      }
    })

    // Générer les badges basés sur les performances
    const badges = generateBadges(quizResults, statsByType, streak, level, totalQuizzes)

    // Activité récente (7 derniers jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentActivity = quizResults
      .filter(result => result.completedAt >= sevenDaysAgo)
      .slice(0, 10)
      .map(result => ({
        id: result.id,
        title: result.quiz.title,
        score: result.score,
        type: result.quiz.type,
        company: result.quiz.company,
        date: result.completedAt,
        difficulty: result.quiz.difficulty
      }))

    // Réalisations spéciales
    const achievements = generateAchievements(quizResults, statsByType, streak, level)

    return {
      user,
      stats: {
        totalQuizzes,
        averageScore,
        totalScore,
        streak,
        level,
        experience,
        experienceToNextLevel
      },
      badges,
      recentActivity,
      achievements,
      statsByType
    }
  } catch (error) {
    console.error("Error fetching user reputation:", error)
    return null
  }
}

// Fonction pour générer les badges
function generateBadges(quizResults: any[], statsByType: any, streak: number, level: number, totalQuizzes: number) {
  const badges = []

  // Badge de niveau
  if (level >= 1) badges.push({ id: 'level-1', name: 'Débutant', icon: '🌟', description: 'Premier niveau atteint', unlocked: true, rarity: 'common' })
  if (level >= 5) badges.push({ id: 'level-5', name: 'Intermédiaire', icon: '⭐', description: 'Niveau 5 atteint', unlocked: true, rarity: 'uncommon' })
  if (level >= 10) badges.push({ id: 'level-10', name: 'Avancé', icon: '💎', description: 'Niveau 10 atteint', unlocked: true, rarity: 'rare' })
  if (level >= 20) badges.push({ id: 'level-20', name: 'Expert', icon: '👑', description: 'Niveau 20 atteint', unlocked: true, rarity: 'epic' })

  // Badge de série
  if (streak >= 3) badges.push({ id: 'streak-3', name: 'Persévérant', icon: '🔥', description: '3 jours consécutifs', unlocked: true, rarity: 'common' })
  if (streak >= 7) badges.push({ id: 'streak-7', name: 'Déterminé', icon: '🔥🔥', description: '7 jours consécutifs', unlocked: true, rarity: 'uncommon' })
  if (streak >= 30) badges.push({ id: 'streak-30', name: 'Légende', icon: '🔥🔥🔥', description: '30 jours consécutifs', unlocked: true, rarity: 'legendary' })

  // Badge de quiz
  if (totalQuizzes >= 10) badges.push({ id: 'quizzes-10', name: 'Quiz Master', icon: '📝', description: '10 quiz complétés', unlocked: true, rarity: 'common' })
  if (totalQuizzes >= 50) badges.push({ id: 'quizzes-50', name: 'Quiz Champion', icon: '🏆', description: '50 quiz complétés', unlocked: true, rarity: 'uncommon' })
  if (totalQuizzes >= 100) badges.push({ id: 'quizzes-100', name: 'Quiz Légende', icon: '👑', description: '100 quiz complétés', unlocked: true, rarity: 'epic' })

  // Badge de score
  const perfectScores = quizResults.filter(r => r.score >= 95).length
  if (perfectScores >= 5) badges.push({ id: 'perfect-5', name: 'Perfectionniste', icon: '💯', description: '5 scores parfaits', unlocked: true, rarity: 'rare' })
  if (perfectScores >= 20) badges.push({ id: 'perfect-20', name: 'Maître de la Perfection', icon: '✨', description: '20 scores parfaits', unlocked: true, rarity: 'legendary' })

  // Badge par type
  Object.keys(statsByType).forEach(type => {
    const typeStats = statsByType[type]
    if (typeStats.count >= 10) {
      const typeIcons: Record<string, string> = { QCM: '📋', CODING: '💻', MOCK_INTERVIEW: '🎤', SOFT_SKILLS: '🤝' }
      badges.push({ 
        id: `${type.toLowerCase()}-master`, 
        name: `Maître ${type.replace('_', ' ')}`, 
        icon: typeIcons[type] || '🏆', 
        description: `10 quiz ${type.replace('_', ' ')} complétés`, 
        unlocked: true, 
        rarity: 'uncommon' 
      })
    }
  })

  // Badge de moyenne
  const overallAverage = quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
  if (overallAverage >= 80) badges.push({ id: 'average-80', name: 'Excellent', icon: '🎯', description: 'Moyenne ≥ 80%', unlocked: true, rarity: 'rare' })
  if (overallAverage >= 90) badges.push({ id: 'average-90', name: 'Exceptionnel', icon: '🏅', description: 'Moyenne ≥ 90%', unlocked: true, rarity: 'epic' })

  return badges
}

// Fonction pour générer les réalisations
function generateAchievements(quizResults: any[], statsByType: any, streak: number, level: number) {
  const achievements = []

  // Réalisations de progression
  achievements.push({
    id: 'first-quiz',
    name: 'Premier Pas',
    description: 'Compléter votre premier quiz',
    progress: quizResults.length > 0 ? 100 : 0,
    target: 1,
    icon: '🎯',
    unlocked: quizResults.length > 0
  })

  achievements.push({
    id: 'streak-achievement',
    name: 'Série de Victoires',
    description: 'Maintenir une série de 7 jours',
    progress: Math.min(streak, 7),
    target: 7,
    icon: '🔥',
    unlocked: streak >= 7
  })

  achievements.push({
    id: 'level-achievement',
    name: 'Progression Continue',
    description: 'Atteindre le niveau 10',
    progress: Math.min(level, 10),
    target: 10,
    icon: '⭐',
    unlocked: level >= 10
  })

  // Réalisations par type
  Object.keys(statsByType).forEach(type => {
    const typeStats = statsByType[type]
    const typeIcons: Record<string, string> = { QCM: '📋', CODING: '💻', MOCK_INTERVIEW: '🎤', SOFT_SKILLS: '🤝' }
    achievements.push({
      id: `${type.toLowerCase()}-achievement`,
      name: `Spécialiste ${type.replace('_', ' ')}`,
      description: `Compléter 20 quiz ${type.replace('_', ' ')}`,
      progress: Math.min(typeStats.count, 20),
      target: 20,
      icon: typeIcons[type] || '🏆',
      unlocked: typeStats.count >= 20
    })
  })

  return achievements
}

export async function getLeaderboard() {
  try {
    // Récupérer tous les utilisateurs avec leurs statistiques
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        credits: true,
        createdAt: true,
        quizResults: {
          select: {
            score: true,
            completedAt: true
          }
        }
      }
    })

    // Calculer les statistiques pour chaque utilisateur
    const leaderboardData = users.map(user => {
      const totalScore = user.quizResults.reduce((sum, result) => sum + result.score, 0)
      const experience = totalScore * 10
      const level = Math.floor(experience / 1000) + 1
      
      // Calculer la série
      const streak = calculateStreak(user.quizResults)
      
      return {
        id: user.id,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.email?.split('@')[0] || 'Utilisateur',
        avatar: user.firstName?.[0] || user.email?.[0] || 'U',
        level,
        experience,
        streak,
        totalQuizzes: user.quizResults.length,
        averageScore: user.quizResults.length > 0 
          ? Math.round(totalScore / user.quizResults.length)
          : 0,
        rank: 0 // Sera mis à jour après le tri
      }
    })

    // Trier par niveau puis par expérience
    leaderboardData.sort((a, b) => {
      if (a.level !== b.level) return b.level - a.level
      return b.experience - a.experience
    })

    // Ajouter les rangs
    leaderboardData.forEach((user, index) => {
      user.rank = index + 1
    })

    return leaderboardData
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

/**
 * Récupérer tous les résultats de Quiz (entrainements) d'un utilisateur
 */
export async function getUserQuizResults(userId: string) {
  try {
    const quizResults = await prisma.quizResult.findMany({
      where: {
        userId: userId
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            type: true,
            difficulty: true,
            technology: true,
            company: true,
            totalPoints: true,
            duration: true
          }
        },
        skillAnalysis: {
          select: {
            skills: true,
            aiFeedback: true,
            improvementTips: true
          },
          orderBy: {
            analyzedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    // Formater les résultats
    return quizResults.map(result => ({
      id: result.id,
      quizId: result.quizId,
      quizTitle: result.quiz.title,
      quizType: result.quiz.type,
      difficulty: result.quiz.difficulty,
      technology: result.quiz.technology,
      company: result.quiz.company,
      score: result.score,
      totalPoints: result.quiz.totalPoints,
      percentage: result.quiz.totalPoints > 0 
        ? Math.round((result.score / result.quiz.totalPoints) * 100)
        : 0,
      duration: result.duration || result.quiz.duration,
      completedAt: result.completedAt,
      answers: result.answers,
      analysis: result.analysis,
      skills: result.skillAnalysis?.[0]?.skills || {},
      aiFeedback: result.skillAnalysis?.[0]?.aiFeedback || null,
      improvementTips: result.skillAnalysis?.[0]?.improvementTips || []
    }))
  } catch (error) {
    console.error("Error fetching user quiz results:", error)
    return []
  }
}
