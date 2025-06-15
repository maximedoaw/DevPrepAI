"use client"

import { useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { EditorState } from "@codemirror/state"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  theme?: "light" | "dark"
}

export function CodeEditor({ value, onChange, language = "javascript", theme = "light" }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const extensions = [
      basicSetup,
      javascript(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
      EditorView.theme({
        "&": {
          fontSize: "14px",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
        },
        ".cm-content": {
          padding: "20px",
          minHeight: "300px",
          lineHeight: "1.6",
        },
        ".cm-focused": {
          outline: "2px solid #3B82F6",
          outlineOffset: "-2px",
        },
        ".cm-editor": {
          border: "2px solid #E5E7EB",
          borderRadius: "12px",
          backgroundColor: "#FAFAFA",
        },
        ".cm-editor.cm-focused": {
          borderColor: "#3B82F6",
          backgroundColor: "#FFFFFF",
        },
        ".cm-scroller": {
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
        },
        ".cm-gutters": {
          backgroundColor: "#F3F4F6",
          border: "none",
          borderRadius: "12px 0 0 12px",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "#E0E7FF",
        },
        ".cm-activeLine": {
          backgroundColor: "#F0F9FF",
        },
      }),
    ]

    const state = EditorState.create({
      doc: value,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      })
    }
  }, [value])

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          {language.toUpperCase()}
        </div>
      </div>
      <div ref={editorRef} className="rounded-xl overflow-hidden shadow-lg" />
    </div>
  )
}
