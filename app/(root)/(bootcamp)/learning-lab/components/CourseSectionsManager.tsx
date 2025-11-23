'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  BookOpen, Upload, X, Plus, Edit, Trash2, FileText, Video, File, 
  ChevronRight, Loader2, ArrowLeft, Eye, EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useUploadThing } from '@/lib/uploadthing'
import { updateBootcampCourse } from '@/actions/bootcamp.action'
import { toast } from 'sonner'

// Enum CourseContentType (défini localement si non disponible depuis Prisma)
enum CourseContentType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  PDF = 'PDF'
}

interface CourseSection {
  id: string
  title: string
  type: CourseContentType
  content?: string // Pour TEXT
  fileUrl?: string // Pour VIDEO et PDF
  order: number
}

interface CourseSectionsManagerProps {
  course: {
    id: string
    title: string
    courseSections?: any
  }
  onUpdate?: () => void
  onBack?: () => void
}

const contentTypeLabels: Record<CourseContentType, string> = {
  [CourseContentType.TEXT]: 'Texte',
  [CourseContentType.VIDEO]: 'Vidéo',
  [CourseContentType.PDF]: 'PDF'
}

const contentTypeIcons: Record<CourseContentType, typeof FileText> = {
  [CourseContentType.TEXT]: FileText,
  [CourseContentType.VIDEO]: Video,
  [CourseContentType.PDF]: File
}

export function CourseSectionsManager({ course, onUpdate, onBack }: CourseSectionsManagerProps) {
  const [showSectionsList, setShowSectionsList] = useState(true)
  
  // Fonction pour tronquer le titre du cours
  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + '...'
  }
  const [sections, setSections] = useState<CourseSection[]>([])
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [newSection, setNewSection] = useState<Partial<CourseSection>>({
    title: '',
    type: CourseContentType.TEXT,
    content: '',
    order: 0
  })
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const { startUpload, isUploading } = useUploadThing('mediaUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]?.url && uploadingSectionId) {
        const currentSectionId = uploadingSectionId
        setUploadProgress(prev => ({ ...prev, [currentSectionId]: 100 }))
        setTimeout(() => {
          handleUploadComplete(res[0].url, currentSectionId)
        }, 500)
      }
    },
    onUploadError: (error) => {
      const currentSectionId = uploadingSectionId
      setUploadingSectionId(null)
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        if (currentSectionId) {
          delete newProgress[currentSectionId]
        }
        return newProgress
      })
      toast.error(`Erreur lors de l'upload: ${error.message}`)
    }
  })

  // Charger les sections existantes depuis courseSections
  useEffect(() => {
    if (course.courseSections && typeof course.courseSections === 'object') {
      const sectionsData = course.courseSections as any
      if (sectionsData.sections && Array.isArray(sectionsData.sections)) {
        setSections(sectionsData.sections as CourseSection[])
      } else if (Array.isArray(sectionsData)) {
        // Si courseSections est directement un tableau
        setSections(sectionsData as CourseSection[])
      }
    }
  }, [course.courseSections])

  // Simuler la progression de l'upload
  useEffect(() => {
    if (uploadingSectionId && isUploading) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[uploadingSectionId] || 0
          if (currentProgress >= 90) {
            clearInterval(interval)
            return prev
          }
          return {
            ...prev,
            [uploadingSectionId]: currentProgress + 10
          }
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [uploadingSectionId, isUploading])

  const handleUploadComplete = async (fileUrl: string, sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const updatedSection = { ...section, fileUrl }
    const updatedSections = sections.map(s => s.id === sectionId ? updatedSection : s)
    
    setSections(updatedSections)
    await saveSections(updatedSections)
    
    setUploadingSectionId(null)
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[sectionId]
      return newProgress
    })
  }

  const saveSections = async (sectionsToSave: CourseSection[]) => {
    try {
      const result = await updateBootcampCourse(course.id, {
        courseSections: {
          sections: sectionsToSave
        }
      })

      if (result.success) {
        toast.success('Sections mises à jour avec succès')
        onUpdate?.()
      } else {
        toast.error(result.error || 'Erreur lors de la sauvegarde des sections')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des sections')
    }
  }

  const onDrop = useCallback((acceptedFiles: File[], sectionId?: string) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (sectionId) {
      // Upload pour une section existante
      setUploadingSectionId(sectionId)
      setUploadProgress(prev => ({ ...prev, [sectionId]: 0 }))
      startUpload([file])
    } else {
      // Upload pour une nouvelle section
      setFileToUpload(file)
    }
  }, [startUpload])

  const handleAddSection = async () => {
    if (!newSection.title?.trim()) {
      toast.error('Veuillez saisir un titre pour la section')
      return
    }

    let fileUrl: string | undefined = undefined

    // Uploader le fichier si nécessaire
    if (fileToUpload && (newSection.type === CourseContentType.VIDEO || newSection.type === CourseContentType.PDF)) {
      try {
        const tempId = `temp-${Date.now()}`
        setUploadingSectionId(tempId)
        setUploadProgress(prev => ({ ...prev, [tempId]: 0 }))
        
        const uploadResult = await startUpload([fileToUpload])
        if (uploadResult && uploadResult[0]?.url) {
          fileUrl = uploadResult[0].url
        } else {
          throw new Error('Échec de l\'upload')
        }
      } catch (error) {
        toast.error('Erreur lors de l\'upload du fichier')
        setUploadingSectionId(null)
        setFileToUpload(null)
        return
      }
    }

    const section: CourseSection = {
      id: `section-${Date.now()}`,
      title: newSection.title,
      type: newSection.type || CourseContentType.TEXT,
      content: newSection.type === CourseContentType.TEXT ? newSection.content : undefined,
      fileUrl: fileUrl,
      order: sections.length
    }

    const updatedSections = [...sections, section]
    setSections(updatedSections)
    await saveSections(updatedSections)

    // Reset mais garder le formulaire ouvert pour ajouter une autre section
    setNewSection({ title: '', type: CourseContentType.TEXT, content: '', order: 0 })
    setFileToUpload(null)
    setUploadingSectionId(null)
    setUploadProgress({})
    // Ne pas fermer setIsAddingSection(false) pour permettre d'ajouter plusieurs sections
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
      return
    }

    const updatedSections = sections.filter(s => s.id !== sectionId)
    setSections(updatedSections)
    await saveSections(updatedSections)
  }

  const handleUpdateSection = async (sectionId: string, updates: Partial<CourseSection>) => {
    const updatedSections = sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    )
    setSections(updatedSections)
    await saveSections(updatedSections)
    setEditingSectionId(null)
  }

  const SectionDropzone = ({ section, onDrop }: { section: CourseSection, onDrop: (files: File[]) => void }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: section.type === CourseContentType.VIDEO 
        ? { 'video/*': ['.mp4', '.webm', '.mov'] }
        : section.type === CourseContentType.PDF
        ? { 'application/pdf': ['.pdf'] }
        : undefined,
      maxFiles: 1,
      maxSize: section.type === CourseContentType.VIDEO ? 100 * 1024 * 1024 : 10 * 1024 * 1024, // 100MB pour vidéo, 10MB pour PDF
      disabled: uploadingSectionId === section.id
    })

    const Icon = contentTypeIcons[section.type]
    const isUploading = uploadingSectionId === section.id
    const progress = uploadProgress[section.id] || 0

    return (
      <div
        {...getRootProps()}
        className={`
          w-full rounded-lg border-2 border-dashed transition-all cursor-pointer
          flex flex-col items-center justify-center gap-3 p-6
          ${isDragActive
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-4 ring-emerald-500/20'
            : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 hover:border-emerald-400 dark:hover:border-emerald-600'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="w-full space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
              Upload en cours...
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {Math.round(progress)}%
            </div>
          </div>
        ) : (
          <>
            <div className={`p-3 rounded-full transition-all ${isDragActive ? 'bg-emerald-500 scale-110' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Icon className={`h-6 w-6 transition-all ${isDragActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isDragActive 
                  ? 'Déposez le fichier ici' 
                  : section.fileUrl 
                    ? 'Cliquez ou glissez-déposez pour remplacer'
                    : 'Cliquez ou glissez-déposez pour uploader'
                }
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {section.type === CourseContentType.VIDEO 
                  ? 'MP4, WebM, MOV jusqu\'à 100MB'
                  : 'PDF jusqu\'à 10MB'
                }
              </p>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb avec boutons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          )}
          <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            {truncateTitle(course.title, 30)}
          </span>
          <ChevronRight className="h-4 w-4" />
          <span>Sections</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSectionsList(!showSectionsList)}
            className="border-emerald-200 dark:border-emerald-800"
          >
            {showSectionsList ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Masquer les sections
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Visualiser les sections ({sections.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sections List */}
      {showSectionsList && (
      <div className="space-y-4">
        {sections.map((section, index) => {
          const Icon = contentTypeIcons[section.type]
          const isEditing = editingSectionId === section.id

          return (
            <Card key={section.id} className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <Input
                          value={section.title}
                          onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                          className="border-emerald-200 dark:border-emerald-800"
                          onBlur={() => setEditingSectionId(null)}
                          autoFocus
                        />
                      ) : (
                        <CardTitle 
                          className="text-base cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                          onClick={() => setEditingSectionId(section.id)}
                        >
                          {section.title}
                        </CardTitle>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                        >
                          {contentTypeLabels[section.type]}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Section {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSection(section.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.type === CourseContentType.TEXT ? (
                  <Textarea
                    value={section.content || ''}
                    onChange={(e) => handleUpdateSection(section.id, { content: e.target.value })}
                    placeholder="Contenu de la section texte..."
                    className="border-emerald-200 dark:border-emerald-800 min-h-[150px]"
                  />
                ) : (
                  <SectionDropzone
                    section={section}
                    onDrop={(files) => onDrop(files, section.id)}
                  />
                )}
                {section.fileUrl && (
                  <div className="space-y-3">
                    {/* Preview du média */}
                    {section.type === CourseContentType.VIDEO ? (
                      <div className="w-full rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-slate-900">
                        <video 
                          src={section.fileUrl} 
                          controls 
                          className="w-full h-auto max-h-[400px]"
                        >
                          Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                      </div>
                    ) : section.type === CourseContentType.PDF ? (
                      <div className="w-full rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900">
                        <iframe
                          src={section.fileUrl}
                          className="w-full h-[500px] border-0"
                          title={`PDF ${section.title}`}
                        />
                      </div>
                    ) : null}
                    
                    {/* Lien de téléchargement */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <a 
                        href={section.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-700 dark:text-emerald-300 hover:underline flex-1 truncate"
                      >
                        {section.type === CourseContentType.VIDEO ? 'Ouvrir la vidéo dans un nouvel onglet' : 'Ouvrir le PDF dans un nouvel onglet'}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      )}

      {/* Add New Section */}
      {!isAddingSection ? (
        <Button
          onClick={() => setIsAddingSection(true)}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une section
        </Button>
      ) : (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Nouvelle section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Titre de la section *</Label>
              <Input
                value={newSection.title}
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                placeholder="Ex: Introduction, Chapitre 1, etc."
                className="border-emerald-200 dark:border-emerald-800"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Type de contenu *</Label>
              <Select
                value={newSection.type}
                onValueChange={(value) => setNewSection({ 
                  ...newSection, 
                  type: value as CourseContentType,
                  content: value === CourseContentType.TEXT ? newSection.content : '',
                  fileUrl: undefined
                })}
              >
                <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CourseContentType.TEXT}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {contentTypeLabels[CourseContentType.TEXT]}
                    </div>
                  </SelectItem>
                  <SelectItem value={CourseContentType.VIDEO}>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      {contentTypeLabels[CourseContentType.VIDEO]}
                    </div>
                  </SelectItem>
                  <SelectItem value={CourseContentType.PDF}>
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      {contentTypeLabels[CourseContentType.PDF]}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newSection.type === CourseContentType.TEXT ? (
              <div>
                <Label className="text-sm font-medium mb-2 block">Contenu</Label>
                <Textarea
                  value={newSection.content || ''}
                  onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                  placeholder="Saisissez le contenu de la section..."
                  className="border-emerald-200 dark:border-emerald-800 min-h-[150px]"
                />
              </div>
            ) : (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  {newSection.type === CourseContentType.VIDEO ? 'Fichier vidéo' : 'Fichier PDF'}
                </Label>
                <SectionDropzone
                  section={{ id: 'new', type: newSection.type || CourseContentType.PDF } as CourseSection}
                  onDrop={(files) => onDrop(files)}
                />
                {fileToUpload && (
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <File className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
                      {fileToUpload.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFileToUpload(null)}
                      className="h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddSection}
                disabled={!newSection.title?.trim() || (newSection.type !== CourseContentType.TEXT && !fileToUpload)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
              >
                {uploadingSectionId?.startsWith('temp') ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter la section
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingSection(false)
                  setNewSection({ title: '', type: CourseContentType.TEXT, content: '', order: 0 })
                  setFileToUpload(null)
                  setUploadingSectionId(null)
                  setUploadProgress({})
                }}
                className="border-emerald-200 dark:border-emerald-800"
              >
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

