'use client'

import React, { useState, useEffect } from 'react'
import { Send, BookOpen } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Domain } from '@prisma/client'
import { updateBootcampCourse } from '@/actions/bootcamp.action'
import { toast } from 'sonner'

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

interface EditCourseDialogProps {
  isOpen: boolean
  onClose: () => void
  course: any
  bootcampDomains: Domain[]
  onCourseUpdated?: () => void
}

export function EditCourseDialog({
  isOpen,
  onClose,
  course,
  bootcampDomains,
  onCourseUpdated
}: EditCourseDialogProps) {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    content: '',
    contentType: 'TEXT' as 'TEXT' | 'VIDEO' | 'PDF' | 'EMBED',
    domain: Domain.DEVELOPMENT,
    order: 0,
    duration: '',
    isPublished: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course && isOpen) {
      setCourseData({
        title: course.title || '',
        description: course.description || '',
        content: course.content || '',
        contentType: course.contentType || 'TEXT',
        domain: course.domain || Domain.DEVELOPMENT,
        order: course.order || 0,
        duration: course.duration?.toString() || '',
        isPublished: course.isPublished || false
      })
    }
  }, [course, isOpen])

  const handleSubmit = async () => {
    if (!courseData.title || !courseData.content) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    const result = await updateBootcampCourse(course.id, {
      title: courseData.title,
      description: courseData.description || undefined,
      content: courseData.content,
      contentType: courseData.contentType,
      domain: courseData.domain,
      order: courseData.order,
      duration: courseData.duration ? parseInt(courseData.duration) : undefined,
      isPublished: courseData.isPublished
    })
    setLoading(false)

    if (result.success) {
      toast.success('Cours mis à jour avec succès')
      onCourseUpdated?.()
      onClose()
    } else {
      toast.error(result.error || 'Erreur lors de la mise à jour du cours')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Modifier le cours
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations du cours
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type de contenu *</label>
              <Select
                value={courseData.contentType}
                onValueChange={(value: 'TEXT' | 'VIDEO' | 'PDF' | 'EMBED') => 
                  setCourseData({ ...courseData, contentType: value })
                }
              >
                <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Texte</SelectItem>
                  <SelectItem value="VIDEO">Vidéo</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="EMBED">Embed</SelectItem>
                </SelectContent>
              </Select>
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
              <label className="text-sm font-medium mb-2 block">Durée (minutes)</label>
              <Input
                type="number"
                value={courseData.duration}
                onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                placeholder="Durée en minutes"
                className="border-emerald-200 dark:border-emerald-800"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Contenu *</label>
            <Textarea
              value={courseData.content}
              onChange={(e) => setCourseData({ ...courseData, content: e.target.value })}
              placeholder={
                courseData.contentType === 'TEXT' 
                  ? 'Contenu texte du cours...'
                  : courseData.contentType === 'VIDEO'
                  ? 'URL de la vidéo (YouTube, Vimeo, etc.)'
                  : courseData.contentType === 'PDF'
                  ? 'URL du PDF'
                  : 'Code embed (iframe, etc.)'
              }
              className="border-emerald-200 dark:border-emerald-800 min-h-[200px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={courseData.isPublished}
              onCheckedChange={(checked) => setCourseData({ ...courseData, isPublished: checked })}
            />
            <Label htmlFor="published" className="cursor-pointer">
              Publier le cours
            </Label>
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
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

