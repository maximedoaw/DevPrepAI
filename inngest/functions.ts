import { inngest } from "@/lib/inngest"
import { generateMatchings } from "@/scripts/generate-matchings"

/**
 * Fonction Inngest pour générer automatiquement les matchings
 * Exécutée tous les jours à minuit UTC
 */
export const generateMatchingsDaily = inngest.createFunction(
  {
    id: "generate-matchings-daily",
    name: "Générer les matchings quotidiennement",
  },
  {
    // Déclencheur cron : tous les jours à minuit UTC
    cron: "0 0 * * *",
  },
  async ({ event, step }) => {
    // Étape 1: Exécuter la génération des matchings
    const result = await step.run("generate-all-matchings", async () => {
      console.log("🕐 Démarrage du cron job de génération des matchings via Inngest...")
      console.log(`📅 Date: ${new Date().toISOString()}`)
      
      try {
        await generateMatchings()
        
        console.log("✅ Génération des matchings terminée avec succès")
        
        return {
          success: true,
          timestamp: new Date().toISOString(),
        }
      } catch (error: unknown) {
        console.error("❌ Erreur lors de la génération des matchings:", error)
        throw error
      }
    })

    return {
      success: result.success,
      timestamp: result.timestamp,
    }
  }
)

