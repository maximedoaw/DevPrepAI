// components/delete-job-modal.tsx
"use client"

import {
  AlertTriangle,
  Trash2,
  X
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobTitle: string
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteJobModal({ 
  open, 
  onOpenChange, 
  jobTitle, 
  onConfirm, 
  isDeleting 
}: DeleteJobModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-center">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Supprimer l'offre
            </DialogTitle>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Êtes-vous sûr de vouloir supprimer l'offre <strong>"{jobTitle}"</strong> ? Cette action est irréversible.
            </p>
          </div>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-slate-200 dark:border-slate-700"
            disabled={isDeleting}
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button 
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}