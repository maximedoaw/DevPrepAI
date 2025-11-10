"use client"

import { useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import {
  CalendarDays,
  Check,
  Clock,
  Loader2,
  MapPin,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
  User2,
  X,
} from "lucide-react"

import { useMeetings } from "@/hooks/use-meetings"
import type { MeetingListResult, MeetingWithRelations } from "@/actions/interview-meeting.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const statusOptions = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "PLANNED", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmé" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "CANCELLED", label: "Annulé" },
]

export function CandidateMeetings() {
  const { user, isLoading: userLoading } = useKindeBrowserClient()
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 5,
    status: "ALL" as "ALL" | "PLANNED" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
    jobPostingId: "ALL",
    search: "",
    upcomingOnly: true,
  })
  const [notesByMeeting, setNotesByMeeting] = useState<Record<string, string>>({})

  const {
    meetingsQuery,
    respondMeeting,
    respondMutation,
    upcomingCount,
  } = useMeetings({
    userId: user?.id,
    filters,
    enabled: !userLoading,
    mode: "candidate",
  })

  const meetings: MeetingWithRelations[] = meetingsQuery.data?.meetings ?? []
  const isInitialLoading = meetingsQuery.isPending && !meetingsQuery.data
  const isFetching = meetingsQuery.isFetching
  const fallbackPagination: MeetingListResult["pagination"] = {
    page: 1,
    pageSize: filters.pageSize,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  }
  const pagination = meetingsQuery.data?.pagination ?? fallbackPagination

  const jobChoices = useMemo(() => {
    const jobs = new Map<string, string>()
    meetings.forEach((meeting) => {
      jobs.set(meeting.job.id, meeting.job.title)
    })
    return Array.from(jobs.entries())
  }, [meetings])

  const handleRespond = (meetingId: string, accepted: boolean) => {
    const note = notesByMeeting[meetingId]?.trim() || undefined
    respondMeeting(
      { meetingId, accepted, notes: note },
      {
        onSuccess: () => {
          setNotesByMeeting((prev) => {
            const updated = { ...prev }
            delete updated[meetingId]
            return updated
          })
        },
      }
    )
  }

  const renderSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  )

  const renderMeetingCard = (meeting: (typeof meetings)[number]) => {
    const scheduledAt = new Date(meeting.scheduledAt)
    const isPast = scheduledAt.getTime() < Date.now()
    const isAwaitingResponse =
      meeting.status === "PLANNED" && !meeting.candidateRespondedAt
    const isProcessing = respondMutation.isPending && respondMutation.variables?.meetingId === meeting.id
    const noteValue = notesByMeeting[meeting.id] ?? ""

    return (
      <div
        key={meeting.id}
        className={cn(
          "rounded-xl border p-4 transition-colors",
          "border-slate-200 dark:border-slate-800",
          "bg-white dark:bg-slate-900/50"
        )}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {meeting.job.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {meeting.organizer.firstName} {meeting.organizer.lastName} · {meeting.organizer.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                <CalendarDays className="h-3 w-3" />
                {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(scheduledAt)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/30">
                <Clock className="h-3 w-3" />
                {meeting.durationMinutes ?? 45} min
              </span>
              {meeting.location && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/30">
                  <MapPin className="h-3 w-3" />
                  {meeting.location}
                </span>
              )}
              {meeting.meetingLink && (
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-teal-700 dark:border-teal-900/40 dark:bg-teal-900/20 dark:text-teal-200">
                  <PhoneCall className="h-3 w-3" />
                  Rendez-vous en visio
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-1 capitalize border text-xs",
                  meeting.status === "CONFIRMED"
                    ? "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                    : meeting.status === "CANCELLED"
                    ? "border-red-300 text-red-600 dark:border-red-800 dark:text-red-400"
                    : meeting.status === "COMPLETED"
                    ? "border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-300"
                    : "border-amber-300 text-amber-600 dark:border-amber-800 dark:text-amber-300"
                )}
              >
                {meeting.status.toLowerCase()}
              </span>
            </div>
            {meeting.publishedAt && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-300">
                Invitation envoyée le{" "}
                {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(meeting.publishedAt))}
              </p>
            )}
            <div className="text-xs text-slate-400 dark:text-slate-500">
              {formatDistanceToNow(scheduledAt, { addSuffix: true, locale: fr })}
            </div>
            {meeting.notes && (
              <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200">
                <p className="font-medium">Informations partagées</p>
                <p className="mt-1 whitespace-pre-wrap">{meeting.notes}</p>
              </div>
            )}
            {meeting.candidateNotes && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900/20 dark:text-slate-200">
                <p className="font-medium">Votre réponse</p>
                <p className="mt-1 whitespace-pre-wrap">{meeting.candidateNotes}</p>
              </div>
            )}
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3">
            {isAwaitingResponse ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-slate-500 dark:text-slate-400">
                    Votre réponse
                  </Label>
                  <Textarea
                    value={noteValue}
                    onChange={(event) => {
                      const value = event.target.value
                      setNotesByMeeting((prev) => ({
                        ...prev,
                        [meeting.id]: value,
                      }))
                    }}
                    placeholder="Ajoutez un message pour expliquer votre choix (optionnel)..."
                    className="min-h-[90px]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleRespond(meeting.id, true)}
                    disabled={isProcessing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Accepter
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRespond(meeting.id, false)}
                    disabled={isProcessing}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                {meeting.status === "CONFIRMED" && (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-4 w-4" />
                    Entretien confirmé
                  </div>
                )}
                {meeting.status === "CANCELLED" && (
                  <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                    <ShieldAlert className="h-4 w-4" />
                    Entretien annulé
                  </div>
                )}
                {meeting.candidateRespondedAt && (
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Réponse envoyée le{" "}
                    {new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(meeting.candidateRespondedAt))}
                  </p>
                )}
                {isPast && meeting.status === "PLANNED" && (
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                    Cet entretien est passé sans réponse.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-emerald-100/60 bg-white/80 dark:border-emerald-900/40 dark:bg-slate-900/70 shadow-lg">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
              Mes propositions d'entretiens
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Consultez vos invitations et répondez rapidement pour confirmer votre participation.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/10 dark:text-emerald-200">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Mise à jour automatique
          </div>
        </CardHeader>
      </Card>

      <Card className="border border-slate-200/70 bg-white/80 dark:border-slate-800/70 dark:bg-slate-900/70 shadow-lg">
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Rechercher
              </Label>
              <Input
                placeholder="Intitulé, recruteur..."
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                    page: 1,
                  }))
                }
                className="border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Statut
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value as typeof filters.status,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Offre
              </Label>
              <Select
                value={filters.jobPostingId}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    jobPostingId: value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Toutes les offres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Toutes les offres</SelectItem>
                  {jobChoices.map(([id, title]) => (
                    <SelectItem key={id} value={id}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-900/10">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
                  À venir uniquement
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-300">
                  {upcomingCount} entretien(s) en attente de réponse
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-emerald-200 bg-white dark:border-emerald-900/40 dark:bg-slate-900/50"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    upcomingOnly: !prev.upcomingOnly,
                    page: 1,
                  }))
                }
              >
                {filters.upcomingOnly ? "Actifs" : "Tous"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/70 bg-white/90 shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white">
              Propositions reçues
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Répondez aux recruteurs pour confirmer votre présence.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {isFetching && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Actualisation…
              </>
            )}
            <div className="flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Dernière mise à jour automatique
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInitialLoading ? (
            renderSkeleton()
          ) : meetings.length === 0 ? (
            <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/10 p-6 text-center text-emerald-700 dark:text-emerald-200">
              <User2 className="mx-auto h-10 w-10 opacity-80 mb-2" />
              <p className="font-medium">Aucune proposition pour le moment.</p>
              <p className="text-sm opacity-80">
                Vous serez notifié dès qu'une entreprise programmera un entretien.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {meetings.map(renderMeetingCard)}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                <div className="text-slate-600 dark:text-slate-400">
                  Page {pagination.page} sur {pagination.totalPages} • {pagination.total} entretien(s)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1 || isInitialLoading}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    className="border-slate-300 dark:border-slate-700"
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage || isInitialLoading}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    className="border-slate-300 dark:border-slate-700"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

