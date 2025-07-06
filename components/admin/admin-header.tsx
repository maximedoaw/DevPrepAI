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
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Système opérationnel</span>
          </div>
          <Button variant="secondary" size="lg" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
            <Settings className="h-5 w-5 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>
    </div>
  )
} 