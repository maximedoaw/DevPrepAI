'use client'

import React, { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { assignTestToParticipant } from '@/actions/bootcamp.action'
import { toast } from 'sonner'

interface AssignTestDialogProps {
  isOpen: boolean
  onClose: () => void
  participant: any
  onSuccess?: () => void
}

export function AssignTestDialog({
  isOpen,
  onClose,
  participant,
  onSuccess
}: AssignTestDialogProps) {
  const [assignTestData, setAssignTestData] = useState({ quizId: '', dueDate: '', notes: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setAssignTestData({ quizId: '', dueDate: '', notes: '' })
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!participant || !assignTestData.quizId) {
      toast.error('Veuillez sélectionner un test')
      return
    }

    const enrollment = participant.bootcampEnrollments?.[0]
    if (!enrollment) {
      toast.error('Aucune inscription trouvée')
      return
    }

    setLoading(true)
    const result = await assignTestToParticipant({
      enrollmentId: enrollment.id,
      studentId: participant.id,
      quizId: assignTestData.quizId || undefined,
      dueDate: assignTestData.dueDate ? new Date(assignTestData.dueDate) : undefined,
      notes: assignTestData.notes || undefined
    })
    setLoading(false)

    if (result.success) {
      toast.success('Test assigné avec succès')
      setAssignTestData({ quizId: '', dueDate: '', notes: '' })
      onSuccess?.()
      onClose()
    } else {
      toast.error(result.error || 'Erreur lors de l\'assignation du test')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Assigner un test</DialogTitle>
          <DialogDescription>
            Sélectionnez un test à assigner à {participant?.firstName} {participant?.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Test *</label>
            <Input
              value={assignTestData.quizId}
              onChange={(e) => setAssignTestData({ ...assignTestData, quizId: e.target.value })}
              placeholder="ID du quiz ou jobQuiz"
              className="border-emerald-200 dark:border-emerald-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Date limite (optionnel)</label>
            <Input
              type="date"
              value={assignTestData.dueDate}
              onChange={(e) => setAssignTestData({ ...assignTestData, dueDate: e.target.value })}
              className="border-emerald-200 dark:border-emerald-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Notes (optionnel)</label>
            <Textarea
              value={assignTestData.notes}
              onChange={(e) => setAssignTestData({ ...assignTestData, notes: e.target.value })}
              placeholder="Notes supplémentaires..."
              className="border-emerald-200 dark:border-emerald-800"
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
            {loading ? 'Assignation...' : 'Assigner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

