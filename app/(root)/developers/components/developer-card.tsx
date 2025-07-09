"use client"

import { Mic } from 'lucide-react'
import StartVoiceInterviewModal from './startVoice-interview-modal'
import { useState } from 'react'

interface Developer {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
}

const DeveloperCard = ({ developer }: { developer: Developer }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 border border-cyan-100 rounded-xl shadow hover:shadow-lg transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
          {developer.firstName?.[0] || developer.email[0]}
        </div>
        <div>
          <div className="font-semibold text-cyan-900 text-lg">
            {developer.firstName || ''} {developer.lastName || ''}
          </div>
          <div className="text-sm text-gray-500">{developer.email}</div>
        </div>
      </div>
      <button
        className="mt-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg font-medium shadow hover:scale-105 hover:shadow-md transition-all"
        onClick={() => setOpen(true)}
      >
        <Mic className="h-5 w-5" />
        Lancer un entretien vocal
      </button>
      {open && (
        <StartVoiceInterviewModal developer={developer} open={open} setOpen={setOpen} />
      )}
    </div>
  )
}

export default DeveloperCard 