// navbar.tsx
'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/components/logo"
import { LoginLink, RegisterLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { Menu, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Skeleton } from "@/components/ui/skeleton"

export default function Navbar() {
  const { isAuthenticated, isLoading } = useKindeBrowserClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {/* Navigation links - only show when not authenticated */}
          {!isAuthenticated && (
            <nav className="flex gap-6">
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                Témoignages
              </Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Tarifs
              </Link>
            </nav>
          )}

          <div className="flex gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </>
            ) : isAuthenticated ? (
              <LogoutLink>
                <Button
                  variant="outline"
                  onClick={() => setAuthLoading(true)}
                  disabled={authLoading}
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
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
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : 'Connexion'}
                  </Button>
                </LoginLink>
                <RegisterLink>
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white"
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
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-t shadow-lg">
            <div className="container py-4 space-y-4">
              {/* Navigation links - only show when not authenticated */}
              {!isAuthenticated && (
                <>
                  <Link 
                    href="#features" 
                    className="block py-2 px-4 rounded-md hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Fonctionnalités
                  </Link>
                  <Link 
                    href="#testimonials" 
                    className="block py-2 px-4 rounded-md hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Témoignages
                  </Link>
                  <Link 
                    href="#pricing" 
                    className="block py-2 px-4 rounded-md hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tarifs
                  </Link>
                </>
              )}

              <div className="pt-2 space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </>
                ) : isAuthenticated ? (
                  <LogoutLink>
                    <Button
                      variant="destructive"
                      className="w-full"
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
                        className="w-full"
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
                        className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white"
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