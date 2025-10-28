"use client"

import { useAuth } from "@/lib/auth-context"
import { SearchPage } from "@/components/search-page"
import { LoginPage } from "@/components/login-page"
import { LandingPage } from "@/components/landing-page"
import { useState } from "react"

export function HomePage() {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading MediSearch...</p>
        </div>
      </div>
    )
  }

  return user ? <SearchPage /> : showLogin ? <LoginPage /> : <LandingPage onGetStarted={() => setShowLogin(true)} />
}
