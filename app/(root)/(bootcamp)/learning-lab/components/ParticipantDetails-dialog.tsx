'use client'

import React from 'react'
import { 
  Users, BookOpen, FileText, Briefcase, MessageSquare,
  Plus, BarChart3, Target, CheckCircle2, X, Award,
  FileVideo, File, Code, ExternalLink, CheckCircle, AlertCircle, XCircle
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
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

const statusConfig = {
  ACTIVE: {
    label: 'Actif',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle
  },
  AT_RISK: {
    label: 'À risque',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    icon: AlertCircle
  },
  INACTIVE: {
    label: 'Inactif',
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
    icon: XCircle
  }
}

interface ParticipantDetailsDialogProps {
  participant: any
  isOpen: boolean
  onClose: () => void
  onFeedbackClick: () => void
  onAssignTestClick: () => void
  calculateProgress: (participant: any) => number
  getStatus: (participant: any) => string
  getBadges: (participant: any) => string[]
}

export function ParticipantDetailsDialog({
  participant,
  isOpen,
  onClose,
  onFeedbackClick,
  onAssignTestClick,
  calculateProgress,
  getStatus,
  getBadges
}: ParticipantDetailsDialogProps) {
  if (!participant) return null

  const status = getStatus(participant)
  const statusInfo = statusConfig[status as keyof typeof statusConfig]
  const StatusIcon = statusInfo?.icon || CheckCircle

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-600">
            Fiche de {participant.firstName} {participant.lastName}
          </DialogTitle>
          <DialogDescription>
            Détails complets de l'apprenant
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 border-emerald-200 dark:border-emerald-800">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="courses">Cours</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Informations générales */}
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-emerald-200 dark:border-emerald-800">
                    <AvatarImage src={participant.imageUrl || undefined} />
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xl">
                      {participant.firstName?.[0] || participant.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {participant.firstName} {participant.lastName}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{participant.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Progression</p>
                    <div className="flex items-center gap-2">
                      <Progress value={calculateProgress(participant)} className="flex-1" />
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {Math.round(calculateProgress(participant))}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Statut</p>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${statusInfo.bgColor}`}>
                      <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
                      <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Domaines</p>
                  <div className="flex flex-wrap gap-2">
                    {participant.domains?.map((domain: Domain) => (
                      <Badge
                        key={domain}
                        variant="outline"
                        className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                      >
                        {domainLabels[domain]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Badges</p>
                  <div className="flex flex-wrap gap-2">
                    {getBadges(participant).map((badge: string, idx: number) => (
                      <Badge
                        key={idx}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {badge}
                      </Badge>
                    ))}
                    {getBadges(participant).length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Aucun badge</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Prêt pour l'emploi:</span>
                  {participant.bootcampEnrollments?.[0]?.isJobReady ? (
                    <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Oui
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-300 dark:border-slate-600">
                      <X className="h-3 w-3 mr-1" />
                      Non
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Scores aux tests techniques */}
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Scores aux tests techniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participant.JobQuizResults?.slice(0, 5).map((result: any) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {result.jobQuiz?.title || 'Test technique'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {result.jobQuiz?.type} • {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          {Math.round(result.score)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!participant.JobQuizResults || participant.JobQuizResults.length === 0) && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      Aucun test technique complété
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Résultats QCM et Soft Skills */}
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Résultats QCM & Soft Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participant.quizResults?.filter((q: any) => 
                    q.quiz?.type === 'QCM' || q.quiz?.type === 'SOFT_SKILLS'
                  ).slice(0, 5).map((result: any) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {result.quiz?.title || 'Quiz'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {result.quiz?.type} • {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          {Math.round(result.score)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!participant.quizResults || participant.quizResults.filter((q: any) => 
                    q.quiz?.type === 'QCM' || q.quiz?.type === 'SOFT_SKILLS'
                  ).length === 0) && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      Aucun QCM ou test de soft skills complété
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Historique des cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participant.bootcampCourseViews?.map((view: any) => (
                    <div key={view.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        {view.course?.contentType === 'VIDEO' && <FileVideo className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        {view.course?.contentType === 'PDF' && <File className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        {view.course?.contentType === 'TEXT' && <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        {view.course?.contentType === 'EMBED' && <Code className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {view.course?.title || 'Cours'}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Vu le {new Date(view.viewedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Progress value={view.progress} className="w-24 mb-1" />
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {Math.round(view.progress)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!participant.bootcampCourseViews || participant.bootcampCourseViews.length === 0) && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      Aucun cours consulté
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Tous les tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Tests techniques</h4>
                    <div className="space-y-2">
                      {participant.JobQuizResults?.map((result: any) => (
                        <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {result.jobQuiz?.title || 'Test technique'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(result.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-emerald-500 text-white">
                            {Math.round(result.score)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">QCM & Soft Skills</h4>
                    <div className="space-y-2">
                      {participant.quizResults?.map((result: any) => (
                        <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {result.quiz?.title || 'Quiz'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {result.quiz?.type} • {new Date(result.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-emerald-500 text-white">
                            {Math.round(result.score)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  CV & Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participant.portfolio?.[0] ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
                        {participant.portfolio[0].title}
                      </h4>
                      {participant.portfolio[0].bio && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          {participant.portfolio[0].bio}
                        </p>
                      )}
                      {participant.portfolio[0].publishedAt && (
                        <Button
                          variant="outline"
                          className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                          onClick={() => window.open(`/portfolio/${participant.portfolio[0].id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Voir le portfolio
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    Aucun portfolio disponible
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onFeedbackClick}
            className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Donner un feedback
          </Button>
          <Button
            variant="outline"
            onClick={onAssignTestClick}
            className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assigner un test
          </Button>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

