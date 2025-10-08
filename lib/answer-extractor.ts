/**
 * Utilitaire pour extraire les réponses correctes depuis les données de la base
 */

export interface ExtractedAnswer {
  questionId: string
  questionText: string
  correctAnswer: any
  explanation?: string
  type: "multiple_choice" | "coding" | "text" | "scenario"
  points: number
  options?: string[]
  expectedOutput?: string
  codeTemplate?: string
}

/**
 * Extrait les réponses correctes d'une question de quiz
 */
export function extractCorrectAnswer(question: any): ExtractedAnswer {
  const baseAnswer: ExtractedAnswer = {
    questionId: question.id,
    questionText: question.question,
    type: question.type,
    points: question.points || 0,
    correctAnswer: null,
    explanation: question.explanation
  }

  switch (question.type) {
    case "multiple_choice":
      // Pour les QCM, correctAnswer peut être soit un index (number) soit le texte (string)
      let correctAnswerIndex = question.correctAnswer
      
      // Si c'est une chaîne, trouver l'index correspondant
      if (typeof question.correctAnswer === "string" && question.options) {
        correctAnswerIndex = question.options.findIndex(option => option === question.correctAnswer)
      }
      
      return {
        ...baseAnswer,
        correctAnswer: correctAnswerIndex,
        options: question.options,
        type: "multiple_choice"
      }

    case "coding":
      return {
        ...baseAnswer,
        correctAnswer: question.codeSnippet || question.codeTemplate,
        expectedOutput: question.expectedOutput,
        codeTemplate: question.codeSnippet || question.codeTemplate,
        type: "coding"
      }

    case "text":
    case "open-ended":
    case "scenario":
      return {
        ...baseAnswer,
        correctAnswer: question.expectedAnswer || question.sampleAnswer,
        explanation: question.explanation || question.sampleAnswer,
        type: question.type === "text" ? "text" : "scenario"
      }

    default:
      return baseAnswer
  }
}

/**
 * Extrait toutes les réponses correctes d'un quiz/interview
 */
export function extractAllCorrectAnswers(questions: any[]): ExtractedAnswer[] {
  return questions.map(question => extractCorrectAnswer(question))
}

/**
 * Trouve la réponse correcte pour une question spécifique
 */
export function findCorrectAnswer(questions: any[], questionId: string): ExtractedAnswer | null {
  const question = questions.find(q => q.id === questionId)
  return question ? extractCorrectAnswer(question) : null
}

/**
 * Formate la réponse correcte pour l'affichage
 */
export function formatCorrectAnswer(answer: ExtractedAnswer): string {
  switch (answer.type) {
    case "multiple_choice":
      if (answer.options && typeof answer.correctAnswer === "number" && answer.correctAnswer >= 0) {
        return answer.options[answer.correctAnswer] || "Réponse non trouvée"
      }
      return String(answer.correctAnswer || "Réponse non définie")

    case "coding":
      return answer.expectedOutput || answer.codeTemplate || "Code attendu non défini"

    case "text":
    case "scenario":
      return answer.correctAnswer || answer.explanation || "Réponse modèle non définie"

    default:
      return String(answer.correctAnswer || "Réponse non définie")
  }
}

/**
 * Vérifie si une réponse utilisateur est correcte
 */
export function isAnswerCorrect(extractedAnswer: ExtractedAnswer, userAnswer: any): boolean {
  switch (extractedAnswer.type) {
    case "multiple_choice":
      return userAnswer === extractedAnswer.correctAnswer

    case "coding":
      // Pour le coding, on vérifie si le code contient des éléments attendus
      if (!userAnswer || !extractedAnswer.expectedOutput) return false
      
      const userCode = String(userAnswer).toLowerCase()
      const expectedOutput = String(extractedAnswer.expectedOutput).toLowerCase()
      
      // Vérification basique : le code contient-il la sortie attendue ?
      return userCode.includes(expectedOutput) || 
             (extractedAnswer.codeTemplate && userCode.includes(extractedAnswer.codeTemplate.toLowerCase()))

    case "text":
    case "scenario":
      // Pour les réponses textuelles, on considère qu'une réponse non vide est acceptable
      return userAnswer && String(userAnswer).trim().length > 0

    default:
      return false
  }
}

/**
 * Obtient un score pour une réponse
 */
export function getAnswerScore(extractedAnswer: ExtractedAnswer, userAnswer: any): number {
  if (isAnswerCorrect(extractedAnswer, userAnswer)) {
    return extractedAnswer.points
  }
  return 0
}
