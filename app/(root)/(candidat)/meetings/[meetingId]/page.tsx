import { notFound, redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  CalendarDays,
  Clock,
  MapPin,
  PhoneCall,
  User,
} from "lucide-react"

import { getInterviewMeetingById } from "@/actions/interview-meeting.action"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MeetingDetailsPageProps {
  params: { meetingId: string }
}

export default async function MeetingDetailsPage({ params }: MeetingDetailsPageProps) {
  const { meetingId } = params
  if (!meetingId) {
    notFound()
  }

  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  const meeting = await getInterviewMeetingById(meetingId, user.id, "candidate").catch(() => null)
  if (!meeting) {
    notFound()
  }

  const scheduledDate = new Date(meeting.scheduledAt)
  const formattedDate = format(scheduledDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })

  return (
    <div className="space-y-6">
      <Card className="border border-emerald-100/60 bg-white/80 dark:border-emerald-900/40 dark:bg-slate-900/70 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
            Détails de l'entretien
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Toutes les informations partagées par l'entreprise.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Date & heure</p>
                <p className="font-medium text-slate-900 dark:text-white">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Durée</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {meeting.durationMinutes ?? 45} minutes
                </p>
              </div>
            </div>
            {meeting.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Lieu</p>
                  <p className="font-medium text-slate-900 dark:text-white">{meeting.location}</p>
                </div>
              </div>
            )}
            {meeting.meetingLink && (
              <div className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Lien visio</p>
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-600 underline dark:text-emerald-300"
                  >
                    Rejoindre la réunion
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Recruteur</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {meeting.organizer.firstName} {meeting.organizer.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {meeting.organizer.email}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Statut actuel</p>
              <Badge
                variant="outline"
                className="mt-1 capitalize border-emerald-200 text-emerald-600 dark:border-emerald-900 dark:text-emerald-300"
              >
                {meeting.status.toLowerCase()}
              </Badge>
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
        </CardContent>
      </Card>
    </div>
  )
}

