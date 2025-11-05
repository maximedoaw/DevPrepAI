"use client"

import { useEffect, useRef, useState } from "react"
import Editor from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: 'javascript' | 'typescript' | 'react' | 'html' | 'css' | 'python' | 'java' | 'json' | 'markdown' | 'sql'
  theme?: 'light' | 'dark'
  height?: string
  readOnly?: boolean
  minimap?: boolean
  fontSize?: number
  lineNumbers?: 'on' | 'off' | 'relative'
  wordWrap?: 'on' | 'off'
  placeholder?: string
}

// Mapping des langages pour Monaco
const languageMap: Record<string, string> = {
  'javascript': 'javascript',
  'typescript': 'typescript',
  'react': 'typescript',
  'jsx': 'typescript',
  'tsx': 'typescript',
  'html': 'html',
  'css': 'css',
  'python': 'python',
  'java': 'java',
  'json': 'json',
  'markdown': 'markdown',
  'sql': 'sql'
}

export function MonacoEditor({
  value,
  onChange,
  language = 'javascript',
  theme: propTheme,
  height = '100%',
  readOnly = false,
  minimap = true,
  fontSize = 14,
  lineNumbers = 'on',
  wordWrap = 'off',
  placeholder
}: MonacoEditorProps) {
  const { theme: systemTheme } = useTheme()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Gérer le montage pour éviter les erreurs SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Déterminer le thème
  const editorTheme = propTheme || (systemTheme === 'dark' ? 'vs-dark' : 'light')
  
  // Mapper le langage
  const monacoLanguage = languageMap[language.toLowerCase()] || 'javascript'

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    setIsLoading(false)
    
    // Configurer les options additionnelles
    editor.updateOptions({
      fontSize,
      lineNumbers,
      wordWrap,
      minimap: {
        enabled: minimap
      },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
      suggest: {
        showKeywords: true,
        showSnippets: true
      }
    })

    // Ajouter placeholder si nécessaire
    if (placeholder) {
      const placeholderText = placeholder
      const model = editor.getModel()
      if (model && !value) {
        // Le placeholder sera géré par le composant parent via le state
      }
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '')
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}
      <Editor
        height={height}
        language={monacoLanguage}
        theme={editorTheme}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: minimap },
          fontSize,
          lineNumbers,
          wordWrap,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          suggest: {
            showKeywords: true,
            showSnippets: true
          },
          padding: { top: 16, bottom: 16 },
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Courier New', monospace",
          fontLigatures: true,
          cursorStyle: 'line',
          cursorBlinking: 'smooth',
          renderWhitespace: 'selection',
          bracketPairColorization: {
            enabled: true
          },
          guides: {
            bracketPairs: true,
            indentation: true
          }
        }}
      />
    </div>
  )
}

