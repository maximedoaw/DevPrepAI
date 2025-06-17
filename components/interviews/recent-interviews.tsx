"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Star, Loader2 } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { getRecentInterviews } from "@/actions/interview.action"
import { useEffect, useRef, useCallback } from "react"

export function RecentInterviews() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['recentInterviews'],
    queryFn: ({ pageParam = 1 }) => getRecentInterviews(pageParam, 5),
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasMore) return undefined
      return pages.length + 1
    },
    initialPageParam: 1
  })

  const observer = useRef<IntersectionObserver>(null)
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    })
    if (node) observer.current.observe(node)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  const interviews = data?.pages.flatMap(page => page.interviews) ?? []

  if (status === "error") {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-red-500">
          Une erreur est survenue lors du chargement des interviews
        </CardContent>
      </Card>
    )
  }

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
          {interviews.map((interview, index) => (
            <div
              key={interview.id}
              ref={index === interviews.length - 1 ? lastElementRef : null}
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
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
