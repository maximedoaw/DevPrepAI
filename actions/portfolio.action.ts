// actions/portfolio.action.ts
"use server"

import prisma from "@/db/prisma"
import { PortfolioTemplate } from "@prisma/client"
import { revalidatePath } from "next/cache"

interface PortfolioData {
  name?: string
  headline?: string | null
  bio?: string | null
  profileImage?: string | null
  template?: string
  theme?: string | null
  isPublic?: boolean
  skills?: string[]
  languages?: string[]
  interests?: string[]
  projects?: any[] | null
  experiences?: any[] | null
  education?: any[] | null
  certifications?: any[] | null
  sections?: string[]
}

interface CreateOrUpdatePortfolioParams {
  userId: string
  portfolioData: PortfolioData
}

export async function createOrUpdatePortfolio({ userId, portfolioData }: CreateOrUpdatePortfolioParams) {
  try {
    if (!userId) {
      throw new Error("User ID est requis")
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error("Utilisateur non trouvé")
    }

    // CORRECTION : Utiliser les bons noms de champs selon le schéma Prisma
    const transformedData = {
      title: portfolioData.name || "Mon Portfolio",
      headline: portfolioData.headline,
      bio: portfolioData.bio,
      avatarUrl: portfolioData.profileImage,
      template: mapTemplateToEnum(portfolioData.template),
      themeColor: portfolioData.theme || "blue",
      // CORRECTION : Le champ 'isPublic' n'existe pas dans le schéma, utiliser publishedAt pour déterminer la visibilité
      publishedAt: portfolioData.isPublic ? new Date() : null,
      skills: portfolioData.skills || [],
      languages: portfolioData.languages || [],
      interests: portfolioData.interests || [],
      projects: portfolioData.projects ? JSON.parse(JSON.stringify(portfolioData.projects)) : null,
      experiences: portfolioData.experiences ? JSON.parse(JSON.stringify(portfolioData.experiences)) : null,
      education: portfolioData.education ? JSON.parse(JSON.stringify(portfolioData.education)) : null,
      certifications: portfolioData.certifications ? JSON.parse(JSON.stringify(portfolioData.certifications)) : null,
      sections: portfolioData.sections || [],
    }

    const existingPortfolio = await prisma.portfolio.findFirst({
      where: { userId }
    })

    let portfolio

    if (existingPortfolio) {
      portfolio = await prisma.portfolio.update({
        where: { id: existingPortfolio.id },
        data: transformedData
      })
    } else {
      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          ...transformedData
        }
      })
    }


    return {
      success: true,
      portfolio,
      message: existingPortfolio ? "Portfolio mis à jour avec succès" : "Portfolio créé avec succès"
    }

  } catch (error) {
    console.error("Erreur lors de la création/mise à jour du portfolio:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue"
    }
  }
}

function mapTemplateToEnum(template?: string): PortfolioTemplate {
  switch (template?.toUpperCase()) {
    case "CLASSIC":
      return PortfolioTemplate.CLASSIC
    case "MODERN":
      return PortfolioTemplate.MODERN
    case "MINIMAL":
      return PortfolioTemplate.MINIMAL
    case "THREE_D":
      return PortfolioTemplate.THREE_D
    case "CORPORATE":
      return PortfolioTemplate.CORPORATE
    default:
      return PortfolioTemplate.CLASSIC
  }
}

export async function getUserPortfolio(userId: string) {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId }
    })

    if (!portfolio) {
      return null
    }

    // CORRECTION : Utiliser publishedAt pour déterminer isPublic
    return {
      name: portfolio.title,
      headline: portfolio.headline,
      bio: portfolio.bio,
      profileImage: portfolio.avatarUrl,
      template: portfolio.template,
      theme: portfolio.themeColor,
      // CORRECTION : isPublic est déterminé par la présence de publishedAt
      isPublic: !!portfolio.publishedAt,
      skills: portfolio.skills,
      languages: portfolio.languages,
      interests: portfolio.interests || [],
      projects: portfolio.projects ? JSON.parse(JSON.stringify(portfolio.projects)) : [],
      experiences: portfolio.experiences ? JSON.parse(JSON.stringify(portfolio.experiences)) : [],
      education: portfolio.education ? JSON.parse(JSON.stringify(portfolio.education)) : [],
      certifications: portfolio.certifications ? JSON.parse(JSON.stringify(portfolio.certifications)) : [],
      sections: portfolio.sections || []
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du portfolio:", error)
    return null
  }
}

export async function deletePortfolio(userId: string) {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId }
    })

    if (!portfolio) {
      throw new Error("Portfolio non trouvé")
    }

    await prisma.portfolio.delete({
      where: { id: portfolio.id }
    })

    revalidatePath("/portfolio")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Portfolio supprimé avec succès"
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du portfolio:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue"
    }
  }
}