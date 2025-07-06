import React from "react"
import { MOCK_INTERVIEWS } from "@/constants"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { seedMockInterviews } from "@/actions/interview.action"

export default function SeedDatabase() {
  const {
    mutate: seed,
    isPending: loading,
    isSuccess: success,
    isError,
    error,
  } = useMutation({
    mutationKey: ["seed-mock-interviews"],
    mutationFn: async () => {
      return await seedMockInterviews(MOCK_INTERVIEWS)
    },
  })

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold font-mono text-blue-700">Seed la base Quiz avec les interviews mock</h2>
      <Button onClick={() => seed()} disabled={loading} className="px-8 py-3 font-mono">
        {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
        {loading ? "Insertion..." : "Insérer les MOCK_INTERVIEWS"}
      </Button>
      {success && (
        <div className="flex items-center gap-2 text-emerald-700 font-mono">
          <CheckCircle2 className="h-5 w-5" /> Succès : Quiz insérés !
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-2 text-red-600 font-mono">
          <AlertTriangle className="h-5 w-5" /> Erreur : {(error as any)?.message || "Erreur inconnue"}
        </div>
      )}
    </div>
  )
} 