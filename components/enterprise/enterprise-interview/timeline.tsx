"use client"

import { useState } from "react"
import { Users, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

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
  
  const INITIAL_DISPLAY_COUNT = 3
  const hasMore = jobOffers.length > INITIAL_DISPLAY_COUNT
  const displayedOffers = isExpanded ? jobOffers : jobOffers.slice(0, INITIAL_DISPLAY_COUNT)
  const remainingCount = jobOffers.length - INITIAL_DISPLAY_COUNT

  const handleToggle = () => {
    if (!isExpanded) {
      setIsLoadingMore(true)
      // Simuler un petit délai de chargement
      setTimeout(() => {
        setIsExpanded(true)
        setIsLoadingMore(false)
      }, 300)
    } else {
      setIsExpanded(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="relative">
        {/* Ligne verticale CONTINUE derrière les cercles */}
        <div 
          className="absolute left-9 top-0 w-0.5 bg-gradient-to-b from-green-300 via-green-300 to-transparent dark:from-green-900 dark:via-green-900 z-0 transition-all duration-300"
          style={{ 
            height: isExpanded ? '100%' : hasMore ? 'calc(100% - 60px)' : '100%' 
          }}
        />
        
        <div className="py-4">
          {/* Loading State */}
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <TimelineItemSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              {/* Job Offers */}
              {displayedOffers.map((offer, index) => (
                <div
                  key={offer.id}
                  className={`relative flex items-center gap-6 px-6 py-3 cursor-pointer transition-all duration-200 group rounded-r-lg ${
                    selectedOffer === offer.id 
                      ? 'bg-green-50/80 border-r-4 border-green-500 dark:bg-green-900/20 shadow-sm' 
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30 border-r-4 border-transparent'
                  }`}
                  onClick={() => onSelectOffer(offer.id)}
                >
                  {/* Cercle avec fond blanc pour "percer" la ligne */}
                  <div className="relative z-20 flex-shrink-0">
                    <div className={`
                      w-6 h-6 rounded-full border-[3px] bg-white dark:bg-slate-900 flex items-center justify-center
                      transition-all duration-300
                      ${offer.status === 'active' ? 'border-green-500' : ''}
                      ${offer.status === 'paused' ? 'border-yellow-500' : ''}
                      ${offer.status === 'closed' ? 'border-slate-400' : ''}
                      ${selectedOffer === offer.id ? 'scale-125 ring-4 ring-green-200 dark:ring-green-900/50 shadow-lg' : 'group-hover:scale-110'}
                    `}>
                      <div className={`
                        w-2 h-2 rounded-full transition-all duration-300
                        ${offer.status === 'active' ? 'bg-green-500' : ''}
                        ${offer.status === 'paused' ? 'bg-yellow-500 animate-pulse' : ''}
                        ${offer.status === 'closed' ? 'bg-slate-400' : ''}
                        ${selectedOffer === offer.id ? 'scale-110' : ''}
                      `} />
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm line-clamp-1 transition-colors ${
                      selectedOffer === offer.id 
                        ? 'text-green-900 dark:text-green-100' 
                        : 'text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300'
                    }`}>
                      {offer.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {offer.company}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs transition-colors ${
                          selectedOffer === offer.id
                            ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        }`}
                      >
                        <Users className="w-3 h-3 mr-1" />
                        {offer.applicants}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs transition-colors ${
                          selectedOffer === offer.id
                            ? 'border-green-300 text-green-800 dark:border-green-700 dark:text-green-200 bg-green-50 dark:bg-green-900/30'
                            : 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-300'
                        }`}
                      >
                        {offer.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {/* Skeleton pour le chargement de plus d'offres */}
              {isLoadingMore && (
                <>
                  {[1, 2, 3].map((i) => (
                    <TimelineItemSkeleton key={`loading-${i}`} />
                  ))}
                </>
              )}

              {/* Message si aucune offre */}
              {jobOffers.length === 0 && !loading && (
                <div className="text-center py-8 px-6">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Aucune offre disponible
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Les offres d'emploi apparaîtront ici
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bouton Voir plus/moins - SÉPARÉ de la timeline */}
        {hasMore && !loading && (
          <div className="px-6 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              disabled={isLoadingMore}
              className="w-full bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 shadow-sm hover:shadow-md group disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </>
              ) : isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                  Voir moins
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Voir {remainingCount} autre{remainingCount > 1 ? 's' : ''} offre{remainingCount > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}