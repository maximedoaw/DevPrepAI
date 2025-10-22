import { Progress } from "@/components/ui/progress"

interface SkillProgressProps {
  skill: string
  current: number
}

export function SkillProgress({ skill, current }: SkillProgressProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">{skill}</span>
        <span className="text-slate-600 dark:text-slate-400">{current}%</span>
      </div>
      <Progress value={current} className="h-2" />
    </div>
  )
}
