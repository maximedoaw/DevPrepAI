// application.action.ts
"use server"

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { ApplicationStatus, mapUIStatusToPrisma } from "@/lib/enums/application-status";

// Sauvegarder une candidature
export async function saveApplication(data: { 
  jobId: string; 
  coverLetter?: string;
  portfolioUrl?: string; 
  resumeUrl?: string; 
  score?: number; 
  reportUrl?: string;
}) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) {
    throw new Error("Utilisateur non connecté")
  }

  // Vérifier si l'utilisateur a déjà postulé à ce job
  const existingApplication = await prisma.application.findFirst({
    where: {
      userId: user.id,
      jobId: data.jobId,
    },
  });

  if (existingApplication) {
    throw new Error("Vous avez déjà postulé à cette offre d'emploi")
  }

  const result = await prisma.application.create({
    data: {
      userId: user.id, 
      jobId: data.jobId,
      coverLetter: data.coverLetter || null,
      portfolioUrl: data.portfolioUrl || null,
      resumeUrl: data.resumeUrl || null,
      status: ApplicationStatus.PENDING, // Utiliser l'enum ApplicationStatus
      score: data.score || null,
      reportUrl: data.reportUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  revalidatePath("/jobs");
  return result;
}

// Vérifier si l'utilisateur a déjà postulé à ce job
export async function checkIfApplied(jobId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) {
    return false;
  }

  const application = await prisma.application.findFirst({
    where: {
      userId: user.id,
      jobId: jobId,
    },
  });

  return !!application;
}

// Obtenir les détails d'une candidature existante
export async function getApplicationDetails(jobId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) {
    return null;
  }

  const application = await prisma.application.findFirst({
    where: {
      userId: user.id,
      jobId: jobId,
    },
    include: {
      job: true,
    },
  });

  return application;
}

// Mettre à jour une candidature existante
export async function updateApplication(applicationId: string, data: {
  coverLetter?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  score?: number;
  reportUrl?: string;
  status?: string;
}) {
  // Convertir le statut UI vers la valeur de l'enum Prisma si fourni
  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  };
  
  if (data.status) {
    updateData.status = mapUIStatusToPrisma(data.status);
  }
  
  const result = await prisma.application.update({
    where: { id: applicationId },
    data: updateData,
  });

  revalidatePath("/jobs");
  revalidatePath("/");
  return result;
}

// Mettre à jour la review d'une candidature (statut et score final)
export async function updateApplicationReview(applicationId: string, data: {
  status: string;
  score?: number;
  reviewerNotes?: string;
}) {
  try {
    // Convertir le statut UI vers la valeur de l'enum Prisma
    const prismaStatus = mapUIStatusToPrisma(data.status);
    
    const result = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: prismaStatus,
        score: data.score || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/enterprise/enterprise-interviews");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating application review:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la mise à jour" };
  }
}

// Obtenir les compétences de l'utilisateur depuis son profil
export async function getUserSkills() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) {
    return [];
  }

  // Simulation - À remplacer par votre logique réelle
  const userSkills = await prisma.user.findUnique({
    where: { id: user.id },
    select: { skills: true }
  });

  return userSkills?.skills || ["React", "TypeScript", "Node.js", "Python", "MongoDB", "AWS"];
}

// Obtenir les résultats des tests de l'utilisateur
export async function getUserTestResults() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) {
    return { validated: [], invalid: [] };
  }

  // Simulation - À remplacer par votre logique réelle
  return {
    validated: [
      { id: 1, name: "Entretien technique", score: 85, validated: true },
      { id: 2, name: "Test de compétences", score: 92, validated: true },
    ],
    invalid: [
      { id: 3, name: "Quiz culture d'entreprise", score: 45, validated: false },
    ]
  };
}

// Analyser la compatibilité des compétences
export async function analyzeSkillCompatibility(jobId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) {
    return { matchPercent: 0, matchedSkills: [], missingSkills: [] };
  }

  const userSkills = await getUserSkills();
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: { skills: true }
  });

  if (!job) {
    return { matchPercent: 0, matchedSkills: [], missingSkills: [] };
  }

  const matchedSkills = userSkills.filter(skill => 
    job.skills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );

  const missingSkills = job.skills.filter(jobSkill => 
    !userSkills.some(skill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );

  const matchPercent = Math.round((matchedSkills.length / job.skills.length) * 100);

  return { matchPercent, matchedSkills, missingSkills };
}

// Générer une lettre de motivation avec IA
export async function generateCoverLetter(jobId: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) {
    throw new Error("Utilisateur non connecté");
  }

  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: { title: true, companyName: true, skills: true, domains: true }
  });

  if (!job) {
    throw new Error("Job non trouvé");
  }

  // Simulation de génération IA - À remplacer par votre service IA
  await new Promise(resolve => setTimeout(resolve, 3000));

  const generatedLetter = `Madame, Monsieur,

Je me permets de vous soumettre ma candidature pour le poste de ${job.title} au sein de ${job.companyName}.

Fort(e) de mon expérience en ${job.skills.slice(0, 3).join(', ')} et de ma passion pour ${job.domains[0] || "votre secteur d'activité"}, je suis convaincu(e) que mon profil correspond parfaitement à vos attentes.

Mes compétences en ${job.skills.slice(0, 2).join(' et ')} me permettront de contribuer efficacement à vos projets. J'ai particulièrement été attiré(e) par ${job.domains.length > 1 ? `vos domaines d'expertise en ${job.domains.join(', ')}` : "votre approche innovante"}.

Je suis impatient(e) de pouvoir discuter de la manière dont mon expertise pourrait bénéficier à ${job.companyName} et contribuer à votre succès.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`;

  return generatedLetter;
}

// Récupérer toutes les candidatures d'un utilisateur avec leurs résultats de quiz et statuts
export async function getUserApplications() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id) {
    return [];
  }

  try {
    const applications = await prisma.application.findMany({
      where: {
        userId: user.id,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            skills: true,
            domains: true,
            type: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Pour chaque candidature, récupérer les résultats de quiz
    const applicationsWithQuizResults = await Promise.all(
      applications.map(async (app) => {
        // Récupérer les quizzes du job
        const jobQuizzes = await prisma.jobQuiz.findMany({
          where: { jobPostingId: app.jobId }
        })

        // Récupérer les résultats de quiz pour cet utilisateur et ces quizzes
        const quizResults = await prisma.jobQuizResult.findMany({
          where: {
            userId: user.id,
            jobQuizId: { in: jobQuizzes.map(q => q.id) }
          },
          include: {
            jobQuiz: {
              select: {
                id: true,
                title: true,
                totalPoints: true,
                technology: true
              }
            },
            skillAnalysis: {
              select: {
                id: true,
                skills: true,
                aiFeedback: true
              },
              orderBy: {
                analyzedAt: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            completedAt: 'desc'
          }
        })

        // Calculer le score moyen
        const averageScore = quizResults.length > 0
          ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
          : 0

        // Extraire les compétences des quiz results
        const skills: string[] = []
        quizResults.forEach(result => {
          if (result.jobQuiz.technology && Array.isArray(result.jobQuiz.technology)) {
            skills.push(...result.jobQuiz.technology)
          }
          if (result.skillAnalysis && result.skillAnalysis.length > 0) {
            const analysisSkills = result.skillAnalysis[0].skills as any
            if (analysisSkills && Array.isArray(analysisSkills)) {
              analysisSkills.forEach((skill: any) => {
                const skillName = skill.name || skill.skill || ''
                if (skillName && !skills.includes(skillName)) {
                  skills.push(skillName)
                }
              })
            }
          }
        })

        return {
          ...app,
          quizResults: quizResults.map(r => ({
            id: r.id,
            quizTitle: r.jobQuiz.title,
            score: r.score,
            totalPoints: r.jobQuiz.totalPoints,
            percentage: r.jobQuiz.totalPoints > 0 
              ? Math.round((r.score / r.jobQuiz.totalPoints) * 100) 
              : 0,
            completedAt: r.completedAt,
            answers: r.answers, // Inclure les réponses pour vérifier si révisé
            skills: r.skillAnalysis && r.skillAnalysis.length > 0 
              ? r.skillAnalysis[0].skills 
              : null
          })),
          averageScore: Math.round(averageScore),
          skills: Array.from(new Set(skills)) // Supprimer les doublons
        }
      })
    )

    return applicationsWithQuizResults
  } catch (error) {
    console.error("Error fetching user applications:", error)
    return []
  }
}