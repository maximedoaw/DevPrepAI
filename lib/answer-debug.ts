/**
 * Utilitaires de debug pour tester l'extraction des réponses
 */

import { extractCorrectAnswer, formatCorrectAnswer } from "./answer-extractor"

// Question de test basée sur les vraies données
export const testQuestion = {
  id: "q1",
  question: "Qu'est-ce que le modèle de leadership situationnel?",
  type: "multiple_choice",
  options: [
    "Adapter son style de leadership selon la maturité de l'équipe",
    "Changer de leader selon la situation",
    "Gérer les situations de crise",
    "Diriger depuis n'importe quel endroit"
  ],
  correctAnswer: "Adapter son style de leadership selon la maturité de l'équipe",
  points: 35,
  explanation: "Le style varie de directif à délégatif selon le niveau d'autonomie."
}

// Fonction de test
export function debugAnswerExtraction() {
  console.log("🧪 Testing answer extraction...")
  console.log("📋 Test question:", testQuestion)
  
  const extracted = extractCorrectAnswer(testQuestion)
  console.log("🔍 Extracted answer:", extracted)
  
  const formatted = formatCorrectAnswer(extracted)
  console.log("📝 Formatted answer:", formatted)
  
  return {
    question: testQuestion,
    extracted,
    formatted
  }
}

// Fonction pour tester avec des données réelles
export function testWithRealData(question: any) {
  console.log("🧪 Testing with real data...")
  console.log("📋 Real question:", question)
  
  const extracted = extractCorrectAnswer(question)
  console.log("🔍 Extracted:", extracted)
  
  const formatted = formatCorrectAnswer(extracted)
  console.log("📝 Formatted:", formatted)
  
  return {
    original: question,
    extracted,
    formatted
  }
}

