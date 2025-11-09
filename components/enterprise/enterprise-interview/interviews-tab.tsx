"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Link2,
  Loader2,
  MapPin,
  Plus,
  User,
  Users,
  Video,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  scheduleInterviewMeeting,
  getInterviewMeetings,
  getInterviewSchedulingContext,
  type ScheduleInterviewMeetingInput,
} from "@/actions/interview-meeting.action"
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
  DialogTrigger,
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

interface InterviewsTabProps {
  onScheduleInterview?: () => void
}

type Meeting = Awaited<ReturnType<typeof getInterviewMeetings>>[number]

export function InterviewsTab({ onScheduleInterview }: InterviewsTabProps) {
  const { user, isLoading: userLoading } = useKindeBrowserClient()
  const queryClient = useQueryClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
  })

  const { data: contextData, isLoading: contextLoading } = useQuery({
    queryKey: ["interview-context", user?.id],
    queryFn: () => getInterviewSchedulingContext(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })

  const {
    data: meetings = [],
    isLoading: meetingsLoading,
    isFetching: meetingsFetching,
  } = useQuery({
    queryKey: ["interview-meetings", user?.id],
    queryFn: () => getInterviewMeetings(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  })

  const scheduleMutation = useMutation({
    mutationFn: scheduleInterviewMeeting,
    onSuccess: () => {
      toast.success("Entretien programmé avec succès")
      setIsDialogOpen(false)
      setFormData((prev) => ({
        ...prev,
        jobPostingId: "",
        candidateId: "",
        applicationId: undefined,
        scheduledAt: "",
        meetingLink: "",
        location: "",
        notes: "",
      }))
      queryClient.invalidateQueries({ queryKey: ["interview-meetings", user?.id] })
      onScheduleInterview?.()
    },
    onError: (error: any) => {
      toast.error(error?.message || "Impossible de planifier l'entretien")
    },
  })

  const selectedJob = useMemo(() => {
    if (!contextData || !formData.jobPostingId) return undefined
    return contextData.jobs.find((job) => job.id === formData.jobPostingId)
  }, [contextData, formData.jobPostingId])

  const candidateOptions = useMemo(() => {
    if (!selectedJob) return []
    return selectedJob.candidates
  }, [selectedJob])

  const upcomingMeetings = useMemo(() => {
    const now = new Date()
    return meetings.filter((meeting) => new Date(meeting.scheduledAt) >= now)
  }, [meetings])

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

  const handleOpenDialog = () => {
    if (!user?.id) {
      toast.error("Identifiant utilisateur introuvable.")
      return
    }

    setFormData((prev) => ({
      ...prev,
      organizerId: user.id,
    }))
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.jobPostingId || !formData.candidateId || !formData.scheduledAt) {
      toast.error("Veuillez renseigner l'offre, le candidat et la date de l'entretien.")
      return
    }
    scheduleMutation.mutate({
      ...formData,
      applicationId: formData.applicationId || undefined,
      durationMinutes: formData.durationMinutes || 45,
    })
  }

  const renderMeetings = () => {
    if (meetingsLoading || meetingsFetching) {
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
                      {meeting.durationMinutes && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/30">
                          <Clock className="h-3 w-3" />
                          {meeting.durationMinutes} min
                        </span>
                      )}
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
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
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
          <Button
            onClick={handleOpenDialog}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Programmer un entretien
          </Button>
        </CardHeader>
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
          <Badge variant="outline" className="border-emerald-200 text-emerald-600 dark:border-emerald-900 dark:text-emerald-300">
            {upcomingMeetings.length} entretien(s) à venir
          </Badge>
        </CardHeader>
        <CardContent>{renderMeetings()}</CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border border-emerald-100 dark:border-emerald-900/40">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900 dark:text-white">
              Programmer un entretien
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Définissez l'offre concernée, le candidat et la date de passage.
            </DialogDescription>
          </DialogHeader>

          {contextLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
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
                    Date & heure
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledAt: event.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-700"
                    min={new Date().toISOString().substring(0, 16)}
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
                      {candidateOptions.map((candidate) => (
                        <SelectItem key={candidate.user.id} value={candidate.user.id}>
                          {candidate.user.firstName} {candidate.user.lastName} —{" "}
                          {candidate.status.toLowerCase()}
                        </SelectItem>
                      ))}
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
                    ? ` (durée prévue : ${formData.durationMinutes} minutes)`
                    : ""}
                  .
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-slate-200 dark:border-slate-700"
              disabled={scheduleMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={scheduleMutation.isPending}
            >
              {scheduleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Planification en cours...
                </>
              ) : (
                "Planifier l'entretien"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
