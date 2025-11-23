'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Send, BookOpen, Upload, X, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Domain } from '@prisma/client'
import { createBootcampCourse } from '@/actions/bootcamp.action'
import { toast } from 'sonner'
import { useUploadThing } from '@/lib/uploadthing'

const domainLabels: Record<Domain, string> = {
  MACHINE_LEARNING: 'Machine Learning',
  DEVELOPMENT: 'Développement',
  DATA_SCIENCE: 'Data Science',
  FINANCE: 'Finance',
  BUSINESS: 'Business',
  ENGINEERING: 'Ingénierie',
  DESIGN: 'Design',
  DEVOPS: 'DevOps',
  CYBERSECURITY: 'Cybersécurité',
  MARKETING: 'Marketing',
  PRODUCT: 'Product',
  ARCHITECTURE: 'Architecture',
  MOBILE: 'Mobile',
  WEB: 'Web',
  COMMUNICATION: 'Communication',
  MANAGEMENT: 'Management',
  EDUCATION: 'Éducation',
  HEALTH: 'Santé'
}

// Options de durée pour le cours
const durationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 heure' },
  { value: '90', label: '1 heure 30' },
  { value: '120', label: '2 heures' },
  { value: '150', label: '2 heures 30' },
  { value: '180', label: '3 heures' },
  { value: '240', label: '4 heures' },
  { value: '300', label: '5 heures' },
  { value: '360', label: '6 heures' }
]

interface CreateCourseDialogProps {
  isOpen: boolean
  onClose: () => void
  bootcampDomains: Domain[]
  onCourseCreated?: () => void
}

export function CreateCourseDialog({
  isOpen,
  onClose,
  bootcampDomains,
  onCourseCreated
}: CreateCourseDialogProps) {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    domain: bootcampDomains[0] || Domain.DEVELOPMENT,
    order: 0,
    duration: '',
    isPublished: false
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { startUpload, isUploading } = useUploadThing('mediaUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]?.url) {
        setUploadProgress(100)
        setTimeout(() => {
          setUploadingImage(false)
          setUploadProgress(0)
        }, 500)
      }
    },
    onUploadError: (error) => {
      setUploadProgress(0)
      setUploadingImage(false)
      toast.error(`Erreur lors de l'upload: ${error.message}`)
    }
  })

  // Simuler la progression de l'upload
  useEffect(() => {
    if (uploadingImage && isUploading) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [uploadingImage, isUploading])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Stocker le fichier localement
      setImageFile(file)
      // Créer une preview locale
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 4 * 1024 * 1024 // 4MB
  })

  const removeImage = () => {
    setImageFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
  }

  const handleSubmit = async () => {
    if (!courseData.title) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    let uploadedImageUrl: string | undefined = undefined

    // Uploader l'image si elle existe
    if (imageFile) {
      try {
        setUploadingImage(true)
        setUploadProgress(0)
        const uploadResult = await startUpload([imageFile])
        if (uploadResult && uploadResult[0]?.url) {
          uploadedImageUrl = uploadResult[0].url
          setUploadProgress(100)
        } else {
          throw new Error('Échec de l\'upload de l\'image')
        }
      } catch (error) {
        setLoading(false)
        setUploadingImage(false)
        setUploadProgress(0)
        return
      } finally {
        setUploadingImage(false)
      }
    }

    // Créer le cours avec l'URL de l'image uploadée
    const result = await createBootcampCourse({
      title: courseData.title,
      description: courseData.description || undefined,
      domain: courseData.domain,
      order: courseData.order,
      duration: courseData.duration ? parseInt(courseData.duration) : undefined,
      courseImage: uploadedImageUrl,
      isPublished: courseData.isPublished
    })

    setLoading(false)
    setUploadingImage(false)
    setUploadProgress(0)

    if (result.success) {
      toast.success('Cours créé avec succès')
      setCourseData({
        title: '',
        description: '',
        domain: bootcampDomains[0] || Domain.DEVELOPMENT,
        order: 0,
        duration: '',
        isPublished: false
      })
      setImageFile(null)
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
      }
      onCourseCreated?.()
      onClose()
    } else {
      toast.error(result.error || 'Erreur lors de la création du cours')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Créer un nouveau cours
          </DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau cours au bootcamp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-700 scrollbar-track-transparent">
          {/* Image Upload Dropzone */}
          <div>
            <label className="text-sm font-medium mb-2 block">Image du cours</label>
            {imagePreview ? (
              <div
                {...getRootProps()}
                className="relative group cursor-pointer"
              >
                <input {...getInputProps()} />
                <div className={`relative w-full h-48 rounded-lg overflow-hidden border-2 transition-all bg-slate-100 dark:bg-slate-800 ${
                  isDragActive
                    ? 'border-emerald-500 ring-4 ring-emerald-500/20'
                    : 'border-emerald-200 dark:border-emerald-800'
                }`}>
                  <img
                    src={imagePreview}
                    alt="Course preview"
                    className="w-full h-full object-cover"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 p-4 z-20">
                      <div className="text-white text-sm font-medium mb-2">Upload en cours...</div>
                      <Progress value={uploadProgress} className="w-full max-w-xs h-2" />
                      <div className="text-white text-xs">{Math.round(uploadProgress)}%</div>
                    </div>
                  )}
                  {isDragActive && !uploadingImage && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center gap-3 p-6 z-10 border-4 border-dashed border-emerald-500 rounded-lg">
                      <div className="p-3 rounded-full bg-emerald-500">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white">
                          Déposez l'image ici pour la remplacer
                        </p>
                      </div>
                    </div>
                  )}
                  {!isDragActive && !uploadingImage && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                        <div className="p-2 rounded-full bg-emerald-500/90 backdrop-blur-sm">
                          <Upload className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-xs text-white font-medium">Glisser-déposer ou cliquer pour changer</p>
                      </div>
                    </div>
                  )}
                </div>
                {!uploadingImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`
                  w-full h-48 rounded-lg border-2 border-dashed transition-all cursor-pointer
                  flex flex-col items-center justify-center gap-3 p-6
                  ${isDragActive
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className={`p-3 rounded-full ${isDragActive ? 'bg-emerald-500' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                  <Upload className={`h-6 w-6 ${isDragActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isDragActive ? 'Déposez l\'image ici' : 'Glissez-déposez une image ou cliquez pour sélectionner'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    PNG, JPG, GIF jusqu'à 4MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Titre *</label>
            <Input
              value={courseData.title}
              onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
              placeholder="Titre du cours"
              className="border-emerald-200 dark:border-emerald-800"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={courseData.description}
              onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
              placeholder="Description du cours"
              className="border-emerald-200 dark:border-emerald-800"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Domaine *</label>
            <Select
              value={courseData.domain}
              onValueChange={(value: Domain) => setCourseData({ ...courseData, domain: value })}
            >
              <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bootcampDomains.map(domain => (
                  <SelectItem key={domain} value={domain}>
                    {domainLabels[domain]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ordre</label>
              <Input
                type="number"
                value={courseData.order}
                onChange={(e) => setCourseData({ ...courseData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="border-emerald-200 dark:border-emerald-800"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Durée</label>
              <Select
                value={courseData.duration}
                onValueChange={(value) => setCourseData({ ...courseData, duration: value })}
              >
                <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                  <SelectValue placeholder="Sélectionner la durée" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${courseData.isPublished ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <BookOpen className={`h-5 w-5 ${courseData.isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <Label htmlFor="published-create" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                  Publier le cours
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {courseData.isPublished ? 'Le cours sera visible par les apprenants' : 'Le cours sera en mode brouillon'}
                </p>
              </div>
            </div>
            <Switch
              id="published-create"
              checked={courseData.isPublished}
              onCheckedChange={(checked) => setCourseData({ ...courseData, isPublished: checked })}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t border-emerald-200 dark:border-emerald-800 pt-4 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || uploadingImage}
            className="border-emerald-200 dark:border-emerald-800"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || uploadingImage}
            className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Création...' : 'Créer le cours'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

