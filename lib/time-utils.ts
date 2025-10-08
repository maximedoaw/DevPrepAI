/**
 * Formate le temps en secondes vers le format "heures:minutes:secondes"
 */
export function formatTimeDetailed(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/**
 * Formate le temps en secondes vers le format "mm:ss" (pour les timers courts)
 */
export function formatTimeShort(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/**
 * Formate le temps restant avec des couleurs selon l'urgence
 */
export function getTimeDisplayProps(timeLeft: number): {
  formatted: string
  isUrgent: boolean
  isCritical: boolean
  colorClass: string
} {
  const formatted = formatTimeShort(timeLeft)
  const isUrgent = timeLeft < 300 // Moins de 5 minutes
  const isCritical = timeLeft < 60 // Moins d'1 minute
  
  let colorClass = "text-gray-700 dark:text-gray-300"
  if (isCritical) {
    colorClass = "text-red-600 dark:text-red-400 font-bold animate-pulse"
  } else if (isUrgent) {
    colorClass = "text-orange-600 dark:text-orange-400 font-semibold"
  }

  return {
    formatted,
    isUrgent,
    isCritical,
    colorClass
  }
}

/**
 * Calcule le temps écoulé depuis le début
 */
export function calculateElapsedTime(totalDuration: number, timeLeft: number): number {
  return Math.max(0, totalDuration - timeLeft)
}

/**
 * Formate la durée totale d'une interview
 */
export function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  
  return `${minutes}min`
}
