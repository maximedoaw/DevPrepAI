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
        score: 0
      }
    })

    // Remplir les scores pour chaque jour
    results.forEach(result => {
      const resultDate = result.completedAt.toISOString().split('T')[0]
      const dayIndex = days.findIndex(day => day.date === resultDate)
      if (dayIndex !== -1) {
        days[dayIndex].score = result.score
      }
    })

    return days
  } catch (error) {
    console.error("Error fetching weekly quiz data:", error)
    return []
  }
}
