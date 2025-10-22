"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EnterpriseHeaderProps {
  onCreateJobClick: () => void
  onCreateQuizClick: () => void
}

export function EnterpriseHeader({ onCreateJobClick, onCreateQuizClick }: EnterpriseHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Espace Entreprise
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gérez vos offres d'emploi et créez des tests pour vos candidats
        </p>
      </div>
      <div className="flex gap-3">
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25"
          onClick={onCreateJobClick}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Offre
        </Button>
        <Button 
          variant="outline" 
          className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/50"
          onClick={onCreateQuizClick}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Test
        </Button>
      </div>
    </div>
  )
}