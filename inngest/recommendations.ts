import { inngest } from "@/lib/inngest"
import prisma from "@/db/prisma"
import { GoogleGenAI } from "@google/genai"
import { PROMPTS } from "@/lib/prompts"
import { Domain, Difficulty, JobType, WorkMode } from "@prisma/client"

// Helper to get Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY missing")
  return new GoogleGenAI({ apiKey })
}

/**
 * Recommendation Engine: Generates Interview Recommendations (Quizzes)
 * Triggered after career plan generation.
 */
export const recommendationEngineRun = inngest.createFunction(
  { id: "recommendation.engine.run", name: "Generate Interview Recommendations" },
  { event: "recommendation.engine.run" },
  async ({ event, step }) => {
    const { userId } = event.data
    if (!userId) return { error: "No userId provided" }

    const user = await step.run("fetch-user-profile", async () => {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, careerProfile: true, role: true, domains: true }
      })
    })

    if (!user || !user.careerProfile) return { error: "User or Career Profile not found" }

    // 1. Analyze Plan for Difficulty Level & Specific Needs
    const analysis = await step.run("analyze-difficulty-ai", async () => {
      const ai = getGeminiClient()
      // We assume the prompt returns a JSON with "difficulty": "JUNIOR" | "MID" | "SENIOR"
      // and potentially other filters.
      // Modifying the prompt usage slightly to ensure we get this.
      const prompt = PROMPTS.generateInterviewRecommendations({ careerProfile: user.careerProfile })
      const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
      
      const text = response.text || ""
      let jsonText = text.trim()
      const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/)
      if (jsonMatch) jsonText = jsonMatch[1].trim()
      
      try {
        const parsed = JSON.parse(jsonText);
        // Default to JUNIOR if not found or invalid
        const validDifficulties = ["JUNIOR", "MID", "SENIOR"];
        let difficulty = "JUNIOR";
        
        // Simple heuristic: check if AI suggested difficulty in ANY recommendation
        if (parsed.recommendations && parsed.recommendations.length > 0) {
            const levels = parsed.recommendations.map((r: any) => r.difficulty).filter((d: string) => validDifficulties.includes(d));
            if (levels.length > 0) difficulty = levels[0]; // Take the first one as primary level
        }
        
        return { difficulty: difficulty as Difficulty, raw: parsed }
      } catch (e) {
        return { difficulty: "JUNIOR" as Difficulty, raw: null } 
      }
    })

    // 2. Exact DB Matching
    const recommendedQuizzes = await step.run("fetch-db-quizzes-strict", async () => {
        // We use the User's explicit domains AND the AI-estimated difficulty
        const userDomains = user.domains || [];
        const targetDifficulty = analysis.difficulty;

        console.log(`🔍 Matching Quizzes for User ${userId}: Domains=[${userDomains.join(', ')}], Level=${targetDifficulty}`);

        // If user has no domains, we can't do strict matching, falback to broad
        if (userDomains.length === 0) {
            return await prisma.quiz.findMany({
                where: { difficulty: targetDifficulty },
                take: 6,
                orderBy: { createdAt: 'desc' }
            })
        }

        const quizzes = await prisma.quiz.findMany({
            where: {
                domain: { in: userDomains }, // Strict Domain Match
                difficulty: targetDifficulty // Strict Level Match (or close?)
            },
            take: 6,
            orderBy: { createdAt: 'desc' }
        })
        
        // If not enough strict matches, relax difficulty only
        if (quizzes.length < 3) {
             const moreQuizzes = await prisma.quiz.findMany({
                where: {
                    domain: { in: userDomains },
                    id: { notIn: quizzes.map(q => q.id) }
                },
                take: 6 - quizzes.length,
                orderBy: { createdAt: 'desc' }
            })
            return [...quizzes, ...moreQuizzes];
        }

        return quizzes
    })

    await step.run("save-recommendations", async () => {
      if (recommendedQuizzes.length > 0) {
        await prisma.recommendation.create({
            data: {
                userId,
                source: "AI_CAREER_PLAN_STRICT",
                content: JSON.stringify(recommendedQuizzes.map(q => ({
                    id: q.id,
                    title: q.title, 
                    type: q.type, // 'TECHNICAL', 'MOCK_INTERVIEW' ...
                    domain: q.domain,
                    difficulty: q.difficulty,
                    image: q.image
                }))),
                viewed: false,
                weight: 1.0,
                relatedItems: JSON.stringify({ type: "QUIZ_SUGGESTIONS", level: analysis.difficulty })
            }
        })
      }
    })

    return { success: true, count: recommendedQuizzes.length, level: analysis.difficulty }
  }
)


/**
 * Jobs Recommendation: Generates Job Search Suggestions
 * Triggered after career plan generation.
 */
export const jobsRecommended = inngest.createFunction(
    { id: "jobs.recommended", name: "Generate Job Recommendations" },
    { event: "jobs.recommended" },
    async ({ event, step }) => {
      const { userId } = event.data
      if (!userId) return { error: "No userId provided" }
  
      const user = await step.run("fetch-user-profile-jobs", async () => {
        return await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, careerProfile: true, domains: true }
        })
      })
  
      if (!user || !user.careerProfile) return { error: "User or Career Profile not found" }
  
      const aiJobCriteria = await step.run("analyze-job-needs-ai", async () => {
        const ai = getGeminiClient()
        const prompt = PROMPTS.generateJobRecommendations({ careerProfile: user.careerProfile })
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })
        
        const text = response.text || ""
        let jsonText = text.trim()
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/)
        if (jsonMatch) jsonText = jsonMatch[1].trim()
        
        try {
            return JSON.parse(jsonText)
        } catch (e) {
            return { jobTitles: [], searchKeywords: [] }
        }
      })
  
      const matchingJobs = await step.run("fetch-db-jobs-strict", async () => {
        const userDomains = user.domains || [];
        
        // Keywords from AI
        const keywords = [
            ...(aiJobCriteria.jobTitles || []),
            ...(aiJobCriteria.searchKeywords || [])
        ].filter(k => k.length > 3).slice(0, 5)

        // Ensure we retrieve something even if DB is small
        const jobs = await prisma.jobPosting.findMany({
            where: {
                isActive: true,
                OR: [
                    // Match User Domains (Strong signal)
                    ...(userDomains.length > 0 ? [{ domains: { hasSome: userDomains } }] : []),
                    // Match AI Keywords (Contextual signal)
                    ...keywords.map(keyword => ({
                        OR: [
                            { title: { contains: keyword, mode: 'insensitive' as const } },
                            { description: { contains: keyword, mode: 'insensitive' as const } }
                        ]
                    }))
                ]
            },
            take: 6,
            orderBy: { createdAt: 'desc' }
        })
        
        return jobs
      })
  
      await step.run("save-job-recommendations", async () => {
        if (matchingJobs.length > 0) {
          await prisma.recommendation.create({
              data: {
                  userId,
                  source: "AI_CAREER_PLAN_JOBS_STRICT",
                  content: JSON.stringify(matchingJobs.map(j => ({
                      id: j.id,
                      title: j.title,
                      company: j.companyName,
                      location: j.location,
                      type: j.type,
                      salaryMin: j.salaryMin,
                      salaryMax: j.salaryMax,
                      currency: j.currency,
                      logo: j.metadata ? (j.metadata as any).logoUrl : null 
                  }))),
                  viewed: false,
                  weight: 0.9,
                  relatedItems: JSON.stringify({ type: "JOB_SUGGESTIONS" })
              }
          })
        }
      })
  
      return { success: true, count: matchingJobs.length }
    }
  )


/**
 * Daily Cron: Refresh Recommendations for Active Users
 */
export const refreshDailyRecommendations = inngest.createFunction(
    { id: "refresh-daily-recommendations", name: "Refresh Daily Recommendations" },
    { cron: "0 0 * * *" }, // Every day at midnight
    async ({ step }) => {
        const users = await step.run("fetch-active-candidates", async () => {
            return await prisma.user.findMany({
                where: {
                    role: { in: ['CANDIDATE', 'CAREER_CHANGER'] },
                    careerProfileTestStatus: 'DONE' 
                },
                select: { id: true },
                take: 100 
            })
        })

        if (users.length > 0) {
            const events = users.flatMap(user => [
                { name: "recommendation.engine.run", data: { userId: user.id } },
                { name: "jobs.recommended", data: { userId: user.id } }
            ])
            
            await step.sendEvent("trigger-user-refreshes", events)
        }

        return { success: true, triggeredCount: users.length }
    }
)
