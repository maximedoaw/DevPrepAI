'use client'

import { RefreshCw } from 'lucide-react'

export function Loader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
      </div>
    </div>
  )
}

