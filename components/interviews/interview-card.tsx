"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Building2, Code } from "lucide-react"
import { type Interview, DIFFICULTY_COLORS, TYPE_ICONS } from "@/constants"

interface InterviewCardProps {
  interview: Interview
  onStart: (interview: Interview) => void
}

export function InterviewCard({ interview, onStart }: InterviewCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TYPE_ICONS[interview.type]}</span>
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{interview.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3" />
                {interview.company}
              </CardDescription>
            </div>
          </div>
          <Badge className={DIFFICULTY_COLORS[interview.difficulty]}>{interview.difficulty}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{interview.duration} minutes</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Code className="h-4 w-4" />
            <div className="flex flex-wrap gap-1">
              {interview.technology.slice(0, 2).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {interview.technology.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{interview.technology.length - 2}
                </Badge>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {interview.questions.length} question{interview.questions.length > 1 ? "s" : ""}
          </div>

          <Button onClick={() => onStart(interview)} className="w-full mt-4" variant="default">
            Commencer l'Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
