import { NextRequest, NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { GoogleGenAI } from "@google/genai"
import prisma from "@/db/prisma"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est une entreprise
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (dbUser?.role !== Role.ENTERPRISE) {
      return NextResponse.json(
        { error: "Accès réservé aux entreprises" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jobPostingId } = body

    if (!jobPostingId) {
      return NextResponse.json(
        { error: "jobPostingId est requis" },
        { status: 400 }
      )
    }

    // Récupérer le job posting
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId, userId: user.id, isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        domains: true,
        skills: true,
        experienceLevel: true,
        location: true,
        type: true,
        workMode: true,
      },
    })

    if (!jobPosting) {
      return NextResponse.json(
        { error: "Poste introuvable ou inactif" },
        { status: 404 }
      )
    }

    // Vérifier d'abord si des matchings existent déjà pour ce job posting
    const existingMatchings = await prisma.candidateMatching.findMany({
      where: { jobPostingId: jobPosting.id },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
            domains: true,
            matchingJobs: true,
            portfolio: {
              select: {
                id: true,
                avatarUrl: true,
                headline: true,
                bio: true,
                skills: true,
              },
              take: 1,
              orderBy: { updatedAt: "desc" },
            },
          },
        },
      },
      orderBy: { matchScore: "desc" },
      take: 50, // Limiter à 50 candidats
    })

    // Si des matchings existent déjà, récupérer les vrais candidats et ajouter les faux profils
    if (existingMatchings.length > 0) {
      const realMatches = existingMatchings.map(m => ({
        id: m.id,
        matchScore: m.matchScore,
        skillsMatch: m.skillsMatch,
        domainMatch: m.domainMatch,
        experienceMatch: m.experienceMatch,
        aiReason: m.aiReason,
        candidate: {
          id: m.candidate.id,
          firstName: m.candidate.firstName,
          lastName: m.candidate.lastName,
          email: m.candidate.email,
          skills: m.candidate.skills,
          domains: m.candidate.domains,
          matchingJobs: m.candidate.matchingJobs,
          portfolio: m.candidate.portfolio?.[0] ? {
            id: m.candidate.portfolio[0].id,
            avatarUrl: m.candidate.portfolio[0].avatarUrl,
            headline: m.candidate.portfolio[0].headline,
            bio: m.candidate.portfolio[0].bio,
            skills: m.candidate.portfolio[0].skills || [],
          } : null,
        },
      }))

      // Générer les matchings pour les faux profils avec Gemini (pas stockés en DB)
      const fakeCandidates = [
        {
          id: "fake-candidate-1",
          firstName: "Lucas",
          lastName: "Moreau",
          email: "lucas.moreau@example.com",
          skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
          domains: ["DEVELOPMENT"],
          matchingJobs: 12,
          portfolio: {
            id: "portfolio-fake-1",
            avatarUrl: null,
            headline: "Développeur Full Stack Next.js expérimenté",
            bio: "Développeur Full Stack spécialisé en Next.js avec plus de 5 ans d'expérience. Expert en développement d'applications web modernes et performantes.",
            skills: ["Next.js", "React", "TypeScript"],
            experiences: JSON.stringify([
              { title: "Développeur Full Stack", company: "Tech Corp", duration: "3 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Master en Informatique", school: "Université Paris", year: "2018" }
            ]),
          },
        },
        {
          id: "fake-candidate-2",
          firstName: "Sophie",
          lastName: "Dubois",
          email: "sophie.dubois@example.com",
          skills: ["Next.js", "React", "TypeScript", "GraphQL", "AWS", "Docker"],
          domains: ["DEVELOPMENT", "DEVOPS"],
          matchingJobs: 15,
          portfolio: {
            id: "portfolio-fake-2",
            avatarUrl: null,
            headline: "Développeuse Next.js & Architecte Cloud",
            bio: "Architecte logiciel spécialisée en Next.js et déploiements cloud. Passionnée par la création d'applications scalables et performantes.",
            skills: ["Next.js", "React", "AWS"],
            experiences: JSON.stringify([
              { title: "Architecte Cloud", company: "Cloud Solutions", duration: "4 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Ingénieur Informatique", school: "École Polytechnique", year: "2017" }
            ]),
          },
        },
        {
          id: "fake-candidate-3",
          firstName: "Thomas",
          lastName: "Martin",
          email: "thomas.martin@example.com",
          skills: ["Next.js", "React", "TypeScript", "Node.js", "MongoDB", "Redis"],
          domains: ["DEVELOPMENT"],
          matchingJobs: 8,
          portfolio: {
            id: "portfolio-fake-3",
            avatarUrl: null,
            headline: "Développeur Full Stack JavaScript/Next.js",
            bio: "Développeur Full Stack avec expertise en Next.js, React et Node.js. Création d'applications web performantes et modernes.",
            skills: ["Next.js", "React", "Node.js"],
            experiences: JSON.stringify([
              { title: "Développeur Full Stack", company: "StartupTech", duration: "2 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Licence Informatique", school: "Université Lyon", year: "2020" }
            ]),
          },
        },
        {
          id: "fake-candidate-4",
          firstName: "Emma",
          lastName: "Bernard",
          email: "emma.bernard@example.com",
          skills: ["Next.js", "React", "TypeScript", "Framer Motion", "Storybook", "Jest"],
          domains: ["DEVELOPMENT", "DESIGN"],
          matchingJobs: 10,
          portfolio: {
            id: "portfolio-fake-4",
            avatarUrl: null,
            headline: "Développeuse Frontend Next.js créative",
            bio: "Développeuse Frontend spécialisée en Next.js et animations. Passionnée par l'UX et la création d'interfaces utilisateur exceptionnelles.",
            skills: ["Next.js", "React", "Framer Motion"],
            experiences: JSON.stringify([
              { title: "Développeuse Frontend", company: "Design Studio", duration: "3 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Master Design Web", school: "École de Design", year: "2019" }
            ]),
          },
        },
        {
          id: "fake-candidate-5",
          firstName: "Pierre",
          lastName: "Petit",
          email: "pierre.petit@example.com",
          skills: ["Next.js", "React", "TypeScript", "Supabase", "Stripe", "Vercel"],
          domains: ["DEVELOPMENT"],
          matchingJobs: 18,
          portfolio: {
            id: "portfolio-fake-5",
            avatarUrl: null,
            headline: "Développeur Next.js E-commerce",
            bio: "Expert en développement d'applications e-commerce avec Next.js. Spécialisé dans l'intégration de paiements et la gestion de produits.",
            skills: ["Next.js", "React", "Stripe"],
            experiences: JSON.stringify([
              { title: "Développeur E-commerce", company: "Ecom Platform", duration: "5 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Master Commerce Électronique", school: "Business School", year: "2016" }
            ]),
          },
        },
        {
          id: "fake-candidate-6",
          firstName: "Camille",
          lastName: "Robert",
          email: "camille.robert@example.com",
          skills: ["Next.js", "React", "TypeScript", "Zustand", "React Query", "Cypress"],
          domains: ["DEVELOPMENT"],
          matchingJobs: 9,
          portfolio: {
            id: "portfolio-fake-6",
            avatarUrl: null,
            headline: "Développeuse Next.js & Tests",
            bio: "Développeuse Full Stack Next.js avec expertise en tests automatisés et gestion d'état. Création d'applications robustes et maintenables.",
            skills: ["Next.js", "React", "Cypress"],
            experiences: JSON.stringify([
              { title: "Développeuse Full Stack", company: "Quality Software", duration: "2 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Master Informatique", school: "Université Bordeaux", year: "2021" }
            ]),
          },
        },
        {
          id: "fake-candidate-7",
          firstName: "Nicolas",
          lastName: "Richard",
          email: "nicolas.richard@example.com",
          skills: ["Next.js", "React", "TypeScript", "tRPC", "Prisma", "PostgreSQL"],
          domains: ["DEVELOPMENT"],
          matchingJobs: 14,
          portfolio: {
            id: "portfolio-fake-7",
            avatarUrl: null,
            headline: "Développeur Full Stack Type-Safe Next.js",
            bio: "Spécialiste en développement type-safe avec Next.js, tRPC et Prisma. Expertise en création d'APIs robustes et typées.",
            skills: ["Next.js", "TypeScript", "tRPC"],
            experiences: JSON.stringify([
              { title: "Développeur Full Stack", company: "TypeSafe Inc", duration: "3 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Ingénieur Logiciel", school: "École Centrale", year: "2018" }
            ]),
          },
        },
        {
          id: "fake-candidate-8",
          firstName: "Marie",
          lastName: "Durand",
          email: "marie.durand@example.com",
          skills: ["Next.js", "React", "TypeScript", "Styled Components", "Figma", "GSAP"],
          domains: ["DEVELOPMENT", "DESIGN"],
          matchingJobs: 7,
          portfolio: {
            id: "portfolio-fake-8",
            avatarUrl: null,
            headline: "Développeuse Next.js & Design System",
            bio: "Développeuse Frontend spécialisée en Next.js et design systems. Création d'interfaces cohérentes et performantes.",
            skills: ["Next.js", "React", "Styled Components"],
            experiences: JSON.stringify([
              { title: "Développeuse Frontend", company: "Design Systems Co", duration: "2 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Licence Web Design", school: "École Supérieure Design", year: "2020" }
            ]),
          },
        },
        {
          id: "fake-candidate-9",
          firstName: "Alexandre",
          lastName: "Laurent",
          email: "alexandre.laurent@example.com",
          skills: ["Next.js", "React", "TypeScript", "Micro-frontends", "Webpack", "Module Federation"],
          domains: ["DEVELOPMENT", "ENGINEERING"],
          matchingJobs: 11,
          portfolio: {
            id: "portfolio-fake-9",
            avatarUrl: null,
            headline: "Architecte Next.js & Micro-frontends",
            bio: "Architecte logiciel spécialisé en Next.js et architectures micro-frontends. Expertise en systèmes distribués et scalables.",
            skills: ["Next.js", "React", "Webpack"],
            experiences: JSON.stringify([
              { title: "Architecte Logiciel", company: "Enterprise Solutions", duration: "4 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Master Architecture Logicielle", school: "Université Toulouse", year: "2017" }
            ]),
          },
        },
        {
          id: "fake-candidate-10",
          firstName: "Julie",
          lastName: "Simon",
          email: "julie.simon@example.com",
          skills: ["Next.js", "React", "TypeScript", "Server Components", "RSC", "React Server Actions"],
          domains: ["DEVELOPMENT"],
          matchingJobs: 13,
          portfolio: {
            id: "portfolio-fake-10",
            avatarUrl: null,
            headline: "Développeuse Next.js App Router",
            bio: "Experte en Next.js App Router et React Server Components. Spécialisée dans les applications modernes avec la dernière stack Next.js.",
            skills: ["Next.js", "React", "Server Components"],
            experiences: JSON.stringify([
              { title: "Développeuse Senior", company: "NextGen Tech", duration: "3 ans" }
            ]),
            education: JSON.stringify([
              { degree: "Master Informatique", school: "Université Paris-Saclay", year: "2019" }
            ]),
          },
        },
      ]

      // Utiliser Gemini pour générer les matchings des faux profils
      const apiKey = process.env.GEMINI_API_KEY
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey })
          const prompt = `Tu es un expert en recrutement et matching candidat-entreprise.

POSTE À POURVOIR:
- Titre: ${jobPosting.title}
- Description: ${jobPosting.description}
- Domaines requis: ${jobPosting.domains.join(", ")}
- Compétences requises: ${jobPosting.skills.join(", ")}
- Niveau d'expérience: ${jobPosting.experienceLevel || "Non spécifié"}
- Type: ${jobPosting.type}
- Mode de travail: ${jobPosting.workMode}
- Localisation: ${jobPosting.location || "Non spécifiée"}

CANDIDATS À ÉVALUER:
${fakeCandidates.map((candidate, index) => {
  const portfolio = candidate.portfolio
  return `
Candidat ${index + 1} (ID: ${candidate.id}):
- Nom: ${candidate.firstName} ${candidate.lastName}
- Email: ${candidate.email}
- Compétences: ${candidate.skills.join(", ")} (Total: ${candidate.skills.length} compétences)
- Domaines: ${candidate.domains.join(", ")} (Total: ${candidate.domains.length} domaines)
- Nombre de domaines correspondants: ${candidate.domains.filter((d: string) => requiredDomains.includes(d as any)).length} sur ${requiredDomains.length}
- Nombre de compétences correspondantes: ${candidate.skills.filter(s => requiredSkills.some(req => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))).length} sur ${requiredSkills.length}
- Headline: ${portfolio?.headline || "Non spécifié"}
- Bio: ${portfolio?.bio || "Non spécifiée"}
- Expériences: ${portfolio?.experiences ? (typeof portfolio.experiences === 'string' ? portfolio.experiences.substring(0, 300) : JSON.stringify(portfolio.experiences).substring(0, 300)) : "Non spécifiées"}
- Formation: ${portfolio?.education ? (typeof portfolio.education === 'string' ? portfolio.education.substring(0, 300) : JSON.stringify(portfolio.education).substring(0, 300)) : "Non spécifiée"}
`
}).join("\n")}

TÂCHE:
Pour chaque candidat, calcule un score de matching (0-100) basé sur:
1. Correspondance des compétences (35%)
2. Correspondance des domaines (25%)
3. Correspondance de l'expérience et du profil (15%)
4. Performance aux tests d'entraînement - score moyen et nombre de quiz (10%)
5. Amélioration des scores dans le temps - progression positive (8%)
6. Badges obtenus - reconnaissance de l'excellence (5%)
7. Pertinence globale du profil (2%)

IMPORTANT:
- Donne plus de poids aux candidats avec des scores élevés et une progression positive
- Valorise les badges obtenus comme signe d'engagement et d'excellence
- Prends en compte le nombre de quiz comme indicateur de motivation

Retourne UNIQUEMENT un JSON valide avec ce format:
{
  "matches": [
    {
      "candidateId": "id_exact_du_candidat",
      "matchScore": 85.5,
      "skillsMatch": 90,
      "domainMatch": 80,
      "experienceMatch": 85,
      "reason": "Explication détaillée en 2-3 phrases du pourquoi ce candidat correspond au poste"
    }
  ]
}

IMPORTANT: 
- Retourne uniquement le JSON, sans texte avant ou après.
- Utilise les IDs exacts des candidats fournis.`

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          })

          const generatedText = response.text
          if (generatedText) {
            let jsonText = generatedText.trim()
            const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/)
            if (jsonMatch) {
              jsonText = jsonMatch[1].trim()
            }

            const parsedResult = JSON.parse(jsonText)
            if (parsedResult.matches && Array.isArray(parsedResult.matches)) {
              const fakeMatchings = parsedResult.matches
                .filter((match: any) => {
                  const candidate = fakeCandidates.find((c) => c.id === match.candidateId)
                  return candidate !== undefined
                })
                .sort((a: any, b: any) => b.matchScore - a.matchScore)

              // Construire les matchings des faux candidats
              const fakeMatches = fakeMatchings.map((match: any) => {
                const candidate = fakeCandidates.find(c => c.id === match.candidateId)
                if (!candidate) return null

                return {
                  id: match.candidateId,
                  matchScore: match.matchScore,
                  skillsMatch: match.skillsMatch || 0,
                  domainMatch: match.domainMatch || 0,
                  experienceMatch: match.experienceMatch || null,
                  aiReason: match.reason || null,
                  candidate: {
                    id: candidate.id,
                    firstName: candidate.firstName,
                    lastName: candidate.lastName,
                    email: candidate.email,
                    skills: candidate.skills,
                    domains: candidate.domains,
                    matchingJobs: candidate.matchingJobs,
                    portfolio: candidate.portfolio ? {
                      id: candidate.portfolio.id || "portfolio-id",
                      avatarUrl: candidate.portfolio.avatarUrl,
                      headline: candidate.portfolio.headline,
                      bio: candidate.portfolio.bio,
                      skills: candidate.portfolio.skills || [],
                    } : null,
                  },
                }
              }).filter(Boolean)

              // Combiner les matchings réels et fictifs, triés par score décroissant
              const allMatches = [...realMatches, ...fakeMatches].sort((a, b) => b.matchScore - a.matchScore).slice(0, 50)

              return NextResponse.json({
                success: true,
                matches: allMatches,
                total: allMatches.length,
                fromCache: true,
              })
            }
          }
        } catch (error) {
          console.error("Erreur lors de la génération des matchings fictifs:", error)
          // En cas d'erreur, retourner seulement les matchings réels
        }
      }

      // Si erreur ou pas de clé API, retourner seulement les matchings réels
      return NextResponse.json({
        success: true,
        matches: realMatches,
        total: realMatches.length,
        fromCache: true,
      })
    }

    // Si aucun matching n'existe, générer avec Gemini
    // Filtrer les candidats par domaines et compétences qui matchent avec le poste
    const requiredDomains = jobPosting.domains
    const requiredSkills = jobPosting.skills.map(s => s.toLowerCase())

    // Récupérer tous les vrais candidats avec filtre par domaines et compétences
    const dbCandidates = await prisma.user.findMany({
      where: {
        role: Role.CANDIDATE,
        // Filtrer par domaines : au moins un domaine doit correspondre
        domains: {
          hasSome: requiredDomains,
        },
        // Filtrer par compétences : au moins une compétence doit correspondre (approximatif)
        // Note: Prisma ne supporte pas directement la recherche par substring, donc on filtre après
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        skills: true,
        domains: true,
        matchingJobs: true,
        portfolio: {
          select: {
            id: true,
            avatarUrl: true,
            headline: true,
            bio: true,
            skills: true,
            experiences: true,
            education: true,
          },
          take: 1,
          orderBy: { updatedAt: "desc" },
        },
      },
    })

    // Filtrer STRICTEMENT par compétences : le candidat DOIT avoir au moins une compétence correspondante
    // ET travailler dans au moins un domaine du poste (déjà filtré par Prisma)
    const filteredCandidates = dbCandidates.filter(candidate => {
      const candidateSkills = candidate.skills.map(s => s.toLowerCase())
      // Le candidat DOIT avoir au moins une compétence qui correspond
      const hasMatchingSkill = requiredSkills.some(reqSkill => 
        candidateSkills.some(candSkill => 
          candSkill.includes(reqSkill) || reqSkill.includes(candSkill)
        )
      )
      // Le candidat DOIT avoir au moins un domaine qui correspond (vérification supplémentaire)
      const hasMatchingDomain = requiredDomains.some(reqDomain => 
        candidate.domains.includes(reqDomain)
      )
      // Retourner seulement si les DEUX conditions sont remplies
      return hasMatchingSkill && hasMatchingDomain
    })

    // Récupérer les résultats de quiz d'entraînement ET les feedbacks des recruteurs pour chaque candidat
    const candidatesWithStats = await Promise.all(
      filteredCandidates.map(async (c) => {
        // Récupérer les résultats de quiz d'entraînement (QCM, TECHNICAL, MOCK_INTERVIEW)
        const quizResults = await prisma.quizResult.findMany({
          where: {
            userId: c.id,
            quiz: {
              type: {
                in: ["QCM", "TECHNICAL", "MOCK_INTERVIEW"],
              },
              // Filtrer par domaines du poste
              domain: {
                in: requiredDomains,
              },
            },
          },
          include: {
            quiz: {
              select: {
                type: true,
                domain: true,
                difficulty: true,
              },
            },
          },
          orderBy: {
            completedAt: "asc", // Du plus ancien au plus récent pour calculer la progression
          },
        })

        // Récupérer les feedbacks des recruteurs (JobQuizResult) pour ce candidat
        const recruiterFeedbacks = await prisma.jobQuizResult.findMany({
          where: {
            userId: c.id,
            feedbackVisibleToCandidate: true, // Seulement les feedbacks partagés
            jobQuiz: {
              // Filtrer par domaines du poste
              domain: {
                in: requiredDomains,
              },
            },
          },
          include: {
            jobQuiz: {
              select: {
                title: true,
                type: true,
                domain: true,
                difficulty: true,
                company: true,
              },
            },
            skillAnalysis: {
              select: {
                aiFeedback: true,
                improvementTips: true,
                analyzedAt: true,
              },
              orderBy: {
                analyzedAt: "desc",
              },
              take: 1,
            },
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 10, // Limiter à 10 feedbacks récents
        })

        // Calculer la progression des scores par type de quiz
        const progressionByType: Record<string, {
          firstScores: number[],
          recentScores: number[],
          averageFirst: number,
          averageRecent: number,
          improvement: number, // Pourcentage d'amélioration
          totalCount: number,
        }> = {
          QCM: { firstScores: [], recentScores: [], averageFirst: 0, averageRecent: 0, improvement: 0, totalCount: 0 },
          TECHNICAL: { firstScores: [], recentScores: [], averageFirst: 0, averageRecent: 0, improvement: 0, totalCount: 0 },
          MOCK_INTERVIEW: { firstScores: [], recentScores: [], averageFirst: 0, averageRecent: 0, improvement: 0, totalCount: 0 },
        }

        quizResults.forEach((result) => {
          const type = result.quiz.type
          if (progressionByType[type]) {
            progressionByType[type].totalCount++
            // Prendre les 3 premiers scores et les 3 derniers pour calculer la progression
            if (progressionByType[type].firstScores.length < 3) {
              progressionByType[type].firstScores.push(result.score)
            }
            // Garder seulement les 3 derniers
            progressionByType[type].recentScores.push(result.score)
            if (progressionByType[type].recentScores.length > 3) {
              progressionByType[type].recentScores.shift()
            }
          }
        })

        // Calculer les moyennes et l'amélioration
        Object.keys(progressionByType).forEach((type) => {
          const stats = progressionByType[type]
          if (stats.firstScores.length > 0) {
            stats.averageFirst = stats.firstScores.reduce((sum, score) => sum + score, 0) / stats.firstScores.length
          }
          if (stats.recentScores.length > 0) {
            stats.averageRecent = stats.recentScores.reduce((sum, score) => sum + score, 0) / stats.recentScores.length
          }
          if (stats.averageFirst > 0) {
            stats.improvement = ((stats.averageRecent - stats.averageFirst) / stats.averageFirst) * 100
          }
        })

        // Calculer les badges basés sur les résultats
        const badges: string[] = []
        const totalQuizzes = quizResults.length
        const averageScore = totalQuizzes > 0
          ? quizResults.reduce((sum, r) => sum + r.score, 0) / totalQuizzes
          : 0
        const perfectScores = quizResults.filter(r => r.score >= 95).length

        // Badges basés sur le nombre de quiz
        if (totalQuizzes >= 10) badges.push("📝 Quiz Master (10+ quiz)")
        if (totalQuizzes >= 50) badges.push("🏆 Quiz Champion (50+ quiz)")
        if (totalQuizzes >= 100) badges.push("👑 Quiz Légende (100+ quiz)")

        // Badges basés sur les scores parfaits
        if (perfectScores >= 5) badges.push("✨ Perfectionniste (5+ scores ≥95%)")
        if (perfectScores >= 20) badges.push("💎 Maître de la Perfection (20+ scores ≥95%)")

        // Badges basés sur la moyenne
        if (averageScore >= 80 && totalQuizzes >= 5) badges.push("🎯 Excellent (moyenne ≥80%)")
        if (averageScore >= 90 && totalQuizzes >= 5) badges.push("🏅 Exceptionnel (moyenne ≥90%)")

        // Badges basés sur l'amélioration
        const hasImprovement = Object.values(progressionByType).some(
          (stats) => stats.improvement > 10 && stats.totalCount >= 3
        )
        if (hasImprovement) badges.push("📈 En Progression (amélioration significative)")

        // Badges par type de quiz
        Object.entries(progressionByType).forEach(([type, stats]) => {
          if (stats.totalCount >= 10) {
            const typeIcons: Record<string, string> = {
              QCM: "📋",
              TECHNICAL: "💻",
              MOCK_INTERVIEW: "🎤",
            }
            badges.push(`${typeIcons[type] || "🏆"} Maître ${type.replace("_", " ")} (10+ quiz)`)
          }
        })

        const candidatePortfolio = c.portfolio?.[0] || null
        
        // Traiter les feedbacks des recruteurs
        const recruiterFeedbacksFormatted = recruiterFeedbacks.map((feedback) => ({
          quizTitle: feedback.jobQuiz.title,
          quizType: feedback.jobQuiz.type,
          score: feedback.score,
          reviewScore: feedback.reviewScore,
          finalScore: feedback.finalScore || feedback.score,
          analysis: feedback.analysis,
          aiFeedback: feedback.skillAnalysis?.[0]?.aiFeedback,
          improvementTips: feedback.skillAnalysis?.[0]?.improvementTips || [],
          completedAt: feedback.completedAt,
          company: feedback.jobQuiz.company,
          domain: feedback.jobQuiz.domain,
        }))

        // Calculer la moyenne des feedbacks des recruteurs
        const averageRecruiterScore = recruiterFeedbacks.length > 0
          ? recruiterFeedbacks.reduce((sum, f) => sum + (f.finalScore || f.reviewScore || f.score || 0), 0) / recruiterFeedbacks.length
          : 0
        
        return {
          ...c,
          portfolio: candidatePortfolio,
          quizStats: {
            totalQuizzes,
            averageScore: Math.round(averageScore * 10) / 10,
            perfectScores,
            progressionByType,
            badges,
            quizResultsCount: {
              QCM: progressionByType.QCM.totalCount,
              TECHNICAL: progressionByType.TECHNICAL.totalCount,
              MOCK_INTERVIEW: progressionByType.MOCK_INTERVIEW.totalCount,
            },
          },
          recruiterFeedbacks: recruiterFeedbacksFormatted,
          averageRecruiterScore: Math.round(averageRecruiterScore * 10) / 10,
          recruiterFeedbacksCount: recruiterFeedbacks.length,
        }
      })
    )

    // Préparer les candidats réels pour Gemini (seulement ceux qui ont des domaines/compétences correspondants)
    const realCandidates = candidatesWithStats

    // Ajouter 10 faux profils candidats
    const fakeCandidates = [
      {
        id: "fake-candidate-1",
        firstName: "Lucas",
        lastName: "Moreau",
        email: "lucas.moreau@example.com",
        skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
        domains: ["DEVELOPMENT"],
        matchingJobs: 12,
        portfolio: {
          id: "portfolio-fake-1",
          avatarUrl: null,
          headline: "Développeur Full Stack Next.js expérimenté",
          bio: "Développeur Full Stack spécialisé en Next.js avec plus de 5 ans d'expérience. Expert en développement d'applications web modernes et performantes.",
          skills: ["Next.js", "React", "TypeScript"],
          experiences: JSON.stringify([
            { title: "Développeur Full Stack", company: "Tech Corp", duration: "3 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Master en Informatique", school: "Université Paris", year: "2018" }
          ]),
        },
      },
      {
        id: "fake-candidate-2",
        firstName: "Sophie",
        lastName: "Dubois",
        email: "sophie.dubois@example.com",
        skills: ["Next.js", "React", "TypeScript", "GraphQL", "AWS", "Docker"],
        domains: ["DEVELOPMENT", "DEVOPS"],
        matchingJobs: 15,
        portfolio: {
          id: "portfolio-fake-2",
          avatarUrl: null,
          headline: "Développeuse Next.js & Architecte Cloud",
          bio: "Architecte logiciel spécialisée en Next.js et déploiements cloud. Passionnée par la création d'applications scalables et performantes.",
          skills: ["Next.js", "React", "AWS"],
          experiences: JSON.stringify([
            { title: "Architecte Cloud", company: "Cloud Solutions", duration: "4 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Ingénieur Informatique", school: "École Polytechnique", year: "2017" }
          ]),
        },
      },
      {
        id: "fake-candidate-3",
        firstName: "Thomas",
        lastName: "Martin",
        email: "thomas.martin@example.com",
        skills: ["Next.js", "React", "TypeScript", "Node.js", "MongoDB", "Redis"],
        domains: ["DEVELOPMENT"],
        matchingJobs: 8,
        portfolio: {
          id: "portfolio-fake-3",
          avatarUrl: null,
          headline: "Développeur Full Stack JavaScript/Next.js",
          bio: "Développeur Full Stack avec expertise en Next.js, React et Node.js. Création d'applications web performantes et modernes.",
          skills: ["Next.js", "React", "Node.js"],
          experiences: JSON.stringify([
            { title: "Développeur Full Stack", company: "StartupTech", duration: "2 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Licence Informatique", school: "Université Lyon", year: "2020" }
          ]),
        },
      },
      {
        id: "fake-candidate-4",
        firstName: "Emma",
        lastName: "Bernard",
        email: "emma.bernard@example.com",
        skills: ["Next.js", "React", "TypeScript", "Framer Motion", "Storybook", "Jest"],
        domains: ["DEVELOPMENT", "DESIGN"],
        matchingJobs: 10,
        portfolio: {
          id: "portfolio-fake-4",
          avatarUrl: null,
          headline: "Développeuse Frontend Next.js créative",
          bio: "Développeuse Frontend spécialisée en Next.js et animations. Passionnée par l'UX et la création d'interfaces utilisateur exceptionnelles.",
          skills: ["Next.js", "React", "Framer Motion"],
          experiences: JSON.stringify([
            { title: "Développeuse Frontend", company: "Design Studio", duration: "3 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Master Design Web", school: "École de Design", year: "2019" }
          ]),
        },
      },
      {
        id: "fake-candidate-5",
        firstName: "Pierre",
        lastName: "Petit",
        email: "pierre.petit@example.com",
        skills: ["Next.js", "React", "TypeScript", "Supabase", "Stripe", "Vercel"],
        domains: ["DEVELOPMENT"],
        matchingJobs: 18,
        portfolio: {
          id: "portfolio-fake-5",
          avatarUrl: null,
          headline: "Développeur Next.js E-commerce",
          bio: "Expert en développement d'applications e-commerce avec Next.js. Spécialisé dans l'intégration de paiements et la gestion de produits.",
          skills: ["Next.js", "React", "Stripe"],
          experiences: JSON.stringify([
            { title: "Développeur E-commerce", company: "Ecom Platform", duration: "5 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Master Commerce Électronique", school: "Business School", year: "2016" }
          ]),
        },
      },
      {
        id: "fake-candidate-6",
        firstName: "Camille",
        lastName: "Robert",
        email: "camille.robert@example.com",
        skills: ["Next.js", "React", "TypeScript", "Zustand", "React Query", "Cypress"],
        domains: ["DEVELOPMENT"],
        matchingJobs: 9,
        portfolio: {
          id: "portfolio-fake-6",
          avatarUrl: null,
          headline: "Développeuse Next.js & Tests",
          bio: "Développeuse Full Stack Next.js avec expertise en tests automatisés et gestion d'état. Création d'applications robustes et maintenables.",
          skills: ["Next.js", "React", "Cypress"],
          experiences: JSON.stringify([
            { title: "Développeuse Full Stack", company: "Quality Software", duration: "2 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Master Informatique", school: "Université Bordeaux", year: "2021" }
          ]),
        },
      },
      {
        id: "fake-candidate-7",
        firstName: "Nicolas",
        lastName: "Richard",
        email: "nicolas.richard@example.com",
        skills: ["Next.js", "React", "TypeScript", "tRPC", "Prisma", "PostgreSQL"],
        domains: ["DEVELOPMENT"],
        matchingJobs: 14,
        portfolio: {
          id: "portfolio-fake-7",
          avatarUrl: null,
          headline: "Développeur Full Stack Type-Safe Next.js",
          bio: "Spécialiste en développement type-safe avec Next.js, tRPC et Prisma. Expertise en création d'APIs robustes et typées.",
          skills: ["Next.js", "TypeScript", "tRPC"],
          experiences: JSON.stringify([
            { title: "Développeur Full Stack", company: "TypeSafe Inc", duration: "3 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Ingénieur Logiciel", school: "École Centrale", year: "2018" }
          ]),
        },
      },
      {
        id: "fake-candidate-8",
        firstName: "Marie",
        lastName: "Durand",
        email: "marie.durand@example.com",
        skills: ["Next.js", "React", "TypeScript", "Styled Components", "Figma", "GSAP"],
        domains: ["DEVELOPMENT", "DESIGN"],
        matchingJobs: 7,
        portfolio: {
          id: "portfolio-fake-8",
          avatarUrl: null,
          headline: "Développeuse Next.js & Design System",
          bio: "Développeuse Frontend spécialisée en Next.js et design systems. Création d'interfaces cohérentes et performantes.",
          skills: ["Next.js", "React", "Styled Components"],
          experiences: JSON.stringify([
            { title: "Développeuse Frontend", company: "Design Systems Co", duration: "2 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Licence Web Design", school: "École Supérieure Design", year: "2020" }
          ]),
        },
      },
      {
        id: "fake-candidate-9",
        firstName: "Alexandre",
        lastName: "Laurent",
        email: "alexandre.laurent@example.com",
        skills: ["Next.js", "React", "TypeScript", "Micro-frontends", "Webpack", "Module Federation"],
        domains: ["DEVELOPMENT", "ENGINEERING"],
        matchingJobs: 11,
        portfolio: {
          id: "portfolio-fake-9",
          avatarUrl: null,
          headline: "Architecte Next.js & Micro-frontends",
          bio: "Architecte logiciel spécialisé en Next.js et architectures micro-frontends. Expertise en systèmes distribués et scalables.",
          skills: ["Next.js", "React", "Webpack"],
          experiences: JSON.stringify([
            { title: "Architecte Logiciel", company: "Enterprise Solutions", duration: "4 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Master Architecture Logicielle", school: "Université Toulouse", year: "2017" }
          ]),
        },
      },
      {
        id: "fake-candidate-10",
        firstName: "Julie",
        lastName: "Simon",
        email: "julie.simon@example.com",
        skills: ["Next.js", "React", "TypeScript", "Server Components", "RSC", "React Server Actions"],
        domains: ["DEVELOPMENT"],
        matchingJobs: 13,
        portfolio: {
          id: "portfolio-fake-10",
          avatarUrl: null,
          headline: "Développeuse Next.js App Router",
          bio: "Experte en Next.js App Router et React Server Components. Spécialisée dans les applications modernes avec la dernière stack Next.js.",
          skills: ["Next.js", "React", "Server Components"],
          experiences: JSON.stringify([
            { title: "Développeuse Senior", company: "NextGen Tech", duration: "3 ans" }
          ]),
          education: JSON.stringify([
            { degree: "Master Informatique", school: "Université Paris-Saclay", year: "2019" }
          ]),
        },
      },
    ]

    // Combiner les candidats réels et fictifs
    const allCandidates = [...realCandidates, ...fakeCandidates]

    // Vérifier la clé API Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY non configurée" },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    // Préparer le prompt pour Gemini
    const prompt = `Tu es un expert en recrutement et matching candidat-entreprise.

POSTE À POURVOIR:
- Titre: ${jobPosting.title}
- Description: ${jobPosting.description}
- Domaines requis: ${jobPosting.domains.join(", ")}
- Compétences requises: ${jobPosting.skills.join(", ")}
- Niveau d'expérience: ${jobPosting.experienceLevel || "Non spécifié"}
- Type: ${jobPosting.type}
- Mode de travail: ${jobPosting.workMode}
- Localisation: ${jobPosting.location || "Non spécifiée"}

CANDIDATS À ÉVALUER:
${allCandidates.map((candidate, index) => {
  const portfolio = candidate.portfolio
  const quizStats = (candidate as any).quizStats || null
  
  // Informations sur les résultats de quiz et badges pour les vrais candidats
  const recruiterFeedbacks = (candidate as any).recruiterFeedbacks || []
  const averageRecruiterScore = (candidate as any).averageRecruiterScore || 0
  const recruiterFeedbacksCount = (candidate as any).recruiterFeedbacksCount || 0
  
  let quizInfo = ""
  if (quizStats && !candidate.id.startsWith("fake-")) {
    // Format des feedbacks des recruteurs
    let recruiterFeedbacksInfo = ""
    if (recruiterFeedbacks.length > 0) {
      recruiterFeedbacksInfo = `
- Feedbacks des recruteurs (${recruiterFeedbacksCount} feedbacks):
  * Score moyen des recruteurs: ${averageRecruiterScore}%
  * Derniers feedbacks:
${recruiterFeedbacks.slice(0, 3).map((fb: any) => `
    - ${fb.quizTitle} (${fb.company}): Score ${Math.round(fb.finalScore || fb.reviewScore || fb.score || 0)}%
      ${fb.aiFeedback ? `Feedback: ${fb.aiFeedback.substring(0, 200)}` : ""}`).join("")}`
    }
    
    quizInfo = `
- Résultats de quiz d'entraînement:
  * Total de quiz: ${quizStats.totalQuizzes}
  * Score moyen: ${quizStats.averageScore}%
  * Scores parfaits (≥95%): ${quizStats.perfectScores}
  * Progression QCM: ${quizStats.progressionByType.QCM.improvement > 0 ? `+${Math.round(quizStats.progressionByType.QCM.improvement)}%` : "Stable"} (${quizStats.progressionByType.QCM.totalCount} quiz)
  * Progression TECHNICAL: ${quizStats.progressionByType.TECHNICAL.improvement > 0 ? `+${Math.round(quizStats.progressionByType.TECHNICAL.improvement)}%` : "Stable"} (${quizStats.progressionByType.TECHNICAL.totalCount} quiz)
  * Progression MOCK_INTERVIEW: ${quizStats.progressionByType.MOCK_INTERVIEW.improvement > 0 ? `+${Math.round(quizStats.progressionByType.MOCK_INTERVIEW.improvement)}%` : "Stable"} (${quizStats.progressionByType.MOCK_INTERVIEW.totalCount} quiz)
  * Badges obtenus: ${quizStats.badges.length > 0 ? quizStats.badges.join(", ") : "Aucun"}${recruiterFeedbacksInfo}`
  }

  return `
Candidat ${index + 1} (ID: ${candidate.id}):
- Nom: ${candidate.firstName} ${candidate.lastName}
- Email: ${candidate.email}
- Compétences: ${candidate.skills.join(", ")} (Total: ${candidate.skills.length} compétences)
- Domaines: ${candidate.domains.join(", ")} (Total: ${candidate.domains.length} domaines)
- Nombre de domaines correspondants: ${candidate.domains.filter((d: string) => requiredDomains.includes(d as any)).length} sur ${requiredDomains.length}
- Nombre de compétences correspondantes: ${candidate.skills.filter(s => requiredSkills.some(req => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))).length} sur ${requiredSkills.length}
- Headline: ${portfolio?.headline || "Non spécifié"}
- Bio: ${portfolio?.bio || "Non spécifiée"}
- Expériences: ${portfolio?.experiences ? (typeof portfolio.experiences === 'string' ? portfolio.experiences.substring(0, 300) : JSON.stringify(portfolio.experiences).substring(0, 300)) : "Non spécifiées"}
- Formation: ${portfolio?.education ? (typeof portfolio.education === 'string' ? portfolio.education.substring(0, 300) : JSON.stringify(portfolio.education).substring(0, 300)) : "Non spécifiée"}${quizInfo}
`
}).join("\n")}

TÂCHE:
Pour chaque candidat, calcule un score de matching (0-100) basé sur:
1. Correspondance des compétences (25%)
   - Nombre de compétences du poste: ${jobPosting.skills.length}
   - Plus le candidat a de compétences correspondantes, plus le score est élevé
   - Bonus si le candidat a plus de compétences que requises (expertise approfondie)
2. Correspondance des domaines (20%)
   - Nombre de domaines du poste: ${jobPosting.domains.length}
   - Plus le candidat travaille dans de domaines correspondants, plus le score est élevé
   - Bonus si le candidat couvre tous les domaines du poste
3. Portfolio et expérience (15%)
   - Qualité et pertinence du portfolio
   - Expériences professionnelles pertinentes
   - Formation et certifications
4. Performance aux tests techniques - Feedback des recruteurs (15%)
   - Score moyen des recruteurs sur les tests techniques passés
   - Nombre et qualité des feedbacks des recruteurs
   - Analyse des feedbacks (points forts, axes d'amélioration)
5. Performance aux tests d'entraînement (QCM, TECHNICAL, MOCK_INTERVIEW) - score moyen et nombre de quiz (10%)
6. Amélioration des scores dans le temps - progression positive (8%)
7. Badges obtenus - reconnaissance de l'excellence (4%)
8. Pertinence globale du profil (3%)

IMPORTANT:
- ACCORDE UN POIDS TRÈS IMPORTANT aux feedbacks des recruteurs : un candidat avec de bons feedbacks des recruteurs doit être favorisé
- Donne plus de poids aux candidats avec des scores élevés aux tests techniques passés pour d'autres entreprises
- Valorise les badges obtenus comme signe d'engagement et d'excellence
- Prends en compte le nombre de quiz comme indicateur de motivation
- Prends en compte le nombre de domaines/compétences : plus un candidat a de domaines/compétences correspondants, meilleur est le score
- Un candidat qui couvre tous les domaines du poste doit avoir un bonus
- Un candidat qui a plus de compétences que requises doit avoir un bonus
- Un portfolio riche et détaillé augmente significativement le score

Retourne UNIQUEMENT un JSON valide avec ce format:
{
  "matches": [
    {
      "candidateId": "id_exact_du_candidat",
      "matchScore": 85.5,
      "skillsMatch": 90,
      "domainMatch": 80,
      "experienceMatch": 85,
      "reason": "Explication détaillée en 2-3 phrases du pourquoi ce candidat correspond au poste"
    }
  ]
}

IMPORTANT: 
- Retourne uniquement le JSON, sans texte avant ou après.
- Utilise les IDs exacts des candidats fournis.
- Retourne les 50 meilleurs matchings triés par score décroissant.`

    // Appeler Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const generatedText = response.text
    if (!generatedText) {
      throw new Error("Aucune réponse de Gemini")
    }

    // Parser la réponse JSON
    let jsonText = generatedText.trim()
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim()
    }

    const parsedResult = JSON.parse(jsonText)

    if (!parsedResult.matches || !Array.isArray(parsedResult.matches)) {
      throw new Error("Format de réponse invalide")
    }

    // Limiter à 50 meilleurs matchings
    const topMatchings = parsedResult.matches
      .filter((match: any) => {
        const candidate = allCandidates.find((c) => c.id === match.candidateId)
        return candidate !== undefined
      })
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 50)

    // Séparer les matchings réels et fictifs
    const realMatchings = topMatchings.filter((match: any) => {
      const candidate = allCandidates.find((c) => c.id === match.candidateId)
      return candidate && !candidate.id.startsWith("fake-")
    })

    const fakeMatchings = topMatchings.filter((match: any) => {
      const candidate = allCandidates.find((c) => c.id === match.candidateId)
      return candidate && candidate.id.startsWith("fake-")
    })

    // Sauvegarder UNIQUEMENT les matchings des vrais candidats dans la base de données
    const matchingsToCreate = realMatchings.map((match: any) => ({
      jobPostingId: jobPosting.id,
      candidateId: match.candidateId,
      matchScore: match.matchScore,
      aiReason: match.reason || null,
      skillsMatch: match.skillsMatch || 0,
      domainMatch: match.domainMatch || 0,
      experienceMatch: match.experienceMatch || null,
      status: "PENDING",
    }))

    // Supprimer les anciens matchings pour ce job posting
    if (matchingsToCreate.length > 0) {
      await prisma.candidateMatching.deleteMany({
        where: { jobPostingId: jobPosting.id },
      })

      // Créer les nouveaux matchings
      await prisma.candidateMatching.createMany({
        data: matchingsToCreate,
        skipDuplicates: true,
      })
    }

    // Récupérer les matchings des vrais candidats depuis la base de données
    const savedMatchings = await prisma.candidateMatching.findMany({
      where: { jobPostingId: jobPosting.id },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
            domains: true,
            matchingJobs: true,
            portfolio: {
              select: {
                id: true,
                avatarUrl: true,
                headline: true,
                bio: true,
                skills: true,
              },
              take: 1,
              orderBy: { updatedAt: "desc" },
            },
          },
        },
      },
      orderBy: { matchScore: "desc" },
      take: 50,
    })

    // Construire les matchings des vrais candidats
    const realMatches = savedMatchings.map(m => ({
      id: m.id,
      matchScore: m.matchScore,
      skillsMatch: m.skillsMatch,
      domainMatch: m.domainMatch,
      experienceMatch: m.experienceMatch,
      aiReason: m.aiReason,
      candidate: {
        id: m.candidate.id,
        firstName: m.candidate.firstName,
        lastName: m.candidate.lastName,
        email: m.candidate.email,
        skills: m.candidate.skills,
        domains: m.candidate.domains,
        matchingJobs: m.candidate.matchingJobs,
        portfolio: m.candidate.portfolio?.[0] ? {
          id: m.candidate.portfolio[0].id,
          avatarUrl: m.candidate.portfolio[0].avatarUrl,
          headline: m.candidate.portfolio[0].headline,
          bio: m.candidate.portfolio[0].bio,
          skills: m.candidate.portfolio[0].skills || [],
        } : null,
      },
    }))

    // Construire les matchings des faux candidats (pas stockés en DB)
    const fakeMatches = fakeMatchings.map((match: any) => {
      const candidate = allCandidates.find(c => c.id === match.candidateId)
      if (!candidate) return null

      return {
        id: match.candidateId,
        matchScore: match.matchScore,
        skillsMatch: match.skillsMatch || 0,
        domainMatch: match.domainMatch || 0,
        experienceMatch: match.experienceMatch || null,
        aiReason: match.reason || null,
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          skills: candidate.skills,
          domains: candidate.domains,
          matchingJobs: candidate.matchingJobs,
          portfolio: candidate.portfolio ? {
            id: candidate.portfolio.id || "portfolio-id",
            avatarUrl: candidate.portfolio.avatarUrl,
            headline: candidate.portfolio.headline,
            bio: candidate.portfolio.bio,
            skills: candidate.portfolio.skills || [],
          } : null,
        },
      }
    }).filter(Boolean)

    // Combiner les matchings réels et fictifs, triés par score décroissant
    const allMatches = [...realMatches, ...fakeMatches].sort((a, b) => b.matchScore - a.matchScore).slice(0, 20)

    return NextResponse.json({
      success: true,
      matches: allMatches,
      total: allMatches.length,
      fromCache: false,
    })
  } catch (error: any) {
    console.error("Erreur lors du matching:", error)
    return NextResponse.json(
      {
        error: "Erreur lors du matching",
        message: error.message || "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jobPostingId = searchParams.get("jobPostingId")

    if (!jobPostingId) {
      return NextResponse.json(
        { error: "jobPostingId est requis" },
        { status: 400 }
      )
    }

    // Vérifier que le job posting appartient à l'utilisateur
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      select: { userId: true },
    })

    if (!jobPosting || jobPosting.userId !== user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer les matchings
    const matchings = await prisma.candidateMatching.findMany({
      where: { jobPostingId },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
            domains: true,
            matchingJobs: true,
            portfolio: {
              select: {
                id: true,
                avatarUrl: true,
                headline: true,
                bio: true,
                skills: true,
              },
              take: 1,
              orderBy: { updatedAt: "desc" },
            },
          },
        },
      },
      orderBy: { matchScore: "desc" },
      take: 50,
    })

    // Formater les matchings pour la réponse
    const matches = matchings.map(m => ({
      id: m.id,
      matchScore: m.matchScore,
      skillsMatch: m.skillsMatch,
      domainMatch: m.domainMatch,
      experienceMatch: m.experienceMatch,
      aiReason: m.aiReason,
      candidate: {
        id: m.candidate.id,
        firstName: m.candidate.firstName,
        lastName: m.candidate.lastName,
        email: m.candidate.email,
        skills: m.candidate.skills,
        domains: m.candidate.domains,
        matchingJobs: m.candidate.matchingJobs,
        portfolio: m.candidate.portfolio?.[0] ? {
          id: m.candidate.portfolio[0].id,
          avatarUrl: m.candidate.portfolio[0].avatarUrl,
          headline: m.candidate.portfolio[0].headline,
          bio: m.candidate.portfolio[0].bio,
          skills: m.candidate.portfolio[0].skills || [],
        } : null,
      },
    }))

    return NextResponse.json({
      success: true,
      matches: matchings,
      total: matchings.length,
    })
  } catch (error: any) {
    console.error("Erreur lors de la récupération des matchings:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des matchings",
        message: error.message || "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}
