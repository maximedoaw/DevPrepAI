import React from 'react'
import DeveloperCard from './developer-card'

interface Developer {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
}

const DevelopersList = ({ developers }: { developers: Developer[] }) => {
  if (!developers || developers.length === 0) {
    return <div className="text-gray-500">Aucun développeur trouvé.</div>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {developers.map((dev) => (
        <DeveloperCard key={dev.id} developer={dev} />
      ))}
    </div>
  )
}

export default DevelopersList 