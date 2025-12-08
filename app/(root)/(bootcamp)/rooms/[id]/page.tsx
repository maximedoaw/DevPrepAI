import React from 'react'
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
import RoomVideo from '../components/RoomVideo'

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
    <div className="h-[calc(100vh-4rem)] w-full bg-white dark:bg-slate-950">
      <RoomVideo 
        room={{
          id: room.id,
          userId: room.userId,
          trainers: typeof room.trainers === 'string' ? JSON.parse(room.trainers) : room.trainers || [],
          candidates: typeof room.candidates === 'string' ? JSON.parse(room.candidates) : room.candidates || []
        }}
        roomTitle={room?.roomData?.title}
      />
    </div>
  )
}

export default RoomPage
