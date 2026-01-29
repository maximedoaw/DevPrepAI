import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Mail, MapPin, Briefcase, Award, TrendingUp, Target } from "lucide-react"
import type { MatchedCandidate } from "./types"
import { cn } from "@/lib/utils"

interface CandidateDetailModalProps {
    candidate: MatchedCandidate | null
    open: boolean
    onOpenChange: (open: boolean) => void
    formatDomain: (domain: string) => string
}

export function CandidateDetailModal({
    candidate,
    open,
    onOpenChange,
    formatDomain
}: CandidateDetailModalProps) {
    if (!candidate) return null

    const { candidate: c, matchScore, skillsMatch, domainMatch, aiReason } = candidate
    const initials = `${c.firstName?.[0] ?? ""}${c.lastName?.[0] ?? ""}`.trim() || "?"
    const portfolioUrl = c.portfolio?.id ? `/portfolio/${c.portfolio.id}` : null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-20 w-20 border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
                            <AvatarImage src={c.portfolio?.avatarUrl || undefined} alt={`${c.firstName} ${c.lastName}`} />
                            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-2xl font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                                {c.firstName} {c.lastName}
                            </DialogTitle>
                            {c.portfolio?.headline && (
                                <DialogDescription className="text-base mt-1 text-slate-600 dark:text-slate-400">
                                    {c.portfolio.headline}
                                </DialogDescription>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                <Mail className="h-4 w-4" />
                                {c.email}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Match Scores */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                            <Target className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Match Global</span>
                        </div>
                        <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                            {matchScore}%
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                            <Briefcase className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Compétences</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                            {skillsMatch}%
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Domaine</span>
                        </div>
                        <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                            {domainMatch}%
                        </div>
                    </div>
                </div>

                {/* AI Reason */}
                {aiReason && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                        <div className="flex items-start gap-2">
                            <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Analyse IA</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{aiReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                <Separator className="my-6" />

                {/* Bio */}
                {c.portfolio?.bio && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <span>À propos</span>
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.portfolio.bio}</p>
                    </div>
                )}

                {/* Domaines */}
                {c.domains.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Domaines d'expertise</h4>
                        <div className="flex flex-wrap gap-2">
                            {c.domains.map((domain) => (
                                <Badge
                                    key={domain}
                                    variant="secondary"
                                    className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1"
                                >
                                    {formatDomain(domain)}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Compétences */}
                {c.skills.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Compétences techniques</h4>
                        <div className="flex flex-wrap gap-2">
                            {c.skills.map((skill, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <Separator className="my-6" />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {portfolioUrl ? (
                        <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                            onClick={() => window.open(portfolioUrl, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Consulter le portfolio
                        </Button>
                    ) : (
                        <div className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-center text-sm text-slate-500 dark:text-slate-400">
                            Portfolio non disponible
                        </div>
                    )}
                    <Button
                        variant="outline"
                        className="flex-1 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Contacter
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
