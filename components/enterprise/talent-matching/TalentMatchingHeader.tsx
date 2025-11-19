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
        <Badge
          variant="outline"
          className="mb-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Marketplace de Talents Premium
        </Badge>
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">
          Trouvez les meilleurs talents
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          Connectez-vous avec des professionnels vérifiés prêts à transformer vos projets
        </p>
      </div>

      {/* Stats en haut */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-900/50 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalCandidates}+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Talents actifs</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-900/50 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">95%</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Taux de réussite</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-900/50 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">24h</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Temps de réponse</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-900/50 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">4.9/5</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Satisfaction client</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
