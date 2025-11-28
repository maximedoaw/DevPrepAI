'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Video,
  FileText,
  File,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { PDFReader } from '@/components/PDFReader'
import { Loader } from '@/components/ui/loader'
import { getCourseByIdForCandidate, updateCourseProgress } from '@/actions/bootcamp.action'
import { Domain } from '@prisma/client'
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

enum CourseContentType {
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  PDF = 'PDF'
}

interface SubSection {
  id: string
  title: string
  type: CourseContentType
  content?: string
  fileUrl?: string
  order: number
}

interface Section {
  id: string
  title: string
  order: number
  subSections: SubSection[]
}

const CourseGuidePage = () => {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const courseId = params.id as string
  const sectionId = searchParams.get('section')
  const lessonId = searchParams.get('lesson')

  const { data: courseData, isLoading: courseLoading, error: courseError, refetch: refetchCourse } = useQuery({
    queryKey: ['courseById', courseId],
    queryFn: async () => {
      const result = await getCourseByIdForCandidate(courseId)
      if (!result.success) {
        const error = new Error(result.error) as Error & { isNotPublished?: boolean }
        error.isNotPublished = (result as any).isNotPublished
        throw error
      }
      return result.data
    },
    enabled: !!courseId,
    // Realtime : refetch toutes les 30 secondes pour mettre à jour le progrès
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 10000, // 10 secondes
    retry: 2
  })

  // Parser les sections du cours
  const sections = useMemo(() => {
    if (!courseData?.courseSections) return []
    try {
      const parsed = typeof courseData.courseSections === 'string' 
        ? JSON.parse(courseData.courseSections) 
        : courseData.courseSections
      return (parsed?.sections || []) as Section[]
    } catch (error) {
      console.error('Error parsing course sections:', error)
      return []
    }
  }, [courseData?.courseSections])

  // Trouver la leçon active depuis les paramètres d'URL
  const activeLesson = useMemo(() => {
    if (!lessonId || !sections.length) return null
    
    for (const section of sections) {
      const lesson = section.subSections.find(sub => sub.id === lessonId)
      if (lesson) return { section, lesson }
    }
    return null
  }, [lessonId, sections])

  // Si pas de leçon active mais une section, prendre la première leçon de cette section
  const defaultLesson = useMemo(() => {
    if (activeLesson) return activeLesson
    if (!sectionId || !sections.length) {
      // Prendre la première leçon de la première section
      const firstSection = sections[0]
      if (firstSection && firstSection.subSections && firstSection.subSections.length > 0) {
        return { section: firstSection, lesson: firstSection.subSections[0] }
      }
      return null
    }
    
    const section = sections.find(s => s.id === sectionId)
    if (section && section.subSections && section.subSections.length > 0) {
      return { section, lesson: section.subSections[0] }
    }
    return null
  }, [activeLesson, sectionId, sections])

  const currentLesson = defaultLesson

  // État pour suivre les leçons complétées
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [showNextLessonDialog, setShowNextLessonDialog] = useState(false)
  const [justCompletedLesson, setJustCompletedLesson] = useState<{ section: Section; lesson: SubSection } | null>(null)

  // Charger les leçons complétées depuis la base de données
  useEffect(() => {
    if (courseData && sections.length > 0) {
      // Utiliser les leçons complétées stockées dans la base de données
      const completed = new Set<string>((courseData.completedLessons as string[]) || [])
      setCompletedLessons(completed)
    }
  }, [courseData?.completedLessons, sections])

  // Fonction pour trouver la prochaine leçon
  const findNextLesson = useCallback((currentSection: Section, currentLesson: SubSection) => {
    // Chercher dans la section actuelle
    const currentSectionIndex = sections.findIndex(s => s.id === currentSection.id)
    const currentLessonIndex = currentSection.subSections.findIndex(l => l.id === currentLesson.id)
    
    // Si il y a une leçon suivante dans la section actuelle
    if (currentLessonIndex < currentSection.subSections.length - 1) {
      return {
        section: currentSection,
        lesson: currentSection.subSections[currentLessonIndex + 1]
      }
    }
    
    // Sinon, chercher dans la section suivante
    if (currentSectionIndex < sections.length - 1) {
      const nextSection = sections[currentSectionIndex + 1]
      if (nextSection.subSections.length > 0) {
        return {
          section: nextSection,
          lesson: nextSection.subSections[0]
        }
      }
    }
    
    return null
  }, [sections])

  // Mutation pour mettre à jour le progrès
  const updateProgressMutation = useMutation({
    mutationFn: ({ progress, lessonId }: { progress: number; lessonId?: string }) =>
      updateCourseProgress(courseId, progress, lessonId),
    onSuccess: () => {
      // Invalider le cache pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['courseById', courseId] })
    },
    onError: (error: Error) => {
      console.error('Error updating progress:', error)
    }
  })

  // Fonction pour charger une leçon
  const loadLesson = useCallback((section: Section, lesson: SubSection) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('section', section.id)
    newSearchParams.set('lesson', lesson.id)
    router.push(`/guides/${courseId}?${newSearchParams.toString()}`, { scroll: false })
  }, [courseId, searchParams, router])

  // Mettre à jour l'URL si nécessaire au chargement
  useEffect(() => {
    if (currentLesson && !lessonId && currentLesson.section) {
      loadLesson(currentLesson.section, currentLesson.lesson)
    }
  }, [currentLesson, lessonId, courseId, searchParams, router])

  if (courseLoading) {
    return <Loader />
  }

  // Gérer les erreurs spécifiques
  if (courseError) {
    const isNotPublished = (courseError as any)?.isNotPublished
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-green-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <Card className="border-red-200 dark:border-red-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
              {isNotPublished ? 'Cours non publié' : 'Cours non trouvé'}
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-6">
              {isNotPublished 
                ? "Ce cours n'est pas encore publié par le bootcamp et n'est pas accessible pour le moment. Veuillez réessayer plus tard."
                : "Ce cours n'existe pas ou vous n'y avez pas accès."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push('/guides')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux guides
              </Button>
              {!isNotPublished && (
                <Button
                  onClick={() => refetchCourse()}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-green-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <Card className="border-red-200 dark:border-red-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
              Cours non trouvé
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-6">
              Ce cours n'existe pas ou vous n'y avez pas accès.
            </p>
            <Button
              onClick={() => router.push('/guides')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux guides
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const contentTypeIcons = {
    [CourseContentType.VIDEO]: Video,
    [CourseContentType.TEXT]: FileText,
    [CourseContentType.PDF]: File
  }

  const contentTypeLabels = {
    [CourseContentType.VIDEO]: 'Vidéo',
    [CourseContentType.TEXT]: 'Texte',
    [CourseContentType.PDF]: 'PDF'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header avec bouton retour */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/guides')}
            className="text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-sm sm:text-base"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Informations du cours */}
        <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {courseData.courseImage && (
                <img
                  src={courseData.courseImage}
                  alt={courseData.title}
                  className="w-full sm:w-32 h-48 sm:h-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 w-full">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                  {courseData.title}
                </h1>
                {courseData.description && (
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {courseData.description}
                  </p>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                    {domainLabels[courseData.domain as Domain]}
                  </Badge>
                  {courseData.duration && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{courseData.duration} min</span>
                    </div>
                  )}
                  {(courseData.progress >= 100 || courseData.completedAt) && (
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Cours complété
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={courseData.bootcamp?.imageUrl || undefined} />
                      <AvatarFallback className="bg-emerald-500 text-white text-xs">
                        {courseData.bootcamp?.firstName?.charAt(0)?.toUpperCase() || courseData.bootcamp?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {courseData.bootcamp?.firstName && courseData.bootcamp?.lastName
                        ? `${courseData.bootcamp.firstName} ${courseData.bootcamp.lastName}`
                        : courseData.bootcamp?.email}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Progression
                    </span>
                    <div className="flex items-center gap-2">
                      {updateProgressMutation.isPending && (
                        <RefreshCw className="h-3 w-3 animate-spin text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {completedLessons.size} / {sections.reduce((acc, sec) => acc + sec.subSections.length, 0)} leçons
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ({Math.round(courseData.progress || 0)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={courseData.progress || 0} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal : Vidéo à gauche, Sections à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Partie gauche : Vidéo et description */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {currentLesson ? (
              <>
                {/* Lecteur vidéo ou contenu */}
                <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-xl">
                  <CardContent className="p-0">
                    {currentLesson.lesson.type === CourseContentType.VIDEO && currentLesson.lesson.fileUrl ? (
                      <div className="relative w-full aspect-video">
                        <VideoPlayer
                          src={currentLesson.lesson.fileUrl}
                          onComplete={() => {
                            // Marquer la leçon comme complétée (1 minute avant la fin)
                            if (courseData && sections.length > 0 && currentLesson) {
                              // Vérifier si la leçon n'est pas déjà complétée
                              if (!completedLessons.has(currentLesson.lesson.id)) {
                                // Ajouter la leçon actuelle aux leçons complétées
                                setCompletedLessons((prev: Set<string>) => {
                                  const newSet = new Set(prev)
                                  newSet.add(currentLesson.lesson.id)
                                  
                                  // Calculer le progrès basé UNIQUEMENT sur le nombre de leçons complétées
                                  const totalLessons = sections.reduce((acc, sec) => acc + sec.subSections.length, 0)
                                  const completedCount = newSet.size
                                  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 100
                                  
                                  // Sauvegarder dans la base de données (le cours sera marqué comme complété si progress = 100)
                                  updateProgressMutation.mutate({ 
                                    progress, 
                                    lessonId: currentLesson.lesson.id 
                                  })
                                  
                                  // Si toutes les leçons sont complétées, afficher un message
                                  if (progress >= 100) {
                                    toast.success('Félicitations !', {
                                      description: 'Vous avez terminé toutes les leçons de ce cours.',
                                    })
                                  }
                                  
                                  return newSet
                                })
                                
                                // Trouver la prochaine leçon et afficher le dialogue
                                const nextLesson = findNextLesson(currentLesson.section, currentLesson.lesson)
                                if (nextLesson) {
                                  setJustCompletedLesson({ section: currentLesson.section, lesson: currentLesson.lesson })
                                  setShowNextLessonDialog(true)
                                } else if (completedLessons.size + 1 >= sections.reduce((acc, sec) => acc + sec.subSections.length, 0)) {
                                  // Si c'est la dernière leçon, afficher un message de félicitations
                                  toast.success('Félicitations !', {
                                    description: 'Vous avez terminé toutes les leçons de ce cours.',
                                  })
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    ) : currentLesson.lesson.type === CourseContentType.TEXT ? (
                      <div className="p-6">
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                          <div 
                            className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: currentLesson.lesson.content || '' }}
                          />
                        </div>
                      </div>
                    ) : currentLesson.lesson.type === CourseContentType.PDF && currentLesson.lesson.fileUrl ? (
                      <div className="p-0">
                        <PDFReader
                          src={currentLesson.lesson.fileUrl}
                          title={currentLesson.lesson.title}
                          onComplete={() => {
                            // Marquer la leçon PDF comme complétée après visualisation
                            if (courseData && sections.length > 0 && currentLesson) {
                              if (!completedLessons.has(currentLesson.lesson.id)) {
                                setCompletedLessons((prev: Set<string>) => {
                                  const newSet = new Set(prev)
                                  newSet.add(currentLesson.lesson.id)
                                  
                                  const totalLessons = sections.reduce((acc, sec) => acc + sec.subSections.length, 0)
                                  const completedCount = newSet.size
                                  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 100
                                  
                                  // Sauvegarder dans la base de données (le cours sera marqué comme complété si progress = 100)
                                  updateProgressMutation.mutate({ 
                                    progress, 
                                    lessonId: currentLesson.lesson.id 
                                  })
                                  
                                  // Si toutes les leçons sont complétées, afficher un message
                                  if (progress >= 100) {
                                    toast.success('Félicitations !', {
                                      description: 'Vous avez terminé toutes les leçons de ce cours.',
                                    })
                                  }
                                  
                                  return newSet
                                })
                                
                                const nextLesson = findNextLesson(currentLesson.section, currentLesson.lesson)
                                if (nextLesson) {
                                  setJustCompletedLesson({ section: currentLesson.section, lesson: currentLesson.lesson })
                                  setShowNextLessonDialog(true)
                                } else if (completedLessons.size + 1 >= sections.reduce((acc, sec) => acc + sec.subSections.length, 0)) {
                                  // Si c'est la dernière leçon, afficher un message de félicitations
                                  toast.success('Félicitations !', {
                                    description: 'Vous avez terminé toutes les leçons de ce cours.',
                                  })
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <PlayCircle className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">
                          Aucun contenu disponible pour cette leçon
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Description de la leçon */}
                <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-white">
                      {currentLesson.lesson.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                        {contentTypeLabels[currentLesson.lesson.type]}
                      </Badge>
                      {currentLesson.section && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Section {currentLesson.section.order + 1} • Leçon {currentLesson.lesson.order + 1}
                        </span>
                      )}
                    </div>
                    {currentLesson.lesson.type === CourseContentType.TEXT && currentLesson.lesson.content && (
                      <p className="text-slate-600 dark:text-slate-400">
                        {currentLesson.lesson.content.substring(0, 200)}...
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-xl">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Aucune leçon disponible
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Ce cours n'a pas encore de contenu.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Partie droite : Liste des sections */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-xl lg:sticky lg:top-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Contenu du cours
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {sections.length > 0 ? (
                  <Accordion 
                    type="multiple" 
                    defaultValue={currentLesson && currentLesson.section ? [currentLesson.section.id] : []}
                    className="w-full"
                  >
                    {sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <AccordionItem key={section.id} value={section.id} className="border-slate-200 dark:border-slate-700">
                          <AccordionTrigger className="text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400">
                            <div className="flex items-center gap-2 flex-1 text-left">
                              <span className="font-semibold">{section.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {section.subSections.length} leçon{section.subSections.length > 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-1 pt-2">
                              {section.subSections
                                .sort((a, b) => a.order - b.order)
                                .map((lesson) => {
                                  const isActive = currentLesson?.lesson.id === lesson.id
                                  const Icon = contentTypeIcons[lesson.type]
                                  // Déterminer si la leçon est complétée (basé sur l'état complété)
                                  const isCompleted = completedLessons.has(lesson.id)
                                  
                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => loadLesson(section, lesson)}
                                      className={`w-full text-left p-3 rounded-lg transition-all ${
                                        isActive
                                          ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 dark:border-emerald-400'
                                          : isCompleted
                                          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                                          : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-transparent'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        {isCompleted ? (
                                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                                            isActive 
                                              ? 'text-emerald-600 dark:text-emerald-400' 
                                              : 'text-green-600 dark:text-green-400'
                                          }`} />
                                        ) : (
                                          <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                                            isActive 
                                              ? 'text-emerald-600 dark:text-emerald-400' 
                                              : 'text-slate-500 dark:text-slate-400'
                                          }`} />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className={`font-medium text-sm ${
                                            isActive
                                              ? 'text-emerald-900 dark:text-emerald-100'
                                              : isCompleted
                                              ? 'text-green-900 dark:text-green-100'
                                              : 'text-slate-700 dark:text-slate-300'
                                          }`}>
                                            {lesson.title}
                                          </div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {contentTypeLabels[lesson.type]}
                                          </div>
                                        </div>
                                        {isActive && !isCompleted && (
                                          <PlayCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                        )}
                                        {isCompleted && (
                                          <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${
                                            isActive 
                                              ? 'text-emerald-600 dark:text-emerald-400' 
                                              : 'text-green-600 dark:text-green-400'
                                          }`} />
                                        )}
                                      </div>
                                    </button>
                                  )
                                })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Aucune section disponible
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogue pour passer à la leçon suivante */}
      <AlertDialog open={showNextLessonDialog} onOpenChange={setShowNextLessonDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              Leçon complétée !
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {justCompletedLesson && (
                <>
                  Vous avez terminé la leçon <strong className="text-slate-800 dark:text-white">"{justCompletedLesson.lesson.title}"</strong>.
                  <br />
                  <br />
                  Souhaitez-vous passer à la leçon suivante ?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600">
              Rester sur cette leçon
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (justCompletedLesson) {
                  const nextLesson = findNextLesson(justCompletedLesson.section, justCompletedLesson.lesson)
                  if (nextLesson) {
                    loadLesson(nextLesson.section, nextLesson.lesson)
                  }
                }
                setShowNextLessonDialog(false)
              }}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
            >
              Passer à la leçon suivante
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CourseGuidePage
