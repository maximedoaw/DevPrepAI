import React from 'react'
import { getDevelopers } from '@/actions/developers.action'
import DevelopersList from './components/developers-list'

const DevelopersPage = async () => {
  const developers = await getDevelopers()
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-cyan-800">Liste des développeurs</h1>
      <DevelopersList developers={developers} />
    </div>
  )
}

export default DevelopersPage