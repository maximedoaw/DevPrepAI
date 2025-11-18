import { notFound, redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarDays, Clock, MapPin, PhoneCall, User } from "lucide-react"

import { getInterviewMeetingById, type MeetingWithRelations } from "@/actions/interview-meeting.action"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import MeetingPageClient from "./MeetingPageClient"

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

  let meeting: MeetingWithRelations | null = null
  let viewerRole: "organizer" | "candidate" | null = null

  // On tente d'abord une récupération côté organisateur, puis côté candidat.
  meeting = await getInterviewMeetingById(meetingId, user.id, "organizer").catch(() => null)
  if (meeting) {
    viewerRole = "organizer"
  } else {
    meeting = await getInterviewMeetingById(meetingId, user.id, "candidate").catch(() => null)
    if (meeting) {
      viewerRole = "candidate"
    }
  }

  if (!meeting || !viewerRole) {
    notFound()
  }

  const scheduledDate = new Date(meeting.scheduledAt)
  const formattedDate = format(scheduledDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })

  const participants = [
    { id: meeting.organizerId, role: "organizer" as const },
    { id: meeting.candidateId, role: "candidate" as const },
  ]

  const viewerName =
    viewerRole === "organizer"
      ? `${meeting.organizer.firstName ?? ""} ${meeting.organizer.lastName ?? ""}`.trim() ||
        user.given_name ||
        user.email ||
        user.id
      : `${meeting.candidate.firstName ?? ""} ${meeting.candidate.lastName ?? ""}`.trim() ||
        user.given_name ||
        user.email ||
        user.id

  const candidateName = `${meeting.candidate.firstName ?? ""} ${meeting.candidate.lastName ?? ""}`.trim() ||
    meeting.candidate.email ||
    "Candidat"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="space-y-4 sm:space-y-6">
          {/* Header avec titre du meeting */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-700 dark:to-emerald-800 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Poste : {meeting.job.title}</h1>
          </div>

          {/* Grille principale */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Colonne gauche - Détails */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="border border-emerald-100/60 dark:border-emerald-900/40 bg-white dark:bg-slate-900/50 shadow-lg">
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                    <CardHeader className="bg-gradient-to-r dark:from-emerald-900/20 dark:to-emerald-900/10 border-b border-emerald-200 dark:border-emerald-900/40 p-4 sm:p-6">
                      <AccordionTrigger className="p-0 hover:no-underline">
                        <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                          Informations de l'entretien
                        </CardTitle>
                      </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                      <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Date & heure
                              </p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                {formattedDate}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Durée
                              </p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                {meeting.durationMinutes ?? 45} minutes
                              </p>
                            </div>
                          </div>

                          {meeting.location && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                  Lieu
                                </p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 break-words">
                                  {meeting.location}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                {viewerRole === "organizer" ? "Candidat" : "Recruteur"}
                              </p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                {viewerRole === "organizer"
                                  ? candidateName
                                  : `${meeting.organizer.firstName} ${meeting.organizer.lastName}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                Statut
                              </p>
                              <Badge
                                variant="outline"
                                className="capitalize border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              >
                                {meeting.status.toLowerCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {meeting.notes && (
                          <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40">
                            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide mb-2">
                              Informations partagées
                            </p>
                            <p className="text-sm text-emerald-800 dark:text-emerald-200 whitespace-pre-wrap break-words">
                              {meeting.notes}
                            </p>
                          </div>
                        )}

                        {meeting.candidateNotes && (
                          <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                              Retour du candidat
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
                              {meeting.candidateNotes}
                            </p>
                          </div>
                        )}

                        {meeting.meetingLink && (
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-sm font-medium"
                          >
                            <PhoneCall className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">Participer via le lien externe</span>
                          </a>
                        )}
                      </CardContent>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            </div>

            {/* Colonne droite - Configuration et appel */}
            <div className="lg:col-span-2">
              <MeetingPageClient
                meetingId={meeting.id}
                meetingTitle={meeting.job.title}
                viewerName={viewerName}
                candidateName={viewerRole === "organizer" ? candidateName : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

