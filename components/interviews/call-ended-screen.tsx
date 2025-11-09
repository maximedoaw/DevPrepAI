import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, RotateCcw, Plus, Sparkles, Loader2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { analyzeAndSaveVoiceInterview } from "@/actions/ai.action"
import { useMutation } from "@tanstack/react-query"

interface CallEndedScreenProps {
  callDuration: number
  selectedTechnologies: string[]
  handleRestartInterview: () => void
  handleNewInterview: () => void
  formatCallTime: (seconds: number) => string
  feedback?: {
    note: number
    explication_note: string
    points_faibles: string[]
    points_forts: string[]
  }
  interviewId?: string
  transcription?: any[]
}

export const CallEndedScreen: React.FC<CallEndedScreenProps> = ({
  callDuration,
  selectedTechnologies,
  handleRestartInterview,
  handleNewInterview,
  formatCallTime,
  feedback: feedbackProp,
  interviewId,
  transcription
}) => {
  const [feedback, setFeedback] = useState<any>(feedbackProp || null)
  const [error, setError] = useState("")

  const {
    mutate: analyzeInterview,
    isPending: isAnalyzing,
    data: mutationData,
    error: mutationError
  } = useMutation({
    mutationKey: ["analyze-voice-interview", interviewId],
    mutationFn: async () => {
      if (!interviewId || !transcription) throw new Error("Données manquantes pour l'analyse IA")
      return await analyzeAndSaveVoiceInterview(interviewId, transcription, callDuration)
    },
    onSuccess: (res) => {
      if (res.success && res.feedback) {
        setFeedback(res.feedback)
      } else if (res.error) {
        setError(res.error)
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Erreur lors de l'analyse IA")
    }
  })

  useEffect(() => {
    if (!feedbackProp && interviewId && transcription && transcription.length > 0 && !feedback && !isAnalyzing) {
      analyzeInterview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackProp, interviewId, transcription, callDuration])

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gradient-to-r rounded-t-lg text-center">
          <CardTitle className="font-mono flex items-center justify-center gap-3 text-2xl">
            <Sparkles className="h-8 w-8 text-teal-400" />
            Entretien terminé !
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
              <Phone className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-mono">
              Merci pour votre entretien !
            </h2>
            <p className="text-gray-600 font-mono">
              Durée de l'entretien : {formatCallTime(callDuration)}
            </p>
            <p className="text-gray-600 font-mono">
              Technologies évaluées : {selectedTechnologies.join(", ")}
            </p>
          </div>
          {/* Bloc feedback Gemini ou loader */}
          {isAnalyzing && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 p-6 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 border border-blue-200 shadow-md text-left max-w-2xl mx-auto animate-pulse">
              <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
              <span className="text-blue-200 font-mono text-lg">Analyse IA en cours...</span>
              <span className="text-xs text-blue-300 font-mono">DevPrepAI • Gemini</span>
            </div>
          )}
          {(error || mutationError) && (
            <div className="mt-8 p-4 rounded-xl bg-red-100 border border-red-300 text-red-700 font-mono max-w-2xl mx-auto">
              Erreur IA : {error || (mutationError as any)?.message}
            </div>
          )}
          {feedback && !isAnalyzing && !error && (
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md text-left max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-blue-700 font-mono">{feedback.note}/100</span>
                <span className="text-blue-600 font-mono text-lg">Note IA</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-blue-700 font-mono">Explication :</span>
                <p className="text-gray-800 font-mono mt-1">{feedback.explication_note}</p>
              </div>
              <div className="flex flex-col md:flex-row gap-6 mt-4">
                <div className="flex-1">
                  <span className="font-semibold text-red-600 font-mono">Points faibles :</span>
                  <ul className="list-disc list-inside text-gray-800 font-mono mt-1">
                    {feedback.points_faibles.map((pf: string, i: number) => (
                      <li key={i}>{pf}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-emerald-700 font-mono">Points forts :</span>
                  <ul className="list-disc list-inside text-gray-800 font-mono mt-1">
                    {feedback.points_forts.map((pf: string, i: number) => (
                      <li key={i}>{pf}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              onClick={handleRestartInterview}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-mono px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Relancer cet entretien
            </Button>
            <Button
              onClick={handleNewInterview}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 font-mono px-8 py-3 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvel entretien
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 