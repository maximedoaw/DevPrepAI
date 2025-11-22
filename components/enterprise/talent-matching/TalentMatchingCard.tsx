import { Eye, Code, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { MatchedCandidate } from "./types"

interface TalentMatchingCardProps {
  matching: MatchedCandidate
  index: number
  formatDomain: (domain: string) => string
}

export function TalentMatchingCard({ matching, index, formatDomain }: TalentMatchingCardProps) {
  const isBlurred = index >= 10
  const candidate = matching.candidate
  const initials = `${candidate.firstName?.[0] ?? ""}${candidate.lastName?.[0] ?? ""}`.trim() || "?"
  const avatarUrl = candidate.portfolio?.avatarUrl || undefined

  return (
    <Card
      className={cn(
        "border transition-all duration-300 hover:shadow-lg dark:hover:shadow-lg group cursor-pointer overflow-hidden",
        isBlurred
          ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-900/10"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 backdrop-blur-sm hover:border-slate-300 dark:hover:border-slate-600",
        "relative rounded-xl"
      )}
    >
      {isBlurred && (
        <div className="absolute inset-0 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 z-10 flex items-center justify-center rounded-2xl">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
            <p className="text-base font-semibold text-amber-700 dark:text-amber-300 mb-2">
              Accès Premium requis
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
              Passez Premium pour découvrir ce talent
            </p>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Voir les offres Premium
            </Button>
          </div>
        </div>
      )}

      <CardContent className={cn("p-6", isBlurred && "blur-sm")}>
        {/* Header avec avatar et infos */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-14 w-14 border-2 border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
            <AvatarImage src={avatarUrl} alt={`${candidate.firstName} ${candidate.lastName}`} />
            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-base">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base text-slate-900 dark:text-white truncate">
              {candidate.firstName} {candidate.lastName}
            </h3>
            {candidate.portfolio?.headline && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {candidate.portfolio.headline}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {candidate.portfolio?.bio && !isBlurred && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
            {candidate.portfolio.bio}
          </p>
        )}

        {/* Domaines et Compétences - Version minimaliste */}
        {(candidate.domains.length > 0 || candidate.skills.length > 0) && !isBlurred && (
          <div className="mb-4 space-y-3">
            {/* Domaines */}
            {candidate.domains.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.domains.slice(0, 3).map((domain) => (
                    <Badge
                      key={domain}
                      variant="outline"
                      className="text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50"
                    >
                      {formatDomain(domain)}
                    </Badge>
                  ))}
                  {candidate.domains.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500"
                    >
                      +{candidate.domains.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Compétences */}
            {candidate.skills.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.slice(0, 5).map((skill, skillIndex) => (
                    <Badge
                      key={skillIndex}
                      variant="outline"
                      className="text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.length > 5 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500"
                    >
                      +{candidate.skills.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex-1 border-slate-200 dark:border-slate-700 transition-all",
              isBlurred
                ? "text-slate-400 dark:text-slate-600"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
            )}
            disabled={isBlurred}
          >
            <Eye className="h-4 w-4 mr-2" />
            Profil
          </Button>
          {!isBlurred && (
            <Button
              size="sm"
              className="flex-1 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900"
            >
              Contacter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
