'use client'

import React, { useState } from 'react'
import { 
  Handshake, CheckCircle, XCircle, Clock, User, 
  GraduationCap, Calendar, ArrowLeft, RefreshCw, 
  Mail, Building2, Sparkles, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getReceivedInvitations, 
  acceptBootcampInvitation, 
  declineBootcampInvitation,
  undoInvitationResponse 
} from '@/actions/bootcamp.action'
import { toast } from 'sonner'
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

const InvitationsPage = () => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('ALL')

  // Query pour récupérer les invitations
  const {
    data: invitations = [],
    isLoading,
    error,
    refetch
  } = useQuery<any[]>({
    queryKey: ['received-invitations'],
    queryFn: async () => {
      const result = await getReceivedInvitations()
      if (result.success && result.data) {
        return result.data
      } else {
        const errorMessage = result.error || 'Erreur lors du chargement des invitations'
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    },
    refetchInterval: 1000 * 60 * 2, // Refetch toutes les 2 minutes
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  })

  // Mutation pour accepter une invitation
  const acceptMutation = useMutation({
    mutationFn: acceptBootcampInvitation,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Invitation acceptée avec succès !')
        queryClient.invalidateQueries({ queryKey: ['received-invitations'] })
      } else {
        toast.error(result.error || 'Erreur lors de l\'acceptation')
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    }
  })

  // Mutation pour refuser une invitation
  const declineMutation = useMutation({
    mutationFn: declineBootcampInvitation,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Invitation refusée')
        queryClient.invalidateQueries({ queryKey: ['received-invitations'] })
      } else {
        toast.error(result.error || 'Erreur lors du refus')
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    }
  })

  // Mutation pour annuler une réponse
  const undoMutation = useMutation({
    mutationFn: undoInvitationResponse,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Réponse annulée avec succès')
        queryClient.invalidateQueries({ queryKey: ['received-invitations'] })
      } else {
        toast.error(result.error || 'Erreur lors de l\'annulation')
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    }
  })

  // Filtrer les invitations
  const filteredInvitations = invitations.filter((inv: any) => {
    if (filter === 'ALL') return true
    return inv.status === filter
  })

  const pendingCount = invitations.filter((inv: any) => inv.status === 'PENDING').length
  const acceptedCount = invitations.filter((inv: any) => inv.status === 'ACCEPTED').length
  const declinedCount = invitations.filter((inv: any) => inv.status === 'DECLINED').length

  // Fonction pour vérifier si on peut annuler (moins de 24h)
  const canUndo = (invitation: any) => {
    if (!invitation.respondedAt) return false
    if (invitation.status === 'PENDING') return false
    
    const respondedAt = new Date(invitation.respondedAt)
    const now = new Date()
    const hoursSinceResponse = (now.getTime() - respondedAt.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceResponse <= 24
  }

  // Fonction pour obtenir le temps restant
  const getTimeRemaining = (invitation: any) => {
    if (!invitation.respondedAt) return null
    
    const respondedAt = new Date(invitation.respondedAt)
    const now = new Date()
    const hoursSinceResponse = (now.getTime() - respondedAt.getTime()) / (1000 * 60 * 60)
    const hoursRemaining = 24 - hoursSinceResponse
    
    if (hoursRemaining <= 0) return null
    
    if (hoursRemaining >= 1) {
      return `${Math.floor(hoursRemaining)}h ${Math.floor((hoursRemaining % 1) * 60)}min restantes`
    } else {
      return `${Math.floor(hoursRemaining * 60)}min restantes`
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )
      case 'ACCEPTED':
        return (
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Acceptée
          </Badge>
        )
      case 'DECLINED':
        return (
          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Refusée
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Chargement des invitations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <Card className="border-red-200 dark:border-red-800 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error instanceof Error ? error.message : 'Une erreur est survenue'}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">
              Mes Invitations
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gérez vos invitations aux bootcamps
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Acceptées</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{acceptedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Refusées</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{declinedCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('ALL')}
            className={filter === 'ALL' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'border-emerald-200 dark:border-emerald-800'}
          >
            Toutes ({invitations.length})
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('PENDING')}
            className={filter === 'PENDING' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'border-emerald-200 dark:border-emerald-800'}
          >
            En attente ({pendingCount})
          </Button>
          <Button
            variant={filter === 'ACCEPTED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('ACCEPTED')}
            className={filter === 'ACCEPTED' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'border-emerald-200 dark:border-emerald-800'}
          >
            Acceptées ({acceptedCount})
          </Button>
          <Button
            variant={filter === 'DECLINED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('DECLINED')}
            className={filter === 'DECLINED' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'border-emerald-200 dark:border-emerald-800'}
          >
            Refusées ({declinedCount})
          </Button>
        </div>

        {/* Liste des invitations */}
        {filteredInvitations.length === 0 ? (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Handshake className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                {filter === 'ALL' 
                  ? 'Aucune invitation pour le moment' 
                  : `Aucune invitation ${filter === 'PENDING' ? 'en attente' : filter === 'ACCEPTED' ? 'acceptée' : 'refusée'}`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvitations.map((invitation: any) => {
              const bootcamp = invitation.bootcamp
              const canUndoResponse = canUndo(invitation)
              const timeRemaining = getTimeRemaining(invitation)
              const domains = (bootcamp?.domains as Domain[]) || []

              return (
                <Card
                  key={invitation.id}
                  className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Avatar et info bootcamp */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <Avatar className="h-14 w-14 border-2 border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                          <AvatarImage src={bootcamp?.imageUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                            <GraduationCap className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate">
                                {bootcamp?.firstName} {bootcamp?.lastName}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                {bootcamp?.email}
                              </p>
                            </div>
                            {getStatusBadge(invitation.status)}
                          </div>

                          {/* Domaines */}
                          {domains.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {domains.slice(0, 3).map((domain: Domain) => (
                                <Badge
                                  key={domain}
                                  variant="outline"
                                  className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                                >
                                  {domainLabels[domain]}
                                </Badge>
                              ))}
                              {domains.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                                >
                                  +{domains.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Message personnalisé */}
                          {invitation.message && (
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                "{invitation.message}"
                              </p>
                            </div>
                          )}

                          {/* Date */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Reçue le {new Date(invitation.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          {/* Temps restant pour annuler */}
                          {canUndoResponse && timeRemaining && (
                            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Vous pouvez annuler votre réponse dans les {timeRemaining}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 md:min-w-[200px]">
                        {invitation.status === 'PENDING' && (
                          <>
                            <Button
                              onClick={() => acceptMutation.mutate(invitation.id)}
                              disabled={acceptMutation.isPending}
                              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                            >
                              {acceptMutation.isPending ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accepter
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => declineMutation.mutate(invitation.id)}
                              disabled={declineMutation.isPending}
                              variant="outline"
                              className="w-full border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              {declineMutation.isPending ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Refuser
                                </>
                              )}
                            </Button>
                          </>
                        )}

                        {canUndoResponse && (
                          <Button
                            onClick={() => undoMutation.mutate(invitation.id)}
                            disabled={undoMutation.isPending}
                            variant="outline"
                            className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                          >
                            {undoMutation.isPending ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Traitement...
                              </>
                            ) : (
                              <>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Annuler la réponse
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default InvitationsPage
