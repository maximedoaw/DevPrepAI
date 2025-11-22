'use client'

import React, { useState } from 'react'
import { 
  BookOpen, FileVideo, File, Code, FileText, 
  Edit, Trash2, Eye, EyeOff, Clock, User, MoreVertical
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Domain } from '@prisma/client'
import { updateBootcampCourse, deleteBootcampCourse } from '@/actions/bootcamp.action'
import { toast } from 'sonner'
import { EditCourseDialog } from './EditCourse-dialog'

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

const contentTypeIcons = {
  TEXT: FileText,
  VIDEO: FileVideo,
  PDF: File,
  EMBED: Code
}

interface CoursesListProps {
  courses: any[]
  onRefresh: () => void
  bootcampDomains: Domain[]
}

export function CoursesList({ courses, onRefresh, bootcampDomains }: CoursesListProps) {
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleTogglePublish = async (course: any) => {
    const result = await updateBootcampCourse(course.id, {
      isPublished: !course.isPublished
    })

    if (result.success) {
      toast.success(course.isPublished ? 'Cours dépublié' : 'Cours publié')
      onRefresh()
    } else {
      toast.error(result.error || 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return
    }

    setDeletingId(courseId)
    const result = await deleteBootcampCourse(courseId)
    setDeletingId(null)

    if (result.success) {
      toast.success('Cours supprimé avec succès')
      onRefresh()
    } else {
      toast.error(result.error || 'Erreur lors de la suppression')
    }
  }

  const handleEdit = (course: any) => {
    setEditingCourse(course)
    setIsEditOpen(true)
  }

  if (courses.length === 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Aucun cours créé. Commencez par créer votre premier cours !
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const ContentIcon = contentTypeIcons[course.contentType as keyof typeof contentTypeIcons] || FileText
          const isDeleting = deletingId === course.id

          return (
            <Card
              key={course.id}
              className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <ContentIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate text-slate-900 dark:text-slate-100">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                        >
                          {domainLabels[course.domain as Domain]}
                        </Badge>
                        {course.isPublished ? (
                          <Badge className="bg-emerald-500 text-white text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Publié
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Brouillon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 dark:text-slate-400"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-emerald-200 dark:border-emerald-800">
                      <DropdownMenuItem
                        onClick={() => handleEdit(course)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(course)}
                        className="cursor-pointer"
                      >
                        {course.isPublished ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publier
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(course.id)}
                        disabled={isDeleting}
                        className="cursor-pointer text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? 'Suppression...' : 'Supprimer'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration} min
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {course.createdBy?.firstName} {course.createdBy?.lastName}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Ordre: {course.order}</span>
                  {course._count && course._count.courseViews > 0 && (
                    <span>• {course._count.courseViews} vue{course._count.courseViews > 1 ? 's' : ''}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {editingCourse && (
        <EditCourseDialog
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setEditingCourse(null)
          }}
          course={editingCourse}
          bootcampDomains={bootcampDomains}
          onCourseUpdated={onRefresh}
        />
      )}
    </>
  )
}

