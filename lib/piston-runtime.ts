// lib/piston-runtime.ts
// Service pour exécuter du code via Piston API

export interface PistonExecutionResult {
  success: boolean
  output: string
  error?: string
  language: string
  version?: string
}

// Mapping des langages supportés vers les identifiants Piston
const LANGUAGE_MAP: Record<string, string> = {
  'javascript': 'javascript',
  'typescript': 'typescript',
  'react': 'javascript', // React s'exécute comme JavaScript
  'jsx': 'javascript',
  'tsx': 'typescript',
  'html': 'html',
  'css': 'css',
  'python': 'python',
  'java': 'java',
  'json': 'json',
  'markdown': 'markdown',
  'sql': 'sql'
}

// URL de l'API Piston (peut être changée pour une instance auto-hébergée)
const PISTON_API_URL = process.env.NEXT_PUBLIC_PISTON_API_URL || 'https://emkc.org/api/v2/piston'

/**
 * Exécute du code via l'API Piston
 */
export async function executeCodeWithPiston(
  code: string,
  language: string,
  stdin?: string,
  args?: string[]
): Promise<PistonExecutionResult> {
  try {
    // Mapper le langage
    const pistonLanguage = LANGUAGE_MAP[language.toLowerCase()] || 'javascript'
    
    // Pour HTML/CSS, on retourne le code pour preview
    if (language.toLowerCase() === 'html' || language.toLowerCase() === 'css') {
      return {
        success: true,
        output: code,
        language: pistonLanguage
      }
    }
    
    // Pour les autres langages, utiliser l'API Piston standard
    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: pistonLanguage,
        version: '*', // Utiliser la dernière version disponible
        files: [
          {
            content: code
          }
        ],
        stdin: stdin || '',
        args: args || []
      })
    })

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Piston retourne un objet avec run et compile
    const runResult = data.run
    const compileResult = data.compile

    if (compileResult && compileResult.stderr) {
      return {
        success: false,
        output: '',
        error: compileResult.stderr,
        language: pistonLanguage
      }
    }

    if (runResult.stderr) {
      return {
        success: false,
        output: runResult.stdout || '',
        error: runResult.stderr,
        language: pistonLanguage
      }
    }

    return {
      success: true,
      output: runResult.stdout || '',
      language: pistonLanguage,
      version: data.language?.version
    }
  } catch (error: any) {
    console.error('Piston execution error:', error)
    return {
      success: false,
      output: '',
      error: error.message || 'Erreur lors de l\'exécution du code',
      language: language
    }
  }
}

/**
 * Formate la sortie pour l'affichage dans la console
 */
export function formatExecutionOutput(result: PistonExecutionResult): string {
  if (!result.success && result.error) {
    return `$ ${result.language}\nERROR: ${result.error}\n$ `
  }
  
  if (result.output) {
    return `$ ${result.language}\n${result.output}\n$ `
  }
  
  return `$ ${result.language}\n> Code exécuté sans sortie\n$ `
}

/**
 * Détecte le langage à partir du code ou du contexte
 */
export function detectLanguage(code: string, hint?: string): string {
  if (hint) {
    const lowerHint = hint.toLowerCase()
    if (LANGUAGE_MAP[lowerHint]) {
      return lowerHint
    }
  }
  
  // Détection basique par patterns
  if (code.includes('import React') || code.includes('from "react"') || code.includes('from \'react\'')) {
    return 'javascript'
  }
  if (code.includes('function') && code.includes(':')) {
    return 'typescript'
  }
  if (code.includes('def ') || code.includes('import ')) {
    return 'python'
  }
  if (code.includes('public class') || code.includes('public static')) {
    return 'java'
  }
  if (code.trim().startsWith('<html') || code.trim().startsWith('<!DOCTYPE')) {
    return 'html'
  }
  if (code.includes('{') && code.includes('}') && code.includes(':')) {
    return 'css'
  }
  
  return 'javascript' // Par défaut
}
