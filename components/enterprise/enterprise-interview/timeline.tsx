"use client"

import { useState } from "react"
import { Users, ChevronDown, ChevronUp, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface JobOffer {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  applicants: number
  status: 'active' | 'paused' | 'closed'
}

interface TimelineProps {
  jobOffers: JobOffer[]
  selectedOffer: string | null
  onSelectOffer: (id: string) => void
  loading: boolean
}

// Skeleton pour un item de la timeline
const TimelineItemSkeleton = () => (
  <div className="relative flex items-center gap-6 px-6 py-3">
    {/* Cercle skeleton */}
    <div className="relative z-20 flex-shrink-0">
      <Skeleton className="w-6 h-6 rounded-full" />
    </div>

    {/* Contenu skeleton */}
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  </div>
)

export function Timeline({ jobOffers, selectedOffer, onSelectOffer, loading }: TimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const INITIAL_DISPLAY_COUNT = 4
  const hasMore = jobOffers.length > INITIAL_DISPLAY_COUNT
  const displayedOffers = isExpanded ? jobOffers : jobOffers.slice(0, INITIAL_DISPLAY_COUNT)
  const remainingCount = jobOffers.length - INITIAL_DISPLAY_COUNT

  const handleToggle = () => {
    if (!isExpanded) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setIsExpanded(true)
        setIsLoadingMore(false)
      }, 300)
    } else {
      setIsExpanded(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-2xl">
      <div className="p-1 space-y-1">
        {/* Header removed from here as it's in parent */}

        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <TimelineItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {displayedOffers.map((offer) => {
              const isSelected = selectedOffer === offer.id;
              return (
                <div
                  key={offer.id}
                  onClick={() => onSelectOffer(offer.id)}
                  className={cn(
                    "group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border border-transparent",
                    isSelected
                      ? "bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 shadow-sm"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900"
                  )}
                >
                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-full" />
                  )}

                  {/* Icon Container */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 group-hover:bg-white group-hover:shadow-sm"
                  )}>
                    <Briefcase className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className={cn(
                        "font-semibold text-sm truncate pr-2",
                        isSelected ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"
                      )}>
                        {offer.title}
                      </h3>
                      {offer.status === 'active' && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{offer.company}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className={cn(
                        "text-[10px] px-1.5 h-5 font-normal",
                        isSelected ? "bg-white/80 dark:bg-slate-800 text-emerald-700" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}>
                        {offer.applicants} candidats
                      </Badge>
                      <span className="text-[10px] text-slate-400 border px-1.5 rounded h-5 flex items-center">{offer.type}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {jobOffers.length === 0 && !loading && (
              <div className="text-center py-12 px-6">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500">Aucune offre disponible</p>
              </div>
            )}
          </>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <Button
            variant="ghost"
            onClick={handleToggle}
            disabled={isLoadingMore}
            className="w-full mt-2 text-xs text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            {isLoadingMore ? "Chargement..." : isExpanded ? "Voir moins" : `Voir ${remainingCount} autres offres`}
          </Button>
        )}
      </div>
    </Card>
  )
}