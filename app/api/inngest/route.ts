import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest"
import { generateMatchingsDaily } from "@/inngest/functions"
import { recommendationEngineRun, jobsRecommended, refreshDailyRecommendations } from "@/inngest/recommendations"

// Serve endpoint pour Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateMatchingsDaily,
    recommendationEngineRun,
    jobsRecommended,
    refreshDailyRecommendations
  ],
})
