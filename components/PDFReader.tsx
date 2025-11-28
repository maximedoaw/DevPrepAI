'use client'

import React, { useState } from 'react'
import { Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PDFReaderProps {
  src: string
  title?: string
  className?: string
  onComplete?: () => void
}

export function PDFReader({
  src,
  title,
  className,
  onComplete
}: PDFReaderProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [hasViewed, setHasViewed] = useState(false)

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = title || 'document.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(src, '_blank', 'noopener,noreferrer')
  }

  // Marquer comme vu quand l'iframe est chargé
  const handleIframeLoad = () => {
    if (!hasViewed) {
      setHasViewed(true)
      // Si onComplete est fourni, l'appeler après un délai pour simuler la lecture
      if (onComplete) {
        // Pour les PDFs, on considère qu'ils sont complétés après 30 secondes de visualisation
        setTimeout(() => {
          onComplete()
        }, 30000)
      }
    }
  }

  return (
    <div className={cn('relative w-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden', className)}>
      {/* Barre d'outils */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-3 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <File className="h-4 w-4 text-emerald-400" />
          </div>
          {title && (
            <span className="text-white font-medium text-sm truncate max-w-[200px]">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-black/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="h-7 w-7 text-white hover:bg-emerald-500/20"
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white text-xs font-medium px-2 min-w-[50px] text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="h-7 w-7 text-white hover:bg-emerald-500/20"
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Rotation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            className="h-8 w-8 text-white hover:bg-emerald-500/20"
            title="Tourner"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          {/* Télécharger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="h-8 w-8 text-white hover:bg-emerald-500/20"
            title="Télécharger"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          {/* Ouvrir dans un nouvel onglet */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenInNewTab}
            className="h-8 w-8 text-white hover:bg-emerald-500/20"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conteneur PDF avec zoom et rotation */}
      <div 
        className="w-full h-full overflow-auto bg-slate-200 dark:bg-slate-800"
        style={{
          height: '600px'
        }}
      >
        <div
          className="flex items-center justify-center p-4 transition-transform duration-300"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            minHeight: '100%'
          }}
        >
          <iframe
            src={src}
            className="w-full border-0 rounded-lg shadow-2xl"
            style={{
              height: `${100 / (zoom / 100)}%`,
              minHeight: '600px'
            }}
            title={title || 'PDF Viewer'}
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  )
}

