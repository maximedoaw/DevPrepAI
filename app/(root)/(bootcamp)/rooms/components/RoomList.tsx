'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Video, 
  UserCheck, 
  Users, 
  Clock, 
  FileText, 
  Briefcase, 
  FolderOpen,
  Search,
  Filter,
  X,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { RoomType } from '@prisma/client'
import { deleteInterviewRoom } from '@/actions/room.action'
import { toast } from 'sonner'
import { RoomDetailModal } from './RoomDetailModal'

const roomTypeLabels: Record<RoomType, string> = {
  TECHNICAL_TEST: 'Test Technique',
  MOCK_INTERVIEW: 'Entretien Simulé',
  PORTFOLIO_REVIEW: 'Revue de Portfolio',
  PROJECT_REVIEW: 'Revue de Projet',
  GROUP_PROJECT_REVIEW: 'Revue de Projet de Groupe'
}

const roomTypeIcons: Record<RoomType, React.ComponentType<{ className?: string }>> = {
  TECHNICAL_TEST: FileText,
  MOCK_INTERVIEW: Video,
  PORTFOLIO_REVIEW: FolderOpen,
  PROJECT_REVIEW: Briefcase,
  GROUP_PROJECT_REVIEW: Users
}

interface Room {
  id: string
  roomType: RoomType
  roomData: any
  trainers: any
  candidates: any
  startedAt: Date | string
  endedAt: Date | string | null
}

interface Trainer {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  imageUrl: string | null
  role: string
}

interface Candidate {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  imageUrl: string | null
  role: string
}

interface RoomListProps {
  rooms: Room[]
  onCreateClick: () => void
  trainers: Trainer[]
  candidates: Candidate[]
}

export function RoomList({ rooms, onCreateClick, trainers, candidates }: RoomListProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<RoomType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  // Mutation pour supprimer une room
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const result = await deleteInterviewRoom(roomId)
      if (!result.success) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      toast.success('Room supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['bootcampRooms'] })
      setDeleteDialogOpen(false)
      setRoomToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression de la room')
    }
  })

  // Ouvrir le modal de détails
  const handleViewDetails = (room: Room, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedRoom(room)
    setDetailModalOpen(true)
  }

  // Filtrer les rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const roomData = typeof room.roomData === 'string' ? JSON.parse(room.roomData) : room.roomData
      const title = roomData?.title || roomTypeLabels[room.roomType] || ''
      const description = roomData?.description || ''
      
      // Filtre par recherche
      const matchesSearch = searchQuery === '' || 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roomTypeLabels[room.roomType].toLowerCase().includes(searchQuery.toLowerCase())

      // Filtre par type
      const matchesType = typeFilter === 'all' || room.roomType === typeFilter

      // Filtre par statut
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !room.endedAt) ||
        (statusFilter === 'ended' && room.endedAt)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [rooms, searchQuery, typeFilter, statusFilter])

  const handleDelete = (room: Room, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setRoomToDelete(room)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (roomToDelete) {
      deleteRoomMutation.mutate(roomToDelete.id)
    }
  }

  if (rooms.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 shadow-xl">
        <CardContent className="p-8 sm:p-16 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-3">
            Aucune room pour le moment
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-6">
            Créez votre première room pour commencer à organiser des sessions d'entretien
          </p>
          <Button
            onClick={onCreateClick}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl"
          >
            Créer une room
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Barre de recherche et filtres */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une room..."
              className="pl-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filtre par type */}
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as RoomType | 'all')}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(roomTypeLabels).map(([roomTypeValue, label]) => {
                const roomType = roomTypeValue as RoomType
                const Icon = roomTypeIcons[roomType]
                return (
                  <SelectItem key={roomType} value={roomTypeValue}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {/* Filtre par statut */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'ended')}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="ended">Terminée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Compteur de résultats */}
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {filteredRooms.length} room{filteredRooms.length > 1 ? 's' : ''} trouvée{filteredRooms.length > 1 ? 's' : ''}
          {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setTypeFilter('all')
                setStatusFilter('all')
              }}
              className="ml-2 h-6 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Liste des rooms */}
      {filteredRooms.length === 0 ? (
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 shadow-xl">
          <CardContent className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Aucune room ne correspond à vos critères de recherche
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const Icon = roomTypeIcons[room.roomType]
            const roomData = typeof room.roomData === 'string' ? JSON.parse(room.roomData) : room.roomData
            const trainers = typeof room.trainers === 'string' ? JSON.parse(room.trainers) : room.trainers || []
            const candidates = typeof room.candidates === 'string' ? JSON.parse(room.candidates) : room.candidates || []
            const isEnded = !!room.endedAt
            
            return (
              <Card
                key={room.id}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle 
                          className="text-base sm:text-lg text-slate-800 dark:text-white mb-1 break-words line-clamp-2"
                          title={roomData?.title || roomTypeLabels[room.roomType]}
                        >
                          {roomData?.title || roomTypeLabels[room.roomType]}
                        </CardTitle>
                        <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs mt-1">
                          {roomTypeLabels[room.roomType]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-start gap-1 flex-shrink-0">
                      {isEnded ? (
                        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-700 text-xs whitespace-nowrap">
                          Terminée
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs whitespace-nowrap">
                          Active
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem
                            onClick={(e) => handleViewDetails(room, e)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleDelete(room, e)}
                            className="cursor-pointer text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  {roomData?.description && (
                    <p 
                      className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 break-words"
                      title={roomData.description}
                    >
                      {roomData.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 sm:gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{trainers.length} formateur{trainers.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{candidates.length} candidat{candidates.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-auto">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="break-words">
                      {new Date(room.startedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Bouton Ouvrir la room */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/rooms/${room.id}`)
                    }}
                    disabled={isEnded}
                    className={`${isEnded ? 'bg-slate-200 dark:bg-slate-700' : 'mt-3 w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    size="sm"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {isEnded ? 'Room terminée' : 'Ouvrir la room'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de détails */}
      <RoomDetailModal
        room={selectedRoom}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        trainers={trainers}
        candidates={candidates}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800 dark:text-white">
              Supprimer la room
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Êtes-vous sûr de vouloir supprimer cette room ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteRoomMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteRoomMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
