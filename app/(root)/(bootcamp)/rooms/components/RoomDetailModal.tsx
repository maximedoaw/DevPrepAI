'use client'

import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Video, 
  UserCheck, 
  Users, 
  Clock, 
  Calendar,
  FileText,
  Briefcase,
  FolderOpen,
  Edit,
  Save,
  X,
  Loader2
} from 'lucide-react'
import { RoomType } from '@prisma/client'
import { updateInterviewRoom } from '@/actions/room.action'
import { toast } from 'sonner'

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

interface Trainer {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string
  imageUrl?: string | null
}

interface Candidate {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string
  imageUrl?: string | null
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

interface RoomDetailModalProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  trainers: Trainer[]
  candidates: Candidate[]
}

export function RoomDetailModal({ 
  room, 
  open, 
  onOpenChange, 
  trainers, 
  candidates 
}: RoomDetailModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editedRoomType, setEditedRoomType] = useState<RoomType | ''>('')
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedStatus, setEditedStatus] = useState<'active' | 'ended'>('active')
  const [editedTrainerIds, setEditedTrainerIds] = useState<string[]>([])
  const [editedCandidateIds, setEditedCandidateIds] = useState<string[]>([])

  // Initialiser les valeurs quand la room change
  useEffect(() => {
    if (room) {
      const roomData = typeof room.roomData === 'string' ? JSON.parse(room.roomData) : room.roomData
      const trainers = typeof room.trainers === 'string' ? JSON.parse(room.trainers) : room.trainers || []
      const candidates = typeof room.candidates === 'string' ? JSON.parse(room.candidates) : room.candidates || []
      
      setEditedRoomType(room.roomType)
      setEditedTitle(roomData?.title || '')
      setEditedDescription(roomData?.description || '')
      setEditedStatus(room.endedAt ? 'ended' : 'active')
      setEditedTrainerIds(trainers.map((t: Trainer) => t.id))
      setEditedCandidateIds(candidates.map((c: Candidate) => c.id))
      setIsEditing(false)
    }
  }, [room])

  const updateRoomMutation = useMutation({
    mutationFn: async (data: {
      roomType?: RoomType
      roomData?: any
      trainerIds?: string[]
      candidateIds?: string[]
      endedAt?: Date | null
    }) => {
      if (!room) throw new Error('Room non trouvée')
      const result = await updateInterviewRoom(room.id, data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Room mise à jour avec succès !')
      queryClient.invalidateQueries({ queryKey: ['bootcampRooms'] })
      setIsEditing(false)
      onOpenChange(false) // Fermer le modal après mise à jour
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de la room')
    }
  })

  const handleSave = () => {
    if (!editedRoomType) {
      toast.error('Veuillez sélectionner un type de room')
      return
    }

    if (editedTrainerIds.length === 0) {
      toast.error('Au moins un formateur est requis')
      return
    }

    if (editedCandidateIds.length === 0) {
      toast.error('Au moins un candidat est requis')
      return
    }

    updateRoomMutation.mutate({
      roomType: editedRoomType as RoomType,
      roomData: {
        title: editedTitle || `Room ${roomTypeLabels[editedRoomType as RoomType]}`,
        description: editedDescription
      },
      trainerIds: editedTrainerIds,
      candidateIds: editedCandidateIds,
      endedAt: editedStatus === 'ended' ? new Date() : null
    })
  }

  const toggleTrainer = (trainerId: string) => {
    setEditedTrainerIds(prev => 
      prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    )
  }

  const toggleCandidate = (candidateId: string) => {
    setEditedCandidateIds(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  if (!room) return null

  const roomData = typeof room.roomData === 'string' ? JSON.parse(room.roomData) : room.roomData
  const roomTrainers = typeof room.trainers === 'string' ? JSON.parse(room.trainers) : room.trainers || []
  const roomCandidates = typeof room.candidates === 'string' ? JSON.parse(room.candidates) : room.candidates || []
  const Icon = roomTypeIcons[room.roomType]
  const isEnded = !!room.endedAt

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800">
        {/* Header fixe avec bouton modifier */}
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">
              Détails de la room
            </DialogTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8"
              >
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-1 py-4">
          <div className="space-y-6">
            {/* Titre */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Titre
              </Label>
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Titre de la room"
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-base h-12"
                />
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-base font-medium text-slate-800 dark:text-white break-words">
                    {roomData?.title || roomTypeLabels[room.roomType]}
                  </p>
                </div>
              )}
            </div>

            {/* Type et Statut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Type d'interview
                </Label>
                {isEditing ? (
                  <Select 
                    value={editedRoomType || undefined} 
                    onValueChange={(value) => setEditedRoomType(value as RoomType)}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
                      <SelectValue placeholder="Type de room" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roomTypeLabels).map(([roomTypeValue, label]) => {
                        const roomType = roomTypeValue as RoomType
                        const IconComponent = roomTypeIcons[roomType]
                        return (
                          <SelectItem key={roomType} value={roomTypeValue}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                      {roomTypeLabels[room.roomType]}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Statut
                </Label>
                {isEditing ? (
                  <Select 
                    value={editedStatus} 
                    onValueChange={(value) => setEditedStatus(value as 'active' | 'ended')}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ended">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                          <span>Terminée</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    {isEnded ? (
                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-700">
                        Terminée
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        Active
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </Label>
              {isEditing ? (
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Description de la room..."
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 min-h-[100px] resize-none"
                />
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 break-words whitespace-pre-wrap">
                    {roomData?.description || 'Aucune description'}
                  </p>
                </div>
              )}
            </div>

            {/* Informations de date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date de création</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white break-words">
                    {new Date(room.startedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              {room.endedAt && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date de fin</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white break-words">
                      {new Date(room.endedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Formateurs */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Formateurs
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  ({isEditing ? editedTrainerIds.length : roomTrainers.length})
                </span>
              </Label>
              {isEditing ? (
                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  {trainers.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      Aucun formateur disponible
                    </p>
                  ) : (
                    trainers.map((trainer) => (
                      <div
                        key={trainer.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() => toggleTrainer(trainer.id)}
                      >
                        <input
                          type="checkbox"
                          checked={editedTrainerIds.includes(trainer.id)}
                          onChange={() => toggleTrainer(trainer.id)}
                          className="rounded border-slate-300 dark:border-slate-600 w-4 h-4 flex-shrink-0"
                        />
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={trainer.imageUrl || undefined} />
                          <AvatarFallback className="bg-emerald-500 text-white text-xs">
                            {trainer.firstName?.charAt(0) || trainer.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                            {trainer.firstName && trainer.lastName 
                              ? `${trainer.firstName} ${trainer.lastName}`
                              : trainer.email}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {trainer.email}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  {roomTrainers.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
                      Aucun formateur assigné
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {roomTrainers.map((trainer: Trainer) => (
                        <div
                          key={trainer.id}
                          className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarImage src={trainer.imageUrl || undefined} />
                            <AvatarFallback className="bg-emerald-500 text-white text-xs">
                              {trainer.firstName?.charAt(0) || trainer.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 dark:text-white truncate max-w-[120px]">
                              {trainer.firstName && trainer.lastName 
                                ? `${trainer.firstName} ${trainer.lastName}`
                                : trainer.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Candidats */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Candidats
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  ({isEditing ? editedCandidateIds.length : roomCandidates.length})
                </span>
              </Label>
              {isEditing ? (
                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  {candidates.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      Aucun candidat disponible
                    </p>
                  ) : (
                    candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() => toggleCandidate(candidate.id)}
                      >
                        <input
                          type="checkbox"
                          checked={editedCandidateIds.includes(candidate.id)}
                          onChange={() => toggleCandidate(candidate.id)}
                          className="rounded border-slate-300 dark:border-slate-600 w-4 h-4 flex-shrink-0"
                        />
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={candidate.imageUrl || undefined} />
                          <AvatarFallback className="bg-green-500 text-white text-xs">
                            {candidate.firstName?.charAt(0) || candidate.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                            {candidate.firstName && candidate.lastName 
                              ? `${candidate.firstName} ${candidate.lastName}`
                              : candidate.email}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  {roomCandidates.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
                      Aucun candidat assigné
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {roomCandidates.map((candidate: Candidate) => (
                        <div
                          key={candidate.id}
                          className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarImage src={candidate.imageUrl || undefined} />
                            <AvatarFallback className="bg-green-500 text-white text-xs">
                              {candidate.firstName?.charAt(0) || candidate.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 dark:text-white truncate max-w-[120px]">
                              {candidate.firstName && candidate.lastName 
                                ? `${candidate.firstName} ${candidate.lastName}`
                                : candidate.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer fixe */}
        <DialogFooter className="flex-shrink-0 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-300 dark:border-slate-600"
          >
            Fermer
          </Button>
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={updateRoomMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateRoomMutation.isPending}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
              >
                {updateRoomMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
