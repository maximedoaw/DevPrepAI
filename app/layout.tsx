

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import TanStackProvider from "@/components/tan-stack-provider"
import { Toaster } from "sonner"
import ClientRoot from "@/components/client-root"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dev Prep AI - Préparation aux entretiens techniques",
  description: "Préparez-vous aux entretiens techniques avec Dev Prep AI - Améliorez vos hard et soft skills",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <TanStackProvider>
            <ClientRoot>{children}</ClientRoot>
          </TanStackProvider>
          <Toaster/>
        </ThemeProvider>
      </body>
    </html>
  )
}
