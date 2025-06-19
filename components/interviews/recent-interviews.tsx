"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Star, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUserStats } from "@/actions/interview.action"

// Composant Skeleton pour simuler le chargement
function RecentInterviewsSkeleton() {
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
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function RecentInterviews() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  })

  if (isLoading) {
    return <RecentInterviewsSkeleton />
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-red-500">
          Une erreur est survenue lors du chargement des interviews
        </CardContent>
      </Card>
    )
  }

  const interviews = stats?.recentInterviews || []

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
          {interviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune interview récente</p>
              <p className="text-sm">Commencez votre première interview !</p>
            </div>
          ) : (
            interviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{interview.title}</h4>
                  <p className="text-xs text-gray-600">
                    {interview.type} • {interview.date}
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
