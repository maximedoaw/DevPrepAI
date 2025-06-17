"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

interface InterviewHeaderProps {
  interview: {
    id: string
    title: string
    company: string
    difficulty: string
  }
  timeLeft: number
  isRunning: boolean
  formatTime: (seconds: number) => string
}

export function InterviewHeader({ interview, timeLeft, isRunning, formatTime }: InterviewHeaderProps) {
  const router = useRouter()

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r">
                <span className="text-lg"></span>
              </div>
              <div>
                <h1 className="font-semibold text-lg">{interview.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{interview.company}</span>
                  <Badge className="border-0 text-xs">{interview.difficulty}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono text-lg ${timeLeft < 300 ? "text-red-600 font-bold" : ""}`}>
                {formatTime(timeLeft)}
              </span>
              <div className="flex items-center gap-2 ml-2">
                <div
                  className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                ></div>
                <span className="text-xs text-gray-600">{isRunning ? "En cours" : "Arrêté"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
