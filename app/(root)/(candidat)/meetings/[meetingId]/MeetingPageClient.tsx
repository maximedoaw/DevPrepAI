
"use client"

import { useState } from "react"
import { MeetingRoom } from "@/components/meetings/MeetingRoom"
import { MeetingSetup } from "@/components/meetings/MeetingSetup"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { FileText, HelpCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Quiz {
  id: string
  title: string
  questions: any
  type: string
}

interface MeetingPageClientProps {
  meetingId: string
  meetingTitle: string
  viewerName: string
  candidateName?: string
  quizzes?: Quiz[]
}

export default function MeetingPageClient({
  meetingId,
  meetingTitle,
  viewerName,
  candidateName,
  quizzes = []
}: MeetingPageClientProps) {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [meetingSettings, setMeetingSettings] = useState<{
    videoEnabled: boolean
    audioEnabled: boolean
  }>({
    videoEnabled: false,
    audioEnabled: true
  })

  const handleJoin = (settings: { videoEnabled: boolean; audioEnabled: boolean }) => {
    setMeetingSettings(settings)
    setIsSetupComplete(true)
  }

  const handleLeave = () => {
    setIsSetupComplete(false)
  }

  return (
    <div className="space-y-4">
      {!isSetupComplete ? (
        <MeetingSetup onJoin={handleJoin} meetingTitle={meetingTitle} />
      ) : (
        <div className="rounded-xl border border-emerald-100/60 dark:border-emerald-900/40 bg-white dark:bg-slate-900/50 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 border-b border-emerald-200 dark:border-emerald-900/40 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                Appel vidéo en cours
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <p>Connecté en tant que {viewerName}</p>
                {candidateName && candidateName !== viewerName && (
                  <p className="sm:before:content-['•'] sm:before:mx-2">
                    Candidat : {candidateName}
                  </p>
                )}
              </div>
            </div>

            {quizzes.length > 0 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Voir les énoncés</span>
                    <span className="sm:hidden">Énoncés</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[90%] sm:max-w-md overflow-hidden flex flex-col">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Énoncés & Questions</SheetTitle>
                    <SheetDescription>
                      Liste des sujets techniques et questions pour cet entretien.
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="flex-1 -mx-6 px-6">
                    <Accordion type="single" collapsible className="w-full">
                      {quizzes.map((quiz, i) => (
                        <AccordionItem key={quiz.id} value={`quiz-${i}`}>
                          <AccordionTrigger className="text-left font-medium">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-emerald-500" />
                              {quiz.title}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              {Array.isArray(quiz.questions) && quiz.questions.map((q: any, idx: number) => (
                                <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                  <p className="font-medium text-slate-900 dark:text-slate-200 text-sm mb-2">Question {idx + 1}</p>
                                  <p className="text-slate-700 dark:text-slate-300 text-sm">{q.question || q.title || "Question sans titre"}</p>
                                  {/* Add options or code snippets if available in schema structure */}
                                </div>
                              ))}
                              {(!quiz.questions || quiz.questions.length === 0) && (
                                <p className="text-sm text-slate-500 italic">Aucune question disponible.</p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}
          </div>
          <div className="min-h-[500px] sm:min-h-[600px] bg-slate-950 dark:bg-slate-950">
            <MeetingRoom
              callId={meetingId}
              meetingId={meetingId}
              settings={meetingSettings}
              onLeave={handleLeave}
            />
          </div>
        </div>
      )}
    </div>
  )
}