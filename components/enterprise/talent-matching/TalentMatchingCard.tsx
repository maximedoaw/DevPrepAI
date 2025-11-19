import { Eye, Star, MapPin, Code, Lock } from "lucide-react"
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
        "border transition-all duration-300 hover:shadow-2xl dark:hover:shadow-2xl group cursor-pointer overflow-hidden",
        isBlurred
          ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-900/10"
          : "border-emerald-200/50 dark:border-emerald-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:border-emerald-300 dark:hover:border-emerald-700",
        "relative rounded-2xl"
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
      
      {/* Badge de score de matching */}
      {!isBlurred && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg">
            {Math.round(matching.matchScore)}% match
          </Badge>
        </div>
      )}

      <CardContent className={cn("p-6", isBlurred && "blur-sm")}>
        {/* Header avec avatar et infos */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg group-hover:scale-105 transition-transform">
            <AvatarImage src={avatarUrl} alt={`${candidate.firstName} ${candidate.lastName}`} />
            <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {candidate.firstName} {candidate.lastName}
            </h3>
            {candidate.portfolio?.headline && (
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {candidate.portfolio.headline}
              </p>
            )}
          </div>
        </div>

        {/* Raison du matching par l'IA */}
        {matching.aiReason && !isBlurred && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              Pourquoi ce candidat correspond :
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {matching.aiReason}
            </p>
          </div>
        )}

        {/* Bio */}
        {candidate.portfolio?.bio && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
            {candidate.portfolio.bio}
          </p>
        )}

        {/* Stats de matching */}
        {!isBlurred && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {Math.round(matching.skillsMatch)}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Compétences</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {Math.round(matching.domainMatch)}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Domaines</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {candidate.matchingJobs}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Matchs</div>
            </div>
          </div>
        )}

        {/* Domaines */}
        {candidate.domains.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {candidate.domains.slice(0, 2).map((domain) => (
                <Badge
                  key={domain}
                  variant="outline"
                  className="text-xs border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20"
                >
                  {formatDomain(domain)}
                </Badge>
              ))}
              {candidate.domains.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                >
                  +{candidate.domains.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Compétences */}
        {candidate.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <Code className="h-3 w-3" />
              Expertise
            </p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 4).map((skill, skillIndex) => (
                <Badge
                  key={skillIndex}
                  variant="outline"
                  className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/20"
                >
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-xs border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                >
                  +{candidate.skills.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex-1 border-emerald-200 dark:border-emerald-800 transition-all",
              isBlurred
                ? "text-slate-400 dark:text-slate-600"
                : "text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300"
            )}
            disabled={isBlurred}
          >
            <Eye className="h-4 w-4 mr-2" />
            Profil
          </Button>
          {!isBlurred && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
            >
              Contacter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
