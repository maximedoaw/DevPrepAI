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
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <span className="text-lg text-white">💼</span>
              </div>
              <div>
                <h1 className="font-semibold text-lg text-gray-900 dark:text-white">{interview.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{interview.company}</span>
                  <Badge className="border-0 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm">{interview.difficulty}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className={`font-mono text-lg ${timeLeft < 300 ? "text-red-600 dark:text-red-400 font-bold" : "text-gray-700 dark:text-gray-300"}`}>
                {formatTime(timeLeft)}
              </span>
              <div className="flex items-center gap-2 ml-2">
                <div
                  className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{isRunning ? "En cours" : "Arrêté"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
