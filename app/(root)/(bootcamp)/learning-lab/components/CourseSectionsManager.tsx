'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  BookOpen, Upload, X, Plus, Edit, Trash2, FileText, Video, File, 
  ChevronRight, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle
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
import { SubSectionDropzone } from './SubSectionDropzone'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'

// Enum CourseContentType (défini localement si non disponible depuis Prisma)
enum CourseContentType {
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  PDF = 'PDF'
}

// Leçon avec contenu
interface SubSection {
  id: string
  title: string
  type: CourseContentType
  content?: string // Pour TEXT
  fileUrl?: string // Pour VIDEO et PDF
  order: number
}

// Section (chapitre) qui contient des leçons
interface Section {
  id: string
  title: string
  order: number
  subSections: SubSection[]
}

interface NewSubSectionForm extends Partial<SubSection> {
  tempId: string
  fileToUpload?: File
}

interface NewSectionForm {
  tempId: string
  title: string
  subSections: NewSubSectionForm[]
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
  [CourseContentType.VIDEO]: 'Vidéo',
  [CourseContentType.TEXT]: 'Texte',
  [CourseContentType.PDF]: 'PDF'
}

const contentTypeIcons: Record<CourseContentType, typeof FileText> = {
  [CourseContentType.VIDEO]: Video,
  [CourseContentType.TEXT]: FileText,
  [CourseContentType.PDF]: File
}

export function CourseSectionsManager({ course, onUpdate, onBack }: CourseSectionsManagerProps) {
  const [showSectionsList, setShowSectionsList] = useState(true)
  
  // Fonction pour tronquer le titre du cours
  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + '...'
  }
  const [sections, setSections] = useState<Section[]>([])
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSubSectionId, setEditingSubSectionId] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(new Set())
  // Nouveau système pour gérer plusieurs sections en cours de création
  const [newSections, setNewSections] = useState<NewSectionForm[]>([])
  const [uploadingSubSectionId, setUploadingSubSectionId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'uploading' | 'success' | 'error'>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: 'section' | 'subSection' | 'file'
    sectionId?: string
    subSectionId?: string
    itemName?: string
  }>({ open: false, type: 'section' })

  // État pour stocker les URLs uploadées (pas encore sauvegardées)
  const [pendingUploads, setPendingUploads] = useState<Record<string, string>>({})
  
  const { startUpload, isUploading } = useUploadThing('mediaUploader', {
    onUploadProgress: (progress) => {
      // Mettre à jour la progression réelle
      setUploadingSubSectionId(prevId => {
        if (prevId) {
          setUploadProgress(prev => ({ ...prev, [prevId]: progress }))
        }
        return prevId
      })
    },
    onClientUploadComplete: async (res) => {
      // Utiliser setTimeout pour éviter l'erreur React
      setTimeout(() => {
        setUploadingSubSectionId(prevId => {
          const currentSubSectionId = prevId
          if (res && res[0]?.url && currentSubSectionId) {
            setUploadProgress(prev => ({ ...prev, [currentSubSectionId]: 100 }))
            setUploadStatus(prev => ({ ...prev, [currentSubSectionId]: 'success' }))
            
            // Stocker l'URL dans pendingUploads (pas de sauvegarde automatique)
            setPendingUploads(prev => ({ ...prev, [currentSubSectionId]: res[0].url }))
            
            toast.success('Upload terminé avec succès!', {
              description: 'Le fichier a été uploadé. N\'oubliez pas de sauvegarder la section.',
              duration: 3000,
            })
            
            // Mettre à jour l'état local sans sauvegarder
            handleUploadComplete(res[0].url, currentSubSectionId, false).catch(error => {
              console.error('Erreur lors de la mise à jour locale:', error)
            })
            
            // Nettoyer le statut après un délai
            setTimeout(() => {
              setUploadStatus(prev => {
                const newStatus = { ...prev }
                delete newStatus[currentSubSectionId]
                return newStatus
              })
              setUploadProgress(prev => {
                const newProgress = { ...prev }
                delete newProgress[currentSubSectionId]
                return newProgress
              })
            }, 2000)
          } else {
            if (currentSubSectionId) {
              setUploadStatus(prev => ({ ...prev, [currentSubSectionId]: 'error' }))
            }
            toast.error('Échec de l\'upload', {
              description: 'Le fichier a été uploadé mais aucune URL n\'a été retournée.',
              duration: 5000,
            })
          }
          return null // Réinitialiser après traitement
        })
      }, 0)
    },
    onUploadError: (error) => {
      const currentSubSectionId = uploadingSubSectionId
      setUploadingSubSectionId(null)
      if (currentSubSectionId) {
        setUploadStatus(prev => ({ ...prev, [currentSubSectionId]: 'error' }))
      }
      
      // Gestion détaillée des erreurs
      let errorMessage = 'Erreur lors de l\'upload'
      let errorDescription = error.message || 'Une erreur inconnue est survenue'
      
      if (error.message?.includes('File too large')) {
        errorMessage = 'Fichier trop volumineux'
        errorDescription = 'Le fichier dépasse la taille maximale autorisée. Veuillez choisir un fichier plus petit.'
      } else if (error.message?.includes('File type not allowed')) {
        errorMessage = 'Type de fichier non autorisé'
        errorDescription = 'Le format de fichier n\'est pas supporté. Veuillez vérifier les formats acceptés.'
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = 'Erreur réseau'
        errorDescription = 'Problème de connexion internet. Veuillez vérifier votre connexion et réessayer.'
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      })
      
      // Nettoyer la progression
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        if (currentSubSectionId) {
          delete newProgress[currentSubSectionId]
        }
        return newProgress
      })
    },
    onUploadBegin: () => {
      const currentSubSectionId = uploadingSubSectionId
      if (currentSubSectionId) {
        setUploadStatus(prev => ({ ...prev, [currentSubSectionId]: 'uploading' }))
        toast.info('Upload en cours...', {
          description: 'Veuillez patienter pendant le téléchargement de votre fichier.',
          duration: 3000,
        })
      }
    }
  })

  // Charger les sections existantes depuis courseSections
  useEffect(() => {
    const loadSections = () => {
      if (course.courseSections) {
        try {
          let sectionsData: any
          
          // Si c'est une string JSON, la parser
          if (typeof course.courseSections === 'string') {
            sectionsData = JSON.parse(course.courseSections)
          } else {
            sectionsData = course.courseSections
          }
          
          // Vérifier si c'est un objet avec une propriété sections
          if (sectionsData && typeof sectionsData === 'object') {
      if (sectionsData.sections && Array.isArray(sectionsData.sections)) {
              // Format: { sections: [...] }
              const loadedSections = sectionsData.sections as Section[]
              // S'assurer que toutes les sections ont des subSections (au moins un tableau vide)
              const normalizedSections = loadedSections.map(s => ({
                ...s,
                subSections: s.subSections || []
              }))
              setSections(normalizedSections)
              // Ouvrir toutes les sections par défaut
              setExpandedSections(new Set(normalizedSections.map((s: Section) => s.id)))
              // Ouvrir toutes les sous-sections par défaut aussi
              const allSubSectionIds = normalizedSections.flatMap(s => s.subSections.map(sub => sub.id))
              setExpandedSubSections(new Set(allSubSectionIds))
              console.log('Sections chargées depuis la base de données:', normalizedSections)
      } else if (Array.isArray(sectionsData)) {
              // Format: [...] (tableau direct)
              const loadedSections = sectionsData as Section[]
              const normalizedSections = loadedSections.map(s => ({
                ...s,
                subSections: s.subSections || []
              }))
              setSections(normalizedSections)
              setExpandedSections(new Set(normalizedSections.map((s: Section) => s.id)))
              const allSubSectionIds = normalizedSections.flatMap(s => s.subSections.map(sub => sub.id))
              setExpandedSubSections(new Set(allSubSectionIds))
              console.log('Sections chargées depuis la base de données:', normalizedSections)
            } else {
              // Si c'est un objet mais pas le format attendu, essayer de trouver les sections
              console.warn('Format de courseSections non reconnu:', sectionsData)
              setSections([])
            }
          } else {
            setSections([])
          }
        } catch (error) {
          console.error('Erreur lors du chargement des sections:', error)
          toast.error('Erreur lors du chargement des sections', {
            description: 'Les sections existantes n\'ont pas pu être chargées correctement.',
          })
          setSections([])
        }
      } else {
        setSections([])
      }
    }
    
    loadSections()
  }, [course.courseSections, course.id])

  // Plus besoin de simuler la progression, on utilise onUploadProgress

  const handleUploadComplete = async (fileUrl: string, subSectionId: string, shouldSave: boolean = false) => {
    try {
      // Chercher dans toutes les sections pour trouver la sous-section
      let found = false
      let previewUrlToClean: string | null = null
      
      const updatedSections = sections.map(section => {
        const subSection = section.subSections.find(sub => sub.id === subSectionId)
        if (subSection) {
          found = true
          // Nettoyer l'ancienne preview locale si elle existe
          if (subSection.fileUrl?.startsWith('blob:')) {
            previewUrlToClean = subSection.fileUrl
          }
          return {
            ...section,
            subSections: section.subSections.map(sub =>
              sub.id === subSectionId ? { ...sub, fileUrl } : sub
            )
          }
        }
        return section
      })

      // Nettoyer la preview locale
      if (previewUrlToClean) {
        URL.revokeObjectURL(previewUrlToClean)
      }

      if (found) {
        setSections(updatedSections)
        // Sauvegarder seulement si demandé explicitement
        if (shouldSave) {
          await saveSections(updatedSections)
        }
        // Développer la sous-section pour voir la preview
        setExpandedSubSections(prev => new Set(prev).add(subSectionId))
      } else {
        // Si c'est une nouvelle sous-section (tempId) dans une nouvelle section
        setNewSections(prev => prev.map(section => ({
          ...section,
          subSections: section.subSections.map(sub => {
            // Nettoyer la preview locale si elle existe
            if (sub.tempId === subSectionId && sub.fileUrl?.startsWith('blob:')) {
              URL.revokeObjectURL(sub.fileUrl)
            }
            return sub.tempId === subSectionId
              ? { ...sub, fileUrl, fileToUpload: undefined }
              : sub
          })
        })))
      }
      
      setUploadingSubSectionId(null)
    } catch (error) {
      console.error('Erreur lors de la mise à jour après upload:', error)
      if (shouldSave) {
        toast.error('Erreur lors de la sauvegarde', {
          description: 'Le fichier a été uploadé mais une erreur est survenue lors de la sauvegarde.',
        })
      }
    }
  }

  const saveSections = async (sectionsToSave: Section[]) => {
    try {
      setIsSaving(true)
      
      // Remplacer les preview URLs locales (blob:) par les URLs uploadées si disponibles
      const sectionsWithUploadedUrls = sectionsToSave.map(section => ({
        ...section,
        subSections: section.subSections.map(sub => {
          // Si on a une URL uploadée en attente, l'utiliser
          const uploadedUrl = pendingUploads[sub.id]
          // Si c'est une preview locale (blob:), utiliser l'URL uploadée ou undefined
          const finalUrl = uploadedUrl || (sub.fileUrl?.startsWith('blob:') ? undefined : sub.fileUrl)
          return {
            ...sub,
            fileUrl: finalUrl
          }
        })
      }))
      
      // Préparer les données pour la sauvegarde en format JSON
      const sectionsData = {
        sections: sectionsWithUploadedUrls.map((section, index) => ({
          id: section.id,
          title: section.title,
          order: section.order !== undefined ? section.order : index,
          subSections: section.subSections.map((sub, subIndex) => ({
            id: sub.id,
            title: sub.title,
            type: sub.type,
            content: sub.type === CourseContentType.TEXT ? (sub.content || null) : null,
            fileUrl: (sub.type === CourseContentType.VIDEO || sub.type === CourseContentType.PDF) ? (sub.fileUrl || null) : null,
            order: sub.order !== undefined ? sub.order : subIndex
          }))
        }))
      }
      
      console.log('Sauvegarde des sections dans courseSections:', JSON.stringify(sectionsData, null, 2))
      
      const result = await updateBootcampCourse(course.id, {
        courseSections: sectionsData
      })

      if (result.success) {
        // Nettoyer les uploads en attente
        setPendingUploads({})
        
        // Remplacer les preview URLs par les URLs uploadées dans l'état
        setSections(sectionsWithUploadedUrls)
        
        const totalSubSections = sectionsToSave.reduce((acc, s) => acc + s.subSections.length, 0)
        toast.success('Sections mises à jour avec succès', {
          description: `${sectionsToSave.length} section(s) avec ${totalSubSections} leçon${totalSubSections > 1 ? 's' : ''} sauvegardée${totalSubSections > 1 ? 's' : ''} dans la base de données.`,
        })
        onUpdate?.()
      } else {
        throw new Error(result.error || 'Erreur inconnue')
      }
    } catch (error) {
      console.error('Erreur sauvegarde sections:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      toast.error('Erreur lors de la sauvegarde', {
        description: errorMessage.includes('Erreur lors de la mise à jour') 
          ? 'Une erreur est survenue lors de la mise à jour du cours. Veuillez vérifier les données et réessayer.'
          : 'Les sections n\'ont pas pu être sauvegardées. Veuillez réessayer.',
      })
      throw error // Propager l'erreur pour la gestion dans handleSaveAllSections
    } finally {
      setIsSaving(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[], subSectionId?: string, tempId?: string) => {
    // Gérer les fichiers rejetés
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      let errorMessage = 'Fichier rejeté'
      
      if (rejection.errors[0]?.code === 'file-too-large') {
        errorMessage = 'Fichier trop volumineux'
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        errorMessage = 'Type de fichier non supporté'
      } else if (rejection.errors[0]?.code === 'too-many-files') {
        errorMessage = 'Trop de fichiers'
      }
      
      toast.error(errorMessage, {
        description: 'Veuillez vérifier les restrictions de taille et de type de fichier.',
        duration: 5000,
      })
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    const targetId = subSectionId || tempId
    if (!targetId) return

    // Créer une preview locale immédiate
    const previewUrl = URL.createObjectURL(file)
    
    // Mettre à jour l'état local avec la preview
    if (subSectionId) {
      // Pour les sections existantes, mettre à jour avec la preview
      setSections(prev => prev.map(section => ({
        ...section,
        subSections: section.subSections.map(sub =>
          sub.id === subSectionId 
            ? { ...sub, fileUrl: previewUrl } 
            : sub
        )
      })))
      // Développer pour voir la preview
      setExpandedSubSections(prev => new Set(prev).add(subSectionId))
    } else if (tempId) {
      // Pour les nouvelles sous-sections
      setNewSections(prev => prev.map(section => ({
        ...section,
        subSections: section.subSections.map(sub =>
          sub.tempId === tempId 
            ? { ...sub, fileToUpload: file, fileUrl: previewUrl } 
            : sub
        )
      })))
    }

    setUploadingSubSectionId(targetId)
    setUploadProgress(prev => ({ ...prev, [targetId]: 0 }))
    setUploadStatus(prev => ({ ...prev, [targetId]: 'uploading' }))

    // Démarrer l'upload
    startUpload([file])
  }, [startUpload])

  const handleAddNewSectionForm = () => {
    const tempId = `section-${Date.now()}`
    setNewSections(prev => [...prev, {
      tempId,
      title: '',
      subSections: []
    }])
  }

  const handleUpdateNewSection = (tempId: string, updates: Partial<NewSectionForm>) => {
    setNewSections(prev => prev.map(s => 
      s.tempId === tempId ? { ...s, ...updates } : s
    ))
  }

  const handleRemoveNewSection = (tempId: string) => {
    setNewSections(prev => {
      const section = prev.find(s => s.tempId === tempId)
      if (section) {
        // Nettoyer les uploads en cours pour toutes les sous-sections
        section.subSections.forEach(sub => {
          if (uploadingSubSectionId === sub.tempId) {
            setUploadingSubSectionId(null)
            setUploadProgress(prev => {
              const newProgress = { ...prev }
              delete newProgress[sub.tempId]
              return newProgress
            })
            setUploadStatus(prev => {
              const newStatus = { ...prev }
              delete newStatus[sub.tempId]
              return newStatus
            })
          }
        })
      }
      return prev.filter(s => s.tempId !== tempId)
    })
  }

  const handleAddSubSectionToNewSection = (sectionTempId: string) => {
    const subSectionTempId = `sub-${Date.now()}`
    setNewSections(prev => prev.map(section =>
      section.tempId === sectionTempId
        ? {
            ...section,
            subSections: [...section.subSections, {
              tempId: subSectionTempId,
              title: '',
              type: CourseContentType.VIDEO,
              content: '',
              order: section.subSections.length
            }]
          }
        : section
    ))
  }

  const handleUpdateNewSubSection = (sectionTempId: string, subSectionTempId: string, updates: Partial<NewSubSectionForm>) => {
    setNewSections(prev => prev.map(section =>
      section.tempId === sectionTempId
        ? {
            ...section,
            subSections: section.subSections.map(sub =>
              sub.tempId === subSectionTempId ? { ...sub, ...updates } : sub
            )
          }
        : section
    ))
  }

  const handleRemoveNewSubSection = (sectionTempId: string, subSectionTempId: string) => {
    setNewSections(prev => prev.map(section =>
      section.tempId === sectionTempId
        ? {
            ...section,
            subSections: section.subSections.filter(sub => {
              if (sub.tempId === subSectionTempId) {
                // Nettoyer l'upload si en cours
                if (uploadingSubSectionId === subSectionTempId) {
                  setUploadingSubSectionId(null)
                  setUploadProgress(prev => {
                    const newProgress = { ...prev }
                    delete newProgress[subSectionTempId]
                    return newProgress
                  })
                  setUploadStatus(prev => {
                    const newStatus = { ...prev }
                    delete newStatus[subSectionTempId]
                    return newStatus
                  })
                }
                return false
              }
              return true
            })
          }
        : section
    ))
  }

  const handleSaveAllSections = async () => {
    // Valider toutes les sections
    const invalidSections = newSections.filter(s => 
      !s.title?.trim() || s.subSections.length === 0
    )

    if (invalidSections.length > 0) {
      toast.error('Sections incomplètes', {
        description: 'Veuillez compléter toutes les sections (titre et au moins une leçon).',
        duration: 5000,
      })
      return
    }

    // Valider toutes les sous-sections
    for (const section of newSections) {
      for (const subSection of section.subSections) {
        if (!subSection.title?.trim() || 
            (subSection.type !== CourseContentType.TEXT && !subSection.fileUrl && !subSection.fileToUpload)) {
          toast.error('Leçons incomplètes', {
            description: `La leçon "${subSection.title || 'sans titre'}" dans "${section.title || 'sans titre'}" est incomplète.`,
            duration: 5000,
          })
          return
        }
      }
    }

    // Vérifier s'il y a des uploads en cours
    const uploadsInProgress = newSections.some(section =>
      section.subSections.some(sub => uploadStatus[sub.tempId] === 'uploading')
    )

    if (uploadsInProgress) {
      toast.warning('Uploads en cours', {
        description: 'Veuillez attendre la fin des uploads avant de sauvegarder.',
        duration: 3000,
      })
      return
    }

    setIsSaving(true)

    try {
      const sectionsToAdd: Section[] = []
      
      for (const newSection of newSections) {
        const subSectionsToAdd: SubSection[] = []
        
        for (const newSubSection of newSection.subSections) {
          let fileUrl = newSubSection.fileUrl

          // Si un fichier doit être uploadé
          if (newSubSection.fileToUpload && !fileUrl) {
            const tempId = newSubSection.tempId
            setUploadingSubSectionId(tempId)
        setUploadProgress(prev => ({ ...prev, [tempId]: 0 }))
            setUploadStatus(prev => ({ ...prev, [tempId]: 'uploading' }))
        
            try {
              const uploadResult = await startUpload([newSubSection.fileToUpload])
        if (uploadResult && uploadResult[0]?.url) {
          fileUrl = uploadResult[0].url
        } else {
          throw new Error('Échec de l\'upload')
        }
      } catch (error) {
              toast.error(`Erreur lors de l'upload pour "${newSubSection.title}"`, {
                description: 'Impossible de sauvegarder cette leçon. Veuillez réessayer.',
              })
              setIsSaving(false)
        return
      }
    }

          const subSectionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          // Si on a une URL uploadée en attente pour cette sous-section, l'utiliser
          const uploadedUrl = pendingUploads[newSubSection.tempId] || fileUrl || undefined
          
          const subSection: SubSection = {
            id: subSectionId,
            title: newSubSection.title!,
            type: newSubSection.type || CourseContentType.TEXT,
            content: newSubSection.type === CourseContentType.TEXT ? newSubSection.content : undefined,
            fileUrl: uploadedUrl,
            order: subSectionsToAdd.length
          }
          
          // Si on avait une URL en attente, la transférer au nouvel ID
          const pendingUrl = pendingUploads[newSubSection.tempId]
          if (pendingUrl && uploadedUrl) {
            setPendingUploads(prev => {
              const newPending = { ...prev }
              delete newPending[newSubSection.tempId]
              newPending[subSectionId] = uploadedUrl
              return newPending
            })
          }

          subSectionsToAdd.push(subSection)
        }

        const section: Section = {
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: newSection.title,
          order: sections.length + sectionsToAdd.length,
          subSections: subSectionsToAdd
        }

        sectionsToAdd.push(section)
      }

      // Ajouter toutes les sections en une fois
      const updatedSections = [...sections, ...sectionsToAdd]
    setSections(updatedSections)
    await saveSections(updatedSections)

      // Réinitialiser
      setNewSections([])
      setUploadingSubSectionId(null)
    setUploadProgress({})
      setUploadStatus({})
      setIsAddingSection(false)
      
      toast.success('Sections ajoutées avec succès', {
        description: `${sectionsToAdd.length} section(s) avec ${sectionsToAdd.reduce((acc, s) => acc + s.subSections.length, 0)} leçon${sectionsToAdd.reduce((acc, s) => acc + s.subSections.length, 0) > 1 ? 's' : ''} ${sectionsToAdd.reduce((acc, s) => acc + s.subSections.length, 0) > 1 ? 'ont' : 'a'} été ajoutée${sectionsToAdd.reduce((acc, s) => acc + s.subSections.length, 0) > 1 ? 's' : ''}.`,
        duration: 4000,
      })
    } catch (error) {
      console.error('Erreur sauvegarde sections:', error)
      // L'erreur est déjà gérée dans saveSections
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    setDeleteDialog({
      open: true,
      type: 'section',
      sectionId,
      itemName: section?.title
    })
  }

  const confirmDeleteSection = async () => {
    if (!deleteDialog.sectionId) return
    
    try {
      const updatedSections = sections.filter(s => s.id !== deleteDialog.sectionId)
      setSections(updatedSections)
      setExpandedSections(prev => {
        const newSet = new Set(prev)
        newSet.delete(deleteDialog.sectionId!)
        return newSet
      })
      await saveSections(updatedSections)
      setDeleteDialog({ open: false, type: 'section' })
      toast.success('Section supprimée', {
        description: 'La section a été supprimée avec succès.',
      })
    } catch (error) {
      console.error('Erreur lors de la suppression de la section:', error)
      toast.error('Erreur lors de la suppression', {
        description: 'La section n\'a pas pu être supprimée. Veuillez réessayer.',
      })
    }
  }

  const handleUpdateSection = async (sectionId: string, updates: Partial<Section>) => {
    try {
    const updatedSections = sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    )
    setSections(updatedSections)
    await saveSections(updatedSections)
    setEditingSectionId(null)
    } catch (error) {
      // L'erreur est déjà gérée dans saveSections
    }
  }

  const handleDeleteSubSection = (sectionId: string, subSectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    const subSection = section?.subSections.find(sub => sub.id === subSectionId)
    setDeleteDialog({
      open: true,
      type: 'subSection',
      sectionId,
      subSectionId,
      itemName: subSection?.title
    })
  }

  const confirmDeleteSubSection = async () => {
    if (!deleteDialog.sectionId || !deleteDialog.subSectionId) return
    
    try {
      const updatedSections = sections.map(section =>
        section.id === deleteDialog.sectionId
          ? {
              ...section,
              subSections: section.subSections.filter(sub => sub.id !== deleteDialog.subSectionId)
            }
          : section
      )
      setSections(updatedSections)
      await saveSections(updatedSections)
      setDeleteDialog({ open: false, type: 'subSection' })
      toast.success('Leçon supprimée', {
        description: 'La leçon a été supprimée avec succès.',
      })
    } catch (error) {
      console.error('Erreur lors de la suppression de la leçon:', error)
        toast.error('Erreur lors de la suppression', {
        description: 'La leçon n\'a pas pu être supprimée. Veuillez réessayer.',
      })
    }
  }

  const handleUpdateSubSection = async (sectionId: string, subSectionId: string, updates: Partial<SubSection>) => {
    try {
      const updatedSections = sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              subSections: section.subSections.map(sub =>
                sub.id === subSectionId ? { ...sub, ...updates } : sub
              )
            }
          : section
      )
      setSections(updatedSections)
      await saveSections(updatedSections)
      setEditingSubSectionId(null)
    } catch (error) {
      // L'erreur est déjà gérée dans saveSections
    }
  }

  const handleRemoveFile = (sectionId: string, subSectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    const subSection = section?.subSections.find(sub => sub.id === subSectionId)
    setDeleteDialog({
      open: true,
      type: 'file',
      sectionId,
      subSectionId,
      itemName: subSection?.title
    })
  }

  const confirmRemoveFile = async () => {
    if (!deleteDialog.sectionId || !deleteDialog.subSectionId) return
    
    try {
      const updatedSections = sections.map(section =>
        section.id === deleteDialog.sectionId
          ? {
              ...section,
              subSections: section.subSections.map(sub =>
                sub.id === deleteDialog.subSectionId 
                  ? { ...sub, fileUrl: undefined, content: sub.type === CourseContentType.TEXT ? sub.content : undefined } 
                  : sub
              )
            }
          : section
      )
      setSections(updatedSections)
      await saveSections(updatedSections)
      setDeleteDialog({ open: false, type: 'file' })
      toast.success('Fichier supprimé', {
        description: 'Le fichier a été supprimé avec succès. Vous pouvez maintenant changer le type de contenu.',
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error)
      toast.error('Erreur lors de la suppression', {
        description: 'Le fichier n\'a pas pu être supprimé. Veuillez réessayer.',
      })
    }
  }

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const toggleSubSectionExpanded = (subSectionId: string) => {
    setExpandedSubSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(subSectionId)) {
        newSet.delete(subSectionId)
      } else {
        newSet.add(subSectionId)
      }
      return newSet
    })
  }


  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Breadcrumb avec boutons */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-sm">
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
      <div className="space-y-4 sm:space-y-6">
        {sections.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 dark:text-slate-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
              Aucune section pour ce cours
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
              Ajoutez des sections pour commencer à structurer votre cours
            </p>
          </div>
        ) : (
          sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id)
          const isEditing = editingSectionId === section.id

          return (
            <Card key={section.id} className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSectionExpanded(section.id)}
                      className="h-8 w-8"
                    >
                      <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </Button>
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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
                          {section.subSections.length} leçon{section.subSections.length > 1 ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Chapitre {index + 1}
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
              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {section.subSections.length} leçon{section.subSections.length > 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSubSection: SubSection = {
                          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          title: 'Nouvelle leçon',
                          type: CourseContentType.VIDEO,
                          order: section.subSections.length
                        }
                        handleUpdateSection(section.id, {
                          subSections: [...section.subSections, newSubSection]
                        })
                        setExpandedSubSections(prev => new Set(prev).add(newSubSection.id))
                      }}
                      className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une leçon
                    </Button>
                  </div>
                  {section.subSections.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <p className="mb-2">Aucune leçon</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSubSection: SubSection = {
                            id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            title: 'Nouvelle leçon',
                            type: CourseContentType.VIDEO,
                            order: 0
                          }
                          handleUpdateSection(section.id, {
                            subSections: [newSubSection]
                          })
                          setExpandedSubSections(prev => new Set(prev).add(newSubSection.id))
                        }}
                        className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter la première leçon
                      </Button>
                    </div>
                  ) : (
                    section.subSections.map((subSection, subIndex) => {
                      const Icon = contentTypeIcons[subSection.type]
                      const isSubSectionUploading = uploadingSubSectionId === subSection.id
                      const isSubSectionExpanded = expandedSubSections.has(subSection.id)
                      
                      return (
                        <div key={subSection.id} className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10 overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleSubSectionExpanded(subSection.id)}
                                  className="h-6 w-6"
                                >
                                  <ChevronRight className={`h-4 w-4 transition-transform ${isSubSectionExpanded ? 'rotate-90' : ''}`} />
                                </Button>
                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                  <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                  {editingSubSectionId === subSection.id ? (
                                    <Input
                                      value={subSection.title}
                                      onChange={(e) => handleUpdateSubSection(section.id, subSection.id, { title: e.target.value })}
                                      className="border-emerald-200 dark:border-emerald-800 text-sm h-8"
                                      onBlur={() => setEditingSubSectionId(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          setEditingSubSectionId(null)
                                        }
                                      }}
                                      autoFocus
                                    />
                                  ) : (
                                    <>
                                      <h4 
                                        className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                                        onClick={() => setEditingSubSectionId(subSection.id)}
                                      >
                                        {subSection.title}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {contentTypeLabels[subSection.type]}
                                        </Badge>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                          Leçon {subIndex + 1}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSubSection(section.id, subSection.id)}
                                className="h-6 w-6 text-red-600 dark:text-red-400"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {isSubSectionExpanded && (
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                              {/* Permettre de changer le type de contenu uniquement si aucun fichier n'est uploadé */}
                              {!subSection.fileUrl && (
                                <div>
                                  <Label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Type de contenu</Label>
                                  <Select
                                    value={subSection.type}
                                    onValueChange={(value) => {
                                      const newType = value as CourseContentType
                                      handleUpdateSubSection(section.id, subSection.id, {
                                        type: newType,
                                        content: newType === CourseContentType.TEXT ? subSection.content : undefined,
                                        fileUrl: undefined
                                      })
                                    }}
                                  >
                                    <SelectTrigger className="border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm h-8 sm:h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={CourseContentType.VIDEO}>
                                        <div className="flex items-center gap-2">
                                          <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                                          {contentTypeLabels[CourseContentType.VIDEO]}
                                        </div>
                                      </SelectItem>
                                      <SelectItem value={CourseContentType.TEXT}>
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                          {contentTypeLabels[CourseContentType.TEXT]}
                                        </div>
                                      </SelectItem>
                                      <SelectItem value={CourseContentType.PDF}>
                                        <div className="flex items-center gap-2">
                                          <File className="h-3 w-3 sm:h-4 sm:w-4" />
                                          {contentTypeLabels[CourseContentType.PDF]}
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              
                              {subSection.type === CourseContentType.TEXT ? (
                                <Textarea
                                  value={subSection.content || ''}
                                  onChange={(e) => handleUpdateSubSection(section.id, subSection.id, { content: e.target.value })}
                                  placeholder="Contenu de la leçon texte..."
                                  className="border-emerald-200 dark:border-emerald-800 min-h-[120px] sm:min-h-[150px] text-sm"
                                />
                              ) : (
                                <SubSectionDropzone
                                  subSection={subSection}
                                  onDrop={(acceptedFiles, rejectedFiles) => onDrop(acceptedFiles, rejectedFiles, subSection.id)}
                                  onRemove={() => handleRemoveFile(section.id, subSection.id)}
                                  isUploading={isSubSectionUploading}
                                  uploadStatus={uploadStatus[subSection.id]}
                                  progress={uploadProgress[subSection.id] || 0}
                                  hasFile={!!subSection.fileUrl}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                )}
              </CardContent>
              )}
            </Card>
          )
        }))}
      </div>
      )}

      {/* Add New Sections - Toujours visible */}
      <div className="space-y-4">
        {!isAddingSection ? (
          <Button
            onClick={() => {
              setIsAddingSection(true)
              handleAddNewSectionForm()
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une section
          </Button>
        ) : (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-emerald-700 dark:text-emerald-300">
                  Nouvelles sections ({newSections.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewSectionForm}
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une autre
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingSection(false)
                      setNewSections([])
                      setUploadingSubSectionId(null)
                      setUploadProgress({})
                      setUploadStatus({})
                    }}
                    className="border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </CardHeader>
          <CardContent className="space-y-6">
            {newSections.map((newSection, index) => (
              <div 
                key={newSection.tempId}
                className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">
                    Chapitre {index + 1}
                  </h4>
                  {newSections.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveNewSection(newSection.tempId)}
                      className="h-6 w-6 text-red-600 dark:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

            <div>
                  <Label className="text-sm font-medium mb-2 block">Titre du chapitre *</Label>
              <Input
                value={newSection.title}
                    onChange={(e) => handleUpdateNewSection(newSection.tempId, { title: e.target.value })}
                placeholder="Ex: Introduction, Chapitre 1, etc."
                className="border-emerald-200 dark:border-emerald-800"
              />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Leçons *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSubSectionToNewSection(newSection.tempId)}
                      className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une leçon
                    </Button>
                  </div>

                  {newSection.subSections.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                      Aucune leçon. Ajoutez-en au moins une pour créer le chapitre.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {newSection.subSections.map((newSubSection, subIndex) => {
                        const isSubUploading = uploadingSubSectionId === newSubSection.tempId
                        const subUploadStatus = uploadStatus[newSubSection.tempId]
                        const subProgress = uploadProgress[newSubSection.tempId] || 0
                        const Icon = contentTypeIcons[newSubSection.type || CourseContentType.VIDEO]
                        
                        return (
                          <div key={newSubSection.tempId} className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Leçon {subIndex + 1}
                              </h5>
                              {newSection.subSections.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveNewSubSection(newSection.tempId, newSubSection.tempId)}
                                  className="h-5 w-5 text-red-600 dark:text-red-400"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
            </div>

            <div>
                              <Label className="text-xs font-medium mb-1 block">Titre de la leçon *</Label>
                              <Input
                                value={newSubSection.title || ''}
                                onChange={(e) => handleUpdateNewSubSection(newSection.tempId, newSubSection.tempId, { title: e.target.value })}
                                placeholder="Ex: Leçon 1, Vidéo introductive, etc."
                                className="border-emerald-200 dark:border-emerald-800 text-sm"
                              />
                            </div>

                            <div>
                              <Label className="text-xs font-medium mb-1 block">Type de contenu *</Label>
              <Select
                                value={newSubSection.type}
                                onValueChange={(value) => handleUpdateNewSubSection(newSection.tempId, newSubSection.tempId, { 
                  type: value as CourseContentType,
                                  content: value === CourseContentType.TEXT ? newSubSection.content : '',
                                  fileUrl: undefined,
                                  fileToUpload: undefined
                })}
              >
                                <SelectTrigger className="border-emerald-200 dark:border-emerald-800 text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CourseContentType.VIDEO}>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      {contentTypeLabels[CourseContentType.VIDEO]}
                    </div>
                  </SelectItem>
                                  <SelectItem value={CourseContentType.TEXT}>
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      {contentTypeLabels[CourseContentType.TEXT]}
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

                            {newSubSection.type === CourseContentType.TEXT ? (
              <div>
                                <Label className="text-xs font-medium mb-1 block">Contenu</Label>
                <Textarea
                                  value={newSubSection.content || ''}
                                  onChange={(e) => handleUpdateNewSubSection(newSection.tempId, newSubSection.tempId, { content: e.target.value })}
                                  placeholder="Saisissez le contenu..."
                                  className="border-emerald-200 dark:border-emerald-800 min-h-[100px] text-sm"
                />
              </div>
            ) : (
              <div>
                                <Label className="text-xs font-medium mb-1 block">
                                  {newSubSection.type === CourseContentType.VIDEO ? 'Fichier vidéo' : 'Fichier PDF'}
                </Label>
                                <SubSectionDropzone
                                  subSection={{ type: newSubSection.type || CourseContentType.PDF } as SubSection}
                                  tempId={newSubSection.tempId}
                                  onDrop={(acceptedFiles: File[], rejectedFiles: any[]) => onDrop(acceptedFiles, rejectedFiles, undefined, newSubSection.tempId)}
                                />
                                {isSubUploading && (
                                  <div className={`mt-2 space-y-2 p-3 rounded-lg border-2 ${
                                    subUploadStatus === 'success' 
                                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                      : subUploadStatus === 'error'
                                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                                      : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                                  }`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {subUploadStatus === 'success' ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : subUploadStatus === 'error' ? (
                                          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        ) : (
                                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                                        )}
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                          {subUploadStatus === 'success' ? 'Terminé' : subUploadStatus === 'error' ? 'Erreur' : 'En cours...'}
                                        </span>
                                      </div>
                                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        {Math.round(subProgress)}%
                                      </span>
                                    </div>
                                    <Progress value={subProgress} className="h-2" />
                                  </div>
                                )}
                                {/* Preview immédiate après upload pour les nouvelles sous-sections */}
                                {newSubSection.fileUrl && (
                                  <div className="mt-3 space-y-3">
                                    {newSubSection.type === CourseContentType.VIDEO ? (
                                      <div className="w-full rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-slate-900">
                                        <video 
                                          src={newSubSection.fileUrl} 
                                          controls 
                                          className="w-full h-auto max-h-[300px]"
                                          preload="metadata"
                                        >
                                          Votre navigateur ne supporte pas la lecture de vidéos.
                                        </video>
                                      </div>
                                    ) : newSubSection.type === CourseContentType.PDF ? (
                                      <div className="w-full rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900">
                                        <iframe
                                          src={newSubSection.fileUrl}
                                          className="w-full h-[400px] border-0"
                                          title={`PDF ${newSubSection.title || 'Preview'}`}
                                        />
                                      </div>
                                    ) : null}
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                      <Icon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                      <a 
                                        href={newSubSection.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline flex-1 truncate"
                                      >
                                        {newSubSection.type === CourseContentType.VIDEO ? 'Ouvrir la vidéo' : 'Ouvrir le PDF'}
                                      </a>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleUpdateNewSubSection(newSection.tempId, newSubSection.tempId, { 
                                          fileToUpload: undefined, 
                                          fileUrl: undefined 
                                        })}
                                        className="h-5 w-5"
                                      >
                                        <X className="h-2 w-2" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                {newSubSection.fileToUpload && !newSubSection.fileUrl && !isSubUploading && (
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                    <File className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs text-slate-700 dark:text-slate-300 flex-1 truncate">
                                      {newSubSection.fileToUpload.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                                      onClick={() => handleUpdateNewSubSection(newSection.tempId, newSubSection.tempId, { 
                                        fileToUpload: undefined
                                      })}
                                      className="h-5 w-5"
                                    >
                                      <X className="h-2 w-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-4 border-t border-emerald-200 dark:border-emerald-800">
              <Button
                onClick={handleSaveAllSections}
                disabled={
                  isSaving || 
                  isUploading || 
                  uploadingSubSectionId !== null ||
                  newSections.length === 0 || 
                  newSections.some(s => 
                    !s.title?.trim() || s.subSections.length === 0
                  )
                }
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enregistrer toutes les sections ({newSections.length})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={() => {
          if (deleteDialog.type === 'section') {
            confirmDeleteSection()
          } else if (deleteDialog.type === 'subSection') {
            confirmDeleteSubSection()
          } else if (deleteDialog.type === 'file') {
            confirmRemoveFile()
          }
        }}
        title={
          deleteDialog.type === 'section'
            ? 'Supprimer la section'
            : deleteDialog.type === 'subSection'
            ? 'Supprimer la leçon'
            : 'Supprimer le fichier'
        }
        description={
          deleteDialog.type === 'section'
            ? 'Êtes-vous sûr de vouloir supprimer cette section et toutes ses leçons ? Cette action est irréversible.'
            : deleteDialog.type === 'subSection'
            ? 'Êtes-vous sûr de vouloir supprimer cette leçon ? Cette action est irréversible.'
            : 'Êtes-vous sûr de vouloir supprimer ce fichier ? Vous pourrez ensuite changer le type de contenu. Cette action est irréversible.'
        }
        itemName={deleteDialog.itemName}
        isDeleting={isSaving}
      />
    </div>
  )
}