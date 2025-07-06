"use server"
import { PrismaClient, SubscriptionTier } from '@prisma/client'

const prisma = new PrismaClient()

const CREDITS_BY_TIER = {
  FREE: 5000,
  PREMIUM: 50000,
  EXPERT: 999999999,
}

export async function subscribeUser({ userId, subscriptionType, paymentMethod }: {
  userId: string,
  subscriptionType: 'FREE' | 'PREMIUM' | 'EXPERT',
  paymentMethod: 'card' | 'mobile_money' | 'om',
}) {
  if (!userId || !subscriptionType || !paymentMethod) {
    return { success: false, error: 'Champs manquants' }
  }
  if (!['FREE', 'PREMIUM', 'EXPERT'].includes(subscriptionType)) {
    return { success: false, error: 'Type d\'abonnement invalide' }
  }
  try {
    // Simulation du paiement (toujours succès ici)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const now = new Date()
    const newCredits = CREDITS_BY_TIER[subscriptionType as keyof typeof CREDITS_BY_TIER]

    // Récupérer l'abonnement existant
    const existingSub = await prisma.subscription.findUnique({ where: { userId } })
    let endDate: Date
    let credits: number
    let tier: SubscriptionTier = subscriptionType as SubscriptionTier

    if (existingSub && existingSub.tier === subscriptionType && existingSub.endDate && existingSub.endDate > now) {
      // Même type d'abonnement, on prolonge la durée
      endDate = new Date(existingSub.endDate)
      endDate.setDate(endDate.getDate() + 30)
      credits = newCredits // On garde le même nombre de crédits quotidiens
    } else if (existingSub && existingSub.tier !== subscriptionType && existingSub.endDate && existingSub.endDate > now) {
      // Type différent, on additionne les crédits quotidiens
      credits = (CREDITS_BY_TIER[existingSub.tier as keyof typeof CREDITS_BY_TIER] || 0) + newCredits
      endDate = new Date(now)
      endDate.setDate(now.getDate() + 30)
      tier = subscriptionType as SubscriptionTier
    } else {
      // Pas d'abonnement actif ou expiré
      endDate = new Date(now)
      endDate.setDate(now.getDate() + 30)
      credits = newCredits
    }

    // Upsert abonnement
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        tier: tier,
        startDate: now,
        endDate,
        isActive: true,
      },
      create: {
        userId,
        tier: tier,
        startDate: now,
        endDate,
        isActive: true,
      },
    })
    // Met à jour les crédits quotidiens de l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: { credits },
    })
    return { success: true, subscription, credits }
  } catch (error) {
    return { success: false, error: 'Erreur serveur' }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getActiveSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
        where: {
            userId: userId,
        },
    })
    const now = new Date();
    const active = !!(subscription && subscription.endDate && subscription.endDate > now);
    return { active, subscription };
} 