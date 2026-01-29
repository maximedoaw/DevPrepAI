"use server"

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/db/prisma"

export async function getEnterpriseDashboardData() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    
    if (!user?.id) {
      return { success: false, error: "Non authentifié" }
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (dbUser?.role !== "ENTERPRISE") {
      return { success: false, error: "Accès refusé" }
    }

    // Get all job postings for this enterprise
    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
            jobQuizzes: true
          }
        }
      }
    })

    // Get all applications for enterprise jobs
    const applications = await prisma.application.findMany({
      where: {
        job: {
          userId: user.id
        }
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Get top recommended talents from matching table
    const topMatches = await prisma.candidateMatching.findMany({
      where: {
        jobPosting: {
          userId: user.id,
          isActive: true
        }
      },
      select: {
        id: true,
        matchScore: true,
        skillsMatch: true,
        domainMatch: true,
        aiReason: true,
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
            domains: true,
            portfolio: {
              select: {
                id: true,
                avatarUrl: true,
                headline: true
              },
              take: 1
            }
          }
        },
        jobPosting: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        matchScore: "desc"
      },
      take: 10
    })

    // Count tests completed
    const testsCompleted = await prisma.jobQuizResult.count({
      where: {
        jobQuiz: {
          jobPosting: {
            userId: user.id
          }
        }
      }
    })

    // Count successful hires (accepted applications)
    const hires = applications.filter(app => app.status === "ACCEPTED").length

    // Calculate pipeline stages
    const pendingApplications = applications.filter(app => app.status === "PENDING" || app.status === "APPLIED").length
    const interviewApplications = applications.filter(app => app.status === "INTERVIEW").length
    const reviewedApplications = applications.filter(app => app.status === "REVIEWED").length

    return {
      success: true,
      data: {
        stats: {
          totalJobs: jobPostings.length,
          activeJobs: jobPostings.filter(j => j.isActive).length,
          totalApplications: applications.length,
          testsCompleted,
          hires,
          avgTimeToHire: 24 // TODO: Calculate from actual data
        },
        pipeline: {
          received: applications.length,
          interview: interviewApplications,
          tested: testsCompleted,
          hired: hires
        },
        topMatches: topMatches.map(match => ({
          id: match.id,
          candidateId: match.candidate.id,
          name: `${match.candidate.firstName} ${match.candidate.lastName}`,
          email: match.candidate.email,
          matchScore: match.matchScore,
          skillsMatch: match.skillsMatch,
          domainMatch: match.domainMatch,
          aiReason: match.aiReason,
          skills: match.candidate.skills,
          domains: match.candidate.domains,
          avatarUrl: match.candidate.portfolio?.[0]?.avatarUrl,
          headline: match.candidate.portfolio?.[0]?.headline,
          portfolioId: match.candidate.portfolio?.[0]?.id,
          jobTitle: match.jobPosting.title,
          jobId: match.jobPosting.id
        })),
        recentApplications: applications.slice(0, 5).map(app => ({
          id: app.id,
          candidateName: `${app.user.firstName} ${app.user.lastName}`,
          status: app.status,
          appliedAt: app.createdAt
        }))
      }
    }
  } catch (error) {
    console.error("Error fetching enterprise dashboard data:", error)
    return { success: false, error: "Erreur lors de la récupération des données" }
  }
}
