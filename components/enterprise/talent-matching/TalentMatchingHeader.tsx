import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface TalentMatchingHeaderProps {
  totalCandidates: number
}

export function TalentMatchingHeader({ totalCandidates }: TalentMatchingHeaderProps) {
  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">
          Trouvez les meilleurs talents
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          Connectez-vous avec des professionnels vérifiés prêts à transformer vos projets
        </p>
      </div>
    </div>
  )
}
