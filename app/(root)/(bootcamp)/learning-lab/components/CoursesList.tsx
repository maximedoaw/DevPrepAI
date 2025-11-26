'use client'

import React, { useState, useEffect } from 'react'
import { 
  BookOpen,
  Edit, Trash2, Eye, EyeOff, Clock, User, MoreVertical, List
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
import { CourseSectionsManager } from './CourseSectionsManager'

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


// Fonction pour générer un gradient de couleur basé sur le domaine
const getDomainGradient = (domain: Domain): string => {
  const gradients: Record<Domain, string> = {
    MACHINE_LEARNING: 'from-purple-500 to-pink-500',
    DEVELOPMENT: 'from-emerald-500 to-teal-500',
    DATA_SCIENCE: 'from-blue-500 to-cyan-500',
    FINANCE: 'from-green-500 to-emerald-500',
    BUSINESS: 'from-indigo-500 to-purple-500',
    ENGINEERING: 'from-orange-500 to-red-500',
    DESIGN: 'from-pink-500 to-rose-500',
    DEVOPS: 'from-gray-600 to-gray-800',
    CYBERSECURITY: 'from-red-600 to-orange-600',
    MARKETING: 'from-yellow-500 to-orange-500',
    PRODUCT: 'from-blue-600 to-indigo-600',
    ARCHITECTURE: 'from-slate-500 to-gray-600',
    MOBILE: 'from-violet-500 to-purple-500',
    WEB: 'from-cyan-500 to-blue-500',
    COMMUNICATION: 'from-rose-500 to-pink-500',
    MANAGEMENT: 'from-amber-500 to-yellow-500',
    EDUCATION: 'from-green-600 to-emerald-600',
    HEALTH: 'from-teal-500 to-cyan-500'
  }
  return gradients[domain] || 'from-emerald-500 to-green-500'
}

// Fonction pour formater la durée
const formatDuration = (minutes: number): string => {
  if (!minutes) return ''
  
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}min`
}

interface CoursesListProps {
  courses: any[]
  onRefresh: () => void
  bootcampDomains: Domain[]
  onManageSections?: (course: any) => void
}

export function CoursesList({ courses, onRefresh, bootcampDomains, onManageSections }: CoursesListProps) {
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


  const CourseImageDisplay = ({ course }: { course: any }) => {
    const domainGradient = getDomainGradient(course.domain as Domain)
    const ContentIcon = BookOpen

    return (
      <div className="relative w-full h-52 overflow-hidden bg-slate-100 dark:bg-slate-900 group">
        {course.courseImage ? (
          <img
            src={course.courseImage}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${domainGradient} flex flex-col items-center justify-center relative`}>
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
            <div className="relative z-10 text-center p-4">
              <ContentIcon className="h-12 w-12 text-white/90 mx-auto mb-2" />
              <div className="text-white/90 font-semibold text-sm line-clamp-2">
                {course.title}
              </div>
            </div>
            <div className="absolute bottom-2 right-2 z-10">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                {domainLabels[course.domain as Domain]}
              </Badge>
            </div>
          </div>
        )}
      </div>
    )
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
          // Utiliser BookOpen comme icône par défaut puisque contentType n'existe plus
          const ContentIcon = BookOpen
          const isDeleting = deletingId === course.id

          const domainGradient = getDomainGradient(course.domain as Domain)

          return (
            <Card
              key={course.id}
              className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden group"
            >
              {/* Course Image or Default Poster */}
              <div className="relative">
                <CourseImageDisplay course={course} />
                {/* Status Badge on Image */}
                <div className="absolute top-2 right-2 z-30">
                  {course.isPublished ? (
                    <Badge className="bg-emerald-500 text-white text-xs shadow-lg">
                      <Eye className="h-3 w-3 mr-1" />
                      Publié
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-300 dark:border-slate-600 text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Brouillon
                    </Badge>
                  )}
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold line-clamp-2 text-slate-900 dark:text-slate-100 mb-2">
                      {course.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                      >
                        {domainLabels[course.domain as Domain]}
                      </Badge>
                      <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-700/50">
                        <ContentIcon className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 dark:text-slate-400 flex-shrink-0"
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
                        onClick={() => onManageSections?.(course)}
                        className="cursor-pointer"
                      >
                        <List className="h-4 w-4 mr-2" />
                        Gérer les sections
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
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-medium text-emerald-700 dark:text-emerald-300">
                        {formatDuration(course.duration)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">
                      {course.createdBy?.firstName} {course.createdBy?.lastName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Ordre: {course.order}</span>
                  {course._count && course._count.courseViews > 0 && (
                    <span>• {course._count.courseViews} vue{course._count.courseViews > 1 ? 's' : ''}</span>
                  )}
                </div>

                {/* Bouton pour gérer les sections */}
                <Button
                  onClick={() => onManageSections?.(course)}
                  variant="outline"
                  className="w-full mt-3 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                >
                  <List className="h-4 w-4 mr-2" />
                  Gérer les sections
                </Button>
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

// Composant wrapper pour afficher soit la liste, soit les sections
export function CoursesListWithSections({ courses, onRefresh, bootcampDomains }: Omit<CoursesListProps, 'onManageSections'>) {
  const [selectedCourseForSections, setSelectedCourseForSections] = useState<any>(null)
  const [isViewingSections, setIsViewingSections] = useState(false)

  const handleManageSections = (course: any) => {
    setSelectedCourseForSections(course)
    setIsViewingSections(true)
  }

  const handleBackToList = () => {
    setIsViewingSections(false)
    setSelectedCourseForSections(null)
  }

  const handleUpdateSections = async () => {
    // Recharger les cours
    await onRefresh()
  }

  // Mettre à jour le cours sélectionné quand les cours changent
  useEffect(() => {
    if (selectedCourseForSections && courses.length > 0) {
      const updatedCourse = courses.find(c => c.id === selectedCourseForSections.id)
      if (updatedCourse) {
        setSelectedCourseForSections(updatedCourse)
      }
    }
  }, [courses, selectedCourseForSections?.id])

  // Si on affiche les sections, montrer CourseSectionsManager
  if (isViewingSections && selectedCourseForSections) {
    return (
      <CourseSectionsManager
        course={selectedCourseForSections}
        onUpdate={handleUpdateSections}
        onBack={handleBackToList}
      />
    )
  }

  // Sinon, afficher la liste des cours
  return (
    <CoursesList
      courses={courses}
      onRefresh={onRefresh}
      bootcampDomains={bootcampDomains}
      onManageSections={handleManageSections}
    />
  )
}

