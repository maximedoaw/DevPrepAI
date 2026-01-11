"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Crown, Settings } from 'lucide-react'

export function AdminHeader() {
  return (
    <div className="relative overflow-hidden bg-emerald-600 dark:bg-emerald-900 rounded-3xl p-8 mb-8 shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-3">
            <Crown className="h-3.5 w-3.5 text-yellow-400" />
            Espace Administrateur
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Administration <span className="text-emerald-200">PrepWise</span>
          </h1>
          <p className="text-emerald-100/80 text-base mt-1">Surveillez et gérez l'ensemble de la plateforme</p>
        </div>
        <div className="hidden md:block">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Settings className="h-8 w-8 text-emerald-100" />
          </div>
        </div>
      </div>
    </div>
  )
} 