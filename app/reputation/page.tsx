import React from 'react'
import { getUserReputation, getLeaderboard } from '@/actions/interview.action'
import { notFound } from 'next/navigation'
import ReputationClient from './reputation-client'

interface ReputationPageProps {
  searchParams: { id?: string }
}

export default async function ReputationPage({ searchParams }: ReputationPageProps) {
  const userId = searchParams.id

  if (!userId) {
    notFound()
  }

  const [reputationData, leaderboardData] = await Promise.all([
    getUserReputation(userId),
    getLeaderboard()
  ])

  if (!reputationData) {
    notFound()
  }

  return <ReputationClient data={reputationData} leaderboardData={leaderboardData} />
}