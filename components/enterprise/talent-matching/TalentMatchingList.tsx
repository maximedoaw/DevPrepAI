import { Users, TrendingUp, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TalentMatchingCard } from "./TalentMatchingCard"
import type { MatchedCandidate } from "./types"

interface TalentMatchingListProps {
  isLoading: boolean
  matchings: MatchedCandidate[]
  formatDomain: (domain: string) => string
  onResetFilters: () => void
  onCardClick?: (matching: MatchedCandidate) => void
}

export function TalentMatchingList({
  isLoading,
  matchings,
  formatDomain,
  onResetFilters,
  onCardClick,
}: TalentMatchingListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, index) => (
          <Card key={index} className="border border-emerald-200/50 dark:border-emerald-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (matchings.length === 0) {
    return (
      <Card className="border border-emerald-200/50 dark:border-emerald-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-12 text-center">
          <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Aucun talent trouvé
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Essayez de modifier vos critères de recherche
          </p>
          <Button
            onClick={onResetFilters}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          >
            Voir tous les talents
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {matchings.length} talent{matchings.length > 1 ? "s" : ""} matché{matchings.length > 1 ? "s" : ""}
          </p>
          <Badge variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            En direct
          </Badge>
        </div>
        {matchings.length > 7 && (
          <Badge variant="outline" className="border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20">
            <Lock className="h-3 w-3 mr-1" />
            Premium pour voir plus
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matchings.map((matching, index) => (
          <TalentMatchingCard
            key={matching.id}
            matching={matching}
            index={index}
            formatDomain={formatDomain}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </>
  )
}
