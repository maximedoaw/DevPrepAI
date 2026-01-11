"use server"

import prisma from "@/db/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { revalidatePath } from "next/cache"

/**
 * Manage Search Templates
 */
export async function createSearchTemplate(name: string, filters: any) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user || !user.id) return { success: false, error: "Non authentifié" }

    const template = await prisma.searchTemplate.create({
      data: {
        userId: user.id,
        name,
        filters,
      }
    })

    revalidatePath("/interviews")
    return { success: true, template }
  } catch (error) {
    console.error("error createSearchTemplate:", error)
    return { success: false, error: "Erreur lors de la création du modèle" }
  }
}

export async function deleteSearchTemplate(templateId: string) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user || !user.id) return { success: false, error: "Non authentifié" }

    await prisma.searchTemplate.delete({
      where: { id: templateId, userId: user.id }
    })

    revalidatePath("/interviews")
    return { success: true }
  } catch (error) {
    console.error("error deleteSearchTemplate:", error)
    return { success: false, error: "Erreur lors de la suppression du modèle" }
  }
}

export async function getSearchTemplates() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user || !user.id) return { success: false, error: "Non authentifié" }

    const templates = await prisma.searchTemplate.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })

    return { success: true, templates }
  } catch (error) {
    console.error("error getSearchTemplates:", error)
    return { success: false, error: "Erreur lors de la récupération des modèles" }
  }
}

/**
 * Manage Favorites
 */
export async function toggleFavorite(targetId: string, type: "QUIZ" | "VOICE") {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user || !user.id) return { success: false, error: "Non authentifié" }

    const existing = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        ...(type === "QUIZ" ? { quizId: targetId } : { voiceInterviewId: targetId })
      }
    })

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      })
      revalidatePath("/interviews")
      return { success: true, isFavorite: false }
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          quizId: type === "QUIZ" ? targetId : null,
          voiceInterviewId: type === "VOICE" ? targetId : null,
        }
      })
      revalidatePath("/interviews")
      return { success: true, isFavorite: true }
    }
  } catch (error) {
    console.error("error toggleFavorite:", error)
    return { success: false, error: "Erreur lors de la mise à jour des favoris" }
  }
}

export async function getUserFavorites() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user || !user.id) return { success: false, error: "Non authentifié" }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: {
          quizId: true,
          voiceInterviewId: true
      }
    })

    return { success: true, favorites }
  } catch (error) {
    console.error("error getUserFavorites:", error)
    return { success: false, error: "Erreur lors de la récupération des favoris" }
  }
}
