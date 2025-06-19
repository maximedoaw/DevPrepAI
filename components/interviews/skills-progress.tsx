import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain } from "lucide-react"

interface SkillsProgressProps {
  skills: { skill: string; level: number; maxLevel: number }[]
  isLoading?: boolean
}

// Composant Skeleton pour les compétences
function SkillsProgressSkeleton() {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Compétences</CardTitle>
            <CardDescription>Votre niveau dans chaque domaine</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SkillsProgress({ skills, isLoading = false }: SkillsProgressProps) {
  if (isLoading) {
    return <SkillsProgressSkeleton />
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Compétences</CardTitle>
            <CardDescription>Votre niveau dans chaque domaine</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune compétence évaluée</p>
              <p className="text-sm">Passez des interviews pour évaluer vos compétences !</p>
            </div>
          ) : (
            skills.map((skill) => (
              <div key={skill.skill}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{skill.skill}</span>
                  <span className="text-gray-600">{skill.level}%</span>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
