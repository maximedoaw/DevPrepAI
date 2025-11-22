'use client'

import React, { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { createBootcampFeedback } from '@/actions/bootcamp.action'
import { toast } from 'sonner'

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
  participant: any
  onSuccess?: () => void
}

export function FeedbackDialog({
  isOpen,
  onClose,
  participant,
  onSuccess
}: FeedbackDialogProps) {
  const [feedbackData, setFeedbackData] = useState({ content: '', rating: 5 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setFeedbackData({ content: '', rating: 5 })
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!participant || !feedbackData.content) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const enrollment = participant.bootcampEnrollments?.[0]
    if (!enrollment) {
      toast.error('Aucune inscription trouvée')
      return
    }

    setLoading(true)
    const result = await createBootcampFeedback({
      enrollmentId: enrollment.id,
      studentId: participant.id,
      content: feedbackData.content,
      rating: feedbackData.rating
    })
    setLoading(false)

    if (result.success) {
      toast.success('Feedback envoyé avec succès')
      setFeedbackData({ content: '', rating: 5 })
      onSuccess?.()
      onClose()
    } else {
      toast.error(result.error || 'Erreur lors de l\'envoi du feedback')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Donner un feedback</DialogTitle>
          <DialogDescription>
            Partagez vos commentaires avec {participant?.firstName} {participant?.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Note (1-5)</label>
            <Select
              value={feedbackData.rating.toString()}
              onValueChange={(value) => setFeedbackData({ ...feedbackData, rating: parseInt(value) })}
            >
              <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(rating => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} {rating === 1 ? 'étoile' : 'étoiles'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Commentaire</label>
            <Textarea
              value={feedbackData.content}
              onChange={(e) => setFeedbackData({ ...feedbackData, content: e.target.value })}
              placeholder="Votre feedback..."
              className="border-emerald-200 dark:border-emerald-800 min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-emerald-200 dark:border-emerald-800"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

