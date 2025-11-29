import React from 'react'
import { redirect } from 'next/navigation'
import { getInterviewRoomById } from '@/actions/room.action'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface RoomPageProps {
  params: {
    id: string
  }
}

const RoomPage = async ({ params }: RoomPageProps) => {
  const result = await getInterviewRoomById(params.id)

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 shadow-xl max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
              Room non trouvée
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {result.error || "Cette room n'existe pas ou vous n'êtes pas autorisé à y accéder."}
            </p>
            <Link href="/rooms">
              <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux rooms
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const room = result.data
  const isEnded = !!room.endedAt

  // Si la room est terminée, afficher un message d'erreur
  if (isEnded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 shadow-xl max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="h-10 w-10 text-slate-600 dark:text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
              Room terminée
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Cette room d'entretien a été terminée et n'est plus accessible.
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="outline" className="bg-slate-100 dark:bg-slate-700">
                Terminée
              </Badge>
            </div>
            <Link href="/rooms">
              <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux rooms
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ici, vous pouvez ajouter le contenu de la room active
  // Pour l'instant, on affiche juste un message de succès
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-slate-800 dark:text-white">
              Room d'entretien
            </CardTitle>
            <Link href="/rooms">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
              Room active
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Le contenu de la room sera affiché ici.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RoomPage
