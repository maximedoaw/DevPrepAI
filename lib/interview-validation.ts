import { QuizQuestion } from "@/constants/practise"

export interface ValidationResult {
  isValid: boolean
  score: number
  feedback?: string
}

export interface AnswerValidation {
  questionId: string
  answer: any
  question: QuizQuestion
  result: ValidationResult
}

/**
 * Valide une réponse pour une question QCM
 * - Supporte correctAnswer en index (number) ou en texte (string)
 * - Utilise options pour convertir le texte en index si nécessaire
 */
export function validateMultipleChoiceAnswer(
  answer: any,
  correctAnswer: any,
  options?: string[]
): ValidationResult {
  // Déterminer l'index attendu
  let expectedIndex: number | null = null
  let expectedText: string | null = null

  if (typeof correctAnswer === "number") {
    expectedIndex = correctAnswer
    expectedText = options && correctAnswer >= 0 && correctAnswer < options.length
      ? options[correctAnswer]
      : null
  } else if (typeof correctAnswer === "string") {
    expectedText = correctAnswer
    if (Array.isArray(options)) {
      const idx = options.findIndex(opt => opt === correctAnswer)
      expectedIndex = idx >= 0 ? idx : null
    }
  }

  // Comparer avec la réponse utilisateur (index ou texte)
  let isValid = false
  if (typeof answer === "number" && expectedIndex !== null) {
    isValid = answer === expectedIndex
  } else if (typeof answer === "string" && expectedText !== null) {
    isValid = answer === expectedText
  }

  return {
    isValid,
    score: isValid ? 100 : 0,
    feedback: isValid
      ? "Correct !"
      : "Incorrect. Réponse attendue : " + (expectedText ?? String(correctAnswer))
  }
}

/**
 * Valide une réponse pour une question de codage
 */
export function validateCodingAnswer(code: string, expectedOutput?: string, codeTemplate?: string): ValidationResult {
  if (!code.trim()) {
    return {
      isValid: false,
      score: 0,
      feedback: "Aucun code fourni"
    }
  }

  let score = 0
  let feedback = ""

  // Vérifier la syntaxe basique (parenthèses, accolades, crochets)
  const syntaxScore = validateSyntax(code)
  score += syntaxScore

  // Vérifier la longueur et la complexité
  const complexityScore = validateComplexity(code)
  score += complexityScore

  // Vérifier la correspondance avec le template (si fourni)
  if (codeTemplate) {
    const templateScore = validateTemplateMatch(code, codeTemplate)
    score += templateScore
  }

  // Vérifier la sortie attendue (si fournie)
  if (expectedOutput) {
    const outputScore = validateOutput(code, expectedOutput)
    score += outputScore
  }

  // Vérifier les bonnes pratiques
  const bestPracticesScore = validateBestPractices(code)
  score += bestPracticesScore

  const finalScore = Math.min(100, score)
  const isValid = finalScore >= 60 // Considéré comme valide si score >= 60%

  // Générer un feedback basé sur le score
  if (finalScore >= 90) {
    feedback = "Excellent ! Code bien structuré et fonctionnel."
  } else if (finalScore >= 75) {
    feedback = "Bon travail ! Quelques améliorations possibles."
  } else if (finalScore >= 60) {
    feedback = "Correct, mais il y a des points à améliorer."
  } else {
    feedback = "Code à revoir. Vérifiez la syntaxe et la logique."
  }

  return {
    isValid,
    score: finalScore,
    feedback
  }
}

/**
 * Valide une réponse ouverte
 */
export function validateOpenEndedAnswer(answer: string, question: string, points: number): ValidationResult {
  if (!answer.trim()) {
    return {
      isValid: false,
      score: 0,
      feedback: "Aucune réponse fournie"
    }
  }

  let score = 0
  let feedback = ""

  // Score basé sur la longueur de la réponse
  const lengthScore = calculateLengthScore(answer)
  score += lengthScore

  // Score basé sur la pertinence (mots-clés techniques)
  const relevanceScore = calculateRelevanceScore(answer, question)
  score += relevanceScore

  // Score basé sur la structure (phrases complètes, organisation)
  const structureScore = calculateStructureScore(answer)
  score += structureScore

  const finalScore = Math.min(100, score)
  const isValid = finalScore >= 50 // Considéré comme valide si score >= 50%

  // Générer un feedback
  if (finalScore >= 80) {
    feedback = "Excellente réponse ! Complète et bien structurée."
  } else if (finalScore >= 60) {
    feedback = "Bonne réponse. Quelques détails pourraient être ajoutés."
  } else if (finalScore >= 40) {
    feedback = "Réponse correcte mais incomplète. Développez davantage."
  } else {
    feedback = "Réponse trop courte ou peu pertinente."
  }

  return {
    isValid,
    score: finalScore,
    feedback
  }
}

/**
 * Valide une réponse pour un scenario (questions ouvertes complexes)
 */
export function validateScenarioAnswer(answer: string, question: string, points: number): ValidationResult {
  return validateOpenEndedAnswer(answer, question, points)
}

// Fonctions utilitaires pour la validation de code

function validateSyntax(code: string): number {
  let score = 0
  
  // Vérifier les parenthèses
  const openParens = (code.match(/\(/g) || []).length
  const closeParens = (code.match(/\)/g) || []).length
  
  // Vérifier les accolades
  const openBraces = (code.match(/\{/g) || []).length
  const closeBraces = (code.match(/\}/g) || []).length
  
  // Vérifier les crochets
  const openBrackets = (code.match(/\[/g) || []).length
  const closeBrackets = (code.match(/\]/g) || []).length
  
  if (openParens === closeParens && openBraces === closeBraces && openBrackets === closeBrackets) {
    score += 25
  }
  
  return score
}

function validateComplexity(code: string): number {
  let score = 0
  
  // Vérifier la longueur du code
  if (code.length > 50) score += 10
  if (code.length > 100) score += 10
  if (code.length > 200) score += 5
  
  // Vérifier la présence de mots-clés de programmation
  const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export']
  const foundKeywords = keywords.filter(keyword => code.toLowerCase().includes(keyword)).length
  score += Math.min(20, foundKeywords * 3)
  
  return score
}

function validateTemplateMatch(code: string, template: string): number {
  if (!template) return 0
  
  // Vérifier si le code contient des éléments du template
  const templateWords = template.toLowerCase().split(/\s+/)
  const codeWords = code.toLowerCase()
  
  const matches = templateWords.filter(word => 
    word.length > 3 && codeWords.includes(word)
  ).length
  
  return Math.min(20, (matches / templateWords.length) * 20)
}

function validateOutput(code: string, expectedOutput: string): number {
  if (!expectedOutput) return 0
  
  // Vérifier si le code contient la sortie attendue ou des éléments similaires
  const outputWords = expectedOutput.toLowerCase().split(/\s+/)
  const codeWords = code.toLowerCase()
  
  const matches = outputWords.filter(word => 
    word.length > 2 && codeWords.includes(word)
  ).length
  
  return Math.min(30, (matches / outputWords.length) * 30)
}

function validateBestPractices(code: string): number {
  let score = 0
  
  // Vérifier l'utilisation de const/let vs var
  if (code.includes('const') || code.includes('let')) score += 5
  if (!code.includes('var')) score += 5
  
  // Vérifier la présence de commentaires
  if (code.includes('//') || code.includes('/*')) score += 5
  
  // Vérifier l'indentation (espaces cohérents)
  const lines = code.split('\n')
  const indentedLines = lines.filter(line => line.startsWith('  ') || line.startsWith('\t')).length
  if (indentedLines > lines.length * 0.3) score += 10
  
  return score
}

// Fonctions utilitaires pour la validation de réponses ouvertes

function calculateLengthScore(answer: string): number {
  const length = answer.trim().length
  
  if (length >= 200) return 30
  if (length >= 100) return 25
  if (length >= 50) return 20
  if (length >= 20) return 15
  return 10
}

function calculateRelevanceScore(answer: string, question: string): number {
  // Extraire les mots-clés de la question
  const questionKeywords = question.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .map(word => word.replace(/[^\w]/g, ''))
  
  const answerWords = answer.toLowerCase().split(/\s+/)
  
  // Compter les mots-clés pertinents dans la réponse
  const relevantWords = questionKeywords.filter(keyword =>
    answerWords.some(word => word.includes(keyword) || keyword.includes(word))
  ).length
  
  return Math.min(40, (relevantWords / questionKeywords.length) * 40)
}

function calculateStructureScore(answer: string): number {
  let score = 0
  
  // Vérifier la présence de phrases complètes
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 10)
  if (sentences.length >= 2) score += 15
  
  // Vérifier la présence de connecteurs logiques
  const connectors = ['donc', 'ainsi', 'cependant', 'néanmoins', 'par ailleurs', 'en outre', 'de plus', 'également']
  const foundConnectors = connectors.filter(connector => 
    answer.toLowerCase().includes(connector)
  ).length
  score += Math.min(15, foundConnectors * 5)
  
  return score
}

/**
 * Fonction principale pour valider toutes les réponses d'une interview
 */
export function validateInterviewAnswers(questions: QuizQuestion[], answers: Record<string, any>): AnswerValidation[] {
  return questions.map(question => {
    const answer = answers[question.id]
    let result: ValidationResult

    switch (question.type) {
      case 'multiple_choice':
        result = validateMultipleChoiceAnswer(
          answer,
          (question as any).correctAnswer,
          (question as any).options
        )
        break
      case 'coding':
        result = validateCodingAnswer(answer, question.expectedOutput, question.codeSnippet)
        break
      case 'text':
        result = validateOpenEndedAnswer(answer, question.question, question.points)
        break
      case 'scenario':
        result = validateScenarioAnswer(answer, question.question, question.points)
        break
      default:
        result = {
          isValid: false,
          score: 0,
          feedback: "Type de question non supporté"
        }
    }

    return {
      questionId: question.id,
      answer,
      question,
      result
    }
  })
}

/**
 * Calcule le score total de l'interview
 */
export function calculateTotalScore(validations: AnswerValidation[]): {
  totalScore: number
  percentage: number
  correctAnswers: number
  totalQuestions: number
  breakdown: {
    byType: Record<string, { correct: number; total: number; score: number }>
  }
} {
  let totalScore = 0
  let correctAnswers = 0
  const totalQuestions = validations.length
  const breakdown: Record<string, { correct: number; total: number; score: number }> = {}

  validations.forEach(validation => {
    const questionType = validation.question.type
    const questionScore = validation.result.score
    const questionPoints = validation.question.points

    // Score pondéré par les points de la question
    const weightedScore = (questionScore / 100) * questionPoints
    totalScore += weightedScore

    if (validation.result.isValid) {
      correctAnswers++
    }

    // Breakdown par type
    if (!breakdown[questionType]) {
      breakdown[questionType] = { correct: 0, total: 0, score: 0 }
    }
    breakdown[questionType].total++
    breakdown[questionType].score += weightedScore
    if (validation.result.isValid) {
      breakdown[questionType].correct++
    }
  })

  // Calculer les totaux pour chaque type
  const totalPossibleScore = validations.reduce((sum, v) => sum + v.question.points, 0)
  const percentage = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0

  return {
    totalScore: Math.round(totalScore),
    percentage,
    correctAnswers,
    totalQuestions,
    breakdown: {
      byType: breakdown
    }
  }
}
