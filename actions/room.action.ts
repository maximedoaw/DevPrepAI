"use server"

import prisma from "@/db/prisma"
import { RoomType } from "@prisma/client"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

// Récupérer les membres du bootcamp (candidats et formateurs)
export async function getBootcampMembers() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur connecté depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        role: true,
        domains: true
      }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { success: false, error: "Seuls les utilisateurs avec le rôle BOOTCAMP peuvent accéder à cette fonctionnalité" }
    }

    const bootcampDomains = (dbUser.domains as any[]) || []

    // Récupérer les candidats membres du bootcamp (via les invitations acceptées)
    const acceptedInvitations = await (prisma as any).bootcampInvitation.findMany({
      where: {
        bootcampId: dbUser.id,
        status: "ACCEPTED"
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
            role: true,
            domains: true
          }
        }
      }
    })

    const candidates = acceptedInvitations.map((inv: any) => inv.candidate).filter(Boolean)

    // Récupérer l'utilisateur connecté complet pour l'inclure dans les formateurs
    const currentUser = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        imageUrl: true,
        role: true,
        domains: true
      }
    })

    // Récupérer les autres formateurs (autres bootcamps avec les mêmes domaines)
    const otherTrainers = await prisma.user.findMany({
      where: {
        role: "BOOTCAMP",
        id: { not: dbUser.id },
        domains: bootcampDomains.length > 0 ? {
          hasSome: bootcampDomains
        } : undefined
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        imageUrl: true,
        role: true,
        domains: true
      },
      take: 49 // Limiter à 49 autres formateurs (50 total avec l'utilisateur connecté)
    })

    // Combiner l'utilisateur connecté avec les autres formateurs
    const trainers = currentUser ? [currentUser, ...otherTrainers] : otherTrainers

    return { 
      success: true, 
      data: {
        candidates,
        trainers
      }
    }
  } catch (error) {
    console.error("[getBootcampMembers] Error:", error)
    return { 
      success: false, 
      error: `Erreur lors de la récupération des membres: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }
  }
}

// Créer une room d'entretien
export async function createInterviewRoom(data: {
  roomType: RoomType
  roomData: any
  trainerIds: string[]
  candidateIds: string[]
  endedAt?: Date | null
}) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur connecté depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        role: true
      }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { success: false, error: "Seuls les utilisateurs avec le rôle BOOTCAMP peuvent créer des rooms" }
    }

    // Vérifier qu'il y a au moins un formateur et un candidat
    if (data.trainerIds.length === 0) {
      return { success: false, error: "Au moins un formateur est requis" }
    }

    if (data.candidateIds.length === 0) {
      return { success: false, error: "Au moins un candidat est requis" }
    }

    // Vérifier que les formateurs existent
    const trainers = await prisma.user.findMany({
      where: {
        id: { in: data.trainerIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        imageUrl: true
      }
    })

    if (trainers.length !== data.trainerIds.length) {
      return { success: false, error: "Certains formateurs n'existent pas" }
    }

    // Vérifier que les candidats existent
    const candidates = await prisma.user.findMany({
      where: {
        id: { in: data.candidateIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        imageUrl: true
      }
    })

    if (candidates.length !== data.candidateIds.length) {
      return { success: false, error: "Certains candidats n'existent pas" }
    }

    // Créer la room
    const room = await prisma.interviewRoom.create({
      data: {
        userId: dbUser.id,
        roomType: data.roomType,
        roomData: data.roomData,
        trainers: trainers.map(t => ({
          id: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
          imageUrl: t.imageUrl
        })),
        candidates: candidates.map(c => ({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          imageUrl: c.imageUrl
        })),
        endedAt: data.endedAt ?? null
      }
    })

    return { success: true, data: room }
  } catch (error) {
    console.error("[createInterviewRoom] Error:", error)
    return { 
      success: false, 
      error: `Erreur lors de la création de la room: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }
  }
}

// Mettre à jour une room
export async function updateInterviewRoom(roomId: string, data: {
  roomType?: RoomType
  roomData?: any
  trainerIds?: string[]
  candidateIds?: string[]
  endedAt?: Date | null
}) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur connecté depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        role: true
      }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { success: false, error: "Seuls les utilisateurs avec le rôle BOOTCAMP peuvent modifier des rooms" }
    }

    // Vérifier que la room existe et appartient au bootcamp
    const existingRoom = await prisma.interviewRoom.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        userId: true
      }
    })

    if (!existingRoom) {
      return { success: false, error: "Room non trouvée" }
    }

    if (existingRoom.userId !== dbUser.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à modifier cette room" }
    }

    // Préparer les données de mise à jour
    const updateData: any = {}

    if (data.roomType) {
      updateData.roomType = data.roomType
    }

    if (data.roomData !== undefined) {
      updateData.roomData = data.roomData
    }

    if (data.endedAt !== undefined) {
      updateData.endedAt = data.endedAt
    }

    // Mettre à jour les formateurs si fournis
    if (data.trainerIds) {
      if (data.trainerIds.length === 0) {
        return { success: false, error: "Au moins un formateur est requis" }
      }

      const trainers = await prisma.user.findMany({
        where: {
          id: { in: data.trainerIds }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true
        }
      })

      if (trainers.length !== data.trainerIds.length) {
        return { success: false, error: "Certains formateurs n'existent pas" }
      }

      updateData.trainers = trainers.map(t => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        imageUrl: t.imageUrl
      }))
    }

    // Mettre à jour les candidats si fournis
    if (data.candidateIds) {
      if (data.candidateIds.length === 0) {
        return { success: false, error: "Au moins un candidat est requis" }
      }

      const candidates = await prisma.user.findMany({
        where: {
          id: { in: data.candidateIds }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true
        }
      })

      if (candidates.length !== data.candidateIds.length) {
        return { success: false, error: "Certains candidats n'existent pas" }
      }

      updateData.candidates = candidates.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        imageUrl: c.imageUrl
      }))
    }

    // Mettre à jour la room
    const updatedRoom = await prisma.interviewRoom.update({
      where: { id: roomId },
      data: updateData
    })

    return { success: true, data: updatedRoom }
  } catch (error) {
    console.error("[updateInterviewRoom] Error:", error)
    return { 
      success: false, 
      error: `Erreur lors de la mise à jour de la room: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }
  }
}

// Supprimer une room
export async function deleteInterviewRoom(roomId: string) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur connecté depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        role: true
      }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { success: false, error: "Seuls les utilisateurs avec le rôle BOOTCAMP peuvent supprimer des rooms" }
    }

    // Vérifier que la room existe et appartient au bootcamp
    const existingRoom = await prisma.interviewRoom.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        userId: true
      }
    })

    if (!existingRoom) {
      return { success: false, error: "Room non trouvée" }
    }

    if (existingRoom.userId !== dbUser.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à supprimer cette room" }
    }

    // Supprimer la room
    await prisma.interviewRoom.delete({
      where: { id: roomId }
    })

    return { success: true }
  } catch (error) {
    console.error("[deleteInterviewRoom] Error:", error)
    return { 
      success: false, 
      error: `Erreur lors de la suppression de la room: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }
  }
}

// Récupérer toutes les rooms créées par le bootcamp
export async function getBootcampRooms() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur connecté depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        role: true
      }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { success: false, error: "Seuls les utilisateurs avec le rôle BOOTCAMP peuvent accéder à cette fonctionnalité" }
    }

    // Récupérer les rooms créées par ce bootcamp
    const rooms = await prisma.interviewRoom.findMany({
      where: {
        userId: dbUser.id
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

    return { success: true, data: rooms }
  } catch (error) {
    console.error("[getBootcampRooms] Error:", error)
    return { 
      success: false, 
      error: `Erreur lors de la récupération des rooms: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }
  }
}

// Récupérer une room par ID
export async function getInterviewRoomById(roomId: string) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur connecté depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        role: true
      }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Récupérer la room
    const room = await prisma.interviewRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return { success: false, error: "Room non trouvée" }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP ou est un candidat/formateur de la room
    const trainers = typeof room.trainers === 'string' ? JSON.parse(room.trainers) : room.trainers || []
    const candidates = typeof room.candidates === 'string' ? JSON.parse(room.candidates) : room.candidates || []
    
    const isOwner = room.userId === dbUser.id
    const isTrainer = trainers.some((t: any) => t.id === dbUser.id)
    const isCandidate = candidates.some((c: any) => c.id === dbUser.id)

    if (dbUser.role !== "BOOTCAMP" && !isTrainer && !isCandidate) {
      return { success: false, error: "Vous n'êtes pas autorisé à accéder à cette room" }
    }

    return { success: true, data: room }
  } catch (error) {
    console.error("[getInterviewRoomById] Error:", error)
    return { 
      success: false, 
      error: `Erreur lors de la récupération de la room: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }
  }
}
