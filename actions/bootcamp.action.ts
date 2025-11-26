"use server"

import prisma from "@/db/prisma"
import { Domain, BootcampEnrollmentStatus } from "@prisma/client"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

// Récupérer les domaines du bootcamp depuis l'utilisateur connecté
export async function getBootcampDomains() {
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

    const domains = (dbUser.domains as Domain[]) || []
    
    return { success: true, data: domains }
  } catch (error) {
    console.error("[getBootcampDomains] Error:", error)
    return { success: false, error: `Erreur lors de la récupération des domaines: ${error instanceof Error ? error.message : 'Erreur inconnue'}` }
  }
}

// Récupérer tous les apprenants du bootcamp avec leurs données
export async function getBootcampParticipants(bootcampDomains: Domain[] = []) {
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

    // Récupérer les domaines du bootcamp depuis l'utilisateur connecté
    // Si bootcampDomains est fourni en paramètre, l'utiliser, sinon utiliser les domaines de l'utilisateur
    const bootcampSupportedDomains = bootcampDomains.length > 0 
      ? bootcampDomains 
      : (dbUser.domains as Domain[] || [])

    if (bootcampSupportedDomains.length === 0) {
      return { success: false, error: "Aucun domaine configuré pour ce bootcamp" }
    }

    console.log(`[getBootcampParticipants] Bootcamp domains:`, bootcampSupportedDomains)
    console.log(`[getBootcampParticipants] Bootcamp user:`, dbUser.id, dbUser.role)

    // Construire la condition where pour filtrer les candidats
    const whereCondition: any = {
      role: "CANDIDATE",
      // Filtrer les candidats qui ont au moins un domaine en commun avec le bootcamp
      domains: {
        hasSome: bootcampSupportedDomains
      }
    }

    // Récupérer tous les candidats ayant au moins un domaine en commun avec le bootcamp
    const participantsRaw = await prisma.user.findMany({
      where: whereCondition,
      include: {
        bootcampEnrollments: {
          include: {
            feedbacks: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    imageUrl: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            },
            assignedTests: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            }
          }
        },
        quizResults: { 
          include: {
            quiz: {
              select: {
                title: true,
                type: true,
                domain: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          },
          take: 20
        },
        JobQuizResults: {
          include: {
            jobQuiz: {
              select: {
                title: true,
                type: true,
                domain: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          },
          take: 20
        },
        portfolio: {
          take: 1,
          orderBy: {
            updatedAt: 'desc'
          }
        },
        bootcampCourseViews: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                domain: true
              }
            }
          },
          orderBy: {
            viewedAt: 'desc'
          }
        },
        skillAnalyses: {
          orderBy: {
            analyzedAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Récupérer les invitations pour chaque participant
    const participants = await Promise.all(
      participantsRaw.map(async (participant: any) => {
        const invitations = await (prisma as any).bootcampInvitation.findMany({
          where: {
            bootcampId: dbUser.id,
            candidateId: participant.id
          },
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        })
        return {
          ...participant,
          bootcampInvitationsReceived: invitations
        }
      })
    )

    console.log(`[getBootcampParticipants] Found ${participants.length} participants for domains:`, bootcampDomains)
    console.log(`[getBootcampParticipants] Where condition:`, JSON.stringify(whereCondition, null, 2))
    
    return { success: true, data: participants }
  } catch (error) {
    console.error("[getBootcampParticipants] Error:", error)
    return { success: false, error: `Erreur lors de la récupération des participants: ${error instanceof Error ? error.message : 'Erreur inconnue'}` }
  }
}

// Récupérer les détails complets d'un apprenant
export async function getParticipantDetails(userId: string) {
  try {
    const participant = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bootcampEnrollments: {
          include: {
            feedbacks: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    imageUrl: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            },
            assignedTests: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        },
        quizResults: {
          include: {
            quiz: {
              select: {
                title: true,
                type: true,
                domain: true,
                difficulty: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          }
        },
        JobQuizResults: {
          include: {
            jobQuiz: {
              select: {
                title: true,
                type: true,
                domain: true,
                difficulty: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          }
        },
        portfolio: {
          orderBy: {
            updatedAt: 'desc'
          }
        },
        bootcampCourseViews: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                domain: true,
                contentType: true
              }
            }
          },
          orderBy: {
            viewedAt: 'desc'
          }
        },
        skillAnalyses: {
          orderBy: {
            analyzedAt: 'desc'
          }
        },
        progressTracking: {
          where: {
            metric: {
              in: ['quizzes_completed', 'xp_earned', 'courses_completed']
            }
          },
          orderBy: {
            date: 'desc'
          },
          take: 50
        }
      }
    })

    return { success: true, data: participant }
  } catch (error) {
    console.error("Error fetching participant details:", error)
    return { success: false, error: "Erreur lors de la récupération des détails" }
  }
}

// Créer ou mettre à jour un feedback
export async function createBootcampFeedback(data: {
  enrollmentId: string
  studentId: string
  content: string
  rating?: number
}) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    const feedback = await prisma.bootcampFeedback.create({
      data: {
        enrollmentId: data.enrollmentId,
        instructorId: dbUser.id,
        studentId: data.studentId,
        content: data.content,
        rating: data.rating
      }
    })

    // Créer une notification pour l'apprenant
    await prisma.bootcampNotification.create({
      data: {
        userId: data.studentId,
        type: "FEEDBACK",
        title: "Nouveau feedback reçu",
        message: `Vous avez reçu un nouveau feedback de votre formateur.`,
        metadata: {
          feedbackId: feedback.id
        }
      }
    })

    return { success: true, data: feedback }
  } catch (error) {
    console.error("Error creating feedback:", error)
    return { success: false, error: "Erreur lors de la création du feedback" }
  }
}

// Assigner un test à un apprenant
export async function assignTestToParticipant(data: {
  enrollmentId: string
  studentId: string
  quizId?: string
  jobQuizId?: string
  dueDate?: Date
  notes?: string
}) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    if (!data.quizId && !data.jobQuizId) {
      return { success: false, error: "Un quiz ou jobQuiz doit être spécifié" }
    }

    // Récupérer l'utilisateur depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    const assignedTest = await prisma.bootcampAssignedTest.create({
      data: {
        enrollmentId: data.enrollmentId,
        assignedBy: dbUser.id,
        assignedTo: data.studentId,
        quizId: data.quizId || null,
        jobQuizId: data.jobQuizId || null,
        dueDate: data.dueDate || null,
        notes: data.notes || null
      }
    })

    // Créer une notification pour l'apprenant
    await prisma.bootcampNotification.create({
      data: {
        userId: data.studentId,
        type: "ASSIGNMENT",
        title: "Nouveau test assigné",
        message: `Un nouveau test vous a été assigné par votre formateur.`,
        metadata: {
          testId: assignedTest.id,
          dueDate: data.dueDate
        }
      }
    })

    return { success: true, data: assignedTest }
  } catch (error) {
    console.error("Error assigning test:", error)
    return { success: false, error: "Erreur lors de l'assignation du test" }
  }
}

// Mettre à jour le statut d'un apprenant
export async function updateParticipantStatus(
  enrollmentId: string,
  status: BootcampEnrollmentStatus,
  progress?: number,
  badges?: string[],
  isJobReady?: boolean
) {
  try {
    const enrollment = await prisma.bootcampEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status,
        ...(progress !== undefined && { progress }),
        ...(badges && { badges }),
        ...(isJobReady !== undefined && { isJobReady })
      }
    })

    return { success: true, data: enrollment }
  } catch (error) {
    console.error("Error updating participant status:", error)
    return { success: false, error: "Erreur lors de la mise à jour du statut" }
  }
}

// Récupérer les notifications d'un utilisateur
export async function getBootcampNotifications(userId?: string) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    const targetUserId = userId || dbUser.id

    const notifications = await prisma.bootcampNotification.findMany({
      where: { userId: targetUserId },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    return { success: true, data: notifications }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return { success: false, error: "Erreur lors de la récupération des notifications" }
  }
}

// Marquer une notification comme lue
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.bootcampNotification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })

    return { success: true, data: notification }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: "Erreur lors de la mise à jour de la notification" }
  }
}

// Récupérer tous les cours du bootcamp
export async function getBootcampCourses(domain?: Domain, userId?: string) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Construire la condition where pour Prisma
    const courseWhereCondition: any = {}
    
    if (userId) {
      courseWhereCondition.createdById = userId
    } else {
      courseWhereCondition.createdById = dbUser.id
    }
    
    if (domain) {
      courseWhereCondition.domain = domain
    }

    // Utiliser Prisma directement si possible, sinon SQL brut
    const targetUserId = userId || dbUser.id
    
    // Essayer d'abord avec Prisma normal
    let coursesRaw: any[] = []
    try {
      // Construire la condition where
      const whereCondition: any = {
        createdById: targetUserId
      }
      if (domain) {
        whereCondition.domain = domain
      }
      
      coursesRaw = await (prisma.bootcampCourse.findMany as any)({
        where: whereCondition,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      })
      
      console.log(`[getBootcampCourses] Prisma query succeeded, found ${coursesRaw.length} courses`)
    } catch (prismaError) {
      // Si Prisma échoue, utiliser SQL brut
      console.log("[getBootcampCourses] Prisma query failed, using raw SQL:", prismaError)
      const domainFilter = domain ? `AND bc.domain = '${domain}'::"Domain"` : ''
      
      try {
        coursesRaw = await prisma.$queryRawUnsafe<any[]>(`
          SELECT 
            bc.id,
            bc.title,
            bc.description,
            bc.domain,
            bc."order",
            bc.duration,
            bc."isPublished",
            bc."courseImage",
            bc."courseSections",
            bc."createdById",
            bc."createdAt",
            bc."updatedAt",
            json_build_object(
              'id', u.id,
              'firstName', u."firstName",
              'lastName', u."lastName",
              'email', u.email,
              'imageUrl', u."imageUrl"
            ) as "createdBy"
          FROM "bootcamp_courses" bc
          LEFT JOIN "users" u ON bc."createdById" = u.id
          WHERE bc."createdById" = $1
            ${domainFilter}
          ORDER BY bc."order" ASC
        `, targetUserId)
        console.log(`[getBootcampCourses] Raw SQL query succeeded, found ${coursesRaw.length} courses`)
      } catch (sqlError) {
        console.error("[getBootcampCourses] Both Prisma and SQL queries failed:", sqlError)
        throw sqlError
      }
    }

    // Normaliser les données des cours
    const courses = await Promise.all(
      coursesRaw.map(async (course: any) => {
        // Si c'est un résultat Prisma, utiliser directement
        if (course.createdBy && typeof course.createdBy === 'object' && !course.createdBy.id) {
          // C'est déjà un objet Prisma
          const viewCount = await prisma.bootcampCourseView.count({
            where: { courseId: course.id }
          })
          
          return {
            id: course.id,
            title: course.title,
            description: course.description,
            domain: course.domain,
            order: course.order,
            duration: course.duration,
            isPublished: course.isPublished,
            courseImage: course.courseImage,
            courseSections: course.courseSections, // Ajouter courseSections
            createdById: course.createdById,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            createdBy: course.createdBy,
            _count: {
              courseViews: viewCount
            }
          }
        } else {
          // C'est un résultat SQL brut, parser le JSON
          const createdBy = typeof course.createdBy === 'string' 
            ? JSON.parse(course.createdBy) 
            : course.createdBy
            
          const viewCount = await prisma.bootcampCourseView.count({
            where: { courseId: course.id }
          })
          
          return {
            id: course.id,
            title: course.title,
            description: course.description,
            domain: course.domain,
            order: course.order,
            duration: course.duration,
            isPublished: course.isPublished,
            courseImage: course.courseImage,
            courseSections: course.courseSections, // Ajouter courseSections
            createdById: course.createdById,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            createdBy: createdBy,
            _count: {
              courseViews: viewCount
            }
          }
        }
      })
    )

    console.log(`[getBootcampCourses] Found ${courses.length} courses for user:`, dbUser.id)
    console.log(`[getBootcampCourses] Where condition:`, JSON.stringify(courseWhereCondition, null, 2))
    
    return { success: true, data: courses }
  } catch (error) {
    console.error("[getBootcampCourses] Error:", error)
    return { success: false, error: `Erreur lors de la récupération des cours: ${error instanceof Error ? error.message : 'Erreur inconnue'}` }
  }
}

// Mettre à jour un cours
export async function updateBootcampCourse(courseId: string, data: {
  title?: string
  description?: string
  domain?: Domain
  order?: number
  duration?: number
  isPublished?: boolean
  courseImage?: string
  courseSections?: any
}) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Vérifier que l'utilisateur est le créateur du cours
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    const course = await (prisma.bootcampCourse.findUnique as any)({
      where: { id: courseId },
      select: {
        id: true,
        createdById: true
      }
    })

    if (!course) {
      return { success: false, error: "Cours non trouvé" }
    }

    if (course.createdById !== dbUser.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à modifier ce cours" }
    }

    const updatedCourse = await prisma.bootcampCourse.update({
      where: { id: courseId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.domain && { domain: data.domain }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.courseImage !== undefined && { courseImage: data.courseImage }),
        ...(data.courseSections !== undefined && { courseSections: data.courseSections })
      }
    })

    // Récupérer le cours avec les relations
    const courseWithRelations = await (prisma.bootcampCourse.findUnique as any)({
      where: { id: courseId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true
          }
        }
      }
    })

    return { success: true, data: courseWithRelations }
  } catch (error) {
    console.error("Error updating course:", error)
    return { success: false, error: "Erreur lors de la mise à jour du cours" }
  }
}

// Supprimer un cours
export async function deleteBootcampCourse(courseId: string) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Vérifier que l'utilisateur est le créateur du cours
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    const course = await (prisma.bootcampCourse.findUnique as any)({
      where: { id: courseId },
      select: {
        id: true,
        createdById: true
      }
    })

    if (!course) {
      return { success: false, error: "Cours non trouvé" }
    }

    if (course.createdById !== dbUser.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à supprimer ce cours" }
    }

    await prisma.bootcampCourse.delete({
      where: { id: courseId }
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting course:", error)
    return { success: false, error: "Erreur lors de la suppression du cours" }
  }
}

// Créer un cours
export async function createBootcampCourse(data: {
  title: string
  description?: string
  domain: Domain
  order?: number
  duration?: number
  courseImage?: string
  isPublished?: boolean
}) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer l'utilisateur depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    const course = await (prisma.bootcampCourse.create as any)({
      data: {
        title: data.title,
        description: data.description,
        domain: data.domain,
        order: data.order || 0,
        duration: data.duration,
        courseImage: data.courseImage,
        isPublished: data.isPublished || false,
        createdById: dbUser.id
      }
    })

    // Récupérer le cours avec les relations
    const courseWithRelations = await (prisma.bootcampCourse.findUnique as any)({
      where: { id: course.id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true
          }
        }
      }
    })

    return { success: true, data: courseWithRelations }
  } catch (error) {
    console.error("Error creating course:", error)
    return { success: false, error: "Erreur lors de la création du cours" }
  }
}

// Inviter un candidat au bootcamp
export async function inviteCandidateToBootcamp(candidateId: string, message?: string) {
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
      return { success: false, error: "Seuls les utilisateurs avec le rôle BOOTCAMP peuvent inviter des candidats" }
    }

    // Vérifier que le candidat existe
    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        role: true
      }
    })

    if (!candidate) {
      return { success: false, error: "Candidat non trouvé" }
    }

    if (candidate.role !== "CANDIDATE") {
      return { success: false, error: "Seuls les candidats peuvent être invités" }
    }

    // Vérifier si une invitation existe déjà
    const existingInvitation = await (prisma as any).bootcampInvitation.findUnique({
      where: {
        bootcampId_candidateId: {
          bootcampId: dbUser.id,
          candidateId: candidateId
        }
      }
    })

    if (existingInvitation) {
      if (existingInvitation.status === "PENDING") {
        return { success: false, error: "Une invitation est déjà en attente pour ce candidat" }
      }
      // Si l'invitation a été annulée ou refusée, on peut la réactiver
      if (existingInvitation.status === "CANCELLED" || existingInvitation.status === "DECLINED") {
        const updatedInvitation = await (prisma as any).bootcampInvitation.update({
          where: { id: existingInvitation.id },
          data: {
            status: "PENDING",
            message: message || null,
            updatedAt: new Date()
          }
        })
        return { success: true, data: updatedInvitation }
      }
    }

    // Créer une nouvelle invitation
    const invitation = await (prisma as any).bootcampInvitation.create({
      data: {
        bootcampId: dbUser.id,
        candidateId: candidateId,
        message: message || null,
        status: "PENDING"
      }
    })

    // Créer une notification pour le candidat
    await prisma.bootcampNotification.create({
      data: {
        userId: candidateId,
        type: "ASSIGNMENT",
        title: "Invitation au bootcamp",
        message: `Vous avez été invité à rejoindre un bootcamp.`,
        metadata: {
          invitationId: invitation.id,
          bootcampId: dbUser.id
        }
      }
    })

    return { success: true, data: invitation }
  } catch (error) {
    console.error("Error inviting candidate:", error)
    return { success: false, error: "Erreur lors de l'invitation du candidat" }
  }
}

// Annuler une invitation
export async function cancelBootcampInvitation(candidateId: string) {
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
      return { success: false, error: "Seuls les utilisateurs avec le rôle BOOTCAMP peuvent annuler des invitations" }
    }

    // Trouver l'invitation
    const invitation = await (prisma as any).bootcampInvitation.findUnique({
      where: {
        bootcampId_candidateId: {
          bootcampId: dbUser.id,
          candidateId: candidateId
        }
      }
    })

    if (!invitation) {
      return { success: false, error: "Invitation non trouvée" }
    }

    if (invitation.status !== "PENDING") {
      return { success: false, error: "Seules les invitations en attente peuvent être annulées" }
    }

    // Annuler l'invitation
    const cancelledInvitation = await (prisma as any).bootcampInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "CANCELLED",
        updatedAt: new Date()
      }
    })

    return { success: true, data: cancelledInvitation }
  } catch (error) {
    console.error("Error cancelling invitation:", error)
    return { success: false, error: "Erreur lors de l'annulation de l'invitation" }
  }
}

// Récupérer les invitations d'un bootcamp (pour les bootcamps)
export async function getBootcampInvitations() {
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
      return { success: false, error: "Seuls les utilisateurs avec le rôle BOOTCAMP peuvent voir les invitations" }
    }

    const invitations = await (prisma as any).bootcampInvitation.findMany({
      where: {
        bootcampId: dbUser.id
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, data: invitations }
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return { success: false, error: "Erreur lors de la récupération des invitations" }
  }
}

// Récupérer les invitations reçues par un candidat
export async function getReceivedInvitations() {
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

    const invitations = await (prisma as any).bootcampInvitation.findMany({
      where: {
        candidateId: dbUser.id,
        status: {
          in: ['PENDING', 'ACCEPTED', 'DECLINED']
        }
      },
      include: {
        bootcamp: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
            domains: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, data: invitations }
  } catch (error) {
    console.error("Error fetching received invitations:", error)
    return { success: false, error: "Erreur lors de la récupération des invitations" }
  }
}

// Accepter une invitation
export async function acceptBootcampInvitation(invitationId: string) {
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

    // Trouver l'invitation
    const invitation = await (prisma as any).bootcampInvitation.findUnique({
      where: { id: invitationId },
      include: {
        bootcamp: {
          select: {
            id: true,
            domains: true
          }
        }
      }
    })

    if (!invitation) {
      return { success: false, error: "Invitation non trouvée" }
    }

    if (invitation.candidateId !== dbUser.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à accepter cette invitation" }
    }

    if (invitation.status !== "PENDING") {
      return { success: false, error: "Cette invitation n'est plus en attente" }
    }

    // Mettre à jour l'invitation
    const updatedInvitation = await (prisma as any).bootcampInvitation.update({
      where: { id: invitationId },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Créer un enrollment si nécessaire
    const existingEnrollment = await prisma.bootcampEnrollment.findUnique({
      where: { userId: dbUser.id }
    })

    if (!existingEnrollment) {
      await prisma.bootcampEnrollment.create({
        data: {
          userId: dbUser.id,
          bootcampDomains: (invitation.bootcamp.domains as Domain[]) || [],
          status: "ACTIVE",
          progress: 0,
          badges: [],
          isJobReady: false
        }
      })
    }

    // Récupérer les informations complètes de l'utilisateur pour la notification
    const fullUser = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: {
        firstName: true,
        lastName: true
      }
    })

    // Créer une notification pour le bootcamp
    await prisma.bootcampNotification.create({
      data: {
        userId: invitation.bootcampId,
        type: "ACHIEVEMENT",
        title: "Invitation acceptée",
        message: `${fullUser?.firstName || ''} ${fullUser?.lastName || ''} a accepté votre invitation au bootcamp.`,
        metadata: {
          invitationId: invitation.id,
          candidateId: dbUser.id
        }
      }
    })

    return { success: true, data: updatedInvitation }
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return { success: false, error: "Erreur lors de l'acceptation de l'invitation" }
  }
}

// Refuser une invitation
export async function declineBootcampInvitation(invitationId: string) {
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

    // Trouver l'invitation
    const invitation = await (prisma as any).bootcampInvitation.findUnique({
      where: { id: invitationId },
      include: {
        bootcamp: {
          select: {
            id: true
          }
        }
      }
    })

    if (!invitation) {
      return { success: false, error: "Invitation non trouvée" }
    }

    if (invitation.candidateId !== dbUser.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à refuser cette invitation" }
    }

    if (invitation.status !== "PENDING") {
      return { success: false, error: "Cette invitation n'est plus en attente" }
    }

    // Mettre à jour l'invitation
    const updatedInvitation = await (prisma as any).bootcampInvitation.update({
      where: { id: invitationId },
      data: {
        status: "DECLINED",
        respondedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Récupérer les informations complètes de l'utilisateur pour la notification
    const fullUser = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: {
        firstName: true,
        lastName: true
      }
    })

    // Créer une notification pour le bootcamp
    await prisma.bootcampNotification.create({
      data: {
        userId: invitation.bootcampId,
        type: "REMINDER",
        title: "Invitation refusée",
        message: `${fullUser?.firstName || ''} ${fullUser?.lastName || ''} a refusé votre invitation au bootcamp.`,
        metadata: {
          invitationId: invitation.id,
          candidateId: dbUser.id
        }
      }
    })

    return { success: true, data: updatedInvitation }
  } catch (error) {
    console.error("Error declining invitation:", error)
    return { success: false, error: "Erreur lors du refus de l'invitation" }
  }
}

// Annuler une réponse (réversible sous 24h)
export async function undoInvitationResponse(invitationId: string) {
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

    // Trouver l'invitation
    const invitation = await (prisma as any).bootcampInvitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      return { success: false, error: "Invitation non trouvée" }
    }

    if (invitation.candidateId !== dbUser.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à modifier cette invitation" }
    }

    // Vérifier que l'invitation a été répondue (ACCEPTED ou DECLINED)
    if (invitation.status !== "ACCEPTED" && invitation.status !== "DECLINED") {
      return { success: false, error: "Cette invitation n'a pas encore été répondue" }
    }

    // Vérifier que moins de 24h se sont écoulées
    if (!invitation.respondedAt) {
      return { success: false, error: "Date de réponse introuvable" }
    }

    const respondedAt = new Date(invitation.respondedAt)
    const now = new Date()
    const hoursSinceResponse = (now.getTime() - respondedAt.getTime()) / (1000 * 60 * 60)

    if (hoursSinceResponse > 24) {
      return { success: false, error: "Vous ne pouvez plus annuler votre réponse après 24 heures" }
    }

    // Remettre l'invitation en PENDING
    const updatedInvitation = await (prisma as any).bootcampInvitation.update({
      where: { id: invitationId },
      data: {
        status: "PENDING",
        respondedAt: null,
        updatedAt: new Date()
      }
    })

    // Si l'invitation était acceptée, supprimer l'enrollment
    if (invitation.status === "ACCEPTED") {
      await prisma.bootcampEnrollment.deleteMany({
        where: { userId: dbUser.id }
      })
    }

    return { success: true, data: updatedInvitation }
  } catch (error) {
    console.error("Error undoing invitation response:", error)
    return { success: false, error: "Erreur lors de l'annulation de la réponse" }
  }
}

