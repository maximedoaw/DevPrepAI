'use client'

import React, { useState } from 'react'
import { Send, BookOpen } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Domain } from '@prisma/client'
import { createBootcampCourse } from '@/actions/bootcamp.action'
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
    content: '',
    contentType: 'TEXT' as 'TEXT' | 'VIDEO' | 'PDF' | 'EMBED',
    domain: bootcampDomains[0] || Domain.DEVELOPMENT,
    order: 0,
    duration: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!courseData.title || !courseData.content) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    const result = await createBootcampCourse({
      title: courseData.title,
      description: courseData.description || undefined,
      content: courseData.content,
      contentType: courseData.contentType,
      domain: courseData.domain,
      order: courseData.order,
      duration: courseData.duration ? parseInt(courseData.duration) : undefined
    })

    setLoading(false)

    if (result.success) {
      toast.success('Cours créé avec succès')
      setCourseData({
        title: '',
        description: '',
        content: '',
        contentType: 'TEXT',
        domain: bootcampDomains[0] || Domain.DEVELOPMENT,
        order: 0,
        duration: ''
      })
      onCourseCreated?.()
      onClose()
    } else {
      toast.error(result.error || 'Erreur lors de la création du cours')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Créer un nouveau cours
          </DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau cours au bootcamp
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {courseData.contentType === 'TEXT' && 'Saisissez le contenu texte du cours'}
              {courseData.contentType === 'VIDEO' && 'Collez l\'URL de la vidéo (YouTube, Vimeo, etc.)'}
              {courseData.contentType === 'PDF' && 'Collez l\'URL du fichier PDF'}
              {courseData.contentType === 'EMBED' && 'Collez le code embed (iframe, etc.)'}
            </p>
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
            {loading ? 'Création...' : 'Créer le cours'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

