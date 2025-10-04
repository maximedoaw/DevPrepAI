import React from "react"
import { getAllQuizzes } from "@/constants/practise"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { seedPractiseFromConstants } from "@/actions/interview.action"

export default function SeedDatabase() {
  const {
    mutate: seed,
    isPending: loading,
    isSuccess: success,
    isError,
    error,
  } = useMutation({
    mutationKey: ["seed-practise-quizzes"],
    mutationFn: async () => {
      // Optionnel: prévisualiser côté client
      const preview = getAllQuizzes()
      if (!preview || preview.length === 0) {
        throw new Error("Aucune donnée à insérer")
      }
      return await seedPractiseFromConstants()
    },
  })

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold font-mono text-blue-700">Seed la base avec les exercices Practise</h2>
      <Button onClick={() => seed()} disabled={loading} className="px-8 py-3 font-mono">
        {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
        {loading ? "Insertion..." : "Insérer les exercices Practise"}
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