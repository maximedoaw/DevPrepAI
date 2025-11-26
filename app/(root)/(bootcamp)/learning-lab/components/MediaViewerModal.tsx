'use client'

import React from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CourseContentType } from './types'

interface MediaViewerModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  type: CourseContentType
  title?: string
}

export function MediaViewerModal({
  isOpen,
  onClose,
  fileUrl,
  type,
  title
}: MediaViewerModalProps) {
  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-slate-900 dark:bg-slate-950">
        <DialogHeader className="p-4 border-b border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg text-emerald-50">
              {title || (type === CourseContentType.VIDEO ? 'Vidéo' : 'PDF')}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNewTab}
                className="text-emerald-50 hover:text-emerald-200 hover:bg-emerald-900/30"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ouvrir dans un nouvel onglet</span>
                <span className="sm:hidden">Ouvrir</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-emerald-50 hover:text-emerald-200 hover:bg-emerald-900/30"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
          {type === CourseContentType.VIDEO ? (
            <div className="w-full h-full flex items-center justify-center">
              <video 
                src={fileUrl} 
                controls 
                className="w-full h-full max-h-[calc(90vh-120px)] object-contain"
                autoPlay
              >
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          ) : type === CourseContentType.PDF ? (
            <div className="w-full h-full">
              <iframe
                src={fileUrl}
                className="w-full h-[calc(90vh-120px)] border-0 rounded-lg"
                title={title || 'PDF Viewer'}
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

