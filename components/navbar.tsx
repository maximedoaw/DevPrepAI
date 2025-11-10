// navbar.tsx
'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/components/logo"
import { LoginLink, RegisterLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { Menu, X, Loader2, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"

function ModeToggle() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="relative border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/50"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Changer de thème</span>
    </Button>
  )
}

export default function Navbar() {
  const { isAuthenticated, isLoading } = useKindeBrowserClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl rounded-full py-1 border border-green-200/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg supports-[backdrop-filter]:bg-background/60 dark:border-green-800/50">
      <div className="container flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* Navigation links - only show when not authenticated */}
          {!isAuthenticated && (
            <nav className="flex gap-8">
              <Link href="#features" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Témoignages
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Tarifs
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ModeToggle />
            
            {/* Auth Buttons */}
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-20 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </>
            ) : isAuthenticated ? (
              <LogoutLink>
                <Button
                  variant="outline"
                  onClick={() => setAuthLoading(true)}
                  disabled={authLoading}
                  className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl"
                >
                  {authLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : 'Déconnexion'}
                </Button>
              </LogoutLink>
            ) : (
              <>
                <LoginLink>
                  <Button
                    variant="outline"
                    onClick={() => setAuthLoading(true)}
                    disabled={authLoading}
                    className="border-green-200 dark:border-green-800 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-950/50 rounded-xl"
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : 'Connexion'}
                  </Button>
                </LoginLink>
                <RegisterLink>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/25 rounded-xl"
                    onClick={() => setAuthLoading(true)}
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : "S'inscrire"}
                  </Button>
                </RegisterLink>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hover:bg-green-50 dark:hover:bg-green-950/50 rounded-xl"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-4 right-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-green-200/50 dark:border-green-800/50 rounded-2xl shadow-xl">
            <div className="container py-4 space-y-3">
              {/* Navigation links - only show when not authenticated */}
              {!isAuthenticated && (
                <>
                  <Link 
                    href="#features" 
                    className="block py-3 px-4 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/50 transition-colors text-slate-700 dark:text-slate-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Fonctionnalités
                  </Link>
                  <Link 
                    href="#testimonials" 
                    className="block py-3 px-4 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/50 transition-colors text-slate-700 dark:text-slate-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Témoignages
                  </Link>
                  <Link 
                    href="#pricing" 
                    className="block py-3 px-4 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/50 transition-colors text-slate-700 dark:text-slate-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tarifs
                  </Link>
                </>
              )}

              <div className="pt-2 space-y-3">
                {isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </>
                ) : isAuthenticated ? (
                  <LogoutLink>
                    <Button
                      variant="destructive"
                      className="w-full rounded-xl"
                      onClick={() => {
                        setAuthLoading(true)
                        setMobileMenuOpen(false)
                      }}
                      disabled={authLoading}
                    >
                      {authLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : 'Déconnexion'}
                    </Button>
                  </LogoutLink>
                ) : (
                  <>
                    <LoginLink>
                      <Button
                        variant="outline"
                        className="w-full border-green-200 dark:border-green-800 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-950/50 rounded-xl"
                        onClick={() => {
                          setAuthLoading(true)
                          setMobileMenuOpen(false)
                        }}
                        disabled={authLoading}
                      >
                        {authLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : 'Connexion'}
                      </Button>
                    </LoginLink>
                    <RegisterLink>
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all rounded-xl"
                        onClick={() => {
                          setAuthLoading(true)
                          setMobileMenuOpen(false)
                        }}
                        disabled={authLoading}
                      >
                        {authLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : "S'inscrire"}
                      </Button>
                    </RegisterLink>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}