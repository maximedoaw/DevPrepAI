'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { getBootcampMembers, getBootcampRooms } from '@/actions/room.action'
import { RoomCreateForm } from './components/RoomCreateForm'
import { RoomList } from './components/RoomList'

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

interface MembersData {
  candidates: Candidate[]
  trainers: Trainer[]
}

const RoomsPage = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Récupérer les membres du bootcamp
  const { data: membersData, isLoading: membersLoading } = useQuery<MembersData>({
    queryKey: ['bootcampMembers'],
    queryFn: async () => {
      const result = await getBootcampMembers()
      if (!result.success) throw new Error(result.error)
      return result.data as MembersData
    }
  })

  // Récupérer les rooms existantes
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['bootcampRooms'],
    queryFn: async () => {
      const result = await getBootcampRooms()
      if (!result.success) throw new Error(result.error)
      return result.data || []
    }
  })

  if (membersLoading || roomsLoading) {
    return <Loader />
  }

  const rooms = roomsData || []
  const trainers = membersData?.trainers || []
  const candidates = membersData?.candidates || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-2 leading-tight">
              Salles d'entretien
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300">
              Créez et gérez vos sessions d'entretien avec vos candidats
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold px-4 sm:px-6 py-3 rounded-xl shadow-lg w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            {showCreateForm ? 'Annuler' : 'Créer une room'}
          </Button>
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <RoomCreateForm
            trainers={trainers}
            candidates={candidates}
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => setShowCreateForm(false)}
          />
        )}

        {/* Liste des rooms existantes */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Video className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
            Rooms existantes ({rooms.length})
          </h2>

          <RoomList 
            rooms={rooms} 
            onCreateClick={() => setShowCreateForm(true)}
            trainers={trainers}
            candidates={candidates}
          />
        </div>
      </div>
    </div>
  )
}

export default RoomsPage
