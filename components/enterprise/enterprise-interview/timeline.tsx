"use client"

import { Users, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
}

export function Timeline({ jobOffers, selectedOffer, onSelectOffer }: TimelineProps) {
  return (
<div className="relative">
          {/* Ligne verticale CONTINUE derrière les cercles */}
          <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-green-300 dark:bg-green-900 z-0" />
          
          <div className="py-4">
            {jobOffers.map((offer, index) => (
              <div
                key={offer.id}
                className={`relative flex items-center gap-6 px-6 py-3 cursor-pointer transition-all duration-200 group ${
                  selectedOffer === offer.id 
                    ? 'bg-green-50/80 border-r-2 border-green-500 dark:bg-green-900/20' 
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
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
                    ${selectedOffer === offer.id ? 'scale-125 ring-4 ring-green-200 dark:ring-green-900' : ''}
                  `}>
                    <div className={`
                      w-2 h-2 rounded-full transition-all duration-300
                      ${offer.status === 'active' ? 'bg-green-500' : ''}
                      ${offer.status === 'paused' ? 'bg-yellow-500' : ''}
                      ${offer.status === 'closed' ? 'bg-slate-400' : ''}
                      ${selectedOffer === offer.id ? 'scale-110' : ''}
                    `} />
                  </div>
                </div>
                
                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {offer.company}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {offer.applicants}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                    >
                      {offer.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
  )
}