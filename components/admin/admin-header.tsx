"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Crown, Settings } from 'lucide-react'

export function AdminHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8">
      <div className="absolute inset-0 bg-black opacity-10" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Crown className="h-10 w-10 text-yellow-300" />
            Administration DevPrepAi
          </h1>
          <p className="text-blue-100 text-lg">Gestion complète de la plateforme</p>
        </div>
      </div>
    </div>
  )
} 