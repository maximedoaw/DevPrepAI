'use client'

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Clock, 
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Star,
  PlayCircle,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { getCandidateBootcamps, getCandidateBootcampCourses } from '@/actions/bootcamp.action'
import { Loader } from '@/components/ui/loader'
import { Domain } from '@prisma/client'

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

const GuidesPage = () => {
  const router = useRouter()
  const [selectedBootcamp, setSelectedBootcamp] = useState<string | null>(null)

  const { data: bootcampsData, isLoading: bootcampsLoading } = useQuery({
    queryKey: ['candidateBootcamps'],
    queryFn: async () => {
      const result = await getCandidateBootcamps()
      if (!result.success) throw new Error(result.error)
      return result.data || []
    }
  })

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['candidateBootcampCourses'],
    queryFn: async () => {
      const result = await getCandidateBootcampCourses()
      if (!result.success) throw new Error(result.error)
      return result.data || []
    }
  })

  const bootcamps = bootcampsData || []
  const courses = coursesData || []

  if (bootcampsLoading || coursesLoading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header avec nouvelle typographie */}
        <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4 leading-tight">
              Votre parcours d'apprentissage
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                commence ici
              </span>
            </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Accédez aux cours publiés par vos bootcamps et progressez à votre rythme
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{bootcamps.length}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Bootcamps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{courses.length}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Cours disponibles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {Math.round(courses.reduce((acc: number, course: any) => acc + (course.progress || 0), 0) / (courses.length || 1))}%
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Progrès moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des bootcamps améliorée */}
        {bootcamps.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                Mes Bootcamps
              </h2>
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                {bootcamps.length} bootcamp{bootcamps.length > 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bootcamps.map((bootcamp: any) => (
                <Card
                  key={bootcamp.id}
                  className="group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-emerald-500 group-hover:border-emerald-600 transition-colors">
                        <AvatarImage src={bootcamp.imageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-500 text-white font-bold text-lg">
                          {bootcamp.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {bootcamp.name}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                          {bootcamp.email}
                        </p>
                        {bootcamp.domains && bootcamp.domains.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {bootcamp.domains.slice(0, 2).map((domain: Domain) => (
                              <Badge
                                key={domain}
                                className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs font-medium"
                              >
                                {domainLabels[domain]}
                              </Badge>
                            ))}
                            {bootcamp.domains.length > 2 && (
                              <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">
                                +{bootcamp.domains.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                Aucun bootcamp pour le moment
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                Rejoignez un bootcamp pour commencer votre apprentissage.
              </p>
              <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold px-8 py-3 rounded-xl">
                Découvrir les bootcamps
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Carrousel des cours avec design Udemy */}
        {courses.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                Cours Recommandés
              </h2>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {courses.length} cours
                </Badge>
              </div>
            </div>

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {courses.map((course: any) => (
                  <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <Card className="group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                        {course.courseImage ? (
                          <img
                            src={course.courseImage}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-500">
                            <BookOpen className="h-16 w-16 text-white/90" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white backdrop-blur-sm font-semibold border-0">
                            {domainLabels[course.domain as Domain]}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <PlayCircle className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300" />
                        </div>
                      </div>
                      
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {course.title}
                          </h3>
                          {course.description && (
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                            {course.duration && (
                              <div className="flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3" />
                                <span>{course.duration} min</span>
                              </div>
                            )}
                            {course.completedAt && (
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Terminé</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Barre de progression améliorée */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              Progression
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {Math.round(course.progress || 0)}%
                            </span>
                          </div>
                          <Progress 
                            value={course.progress || 0} 
                            className="h-2 bg-slate-200 dark:bg-slate-700"
                          />
                        </div>

                         <Button 
                           className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105"
                           onClick={(e) => {
                             e.stopPropagation()
                             router.push(`/guides/${course.id}`)
                           }}
                         >
                           {course.progress > 0 ? 'Continuer' : 'Commencer'}
                         </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-lg" />
              <CarouselNext className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-lg" />
            </Carousel>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuidesPage