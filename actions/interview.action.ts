"use server"

import { MOCK_INTERVIEWS } from "@/constants"
import prisma from "@/db/prisma"
import { nanoid } from "nanoid"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";


export async function interviewSave() {
 // try {
 //   for (const interview of MOCK_INTERVIEWS) {
   //   await prisma.quiz.create({
     //   id: nanoid(),
       //   title: interview.title,
         // description: interview.description,
          //type: interview.type,
         // questions: interview.questions,
         // company: interview.company,
         // technology: interview.technology || [],
         // difficulty: interview.difficulty,
         // duration: interview.duration,
         // totalPoints: interview.totalPoints,
       // },
     // })
    //}
    //return { success: true }
  //} catch (error) {
   // console.error("Error saving interviews:", error)
    //return { success: false, error }
  //}
}

export async function getInterviews() {
  try {
    const interviews = await prisma.quiz.findMany({
      orderBy: { createdAt: "desc" },
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
    const dailyScores: Record<string, { general: number[], byType: Record<string, number[]> }> = {}
    
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
      recentInterviews: quizResults.slice(0, 5).map(result => ({
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
