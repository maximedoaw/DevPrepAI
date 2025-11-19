"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  Clock,
  Link2,
  Loader2,
  MapPin,
  Plus,
  Send,
  User,
  Users,
  Video,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  type MeetingWithRelations,
  type ScheduleInterviewMeetingInput,
  type UpdateInterviewMeetingInput,
} from "@/actions/interview-meeting.action"
import { useMeetings, useMeetingsAction } from "@/hooks/useMeetingAction"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InterviewsTabProps {
  onScheduleInterview?: () => void
}

const statusFilterOptions = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "PLANNED", label: "Planifié" },
  { value: "CONFIRMED", label: "Confirmé" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "CANCELLED", label: "Annulé" },
]

export function InterviewsTab({ onScheduleInterview }: InterviewsTabProps) {
  const { user, isLoading: userLoading } = useKindeBrowserClient()

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 5,
    status: "ALL" as "ALL" | "PLANNED" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
    jobPostingId: "ALL",
    search: "",
    upcomingOnly: false,
    publishedOnly: false,
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ScheduleInterviewMeetingInput>({
    organizerId: "",
    jobPostingId: "",
    candidateId: "",
    applicationId: undefined,
    scheduledAt: "",
    durationMinutes: 45,
    meetingLink: "",
    location: "",
    notes: "",
    status: "PLANNED",
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("09:00")
  const { createInstantMeeting } = useMeetingsAction()

  const {
    meetingsQuery,
    contextQuery,
    scheduleMutation,
    updateMutation,
    cancelMutation,
    deleteMutation,
    publishMutation,
    scheduleMeeting,
    updateMeeting,
    cancelMeeting,
    deleteMeeting,
    publishMeeting,
    upcomingCount,
  } = useMeetings({
    userId: user?.id,
    filters,
    enabled: !userLoading,
    mode: "organizer",
  })

  const contextData = contextQuery.data
  const contextLoading = contextQuery.isLoading

const meetingsData = meetingsQuery.data
const meetingsLoading = meetingsQuery.isPending
const meetingsFetching = meetingsQuery.isFetching
const meetings: MeetingWithRelations[] = meetingsData?.meetings ?? []
const previousStatusesRef = useRef(
  new Map<string, { status: MeetingWithRelations["status"]; respondedAt?: string | Date | null }>()
)

  useEffect(() => {
    if (!meetings || meetings.length === 0) return

    meetings.forEach((meeting) => {
      const prev = previousStatusesRef.current.get(meeting.id)
      const currentStatus = meeting.status
      const respondedAt = meeting.candidateRespondedAt

      if (
        prev &&
        prev.status !== currentStatus &&
        respondedAt &&
        (currentStatus === "CONFIRMED" || currentStatus === "CANCELLED")
      ) {
        if (currentStatus === "CONFIRMED") {
          toast.success(
            `${meeting.candidate.firstName ?? ""} ${meeting.candidate.lastName ?? ""} a confirmé l'entretien`
          )
        } else if (currentStatus === "CANCELLED") {
          toast.error(
            `${meeting.candidate.firstName ?? ""} ${meeting.candidate.lastName ?? ""} a refusé la proposition`
          )
        }
      }

      previousStatusesRef.current.set(meeting.id, {
        status: currentStatus,
        respondedAt,
      })
    })
  }, [meetings])

const pagination =
  meetingsData?.pagination ?? {
    page: 1,
    pageSize: filters.pageSize,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  }

  const selectedJob = useMemo(() => {
    if (!contextData || !formData.jobPostingId) return undefined
    return contextData.jobs.find((job) => job.id === formData.jobPostingId)
  }, [contextData, formData.jobPostingId])

  const candidateOptions = useMemo(() => {
    if (!selectedJob) return []
    return selectedJob.candidates
  }, [selectedJob])

  const stats = useMemo(() => {
    const now = new Date()

    const upcoming = meetings.filter(
      (meeting) =>
        meeting.status !== "CANCELLED" && new Date(meeting.scheduledAt) >= now
    )

    const thisWeek = meetings.filter((meeting) => {
      const date = new Date(meeting.scheduledAt)
      const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 7 && meeting.status !== "CANCELLED"
    })

    const completed = meetings.filter(
      (meeting) => meeting.status === "COMPLETED"
    )

    return {
      upcomingCount: upcoming.length,
      thisWeekCount: thisWeek.length,
      completedCount: completed.length,
    }
  }, [meetings])

  const handleCopyMeetingLink = useCallback((meetingId: string) => {
    if (typeof window === "undefined") return
    const meetingUrl = `${window.location.origin}/meetings/${meetingId}`
    void navigator.clipboard.writeText(meetingUrl).then(() => {
      toast.success("Lien de l'appel copié dans le presse-papiers.")
    })
  }, [])

  const resetForm = () => {
    setSelectedDate(undefined)
    setSelectedTime("09:00")
    setFormData((prev) => ({
      ...prev,
      organizerId: user?.id ?? "",
      jobPostingId: "",
      candidateId: "",
      applicationId: undefined,
      scheduledAt: "",
      meetingLink: "",
      location: "",
      notes: "",
      durationMinutes: 45,
      status: "PLANNED",
    }))
  }

  const handleOpenDialog = () => {
    if (!user?.id) {
      toast.error("Identifiant utilisateur introuvable.")
      return
    }

    setDialogMode("create")
    setEditingMeetingId(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditMeeting = (meeting: typeof meetings[number]) => {
    setDialogMode("edit")
    setEditingMeetingId(meeting.id)
    const meetingDate =
      meeting.scheduledAt instanceof Date
        ? meeting.scheduledAt
        : new Date(meeting.scheduledAt)
    const scheduledIso = meetingDate.toISOString().slice(0, 16)
    const timeString = `${String(meetingDate.getHours()).padStart(2, "0")}:${String(
      meetingDate.getMinutes()
    ).padStart(2, "0")}`

    setSelectedDate(meetingDate)
    setSelectedTime(timeString)
    setFormData({
      organizerId: meeting.organizerId,
      jobPostingId: meeting.jobPostingId,
      candidateId: meeting.candidateId,
      applicationId: meeting.applicationId ?? undefined,
      scheduledAt: scheduledIso,
      durationMinutes: meeting.durationMinutes ?? 45,
      meetingLink: meeting.meetingLink ?? "",
      location: meeting.location ?? "",
      notes: meeting.notes ?? "",
      status: meeting.status ?? "PLANNED",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.jobPostingId || !formData.candidateId || !formData.scheduledAt) {
      toast.error("Veuillez renseigner l'offre, le candidat et la date de l'entretien.")
      return
    }

    if (dialogMode === "create") {
      scheduleMeeting(
        {
          ...formData,
          organizerId: user?.id ?? "",
          applicationId: formData.applicationId || undefined,
          durationMinutes: formData.durationMinutes || 45,
          status: formData.status ?? "PLANNED",
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false)
            resetForm()
            onScheduleInterview?.()
          },
        }
      )
    } else if (dialogMode === "edit" && editingMeetingId) {
      const payload: UpdateInterviewMeetingInput = {
        jobPostingId: formData.jobPostingId,
        candidateId: formData.candidateId,
        applicationId: formData.applicationId ?? null,
        scheduledAt: formData.scheduledAt,
        durationMinutes: formData.durationMinutes ?? 45,
        meetingLink: formData.meetingLink ?? null,
        location: formData.location ?? null,
        notes: formData.notes ?? null,
        status: formData.status ?? "PLANNED",
      }
      updateMeeting(
        { meetingId: editingMeetingId, data: payload },
        {
          onSuccess: () => {
            setIsDialogOpen(false)
            setEditingMeetingId(null)
            setDialogMode("create")
            resetForm()
          },
        }
      )
    }
  }

  const handleCancelMeeting = (meetingId: string) => {
    cancelMeeting(
      { meetingId },
      {
        onSuccess: () => {
          toast.success("Entretien annulé")
        },
      }
    )
  }

  const handleDeleteMeeting = (meetingId: string) => {
    const confirmed = window.confirm("Supprimer définitivement cet entretien ?")
    if (!confirmed) return
    deleteMeeting(meetingId, {
      onSuccess: () => {
        toast.success("Entretien supprimé")
      },
    })
  }

  const renderMeetings = () => {
    if (meetingsLoading && !meetingsData) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )
    }

    if (meetings.length === 0) {
      return (
        <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/10 p-6 text-center text-emerald-700 dark:text-emerald-200">
          <Video className="mx-auto h-10 w-10 opacity-80 mb-2" />
          <p className="font-medium">Aucun entretien programmé pour le moment.</p>
          <p className="text-sm opacity-80">
            Planifiez votre premier entretien pour suivre vos échanges avec les candidats.
          </p>
        </div>
      )
    }

          return (
            <div className="space-y-3">
              {meetings.map((meeting) => {
                const meetingDate = new Date(meeting.scheduledAt)
                const isPast = meetingDate.getTime() < Date.now()
                const canJoin = meetingDate.getTime() <= Date.now()
                const isPublishing =
                  publishMutation.isPending &&
                  (publishMutation.variables as string | undefined) === meeting.id

          const initials = `${meeting.candidate.firstName?.[0] ?? ""}${meeting.candidate.lastName?.[0] ?? ""}`.trim()

          return (
            <div
              key={meeting.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                "border-slate-200 dark:border-slate-800",
                "bg-white dark:bg-slate-900/50"
              )}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Avatar className="h-12 w-12 border border-emerald-100 dark:border-emerald-900/40">
                    <AvatarImage src={undefined} alt="candidate avatar" />
                    <AvatarFallback>{initials || <User className="h-5 w-5" />}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {meeting.candidate.firstName} {meeting.candidate.lastName}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs border-slate-200 dark:border-slate-700",
                          meeting.isPublished
                            ? "text-emerald-600 dark:text-emerald-300"
                            : "text-amber-600 dark:text-amber-300"
                        )}
                      >
                        {meeting.isPublished ? "Envoyé" : "Brouillon"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize border-emerald-200 dark:border-emerald-800",
                          meeting.status === "CANCELLED"
                            ? "text-red-600 dark:text-red-400"
                            : meeting.status === "COMPLETED"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-emerald-700 dark:text-emerald-300"
                        )}
                      >
                        {meeting.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {meeting.job.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                        <CalendarDays className="h-3 w-3" />
                        {format(meetingDate, "dd MMM yyyy - HH:mm", { locale: fr })}
                      </span>
                      {meeting.durationMinutes && (() => {
                        const hours = Math.floor(meeting.durationMinutes / 60)
                        const minutes = meeting.durationMinutes % 60
                        const durationText = hours > 0 
                          ? minutes > 0 
                            ? `${hours}h ${minutes}min`
                            : `${hours}h`
                          : `${minutes}min`
                        return (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/30">
                            <Clock className="h-3 w-3" />
                            {durationText}
                          </span>
                        )
                      })()}
                      {meeting.location && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/30">
                          <MapPin className="h-3 w-3" />
                          {meeting.location}
                        </span>
                      )}
                      {meeting.meetingLink && (
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                        >
                          <Link2 className="h-3 w-3" />
                          Lien visio
                        </a>
                      )}
                    </div>
                    {meeting.isPublished && meeting.publishedAt && (
                      <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-300">
                        Envoyé le{" "}
                        {format(new Date(meeting.publishedAt), "dd MMM yyyy à HH:mm", {
                          locale: fr,
                        })}
                      </p>
                    )}
                    {meeting.candidateRespondedAt && (
                      <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                        Réponse du candidat le{" "}
                        {format(new Date(meeting.candidateRespondedAt), "dd MMM yyyy à HH:mm", {
                          locale: fr,
                        })}
                      </p>
                    )}
                    {meeting.candidateNotes && (
                      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200">
                        <p className="font-medium text-slate-700 dark:text-slate-100">
                          Message du candidat
                        </p>
                        <p className="mt-1 whitespace-pre-wrap">{meeting.candidateNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Users className="h-3.5 w-3.5" />
                      {meeting.application
                        ? `Candidature: ${meeting.application.status}`
                        : "Candidat invité"}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        isPast
                          ? "border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                          : "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                      )}
                    >
                      {isPast ? "Entretien passé" : "À venir"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canJoin ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20 dark:text-emerald-300"
                        asChild
                      >
                        <Link href={`/meetings/${meeting.id}`} prefetch={false}>
                          Rejoindre l'appel
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                      >
                        À venir
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/40"
                      onClick={() => handleCopyMeetingLink(meeting.id)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copier le lien
                    </Button>
                    {!meeting.isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                        onClick={() => publishMeeting(meeting.id)}
                        disabled={isPublishing}
                      >
                        {isPublishing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                      onClick={() => handleEditMeeting(meeting)}
                    >
                      Modifier
                    </Button>
                    {meeting.status !== "CANCELLED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300"
                        onClick={() => handleCancelMeeting(meeting.id)}
                        disabled={cancelMutation.isPending}
                      >
                        Annuler
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 dark:border-red-800 dark:text-red-400"
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (userLoading) {
    return (
      <Card className="border border-emerald-100/60 bg-white/80 dark:border-emerald-900/40 dark:bg-slate-900/70 shadow-lg">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-10 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-emerald-100 dark:border-emerald-900/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
          Gestion des entretiens
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Planifiez vos échanges, suivez les candidats rencontrés et anticipez vos prochaines sessions.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={createInstantMeeting}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
            >
              <Video className="mr-2 h-4 w-4" />
              Réunion instantanée
            </Button>
            <Button
              onClick={handleOpenDialog}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Programmer un entretien
            </Button>
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
                placeholder="Nom, email ou intitulé..."
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
                  {statusFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Offre d'emploi
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
                  {(contextData?.jobs ?? []).map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-900/10">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
                  Uniquement les à venir
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-300">
                  {upcomingCount} entretien(s) programmés
                </p>
              </div>
              <Switch
                checked={filters.upcomingOnly}
                onCheckedChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    upcomingOnly: value,
                    page: 1,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Voir seulement les propositions envoyées
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Masque les brouillons internes.
                </p>
              </div>
              <Switch
                checked={filters.publishedOnly}
                onCheckedChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    publishedOnly: value,
                    page: 1,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-emerald-100/70 dark:border-emerald-900/30 bg-white/90 dark:bg-slate-900/70 shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/40">
              <CalendarDays className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">À venir</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.upcomingCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-100/70 dark:border-emerald-900/30 bg-white/90 dark:bg-slate-900/70 shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/40">
              <Clock className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cette semaine</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.thisWeekCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-100/70 dark:border-emerald-900/30 bg-white/90 dark:bg-slate-900/70 shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-teal-100 p-3 dark:bg-teal-900/40">
              <CheckCircle2 className="h-6 w-6 text-teal-600 dark:text-teal-300" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Finalisés</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.completedCount}
              </p>
            </div>
      </CardContent>
    </Card>
      </div>

      <Card className="border border-slate-200/70 bg-white/90 shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white">
              Entretiens programmés
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Consultez l'ensemble de vos rendez-vous avec les candidats.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {meetingsFetching && (
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Mise à jour…
              </div>
            )}
            <Badge variant="outline" className="border-emerald-200 text-emerald-600 dark:border-emerald-900 dark:text-emerald-300">
              {upcomingCount} entretien(s) à venir
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderMeetings()}
          {meetings.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/50">
              <div className="text-slate-600 dark:text-slate-400">
                Page {pagination.page} sur {pagination.totalPages} • {pagination.total} entretien(s)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || meetingsLoading || meetingsFetching}
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
                  disabled={!pagination.hasNextPage || meetingsLoading || meetingsFetching}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border border-emerald-100 dark:border-emerald-900/40 max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900 dark:text-white">
              {dialogMode === "create" ? "Programmer un entretien" : "Modifier l'entretien"}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Définissez l'offre concernée, le candidat et la date de passage.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 pr-2 -mr-2 min-h-0">
            {contextLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Offre d'emploi
                  </Label>
                  <Select
                    value={formData.jobPostingId}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        jobPostingId: value,
                        candidateId: "",
                        applicationId: undefined,
                      }))
                    }}
                  >
                    <SelectTrigger className="border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Sélectionner une offre" />
                    </SelectTrigger>
                    <SelectContent>
                      {(contextData?.jobs || []).map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-slate-200 dark:border-slate-700",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date)
                          if (date) {
                            const time = selectedTime || "09:00"
                            const [hours, minutes] = time.split(":")
                            const datetime = new Date(date)
                            datetime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
                            setFormData((prev) => ({
                              ...prev,
                              scheduledAt: datetime.toISOString().slice(0, 16),
                            }))
                          }
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Heure
                  </Label>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(event) => {
                      const time = event.target.value
                      setSelectedTime(time)
                      if (selectedDate) {
                        const [hours, minutes] = time.split(":")
                        const datetime = new Date(selectedDate)
                        datetime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
                        setFormData((prev) => ({
                          ...prev,
                          scheduledAt: datetime.toISOString().slice(0, 16),
                        }))
                      }
                    }}
                    className="border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Candidat
                  </Label>
                  <Select
                    value={formData.candidateId}
                    onValueChange={(value) => {
                      const candidate = candidateOptions.find(
                        (option) => option.user.id === value
                      )
                      setFormData((prev) => ({
                        ...prev,
                        candidateId: value,
                        applicationId: candidate?.applicationId,
                      }))
                    }}
                    disabled={!selectedJob || candidateOptions.length === 0}
                  >
                    <SelectTrigger className="border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder={selectedJob ? "Choisir un candidat" : "Sélectionnez d'abord une offre"} />
                    </SelectTrigger>
                    <SelectContent>
                      {candidateOptions.map((candidate) => {
                        const initials = `${candidate.user.firstName?.[0] ?? ""}${candidate.user.lastName?.[0] ?? ""}`.trim() || "?"
                        return (
                          <SelectItem key={candidate.user.id} value={candidate.user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border border-emerald-200 dark:border-emerald-800">
                                <AvatarImage src={undefined} alt={`${candidate.user.firstName} ${candidate.user.lastName}`} />
                                <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-medium">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {candidate.user.firstName} {candidate.user.lastName} —{" "}
                                {candidate.status.toLowerCase()}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {selectedJob && candidateOptions.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Aucun candidat n'est associé à cette offre pour le moment.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Durée (minutes)
                  </Label>
                  <Input
                    type="number"
                    min={15}
                    value={formData.durationMinutes ?? 45}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        durationMinutes: Number(event.target.value),
                      }))
                    }
                    className="border-slate-200 dark:border-slate-700"
                  />
                  {formData.durationMinutes && formData.durationMinutes > 60 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(() => {
                        const hours = Math.floor(formData.durationMinutes / 60)
                        const minutes = formData.durationMinutes % 60
                        return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
                      })()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Statut du meeting
                  </Label>
                  <Select
                    value={formData.status ?? "PLANNED"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: value as ScheduleInterviewMeetingInput["status"],
                      }))
                    }
                  >
                    <SelectTrigger className="border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planifié</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                      <SelectItem value="CANCELLED">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Lien visio (optionnel)
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://"
                    value={formData.meetingLink ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        meetingLink: event.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Lieu (optionnel)
                  </Label>
                  <Input
                    placeholder="Bureau, salle, adresse..."
                    value={formData.location ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notes internes
                </Label>
                <Textarea
                  placeholder="Ajoutez des points à aborder, un ordre du jour, des consignes..."
                  value={formData.notes ?? ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  className="min-h-[100px] border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-200">
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Récapitulatif
                </p>
                <p className="mt-1">
                  L'entretien sera planifié pour&nbsp;
                  <span className="font-semibold">
                    {formData.scheduledAt
                      ? format(new Date(formData.scheduledAt), "dd MMMM yyyy à HH:mm", { locale: fr })
                      : "date à définir"}
                  </span>
                  {formData.durationMinutes
                    ? ` (durée prévue : ${(() => {
                        const hours = Math.floor(formData.durationMinutes / 60)
                        const minutes = formData.durationMinutes % 60
                        return hours > 0 
                          ? minutes > 0 
                            ? `${hours}h ${minutes}min`
                            : `${hours}h`
                          : `${minutes}min`
                      })()})`
                    : ""}
                  .
                </p>
              </div>
            </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end mt-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setEditingMeetingId(null)
                setDialogMode("create")
                resetForm()
              }}
              className="border-slate-200 dark:border-slate-700"
              disabled={scheduleMutation.isPending || updateMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={scheduleMutation.isPending || updateMutation.isPending}
            >
              {(scheduleMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : dialogMode === "create" ? (
                "Planifier l'entretien"
              ) : (
                "Mettre à jour l'entretien"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
