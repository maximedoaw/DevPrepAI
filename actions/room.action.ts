"use server"

import prisma from "@/db/prisma"
import { RoomType } from "@prisma/client"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

// Messages d'erreur conviviaux
const ERROR_MESSAGES = {
  UNAUTHORIZED: "Vous devez être connecté pour effectuer cette action",
  USER_NOT_FOUND: "Votre compte n'a pas été trouvé",
  FORBIDDEN: "Vous n'avez pas les permissions nécessaires pour effectuer cette action",
  BOOTCAMP_ONLY: "Cette fonctionnalité est réservée aux formateurs du bootcamp",
  NOT_BOOTCAMP_OWNER: "Cette action est réservée au propriétaire du bootcamp",
  ROOM_NOT_FOUND: "La salle de réunion demandée n'existe pas",
  ROOM_ACCESS_DENIED: "Vous n'avez pas accès à cette salle de réunion",
  INVALID_DATA: "Les données fournies sont incorrectes",
  SERVER_ERROR: "Une erreur technique est survenue. Veuillez réessayer plus tard.",
  MISSING_TRAINER: "Veuillez sélectionner au moins un formateur",
  MISSING_CANDIDATE: "Veuillez sélectionner au moins un candidat",
  USER_NOT_EXIST: "Certains utilisateurs sélectionnés n'existent plus",
  NO_MEMBERS_FOUND: "Aucun membre trouvé pour votre bootcamp",
  NO_ROOMS_FOUND: "Aucune salle de réunion n'a été créée"
}

// Récupérer les membres du bootcamp (candidats et formateurs)
export async function getBootcampMembers() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.USER_NOT_FOUND 
      }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { 
        success: false, 
        error: ERROR_MESSAGES.BOOTCAMP_ONLY 
      }
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
      take: 49
    })

    // Combiner l'utilisateur connecté avec les autres formateurs
    const trainers = currentUser ? [currentUser, ...otherTrainers] : otherTrainers

    // Vérifier si des membres ont été trouvés
    if (candidates.length === 0 && trainers.length === 0) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.NO_MEMBERS_FOUND 
      }
    }

    return { 
      success: true, 
      data: {
        candidates,
        trainers
      }
    }
  } catch (error) {
    console.error("[getBootcampMembers] Erreur technique:", error)
    return { 
      success: false, 
      error: ERROR_MESSAGES.SERVER_ERROR 
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }
    }

    // Vérifier les données obligatoires
    if (!data.roomType) {
      return { 
        success: false, 
        error: "Veuillez spécifier le type de réunion" 
      }
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.USER_NOT_FOUND 
      }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { 
        success: false, 
        error: ERROR_MESSAGES.BOOTCAMP_ONLY 
      }
    }

    // Vérifier qu'il y a au moins un formateur et un candidat
    if (!data.trainerIds || data.trainerIds.length === 0) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.MISSING_TRAINER 
      }
    }

    if (!data.candidateIds || data.candidateIds.length === 0) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.MISSING_CANDIDATE 
      }
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
      return { 
        success: false, 
        error: "Certains formateurs sélectionnés ne sont plus disponibles" 
      }
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
      return { 
        success: false, 
        error: "Certains candidats sélectionnés ne sont plus disponibles" 
      }
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

    return { 
      success: true, 
      data: room,
      message: "La salle de réunion a été créée avec succès"
    }
  } catch (error) {
    console.error("[createInterviewRoom] Erreur technique:", error)
    
    // Message plus spécifique pour les erreurs de validation
    if (error instanceof Error && error.message.includes("Prisma")) {
      return { 
        success: false, 
        error: "Les données fournies sont incorrectes. Veuillez vérifier vos informations." 
      }
    }
    
    return { 
      success: false, 
      error: ERROR_MESSAGES.SERVER_ERROR 
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }
    }

    if (!roomId) {
      return { 
        success: false, 
        error: "Identifiant de la salle manquant" 
      }
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.USER_NOT_FOUND 
      }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { 
        success: false, 
        error: ERROR_MESSAGES.BOOTCAMP_ONLY 
      }
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.ROOM_NOT_FOUND 
      }
    }

    if (existingRoom.userId !== dbUser.id) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.NOT_BOOTCAMP_OWNER 
      }
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
        return { 
          success: false, 
          error: ERROR_MESSAGES.MISSING_TRAINER 
        }
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
        return { 
          success: false, 
          error: "Certains formateurs sélectionnés ne sont plus disponibles" 
        }
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
        return { 
          success: false, 
          error: ERROR_MESSAGES.MISSING_CANDIDATE 
        }
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
        return { 
          success: false, 
          error: "Certains candidats sélectionnés ne sont plus disponibles" 
        }
      }

      updateData.candidates = candidates.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        imageUrl: c.imageUrl
      }))
    }

    // Vérifier s'il y a des données à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return { 
        success: false, 
        error: "Aucune modification à appliquer" 
      }
    }

    // Mettre à jour la room
    const updatedRoom = await prisma.interviewRoom.update({
      where: { id: roomId },
      data: updateData
    })

    return { 
      success: true, 
      data: updatedRoom,
      message: "La salle de réunion a été mise à jour avec succès"
    }
  } catch (error) {
    console.error("[updateInterviewRoom] Erreur technique:", error)
    
    if (error instanceof Error && error.message.includes("Prisma")) {
      return { 
        success: false, 
        error: "Impossible de mettre à jour la salle. Veuillez vérifier vos données." 
      }
    }
    
    return { 
      success: false, 
      error: ERROR_MESSAGES.SERVER_ERROR 
    }
  }
}

// Supprimer une room
export async function deleteInterviewRoom(roomId: string) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }
    }

    if (!roomId) {
      return { 
        success: false, 
        error: "Identifiant de la salle manquant" 
      }
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.USER_NOT_FOUND 
      }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { 
        success: false, 
        error: ERROR_MESSAGES.BOOTCAMP_ONLY 
      }
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.ROOM_NOT_FOUND 
      }
    }

    if (existingRoom.userId !== dbUser.id) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.NOT_BOOTCAMP_OWNER 
      }
    }

    // Supprimer la room
    await prisma.interviewRoom.delete({
      where: { id: roomId }
    })

    return { 
      success: true,
      message: "La salle de réunion a été supprimée avec succès"
    }
  } catch (error) {
    console.error("[deleteInterviewRoom] Erreur technique:", error)
    
    if (error instanceof Error && error.message.includes("Prisma")) {
      return { 
        success: false, 
        error: "Impossible de supprimer la salle. Elle est peut-être déjà utilisée." 
      }
    }
    
    return { 
      success: false, 
      error: ERROR_MESSAGES.SERVER_ERROR 
    }
  }
}

// Récupérer toutes les rooms créées par le bootcamp
export async function getBootcampRooms() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.USER_NOT_FOUND 
      }
    }

    // Vérifier que l'utilisateur a le rôle BOOTCAMP
    if (dbUser.role !== "BOOTCAMP") {
      return { 
        success: false, 
        error: ERROR_MESSAGES.BOOTCAMP_ONLY 
      }
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

    if (rooms.length === 0) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.NO_ROOMS_FOUND 
      }
    }

    return { 
      success: true, 
      data: rooms 
    }
  } catch (error) {
    console.error("[getBootcampRooms] Erreur technique:", error)
    return { 
      success: false, 
      error: ERROR_MESSAGES.SERVER_ERROR 
    }
  }
}

// Récupérer une room par ID
export async function getInterviewRoomById(roomId: string) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }
    }

    if (!roomId) {
      return { 
        success: false, 
        error: "Identifiant de la salle manquant" 
      }
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
      return { 
        success: false, 
        error: ERROR_MESSAGES.USER_NOT_FOUND 
      }
    }

    // Récupérer la room
    const room = await prisma.interviewRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.ROOM_NOT_FOUND 
      }
    }

    // Vérifier que l'utilisateur est autorisé à accéder à la room
    // L'utilisateur doit être soit le propriétaire, soit dans la liste des trainers, soit dans la liste des candidates
    let trainers: any[] = []
    let candidates: any[] = []
    
    // Parser les données JSON si nécessaire
    if (room.trainers) {
      if (typeof room.trainers === 'string') {
        try {
          trainers = JSON.parse(room.trainers)
        } catch (e) {
          trainers = []
        }
      } else {
        trainers = Array.isArray(room.trainers) ? room.trainers : []
      }
    }
    
    if (room.candidates) {
      if (typeof room.candidates === 'string') {
        try {
          candidates = JSON.parse(room.candidates)
        } catch (e) {
          candidates = []
        }
      } else {
        candidates = Array.isArray(room.candidates) ? room.candidates : []
      }
    }
    
    // Vérifier les permissions
    const isOwner = room.userId === dbUser.id
    const isTrainer = Array.isArray(trainers) && trainers.some((t: any) => t && t.id === dbUser.id)
    const isCandidate = Array.isArray(candidates) && candidates.some((c: any) => c && c.id === dbUser.id)

    // Seuls le propriétaire, les trainers et les candidates peuvent accéder
    if (!isOwner && !isTrainer && !isCandidate) {
      return { 
        success: false, 
        error: "Vous n'avez pas été invité à cette réunion. Seuls les formateurs et candidats désignés peuvent y participer." 
      }
    }

    return { 
      success: true, 
      data: room 
    }
  } catch (error) {
    console.error("[getInterviewRoomById] Erreur technique:", error)
    return { 
      success: false, 
      error: ERROR_MESSAGES.SERVER_ERROR 
    }
  }
}