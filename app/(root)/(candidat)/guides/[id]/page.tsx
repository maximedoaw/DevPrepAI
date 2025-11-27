'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { getCourseByIdForCandidate } from '@/actions/bootcamp.action'
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
  const courseId = params.id as string
  const sectionId = searchParams.get('section')
  const lessonId = searchParams.get('lesson')

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['courseById', courseId],
    queryFn: async () => {
      const result = await getCourseByIdForCandidate(courseId)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: !!courseId
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

  // Fonction pour charger une leçon
  const loadLesson = (section: Section, lesson: SubSection) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('section', section.id)
    newSearchParams.set('lesson', lesson.id)
    router.push(`/guides/${courseId}?${newSearchParams.toString()}`, { scroll: false })
  }

  // Mettre à jour l'URL si nécessaire au chargement
  useEffect(() => {
    if (currentLesson && !lessonId && currentLesson.section) {
      loadLesson(currentLesson.section, currentLesson.lesson)
    }
  }, [currentLesson, lessonId, courseId, searchParams, router])

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
        </div>
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header avec bouton retour */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/guides')}
            className="text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Informations du cours */}
        <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {courseData.courseImage && (
                <img
                  src={courseData.courseImage}
                  alt={courseData.title}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
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
                {courseData.progress > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        Progression
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {Math.round(courseData.progress)}%
                      </span>
                    </div>
                    <Progress value={courseData.progress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal : Vidéo à gauche, Sections à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Partie gauche : Vidéo et description */}
          <div className="lg:col-span-2 space-y-6">
            {currentLesson ? (
              <>
                {/* Lecteur vidéo ou contenu */}
                <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-xl">
                  <CardContent className="p-0">
                    {currentLesson.lesson.type === CourseContentType.VIDEO && currentLesson.lesson.fileUrl ? (
                      <div className="relative w-full aspect-video bg-black">
                        <video
                          src={currentLesson.lesson.fileUrl}
                          controls
                          className="w-full h-full"
                          onPlay={() => {
                            // TODO: Mettre à jour le progrès
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
                      <div className="p-6">
                        <iframe
                          src={currentLesson.lesson.fileUrl}
                          className="w-full h-[600px] rounded-lg"
                          title={currentLesson.lesson.title}
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
          <div className="lg:col-span-1">
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Contenu du cours
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => loadLesson(section, lesson)}
                                      className={`w-full text-left p-3 rounded-lg transition-all ${
                                        isActive
                                          ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 dark:border-emerald-400'
                                          : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-transparent'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                                          isActive 
                                            ? 'text-emerald-600 dark:text-emerald-400' 
                                            : 'text-slate-500 dark:text-slate-400'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                          <div className={`font-medium text-sm ${
                                            isActive
                                              ? 'text-emerald-900 dark:text-emerald-100'
                                              : 'text-slate-700 dark:text-slate-300'
                                          }`}>
                                            {lesson.title}
                                          </div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {contentTypeLabels[lesson.type]}
                                          </div>
                                        </div>
                                        {isActive && (
                                          <PlayCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
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
    </div>
  )
}

export default CourseGuidePage
