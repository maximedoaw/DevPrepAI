"use client"

import { DiscreteTimer } from "./discrete-timer"
import { InterviewInfo } from "./interview-info"
import { ProgressCard } from "./progress-card"
import { QuestionCard } from "./question-card"
import { NavigationControls } from "./navigation-controls"
import { CompletionScreen } from "./completion-screen"
import { quizSaveAnswer } from "@/actions/interview.action"
import { validateInterviewAnswers, calculateTotalScore } from "@/lib/interview-validation"
import { formatTimeDetailed, getTimeDisplayProps } from "@/lib/time-utils"
import AIVocalInterview from "@/components/interviews/vocal-interview"
import { CodeEditor } from "@/components/interviews/code-editor"
import { useEffect, useRef, useState } from "react"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "coding" | "open-ended"
  points: number
  options?: string[]
  correctAnswer?: any // Peut être number, string, etc.
  codeTemplate?: string
  expectedOutput?: string
  explanation?: string
}

interface Interview {
  id: string
  title: string
  company: string
  duration: number
  difficulty: string
  type: string
  questions: Question[]
  totalPoints: number
  technology?: string[]
  description?: string
}

interface InterviewContentProps {
  interview: Interview
  currentQuestionIndex: number
  answers: Record<string, any>
  timeLeft: number
  isRunning: boolean
  isCompleted: boolean
  onAnswerChange: (questionId: string, answer: any) => void
  onNextQuestion: () => void
  onPreviousQuestion: () => void
  onCompleteInterview: () => void
  calculateScore: () => number
  formatTime: (seconds: number) => string
  isSaving?: boolean
  saveError?: Error | null
}

export function InterviewContent({
  interview,
  currentQuestionIndex,
  answers,
  timeLeft,
  isRunning,
  isCompleted,
  onAnswerChange,
  onNextQuestion,
  onPreviousQuestion,
  onCompleteInterview,
  calculateScore,
  formatTime,
  isSaving,
  saveError,
}: InterviewContentProps) {
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<Error | null>(null)
  const hasSavedRef = useRef(false)

  // Fonction pour déterminer le domaine de l'interview
  const getInterviewDomain = (interview: Interview): string => {
    // Mapping des technologies vers les domaines
    const techToDomain: Record<string, string> = {
      'JavaScript': 'DEVELOPMENT',
      'TypeScript': 'DEVELOPMENT', 
      'React': 'DEVELOPMENT',
      'Next.js': 'DEVELOPMENT',
      'Node.js': 'DEVELOPMENT',
      'Python': 'DATA_SCIENCE',
      'Java': 'ENGINEERING',
      'C#': 'ENGINEERING',
      'C++': 'ENGINEERING',
      'Go': 'ENGINEERING',
      'Rust': 'ENGINEERING',
      'PHP': 'WEB',
      'Ruby': 'WEB',
      'Swift': 'MOBILE',
      'Kotlin': 'MOBILE',
      'Dart': 'MOBILE',
      'Flutter': 'MOBILE',
      'Vue.js': 'WEB',
      'Angular': 'WEB',
      'Svelte': 'WEB',
      'Express.js': 'DEVELOPMENT',
      'Django': 'DATA_SCIENCE',
      'Flask': 'DATA_SCIENCE',
      'Spring Boot': 'ENGINEERING',
      'ASP.NET': 'ENGINEERING',
      'Laravel': 'WEB',
      'Rails': 'WEB',
      'GraphQL': 'DEVELOPMENT',
      'REST API': 'DEVELOPMENT',
      'MongoDB': 'DATA_SCIENCE',
      'PostgreSQL': 'DATA_SCIENCE',
      'MySQL': 'DATA_SCIENCE',
      'Redis': 'DATA_SCIENCE',
      'Docker': 'DEVOPS',
      'Kubernetes': 'DEVOPS',
      'AWS': 'DEVOPS',
      'Azure': 'DEVOPS',
      'GCP': 'DEVOPS',
      'Git': 'DEVELOPMENT',
      'CI/CD': 'DEVOPS',
      'Agile': 'MANAGEMENT',
      'Scrum': 'MANAGEMENT',
      'DevOps': 'DEVOPS',
      'Microservices': 'ARCHITECTURE',
      'Serverless': 'ARCHITECTURE',
      'Machine Learning': 'DATA_SCIENCE',
      'Data Science': 'DATA_SCIENCE',
      'Blockchain': 'ENGINEERING',
      'Web3': 'ENGINEERING',
      'Mobile Development': 'MOBILE',
      'Game Development': 'ENGINEERING'
    }

    // Essayer de déterminer le domaine à partir des technologies
    if (interview.technology && interview.technology.length > 0) {
      for (const tech of interview.technology) {
        if (techToDomain[tech]) {
          return techToDomain[tech]
        }
      }
    }

    // Fallback basé sur le titre ou la description
    const titleLower = interview.title.toLowerCase()
    const descLower = interview.description?.toLowerCase() || ''
    
    if (titleLower.includes('data') || descLower.includes('data')) return 'DATA_SCIENCE'
    if (titleLower.includes('mobile') || descLower.includes('mobile')) return 'MOBILE'
    if (titleLower.includes('web') || descLower.includes('web')) return 'WEB'
    if (titleLower.includes('devops') || descLower.includes('devops')) return 'DEVOPS'
    if (titleLower.includes('design') || descLower.includes('design')) return 'DESIGN'
    if (titleLower.includes('finance') || descLower.includes('finance')) return 'FINANCE'
    if (titleLower.includes('business') || descLower.includes('business')) return 'BUSINESS'
    if (titleLower.includes('marketing') || descLower.includes('marketing')) return 'MARKETING'
    if (titleLower.includes('product') || descLower.includes('product')) return 'PRODUCT'
    if (titleLower.includes('management') || descLower.includes('management')) return 'MANAGEMENT'
    if (titleLower.includes('education') || descLower.includes('education')) return 'EDUCATION'
    if (titleLower.includes('health') || descLower.includes('health')) return 'HEALTH'
    if (titleLower.includes('cybersecurity') || descLower.includes('cybersecurity')) return 'CYBERSECURITY'
    if (titleLower.includes('architecture') || descLower.includes('architecture')) return 'ARCHITECTURE'
    if (titleLower.includes('communication') || descLower.includes('communication')) return 'COMMUNICATION'
    
    return 'DEVELOPMENT' // Default
  }

  // Enregistrer automatiquement le résultat quand l'interview est complétée
  useEffect(() => {
    const save = async () => {
      try {
        setSaving(true)
        setSaveErr(null)
        const payload = {
          quizId: interview.id,
          answers: answers,
          timeSpent: Math.max(0, (interview.duration || 0) - (timeLeft || 0)),
          score: calculateScore(),
        }
        await quizSaveAnswer(payload)
        setSaving(false)
      } catch (e: any) {
        setSaving(false)
        setSaveErr(new Error(e?.message || "Erreur lors de l'enregistrement"))
      }
    }

    if (isCompleted && !hasSavedRef.current) {
      hasSavedRef.current = true
      void save()
    }
  }, [isCompleted, interview.id, answers, timeLeft, calculateScore])

  // Déterminer le domaine de l'interview
  const interviewDomain = getInterviewDomain(interview)

  // Completion screen
  if (isCompleted) {
    return (
      <CompletionScreen interview={interview} score={calculateScore()} timeLeft={timeLeft} formatTime={formatTime} />
    )
  }

  // Interface spécifique pour MOCK_INTERVIEW (vocal)
  if (interview.type === "MOCK_INTERVIEW") {
    return (
      <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <AIVocalInterview 
            interviewData={{
              id: interview.id,
              title: interview.title,
              company: interview.company,
              domain: interviewDomain,
              technologies: interview.technology || [],
              description: interview.description || '',
              duration: interview.duration,
              difficulty: interview.difficulty
            }}
            onComplete={(score: number, answers: Record<string, any>) => {
              // Sauvegarder les résultats de l'interview vocal
              const payload = {
                quizId: interview.id,
                answers: answers,
                timeSpent: Math.max(0, (interview.duration || 0) - (timeLeft || 0)),
                score: score,
              }
              quizSaveAnswer(payload).then(() => {
                onCompleteInterview()
              })
            }}
          />
        </div>
      </div>
    )
  }

  // Fonction pour vérifier les réponses de codage
  const validateCodeAnswer = (code: string, expectedOutput?: string): number => {
    if (!code.trim()) return 0
    
    // Vérifications basiques
    let score = 0
    
    // Vérifier la syntaxe basique (pas de parenthèses/accolades non fermées)
    const openParens = (code.match(/\(/g) || []).length
    const closeParens = (code.match(/\)/g) || []).length
    const openBraces = (code.match(/\{/g) || []).length
    const closeBraces = (code.match(/\}/g) || []).length
    const openBrackets = (code.match(/\[/g) || []).length
    const closeBrackets = (code.match(/\]/g) || []).length
    
    if (openParens === closeParens && openBraces === closeBraces && openBrackets === closeBrackets) {
      score += 20 // Syntaxe correcte
    }
    
    // Vérifier la longueur du code (indique un effort)
    if (code.length > 50) score += 10
    if (code.length > 100) score += 10
    
    // Vérifier la présence de mots-clés communs
    const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return']
    const foundKeywords = keywords.filter(keyword => code.toLowerCase().includes(keyword)).length
    score += foundKeywords * 5
    
    // Vérifier si le code contient une fonction ou une logique
    if (code.includes('function') || code.includes('=>') || code.includes('class')) {
      score += 20
    }
    
    // Si une sortie attendue est fournie, vérifier si elle est présente dans le code
    if (expectedOutput && code.toLowerCase().includes(expectedOutput.toLowerCase())) {
      score += 30
    }
    
    return Math.min(100, score)
  }

  // Normaliser les types de question pour supporter plusieurs formats
  const rawQuestion = interview.questions[currentQuestionIndex]
  const normalizedType = ((): Question["type"] => {
    const t = (rawQuestion as any)?.type
    if (t === "multiple_choice" || t === "multiple-choice") return "multiple-choice"
    if (t === "coding") return "coding"
    if (t === "open-ended" || t === "text" || t === "scenario") return "open-ended"
    return "multiple-choice"
  })()
  const currentQuestion: Question = {
    id: rawQuestion.id,
    question: (rawQuestion as any).question,
    type: normalizedType,
    points: (rawQuestion as any).points ?? 0,
    options: (rawQuestion as any).options,
    correctAnswer: (rawQuestion as any).correctAnswer, // Garder la valeur originale
    codeTemplate: (rawQuestion as any).codeSnippet || (rawQuestion as any).codeTemplate,
    expectedOutput: (rawQuestion as any).expectedOutput,
    explanation: (rawQuestion as any).explanation, // Ajouter l'explication
  }

  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
      {/* Timer discret en haut à droite */}
      <DiscreteTimer 
        timeLeft={timeLeft}
        isRunning={isRunning}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Informations sur l'interview */}
        <InterviewInfo 
          interview={interview}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={interview.questions.length}
        />

        {(saveError || saveErr) && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 shadow-lg">
            {(saveError || saveErr)?.message}
          </div>
        )}


        {/* Interface adaptée selon le type de question */}
        {currentQuestion.type === "coding" ? (
          <div className="space-y-4 sm:space-y-6">
            {/* En-tête de la question de codage */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Question de Codage - {interviewDomain}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {currentQuestion.question}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium">{currentQuestion.points} points</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Domaine: {interviewDomain}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Éditeur de code */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Éditeur de Code
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm font-medium">
                      {interview.technology?.[0] || 'JavaScript'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="h-64 sm:h-80 lg:h-96">
                  <CodeEditor
                    value={answers[currentQuestion.id] || currentQuestion.codeTemplate || ''}
                    onChange={(value) => onAnswerChange(currentQuestion.id, value)}
                    language={interview.technology?.[0]?.toLowerCase() || 'javascript'}
                  />
                </div>
              </div>
            </div>

            {/* Instructions et aide */}
            {currentQuestion.expectedOutput && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500 text-white flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">Sortie attendue</h5>
                    <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm leading-relaxed break-words">
                      {currentQuestion.expectedOutput}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <QuestionCard
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={(answer) => onAnswerChange(currentQuestion.id, answer)}
          />
        )}

        <NavigationControls
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={interview.questions.length}
          onPrevious={onPreviousQuestion}
          onNext={onNextQuestion}
          isSaving={isSaving || saving}
        />
      </div>
    </div>
  )
}
