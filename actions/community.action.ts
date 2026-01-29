"use server"

import prisma from "@/db/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

// ============================================
// CIRCLES
// ============================================

export async function createCircle(data: {
  name: string
  description?: string
  targetCareer: string
  level: string
  maxMembers?: number
  duration?: number | null
  imageUrl?: string | null
}) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    const startDate = new Date()
    let endDate = null
    const finalDuration = data.duration || 30 // Default to 30 as per schema change or logic
    
    if (data.duration) {
      endDate = new Date()
      endDate.setDate(endDate.getDate() + data.duration)
    }

    const circle = await prisma.reconversionCircle.create({
      data: {
        ...data,
        duration: finalDuration,
        startDate,
        endDate,
        adminId: user.id,
        members: {
          create: {
            userId: user.id,
            isAdmin: true
          }
        }
      },
      include: {
        members: true
      }
    })

    revalidatePath("/community")
    return { success: true, data: circle }
  } catch (error: any) {
    console.error("Error creating circle:", error)
    return { success: false, error: error.message }
  }
}

export async function joinCircle(circleId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    // Check if circle is full
    const circle = await prisma.reconversionCircle.findUnique({
      where: { id: circleId },
      include: { _count: { select: { members: true } } }
    })

    if (!circle) return { success: false, error: "Cercle introuvable" }
    if (circle.maxMembers && circle._count.members >= circle.maxMembers) {
      return { success: false, error: "Cercle complet" }
    }

    // Check if already member
    const existing = await prisma.circleMember.findUnique({
      where: {
        userId_circleId: {
          userId: user.id,
          circleId
        }
      }
    })

    if (existing) return { success: false, error: "Déjà membre" }

    await prisma.circleMember.create({
      data: {
        userId: user.id,
        circleId,
        status: "PENDING" // En attente de validation
      }
    })

    revalidatePath("/community")
    return { success: true, message: "Demande envoyée, en attente de validation." }
  } catch (error: any) {
    console.error("Error joining circle:", error)
    return { success: false, error: error.message }
  }
}

export async function leaveCircle(circleId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    await prisma.circleMember.deleteMany({
      where: {
        userId: user.id,
        circleId
      }
    })

    revalidatePath("/community")
    return { success: true }
  } catch (error: any) {
    console.error("Error leaving circle:", error)
    return { success: false, error: error.message }
  }
}

export async function getCircles(filters?: {
  targetCareer?: string
  level?: string
  status?: string
}) {
  try {
    const circles = await prisma.reconversionCircle.findMany({
      where: {
        ...(filters?.targetCareer && { targetCareer: filters.targetCareer }),
        ...(filters?.level && { level: filters.level }),
        ...(filters?.status && { status: filters.status as any })
      },
      include: {
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return { success: true, data: circles }
  } catch (error) {
    console.error("Error fetching circles:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

export async function getCircleDetails(circleId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  try {
    const circle = await prisma.reconversionCircle.findUnique({
      where: { id: circleId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
                role: true
              }
            }
          }
        },
        rituals: {
          include: {
            _count: {
              select: { participations: true }
            }
          },
          orderBy: { startDate: "desc" }
        },
        _count: {
          select: {
            posts: true,
            members: true
          }
        }
      }
    })

    if (!circle) return { success: false, error: "Cercle introuvable" }

    // Check if user is member
    const isMember = user?.id ? circle.members.some(m => m.userId === user.id) : false

    return { success: true, data: { ...circle, isMember } }
  } catch (error) {
    console.error("Error fetching circle details:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

export async function getMyCircles() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    const memberships = await prisma.circleMember.findMany({
      where: { userId: user.id },
      include: {
        circle: {
          include: {
            _count: {
              select: {
                members: true,
                posts: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: "desc"
      }
    })

    return { success: true, data: memberships.map(m => m.circle) }
  } catch (error) {
    console.error("Error fetching my circles:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

// ============================================
// POSTS
// ============================================

export async function createPost(data: {
  circleId: string
  type: string
  content: string
  isAnonymous?: boolean
}) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    // Verify user is member of circle
    const membership = await prisma.circleMember.findUnique({
      where: {
        userId_circleId: {
          userId: user.id,
          circleId: data.circleId
        }
      }
    })

    if (!membership) return { success: false, error: "Vous n'êtes pas membre de ce cercle" }

    const post = await prisma.communityPost.create({
      data: {
        userId: data.isAnonymous ? null : user.id,
        circleId: data.circleId,
        type: data.type as any,
        content: data.content,
        isAnonymous: data.isAnonymous || false
      }
    })

    revalidatePath("/community")
    revalidatePath(`/community/${data.circleId}`)
    return { success: true, data: post }
  } catch (error: any) {
    console.error("Error creating post:", error)
    return { success: false, error: error.message }
  }
}

export async function getPosts(circleId: string, type?: string, excludeType?: string) {
  try {
    const posts = await prisma.communityPost.findMany({
      where: {
        circleId,
        ...(type && { type: type as any }),
        ...(excludeType && { NOT: { type: excludeType as any } })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true
              }
            }
          },
          orderBy: { createdAt: "asc" }
        },
        _count: {
          select: {
            reactions: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return { success: true, data: posts }
  } catch (error) {
    console.error("Error fetching posts:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

export async function deletePost(postId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId }
    })

    if (!post) return { success: false, error: "Post introuvable" }
    if (post.userId !== user.id && !post.isAnonymous) {
      return { success: false, error: "Non autorisé" }
    }

    await prisma.communityPost.delete({
      where: { id: postId }
    })

    revalidatePath("/community")
    revalidatePath(`/community/${post.circleId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

// ============================================
// REACTIONS & COMMENTS
// ============================================

export async function addReaction(postId: string, type: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    // Upsert reaction
    const existing = await prisma.postReaction.findFirst({
      where: { postId, userId: user.id, type: type as any }
    })

    if (existing) {
      await prisma.postReaction.delete({ where: { id: existing.id } })
    } else {
      await prisma.postReaction.create({
        data: { postId, userId: user.id, type: type as any }
      })
    }

    revalidatePath(`/community`)
    revalidatePath(`/community/posts/${postId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error adding reaction:", error)
    return { success: false, error: error.message }
  }
}

export async function removeReaction(postId: string, type: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    await prisma.postReaction.delete({
      where: {
        userId_postId_type: {
          userId: user.id,
          postId,
          type: type as any
        }
      }
    })

    revalidatePath("/community")
    revalidatePath(`/community/posts/${postId}`)
    return { success: true }
  } catch (error) {
    console.error("Error removing reaction:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

export async function addComment(postId: string, content: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    const comment = await prisma.postComment.create({
      data: {
        userId: user.id,
        postId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        }
      }
    })

    revalidatePath("/community")
    revalidatePath(`/community/posts/${postId}`)
    return { success: true, data: comment }
  } catch (error: any) {
    console.error("Error adding comment:", error)
    return { success: false, error: error.message }
  }
}

export async function getComments(postId: string) {
  try {
    const comments = await prisma.postComment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    return { success: true, data: comments }
  } catch (error) {
    console.error("Error fetching comments:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

// ============================================
// RITUALS
// ============================================

export async function createRitual(circleId: string, data: {
  name: string
  description: string
  startDate: Date
  endDate: Date
  participantGoal?: number
}) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    // Verify user is admin of circle
    const membership = await prisma.circleMember.findUnique({
      where: {
        userId_circleId: {
          userId: user.id,
          circleId
        }
      }
    })

    if (!membership?.isAdmin) {
      return { success: false, error: "Seuls les admins peuvent créer des rituels" }
    }

    const ritual = await prisma.circleRitual.create({
      data: {
        circleId,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        participantGoal: data.participantGoal
      }
    })

    revalidatePath("/community")
    revalidatePath(`/community/${circleId}`)
    return { success: true, data: ritual }
  } catch (error: any) {
    console.error("Error creating ritual:", error)
    return { success: false, error: error.message }
  }
}

export async function joinRitual(ritualId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    await prisma.ritualParticipation.create({
      data: {
        userId: user.id,
        ritualId
      }
    })

    revalidatePath("/community")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Déjà inscrit" }
    }
    console.error("Error joining ritual:", error)
    return { success: false, error: "Erreur lors de l'inscription" }
  }
}

export async function completeRitual(ritualId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    await prisma.ritualParticipation.update({
      where: {
        userId_ritualId: {
          userId: user.id,
          ritualId
        }
      },
      data: {
        completed: true,
        completedAt: new Date()
      }
    })

    revalidatePath("/community")
    return { success: true }
  } catch (error) {
    console.error("Error completing ritual:", error)
    return { success: false, error: "Erreur lors de la complétion" }
  }
}

export async function getRituals(circleId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  try {
    const rituals = await prisma.circleRitual.findMany({
      where: { circleId },
      include: {
        participations: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true
              }
            }
          }
        },
        _count: {
          select: { participations: true }
        }
      },
      orderBy: {
        startDate: "desc"
      }
    })

    // Add user participation status
    const ritualsWithStatus = rituals.map(ritual => ({
      ...ritual,
      userParticipation: user?.id
        ? ritual.participations.find(p => p.userId === user.id)
        : null
    }))

    return { success: true, data: ritualsWithStatus }
  } catch (error) {
    console.error("Error fetching rituals:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

/**
 * Récupère les vrais profils de personnes en reconversion
 */
export async function getRealCareerChangers() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  try {
    const users = await prisma.user.findMany({
      where: {
        role: "CAREER_CHANGER",
        NOT: user?.id ? { id: user.id } : undefined
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        domains: true,
        onboardingDetails: true,
        careerProfile: true,
        careerProfileUpdatedAt: true,
      },
      take: 20
    })

    return { success: true, data: users }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Suggère des cercles populaires ou récents
 */
export async function getSuggestedCircles() {
  try {
    const circles = await prisma.reconversionCircle.findMany({
      where: { status: "ACTIVE" },
      include: {
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })

    return { success: true, data: circles }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Récupère TOUTES les publications (global feed)
 */
export async function getAllPosts() {
  try {
    const posts = await prisma.communityPost.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        reactions: true,
        comments: {
           include: {
             user: {
               select: { firstName: true, lastName: true, imageUrl: true }
             }
           },
           orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { reactions: true, comments: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })
    return { success: true, data: posts }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Récupère TOUS les rituels actifs
 */
export async function getAllRituals() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  try {
    const rituals = await prisma.circleRitual.findMany({
      where: {
        endDate: { gte: new Date() }
      },
      include: {
        circle: {
          select: { name: true }
        },
        participations: true,
        _count: {
          select: { participations: true }
        }
      },
      orderBy: { startDate: "asc" }
    })

    const ritualsWithStatus = rituals.map(ritual => ({
      ...ritual,
      userParticipation: user?.id
        ? ritual.participations.find(p => p.userId === user.id)
        : null
    }))

    return { success: true, data: ritualsWithStatus }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// CHAT MESSAGES
// ============================================

export async function sendMessage(circleId: string, content: string, attachmentUrl?: string, attachmentType?: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
    // Verify membership
    const membership = await prisma.circleMember.findUnique({
      where: {
        userId_circleId: {
          userId: user.id,
          circleId
        }
      }
    })

    if (!membership) return { success: false, error: "Non membre du cercle" }

    const message = await prisma.circleMessage.create({
      data: {
        circleId,
        userId: user.id,
        content,
        attachmentUrl,
        attachmentType
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        }
      }
    })

    return { success: true, data: message }
  } catch (error: any) {
    console.error("Error sending message:", error)
    return { success: false, error: "Erreur lors de l'envoi du message" }
  }
}

export async function getMessages(circleId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user?.id) return { success: false, error: "Non authentifié" }

  try {
     // Verify membership
    const membership = await prisma.circleMember.findUnique({
      where: {
        userId_circleId: {
          userId: user.id,
          circleId
        }
      }
    })

    if (!membership) return { success: false, error: "Non membre du cercle" }

    const messages = await prisma.circleMessage.findMany({
      where: { circleId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: "asc" },
      take: 100
    })

    return { success: true, data: messages }
  } catch (error: any) {
    console.error("Error fetching messages:", error)
    return { success: false, error: error.message }
  }
}


