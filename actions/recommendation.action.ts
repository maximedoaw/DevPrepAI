"use server"

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/db/prisma"

export async function getUserRecommendations() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) {
    return { success: false, error: "Vous devez être connecté" }
  }

  try {
    const recommendations = await prisma.recommendation.findMany({
      where: {
        userId: user.id,
        // Optional: filter by viewed status if needed, but for now we show recent ones
        // viewed: false 
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit active recommentations
    })

    return { success: true, data: recommendations }
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return { success: false, error: "Impossible de charger les recommandations" }
  }
}
