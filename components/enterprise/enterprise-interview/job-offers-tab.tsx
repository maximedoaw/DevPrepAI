"use client"

import { Briefcase, MapPin, DollarSign, Users, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface JobOffer {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  description: string
  requirements: string[]
  postedDate: string
  applicants: number
  status: 'active' | 'paused' | 'closed'
  image?: string
}

interface JobOffersTabProps {
  offers: JobOffer[]
  onCreateJobClick: () => void
}

export function JobOffersTab({ offers, onCreateJobClick }: JobOffersTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'closed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'paused': return 'En pause'
      case 'closed': return 'Clôturé'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {offers.map((offer) => (
          <Card 
            key={offer.id} 
            className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70 hover:shadow-xl transition-all duration-300 hover:border-green-300/50 dark:hover:border-green-600/50 group"
          >
            {offer.image && (
              <div className="h-32 overflow-hidden rounded-t-lg">
                <img 
                  src={offer.image} 
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg line-clamp-2 text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                  {offer.title}
                </CardTitle>
                <Badge className={getStatusColor(offer.status)}>
                  {getStatusText(offer.status)}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400">
                {offer.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {offer.location}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {offer.salary}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {offer.applicants}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {offer.requirements.slice(0, 3).map((req, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    {req}
                  </Badge>
                ))}
                {offer.requirements.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{offer.requirements.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Posté le {new Date(offer.postedDate).toLocaleDateString('fr-FR')}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700">
                    Modifier
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Voir candidats
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {offers.length === 0 && (
        <Card className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70 text-center py-12">
          <CardContent>
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Aucune offre ne correspond à votre recherche.
            </p>
            <Button className="bg-green-600 hover:bg-green-700" onClick={onCreateJobClick}>
              <Briefcase className="w-4 h-4 mr-2" />
              Créer une première offre
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}