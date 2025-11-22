'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Award, AlertCircle, CheckCircle, XCircle, Briefcase, EyeOff, UserPlus, UserMinus, Crown, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Domain } from '@prisma/client'
import { inviteCandidateToBootcamp, cancelBootcampInvitation } from '@/actions/bootcamp.action'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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

interface ParticipantsListProps {
  participants: any[]
  onParticipantClick: (participant: any) => void
  calculateProgress: (participant: any) => number
  getStatus: (participant: any) => string
  getBadges: (participant: any) => string[]
  bootcampDomains?: Domain[]
  refetchParticipants?: () => void
}

export function ParticipantsList({
  participants,
  onParticipantClick,
  calculateProgress,
  getStatus,
  getBadges,
  bootcampDomains = [],
  refetchParticipants
}: ParticipantsListProps) {
  const queryClient = useQueryClient()
  const [invitingIds, setInvitingIds] = useState<Set<string>>(new Set())
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Séparer les membres (avec enrollment) des invités (sans enrollment)
  const members = participants.filter(p => p.bootcampEnrollments && p.bootcampEnrollments.length > 0)
  const invited = participants.filter(p => {
    const hasEnrollment = p.bootcampEnrollments && p.bootcampEnrollments.length > 0
    const hasPendingInvitation = p.bootcampInvitationsReceived?.some((inv: any) => inv.status === 'PENDING')
    return !hasEnrollment && hasPendingInvitation
  })
  const canInvite = participants.filter(p => {
    const hasEnrollment = p.bootcampEnrollments && p.bootcampEnrollments.length > 0
    const hasPendingInvitation = p.bootcampInvitationsReceived?.some((inv: any) => inv.status === 'PENDING')
    return !hasEnrollment && !hasPendingInvitation
  })

  // Combiner tous les participants pour la pagination
  const allParticipants = useMemo(() => {
    return [
      ...members.map(p => ({ ...p, category: 'member' })),
      ...invited.map(p => ({ ...p, category: 'invited' })),
      ...canInvite.map(p => ({ ...p, category: 'canInvite' }))
    ]
  }, [members, invited, canInvite])

  // Calculer la pagination
  const totalPages = Math.ceil(allParticipants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedParticipants = allParticipants.slice(startIndex, endIndex)

  // Réinitialiser la page si nécessaire
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Mutation pour inviter
  const inviteMutation = useMutation({
    mutationFn: (candidateId: string) => inviteCandidateToBootcamp(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bootcamp-participants'] })
      toast.success('Invitation envoyée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'invitation')
    }
  })

  // Mutation pour annuler
  const cancelMutation = useMutation({
    mutationFn: (candidateId: string) => cancelBootcampInvitation(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bootcamp-participants'] })
      toast.success('Invitation annulée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'annulation de l\'invitation')
    }
  })

  const handleInvite = async (participant: any) => {
    setInvitingIds(prev => new Set(prev).add(participant.id))
    inviteMutation.mutate(participant.id, {
      onSettled: () => {
        setInvitingIds(prev => {
          const next = new Set(prev)
          next.delete(participant.id)
          return next
        })
      }
    })
  }

  const handleCancelInvite = async (participant: any) => {
    setCancellingIds(prev => new Set(prev).add(participant.id))
    cancelMutation.mutate(participant.id, {
      onSettled: () => {
        setCancellingIds(prev => {
          const next = new Set(prev)
          next.delete(participant.id)
          return next
        })
      }
    })
  }

  const shouldBlur = (index: number) => index >= 10

  const renderParticipantCard = (participant: any, index: number, showInviteButton: boolean = false, isInvited: boolean = false) => {
    const category = participant.category || 'member'
    const progress = calculateProgress(participant)
    const status = getStatus(participant)
    const badges = getBadges(participant)
    const statusInfo = statusConfig[status as keyof typeof statusConfig]
    const StatusIcon = statusInfo?.icon || CheckCircle
    const blur = shouldBlur(index)
    const isInviting = invitingIds.has(participant.id)
    const isCancelling = cancellingIds.has(participant.id)

    return (
      <Card
        key={participant.id}
        className={`relative border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
          blur ? 'opacity-60 blur-sm pointer-events-none' : 'hover:scale-[1.02] cursor-pointer'
        }`}
        onClick={() => !blur && onParticipantClick(participant)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-12 w-12 border-2 border-emerald-200 dark:border-emerald-800">
              <AvatarImage src={participant.imageUrl || undefined} />
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                {participant.firstName?.[0] || participant.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {participant.firstName} {participant.lastName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {participant.email}
              </p>
            </div>
          </div>

          {/* Progression */}
          {progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Progression
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-slate-200 dark:bg-slate-700"
              />
            </div>
          )}

          {/* Domaines */}
          <div className="flex flex-wrap gap-2 mb-4">
            {participant.domains?.slice(0, 2).map((domain: Domain) => (
              <Badge
                key={domain}
                variant="outline"
                className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
              >
                {domainLabels[domain]}
              </Badge>
            ))}
            {participant.domains?.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
              >
                +{participant.domains.length - 2}
              </Badge>
            )}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {badges.slice(0, 3).map((badge: string, idx: number) => (
                <Badge
                  key={idx}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs"
                >
                  <Award className="h-3 w-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {/* Statut et Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
              <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
              <span className={`text-xs font-medium ${statusInfo.textColor}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {participant.bootcampEnrollments?.[0]?.isJobReady && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                  <Briefcase className="h-3 w-3 mr-1" />
                  Prêt
                </Badge>
              )}
              {!blur && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    onClick={(e) => {
                      e.stopPropagation()
                      onParticipantClick(participant)
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir détails
                  </Button>
                  {showInviteButton && (
                    <>
                      {isInvited ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelInvite(participant)
                          }}
                          disabled={isCancelling}
                        >
                          <UserMinus className="h-3 w-3 mr-1" />
                          {isCancelling ? 'Annulation...' : 'Annuler'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInvite(participant)
                          }}
                          disabled={isInviting}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          {isInviting ? 'Invitation...' : 'Inviter'}
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grouper les participants paginés par catégorie
  const paginatedMembers = paginatedParticipants.filter(p => p.category === 'member')
  const paginatedInvited = paginatedParticipants.filter(p => p.category === 'invited')
  const paginatedCanInvite = paginatedParticipants.filter(p => p.category === 'canInvite')

  const totalVisible = allParticipants.length

  return (
    <>
      {/* Section Membres */}
      {paginatedMembers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Membres ({members.length})
            </h2>
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Actifs
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedMembers.map((participant, index) => {
              const globalIndex = members.findIndex(m => m.id === participant.id)
              return renderParticipantCard(participant, globalIndex, false, false)
            })}
          </div>
        </div>
      )}

      {/* Section Invités */}
      {paginatedInvited.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Invités ({invited.length})
            </h2>
            <Badge variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30">
              <UserPlus className="h-3 w-3 mr-1" />
              En attente
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedInvited.map((participant, index) => {
              const globalIndex = members.length + invited.findIndex(i => i.id === participant.id)
              return renderParticipantCard(participant, globalIndex, true, true)
            })}
          </div>
        </div>
      )}

      {/* Section Candidats à inviter */}
      {paginatedCanInvite.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Candidats à inviter ({canInvite.length})
            </h2>
            <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              Disponibles
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCanInvite.map((participant, index) => {
              const globalIndex = members.length + invited.length + canInvite.findIndex(c => c.id === participant.id)
              return renderParticipantCard(participant, globalIndex, true, false)
            })}
          </div>
        </div>
      )}

      {/* Message si aucun participant */}
      {allParticipants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            Aucun participant trouvé
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Affichage de {startIndex + 1} à {Math.min(endIndex, allParticipants.length)} sur {allParticipants.length} participant{allParticipants.length > 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0"
                        : "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    }
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Message pour les profils floutés et premium */}
      {totalVisible > 10 && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-emerald-900/20 mt-6">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Crown className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-2" />
              <EyeOff className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
              Passez à Premium pour voir tous les apprenants
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
              Les profils au-delà de 10 sont masqués. Avec Premium, accédez à tous les {totalVisible} apprenants sans limitation.
            </p>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
              onClick={() => toast.info('Fonctionnalité Premium à venir')}
            >
              <Crown className="h-4 w-4 mr-2" />
              Passer à Premium
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}
