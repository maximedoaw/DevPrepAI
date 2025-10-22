"use client"

import { FileText, Clock, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Quiz {
  id: string
  title: string
  description: string
  type: 'QCM' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS' | 'TECHNICAL'
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR'
  technology: string[]
  duration: number
  totalPoints: number
  company: string
  image?: string
  createdAt: string
}

interface QuizzesTabProps {
  quizzes: Quiz[]
}

export function QuizzesTab({ quizzes }: QuizzesTabProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TECHNICAL': return 'bg-green-600 hover:bg-green-700'
      case 'MOCK_INTERVIEW': return 'bg-green-700 hover:bg-green-800'
      case 'SOFT_SKILLS': return 'bg-green-500 hover:bg-green-600'
      case 'QCM': return 'bg-green-400 hover:bg-green-500'
      default: return 'bg-green-600 hover:bg-green-700'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'JUNIOR': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800'
      case 'MID': return 'bg-green-200 text-green-900 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-700'
      case 'SENIOR': return 'bg-green-300 text-green-950 border-green-400 dark:bg-green-700 dark:text-green-100 dark:border-green-600'
      default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <Card 
            key={quiz.id} 
            className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70 hover:shadow-xl transition-all duration-300 hover:border-green-300/50 dark:hover:border-green-600/50 group"
          >
            {quiz.image && (
              <div className="h-32 overflow-hidden rounded-t-lg">
                <img 
                  src={quiz.image} 
                  alt={quiz.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg line-clamp-2 text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                  {quiz.title}
                </CardTitle>
                <Badge className={getTypeColor(quiz.type)}>
                  {quiz.type.replace('_', ' ')}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400">
                {quiz.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <span>Difficulté:</span>
                  <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  {quiz.duration} min
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {quiz.technology.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    {tech}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {quiz.totalPoints} points
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700">
                    Modifier
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Utiliser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <Card className="border border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70 text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Aucun test trouvé
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Aucun test ne correspond à votre recherche.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <FileText className="w-4 h-4 mr-2" />
              Créer un premier test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}