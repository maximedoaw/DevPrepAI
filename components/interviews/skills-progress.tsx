import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain } from "lucide-react"

interface SkillsProgressProps {
  skills: { skill: string; level: number; maxLevel: number }[]
}

export function SkillsProgress({ skills }: SkillsProgressProps) {
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
          {skills.map((skill) => (
            <div key={skill.skill}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{skill.skill}</span>
                <span className="text-gray-600">{skill.level}%</span>
              </div>
              <Progress value={skill.level} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
