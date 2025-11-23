'use client'

import React, { useMemo, useState } from 'react'
import { Bell, BookOpen, Loader2, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getBootcampParticipants, 
  getParticipantDetails,
  getBootcampNotifications,
  getBootcampCourses,
  getBootcampDomains
} from '@/actions/bootcamp.action'
import { Domain } from '@prisma/client'
import { toast } from 'sonner'
import { ParticipantsList } from './components/ParticipantsList'
import { FiltersBar } from './components/FiltersBar'
import { ParticipantDetailsDialog } from './components/ParticipantDetails-dialog'
import { CreateCourseDialog } from './components/CreateCourseDialog'
import { FeedbackDialog } from './components/FeedbackDialog'
import { AssignTestDialog } from './components/AssignTestDialog'
import { CoursesListWithSections } from './components/CoursesList'

const LearningLabPage = () => {
  const queryClient = useQueryClient()
  
  // États locaux pour l'UI
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isAssignTestOpen, setIsAssignTestOpen] = useState(false)
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [domainFilter, setDomainFilter] = useState<string>('ALL')

  // Query pour récupérer les domaines du bootcamp depuis l'utilisateur connecté
  const {
    data: bootcampDomains = [],
    isLoading: loadingDomains
  } = useQuery<Domain[]>({
    queryKey: ['bootcamp-domains'],
    queryFn: async () => {
      const result = await getBootcampDomains()
      if (result.success && result.data) {
        return result.data
      } else {
        const errorMessage = result.error || 'Erreur lors du chargement des domaines'
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - les domaines changent rarement
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2
  })

  // Query pour les participants
  // Les domaines seront récupérés automatiquement depuis l'utilisateur connecté (rôle BOOTCAMP)
  const {
    data: participants = [],
    isLoading: loadingParticipants,
    error: participantsError,
    refetch: refetchParticipants
  } = useQuery<any[]>({
    queryKey: ['bootcamp-participants', bootcampDomains],
    queryFn: async () => {
      // Passer un tableau vide, la fonction récupérera les domaines depuis l'utilisateur connecté
      const result = await getBootcampParticipants([])
      if (result.success && result.data) {
        return result.data
      } else {
        const errorMessage = result.error || 'Erreur lors du chargement des participants'
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2
  })

  // Query pour les cours
  const {
    data: courses = [],
    isLoading: loadingCourses,
    error: coursesError,
    refetch: refetchCourses
  } = useQuery<any[]>({
    queryKey: ['bootcamp-courses'],
    queryFn: async () => {
      const result = await getBootcampCourses()
      if (result.success && result.data) {
        return result.data
      } else {
        const errorMessage = result.error || 'Erreur lors du chargement des cours'
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2
  })

  // Query pour les notifications
  const {
    data: notifications = [],
    isLoading: loadingNotifications
  } = useQuery<any[]>({
    queryKey: ['bootcamp-notifications'],
    queryFn: async () => {
      const result = await getBootcampNotifications()
      if (result.success && result.data) {
        return result.data
      } else {
        return []
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch toutes les 2 minutes
    retry: 1
  })

  // Mutation pour récupérer les détails d'un participant
  const participantDetailsMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const result = await getParticipantDetails(participantId)
      if (result.success && result.data) {
        return result.data
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des détails')
      }
    },
    onSuccess: (data) => {
      setSelectedParticipant(data)
      setIsDetailsOpen(true)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Filtrage des participants avec useMemo
  const filteredParticipants = useMemo(() => {
    let filtered = [...participants]

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase()
        const email = p.email?.toLowerCase() || ''
        return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
      })
    }

    // Filtre par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => {
        const enrollment = p.bootcampEnrollments?.[0]
        return enrollment?.status === statusFilter
      })
    }

    // Filtre par domaine
    if (domainFilter !== 'ALL') {
      filtered = filtered.filter(p => 
        p.domains?.includes(domainFilter as Domain)
      )
    }

    return filtered
  }, [participants, searchTerm, statusFilter, domainFilter])

  const openParticipantDetails = (participant: any) => {
    participantDetailsMutation.mutate(participant.id)
  }

  // Fonction pour rafraîchir les données après les mutations
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['bootcamp-participants'] })
    queryClient.invalidateQueries({ queryKey: ['bootcamp-courses'] })
    queryClient.invalidateQueries({ queryKey: ['bootcamp-notifications'] })
  }

  const calculateProgress = (participant: any) => {
    const enrollment = participant.bootcampEnrollments?.[0]
    return enrollment?.progress || 0
  }

  const getStatus = (participant: any) => {
    const enrollment = participant.bootcampEnrollments?.[0]
    return enrollment?.status || 'INACTIVE'
  }

  const getBadges = (participant: any) => {
    const enrollment = participant.bootcampEnrollments?.[0]
    return enrollment?.badges || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">
              Learning Lab
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gestion des apprenants et suivi de progression
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Bouton créer un cours */}
            <Button
              onClick={() => setIsCreateCourseOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un cours
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="relative border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                onClick={() => {
                  toast.info('Notifications')
                }}
              >
                <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 dark:bg-emerald-400 text-white text-xs flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs pour Participants et Cours */}
        <Tabs defaultValue="participants" className="w-full">
          <TabsList className="grid w-full grid-cols-2 border-emerald-200 dark:border-emerald-800">
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Apprenants
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Cours
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="space-y-6">
            {/* Filtres */}
            <FiltersBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              domainFilter={domainFilter}
              onDomainFilterChange={setDomainFilter}
              bootcampDomains={bootcampDomains}
            />

            {/* Liste des participants */}
            {loadingParticipants ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : participantsError ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">
                  Erreur lors du chargement des participants
                </p>
                <Button
                  onClick={() => refetchParticipants()}
                  variant="outline"
                  className="mt-4"
                >
                  Réessayer
                </Button>
              </div>
            ) : (
              <ParticipantsList
                participants={filteredParticipants}
                onParticipantClick={openParticipantDetails}
                calculateProgress={calculateProgress}
                getStatus={getStatus}
                getBadges={getBadges}
              />
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {loadingCourses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : coursesError ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">
                  Erreur lors du chargement des cours
                </p>
                <Button
                  onClick={() => refetchCourses()}
                  variant="outline"
                  className="mt-4"
                >
                  Réessayer
                </Button>
              </div>
            ) : (
              <CoursesListWithSections
                courses={courses}
                onRefresh={refetchCourses}
                bootcampDomains={bootcampDomains}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog de détails du participant */}
        {selectedParticipant && (
          <ParticipantDetailsDialog
            participant={selectedParticipant}
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            onFeedbackClick={() => {
              setIsDetailsOpen(false)
              setIsFeedbackOpen(true)
            }}
            onAssignTestClick={() => {
              setIsDetailsOpen(false)
              setIsAssignTestOpen(true)
            }}
            calculateProgress={calculateProgress}
            getStatus={getStatus}
            getBadges={getBadges}
          />
        )}

        {/* Dialog de création de cours */}
        <CreateCourseDialog
          isOpen={isCreateCourseOpen}
          onClose={() => setIsCreateCourseOpen(false)}
          bootcampDomains={bootcampDomains}
          onCourseCreated={handleRefresh}
        />

        {/* Dialog de feedback */}
        {selectedParticipant && (
          <FeedbackDialog
            isOpen={isFeedbackOpen}
            onClose={() => setIsFeedbackOpen(false)}
            participant={selectedParticipant}
            onSuccess={handleRefresh}
          />
        )}

        {/* Dialog d'assignation de test */}
        {selectedParticipant && (
          <AssignTestDialog
            isOpen={isAssignTestOpen}
            onClose={() => setIsAssignTestOpen(false)}
            participant={selectedParticipant}
            onSuccess={handleRefresh}
          />
        )}
      </div>
    </div>
  )
}

export default LearningLabPage
