import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Star } from "lucide-react"

interface RecentInterviewsProps {
  interviews: { id: string; title: string; score: number; date: string; company: string }[]
}

export function RecentInterviews({ interviews }: RecentInterviewsProps) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Récents</CardTitle>
            <CardDescription>Vos dernières interviews</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-sm">{interview.title}</h4>
                <p className="text-xs text-gray-600">
                  {interview.company} • {interview.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${
                    interview.score >= 80
                      ? "bg-green-100 text-green-700"
                      : interview.score >= 60
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {interview.score}%
                </Badge>
                {interview.score >= 90 && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
