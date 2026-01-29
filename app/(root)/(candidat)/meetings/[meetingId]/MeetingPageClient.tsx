
"use client"

import { useState } from "react"
import { MeetingRoom } from "@/components/meetings/MeetingRoom"
import { MeetingSetup } from "@/components/meetings/MeetingSetup"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { FileText, HelpCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
                <SheetContent className="w-[90%] sm:max-w-md overflow-hidden flex flex-col bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-l border-emerald-100 dark:border-emerald-900/50">
                  <SheetHeader className="mb-6 pb-4 border-b border-emerald-100 dark:border-emerald-900/50">
                    <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      Énoncés & Questions
                    </SheetTitle>
                    <SheetDescription className="text-slate-500 dark:text-slate-400">
                      Sujets techniques pour cet entretien.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    <Accordion type="single" collapsible className="w-full">
                      {quizzes.map((quiz, i) => (
                        <AccordionItem
                          key={quiz.id}
                          value={`quiz-${i}`}
                          className="border border-emerald-100 dark:border-emerald-900/50 rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden mb-3"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:no-underline transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                <HelpCircle className="w-5 h-5" />
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{quiz.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="pt-2">
                              {Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full space-y-2">
                                  {quiz.questions.map((q: any, idx: number) => {
                                    // Mapping fields based on user request and common patterns
                                    // User said "statement corresponds to correctAnswer"
                                    const statement = q.correctAnswer || q.question || q.statement || q.description || "Énoncé non disponible";
                                    const title = q.title || `Question ${idx + 1}`;
                                    const codeSnippet = q.codeSnippet || q.code;

                                    return (
                                      <AccordionItem
                                        key={idx}
                                        value={`q-${idx}`}
                                        className="border border-emerald-100 dark:border-emerald-900/50 rounded-lg overflow-hidden"
                                      >
                                        <AccordionTrigger className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:no-underline transition-colors">
                                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 text-left">
                                            {title}
                                          </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 pb-3 bg-slate-50/50 dark:bg-slate-900/30">
                                          <div className="space-y-3 pt-2">
                                            {/* Énoncé (correctAnswer) */}
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                                {statement}
                                              </p>
                                            </div>

                                            {/* Code Snippet */}
                                            {codeSnippet && (
                                              <div className="relative rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
                                                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700">
                                                  <span className="text-xs text-slate-400 font-mono">Code</span>
                                                </div>
                                                <pre className="p-3 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300 bg-slate-950">
                                                  <code>{codeSnippet}</code>
                                                </pre>
                                              </div>
                                            )}

                                            {/* Options for QCM */}
                                            {q.options && Array.isArray(q.options) && (
                                              <div className="mt-2 space-y-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase">Options</p>
                                                <ul className="pl-4 list-disc space-y-1">
                                                  {q.options.map((opt: string, optIdx: number) => (
                                                    <li key={optIdx} className="text-xs text-slate-600 dark:text-slate-400">
                                                      {opt}
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    );
                                  })}
                                </Accordion>
                              ) : (
                                <p className="text-sm text-slate-500 italic px-2">Aucune question disponible.</p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
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