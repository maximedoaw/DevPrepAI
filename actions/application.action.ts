// application.action.ts
"use server"

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

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

  const result = await prisma.application.create({
    data: {
      userId: user.id, 
      jobId: data.jobId,
      coverLetter: data.coverLetter || null,
      portfolioUrl: data.portfolioUrl || null,
      resumeUrl: data.resumeUrl || null,
      status: "applied",
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
}) {
  const result = await prisma.application.update({
    where: { id: applicationId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/jobs");
  return result;
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