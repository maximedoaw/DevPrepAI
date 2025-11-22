import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest"
import { generateMatchingsDaily } from "@/inngest/functions"

// Serve endpoint pour Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateMatchingsDaily,
  ],
})

