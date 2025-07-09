import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mic, X } from 'lucide-react'

interface Developer {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
}

interface StartVoiceInterviewModalProps {
  developer: Developer
  open: boolean
  setOpen: (open: boolean) => void
}

const StartVoiceInterviewModal = ({ developer, open, setOpen }: StartVoiceInterviewModalProps) => {
  // TODO: intégrer Stream (voir doc getstream.io)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-800">
            <Mic className="h-5 w-5 text-cyan-500" />
            Entretien vocal avec {developer.firstName || developer.email}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-gray-700">
          <p>
            Vous êtes sur le point de lancer un entretien technique vocal avec <span className="font-semibold text-cyan-700">{developer.firstName || developer.email}</span>.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            (L'intégration vidéo/voix sera gérée par Stream.io — voir documentation pour la suite)
          </p>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            <X className="h-4 w-4 mr-1" /> Annuler
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white" disabled>
            <Mic className="h-4 w-4 mr-1" /> Démarrer (à venir)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default StartVoiceInterviewModal 