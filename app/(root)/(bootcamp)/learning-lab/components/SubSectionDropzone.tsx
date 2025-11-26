'use client'

import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, Video, File, Loader2, CheckCircle, X, Trash2, Maximize2, ExternalLink } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CourseContentType } from './types'
import { MediaViewerModal } from './MediaViewerModal'

interface SubSectionDropzoneProps {
  subSection: { id?: string; type: CourseContentType; fileUrl?: string }
  tempId?: string
  onDrop: (acceptedFiles: File[], rejectedFiles: any[]) => void
  onRemove?: () => void
  isUploading?: boolean
  uploadStatus?: 'uploading' | 'success' | 'error'
  progress?: number
  hasFile?: boolean
}

const contentTypeIcons: Record<CourseContentType, typeof FileText> = {
  [CourseContentType.VIDEO]: Video,
  [CourseContentType.TEXT]: FileText,
  [CourseContentType.PDF]: File
}

export function SubSectionDropzone({
  subSection,
  tempId,
  onDrop,
  onRemove,
  isUploading = false,
  uploadStatus,
  progress = 0,
  hasFile = false
}: SubSectionDropzoneProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const subSectionId = tempId || subSection.id || ''
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setPreviewFile(file)
        // Créer une URL de preview pour les vidéos et PDFs
        if (subSection.type === CourseContentType.VIDEO || subSection.type === CourseContentType.PDF) {
          const url = URL.createObjectURL(file)
          setPreviewUrl(url)
        }
      }
      onDrop(acceptedFiles, rejectedFiles)
    },
    accept: subSection.type === CourseContentType.VIDEO 
      ? { 'video/*': ['.mp4', '.webm', '.mov'] }
      : subSection.type === CourseContentType.PDF
      ? { 'application/pdf': ['.pdf'] }
      : undefined,
    maxFiles: 1,
    maxSize: subSection.type === CourseContentType.VIDEO ? 100 * 1024 * 1024 : 10 * 1024 * 1024,
    disabled: isUploading
  })

  const Icon = contentTypeIcons[subSection.type]
  const isSuccess = uploadStatus === 'success'
  const isError = uploadStatus === 'error'
  
  // Utiliser fileUrl si disponible, sinon previewUrl
  const displayUrl = subSection.fileUrl || previewUrl
  
  // Nettoyer l'URL de preview quand le composant se démonte ou quand un nouveau fichier est uploadé
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])
  
  // Réinitialiser la preview quand l'upload réussit
  React.useEffect(() => {
    if (isSuccess && subSection.fileUrl) {
      setPreviewFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }, [isSuccess, subSection.fileUrl, previewUrl])
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setPreviewFile(null)
    onRemove?.()
  }

  return (
    <div className="w-full space-y-3">
      <div
        {...getRootProps()}
        className={`
          w-full rounded-lg border-2 border-dashed transition-all cursor-pointer
          flex flex-col items-center justify-center gap-3 p-4 sm:p-6
          ${isDragActive
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-4 ring-emerald-500/20'
            : isError
            ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
            : isSuccess
            ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
            : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 hover:border-emerald-400 dark:hover:border-emerald-600'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {/* Preview vidéo dans la dropzone - afficher même pendant l'upload */}
        {displayUrl && subSection.type === CourseContentType.VIDEO && (
          <div className="w-full rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-slate-900 mb-3">
            <video 
              src={displayUrl} 
              controls 
              className="w-full h-auto max-h-[120px] sm:max-h-[150px] md:max-h-[200px]"
              preload="metadata"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        )}
        
        {/* Preview PDF dans la dropzone - afficher même pendant l'upload */}
        {displayUrl && subSection.type === CourseContentType.PDF && (
          <div className="w-full rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 mb-3">
            <iframe
              src={displayUrl}
              className="w-full h-[120px] sm:h-[150px] md:h-[200px] border-0"
              title="PDF Preview"
            />
          </div>
        )}
        
        {isUploading ? (
          <div className="w-full space-y-3 p-2 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                  Upload en cours...
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2 sm:h-3 bg-slate-200 dark:bg-slate-700" />
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Veuillez patienter pendant le téléchargement
            </div>
          </div>
        ) : isSuccess ? (
          <div className="w-full space-y-3 p-2 sm:p-4 text-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto" />
            <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">
              Upload réussi !
            </span>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Le fichier a été uploadé avec succès
            </div>
          </div>
        ) : isError ? (
          <div className="w-full space-y-3 p-2 sm:p-4 text-center">
            <X className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mx-auto" />
            <span className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
              Erreur d'upload
            </span>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Cliquez pour réessayer
            </div>
          </div>
        ) : (
          <>
            <div className={`p-2 sm:p-3 rounded-full transition-all ${
              isDragActive ? 'bg-emerald-500 scale-110' : 
              isError ? 'bg-red-100 dark:bg-red-900/30' :
              'bg-emerald-100 dark:bg-emerald-900/30'
            }`}>
              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 transition-all ${
                isDragActive ? 'text-white' : 
                isError ? 'text-red-600 dark:text-red-400' :
                'text-emerald-600 dark:text-emerald-400'
              }`} />
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                {isDragActive 
                  ? 'Déposez le fichier ici' 
                  : hasFile || displayUrl
                    ? 'Cliquez ou glissez-déposez pour remplacer'
                    : 'Cliquez ou glissez-déposez pour uploader'
                }
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {subSection.type === CourseContentType.VIDEO 
                  ? 'MP4, WebM, MOV jusqu\'à 100MB'
                  : 'PDF jusqu\'à 10MB'
                }
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Actions pour les fichiers uploadés */}
      {(hasFile || displayUrl) && !isUploading && displayUrl && (
        <div className="flex items-center gap-2 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMediaModal(true)}
            className="flex-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="text-xs sm:text-sm">Agrandir</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(displayUrl, '_blank', 'noopener,noreferrer')}
            className="flex-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="text-xs sm:text-sm">Ouvrir</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm hidden sm:inline">Supprimer</span>
            <span className="text-xs sm:text-sm sm:hidden">×</span>
          </Button>
        </div>
      )}
      {displayUrl && (
        <MediaViewerModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          fileUrl={displayUrl}
          type={subSection.type}
          title={subSection.id ? undefined : 'Preview'}
        />
      )}
    </div>
  )
}

