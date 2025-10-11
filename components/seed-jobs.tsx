// components/seed-jobs.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useJobMutations, useJobQueries } from "@/hooks/use-job-queries"
import { Database, RefreshCw, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Difficulty } from "@prisma/client"

export function SeedJobs() {
  const { seedJobsMutation } = useJobMutations()
  const { jobStats, loadingStats, refetchJobs } = useJobQueries()
  const [isResetting, setIsResetting] = useState(false)

  const handleSeedJobs = async () => {
    try {
      await seedJobsMutation.mutateAsync()
      await refetchJobs()
    } catch (error: any) {
      console.error("Seed jobs error:", error)
    }
  }

  const handleResetJobs = async () => {
    setIsResetting(true)
    try {
      // Cette fonction devrait être implémentée dans job.action.ts
      // Pour l'instant, on simule avec un timeout
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.info("Fonction de réinitialisation à implémenter dans job.action.ts")
    } catch (error) {
      toast.error("Erreur lors de la réinitialisation")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gestion des Données
        </CardTitle>
        <CardDescription>
          Peupler ou réinitialiser la base de données de démonstration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Jobs actifs</div>
            <div className="text-2xl font-bold">
              {loadingStats ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                jobStats?.totalJobs || 0
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Statut</div>
            <div>
              {jobStats && jobStats.totalJobs > 0 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Peuplée
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Vide
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Détails des statistiques */}
        {jobStats && jobStats.totalJobs > 0 && (
          <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
            <div className="flex justify-between">
              <span>CDI:</span>
              <span>{jobStats.byType.find((t : any) => t.type === "CDI")?._count.id || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Remote:</span>
              <span>{jobStats.byWorkMode.find((w : any) => w.workMode === "REMOTE")?._count.id || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Senior:</span>
              <span>{jobStats.byExperience.find((e : any) => e.experienceLevel === Difficulty.SENIOR)?._count.id || 0}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleSeedJobs}
            disabled={seedJobsMutation.isPending}
            className="w-full"
            variant="default"
          >
            {seedJobsMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                {jobStats?.totalJobs ? "Repeupler la Base" : "Peupler la Base"}
              </>
            )}
          </Button>

          {jobStats && jobStats.totalJobs > 0 && (
            <Button
              onClick={handleResetJobs}
              disabled={isResetting}
              variant="outline"
              className="w-full"
            >
              {isResetting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Réinitialiser la Base
            </Button>
          )}
        </div>

        {/* Informations */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          <p>• Crée 10 jobs de démonstration réalistes</p>
          <p>• Inclut CDI, MISSION, STAGE, FULL_TIME</p>
          <p>• Remote, Hybride et Présentiel</p>
          <p>• Salaires en FCFA</p>
          {jobStats && jobStats.totalJobs > 0 && (
            <p className="text-green-600 font-medium">
              ✓ Base peuplée avec {jobStats.totalJobs} jobs
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}