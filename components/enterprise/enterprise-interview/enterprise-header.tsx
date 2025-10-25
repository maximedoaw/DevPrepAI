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
    </div>
  )
}