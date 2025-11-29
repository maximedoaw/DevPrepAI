'use client'

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  UserCheck, 
  Users,
  Video,
  FileText,
  Briefcase,
  FolderOpen,
  X,
  Plus,
  Search,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { createInterviewRoom } from '@/actions/room.action'
import { RoomType } from '@prisma/client'
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

interface RoomCreateFormProps {
  trainers: Trainer[]
  candidates: Candidate[]
  onClose: () => void
  onSuccess: () => void
}

export function RoomCreateForm({ trainers, candidates, onClose, onSuccess }: RoomCreateFormProps) {
  const queryClient = useQueryClient()
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | ''>('')
  const [roomTitle, setRoomTitle] = useState('')
  const [roomDescription, setRoomDescription] = useState('')
  const [roomStatus, setRoomStatus] = useState<'active' | 'ended'>('active')
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [trainerSearch, setTrainerSearch] = useState('')
  const [candidateSearch, setCandidateSearch] = useState('')

  const createRoomMutation = useMutation({
    mutationFn: async (data: {
      roomType: RoomType
      roomData: any
      trainerIds: string[]
      candidateIds: string[]
      endedAt?: Date | null
    }) => {
      const result = await createInterviewRoom(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Room créée avec succès !')
      queryClient.invalidateQueries({ queryKey: ['bootcampRooms'] })
      resetForm()
      onSuccess()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création de la room')
    }
  })

  const resetForm = () => {
    setSelectedRoomType('')
    setRoomTitle('')
    setRoomDescription('')
    setRoomStatus('active')
    setSelectedTrainers([])
    setSelectedCandidates([])
    setTrainerSearch('')
    setCandidateSearch('')
  }

  const handleCreateRoom = () => {
    if (!selectedRoomType) {
      toast.error('Veuillez sélectionner un type de room')
      return
    }

    if (selectedTrainers.length === 0) {
      toast.error('Veuillez sélectionner au moins un formateur')
      return
    }

    if (selectedCandidates.length === 0) {
      toast.error('Veuillez sélectionner au moins un candidat')
      return
    }

    createRoomMutation.mutate({
      roomType: selectedRoomType as RoomType,
      roomData: {
        title: roomTitle || `Room ${roomTypeLabels[selectedRoomType as RoomType]}`,
        description: roomDescription
      },
      trainerIds: selectedTrainers,
      candidateIds: selectedCandidates,
      endedAt: roomStatus === 'ended' ? new Date() : null
    })
  }

  const toggleTrainer = (trainerId: string) => {
    setSelectedTrainers(prev => 
      prev.includes(trainerId) 
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    )
  }

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const filteredTrainers = trainers.filter((trainer) => 
    trainer.firstName?.toLowerCase().includes(trainerSearch.toLowerCase()) ||
    trainer.lastName?.toLowerCase().includes(trainerSearch.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(trainerSearch.toLowerCase())
  )

  const filteredCandidates = candidates.filter((candidate) => 
    candidate.firstName?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
    candidate.lastName?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(candidateSearch.toLowerCase())
  )

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-800 dark:text-white flex items-center gap-2">
          <Video className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          Créer une nouvelle room
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Configurez votre session d'entretien en sélectionnant le type, les formateurs et les candidats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type de room */}
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300 font-semibold">
            Type de room *
          </Label>
          <Select 
            value={selectedRoomType || undefined} 
            onValueChange={(value) => setSelectedRoomType(value as RoomType)}
          >
            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="Sélectionnez un type de room" />
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
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300 font-semibold">
            Titre (optionnel)
          </Label>
          <Input
            value={roomTitle}
            onChange={(e) => setRoomTitle(e.target.value)}
            placeholder="Ex: Entretien technique React"
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-base h-12"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300 font-semibold">
            Description (optionnel)
          </Label>
          <Textarea
            value={roomDescription}
            onChange={(e) => setRoomDescription(e.target.value)}
            placeholder="Description de la session..."
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 min-h-[100px]"
          />
        </div>

        {/* Statut */}
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300 font-semibold">
            Statut *
          </Label>
          <Select 
            value={roomStatus} 
            onValueChange={(value) => setRoomStatus(value as 'active' | 'ended')}
          >
            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="Sélectionnez un statut" />
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
        </div>

        {/* Sélection des formateurs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Formateurs * ({selectedTrainers.length} sélectionné{selectedTrainers.length > 1 ? 's' : ''})
            </Label>
            {selectedTrainers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTrainers([])}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <X className="h-4 w-4 mr-1" />
                Tout désélectionner
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={trainerSearch}
              onChange={(e) => setTrainerSearch(e.target.value)}
              placeholder="Rechercher un formateur..."
              className="pl-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            {filteredTrainers.length > 0 ? (
              filteredTrainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => toggleTrainer(trainer.id)}
                >
                  <Checkbox
                    checked={selectedTrainers.includes(trainer.id)}
                    onCheckedChange={() => toggleTrainer(trainer.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={trainer.imageUrl || undefined} />
                    <AvatarFallback className="bg-emerald-500 text-white">
                      {trainer.firstName?.charAt(0) || trainer.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-white">
                      {trainer.firstName && trainer.lastName 
                        ? `${trainer.firstName} ${trainer.lastName}`
                        : trainer.email}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {trainer.email}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                {trainerSearch ? 'Aucun formateur trouvé' : 'Aucun formateur disponible'}
              </p>
            )}
          </div>
        </div>

        {/* Sélection des candidats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Candidats * ({selectedCandidates.length} sélectionné{selectedCandidates.length > 1 ? 's' : ''})
            </Label>
            {selectedCandidates.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCandidates([])}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <X className="h-4 w-4 mr-1" />
                Tout désélectionner
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Rechercher un candidat..."
              className="pl-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => toggleCandidate(candidate.id)}
                >
                  <Checkbox
                    checked={selectedCandidates.includes(candidate.id)}
                    onCheckedChange={() => toggleCandidate(candidate.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={candidate.imageUrl || undefined} />
                    <AvatarFallback className="bg-green-500 text-white">
                      {candidate.firstName?.charAt(0) || candidate.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-white">
                      {candidate.firstName && candidate.lastName 
                        ? `${candidate.firstName} ${candidate.lastName}`
                        : candidate.email}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {candidate.email}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                {candidateSearch ? 'Aucun candidat trouvé' : 'Aucun candidat disponible'}
              </p>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="border-slate-300 dark:border-slate-600 w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateRoom}
            disabled={createRoomMutation.isPending || !selectedRoomType || selectedTrainers.length === 0 || selectedCandidates.length === 0}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold w-full sm:w-auto"
          >
            {createRoomMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Créer la room
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

