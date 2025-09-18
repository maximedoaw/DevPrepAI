"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-[#7df9ff] transition-colors duration-500 overflow-hidden">
        {/* Animation douce de fond */}
        <div className="absolute inset-0 dark:before:absolute dark:before:inset-0 dark:before:bg-gradient-to-r dark:before:from-gray-800 dark:before:via-gray-900 dark:before:to-gray-800 dark:before:opacity-50 dark:before:animate-wave pointer-events-none"></div>
        {children}
      </div>
    </NextThemesProvider>
  )
}
