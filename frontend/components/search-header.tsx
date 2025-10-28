"use client"

import { Button } from "@/components/ui/button"
import { Stethoscope, LogOut, Moon, Sun, Github, Linkedin } from "lucide-react"
import { useState, useEffect } from "react"

export function SearchHeader({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark")
    setIsDark(!isDark)
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">MediSearch</h1>
            <p className="text-xs text-muted-foreground">Medical Literature Search</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 border-l border-r border-border flex-shrink-0">
          <a
            href="https://github.com/rushikatabathuni"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">rushikatabathuni</span>
          </a>
          <a
            href="https://huggingface.co/rushikatabathuni"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            title="HuggingFace"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 10 15.5 10 14 10.67 14 11.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 10 8.5 10 7 10.67 7 11.5 7.67 13 8.5 13zm3.5 6c-2.33 0-4.31-1.46-5.12-3.5h10.24c-.81 2.04-2.79 3.5-5.12 3.5z" />
            </svg>
            <span className="hidden sm:inline">rushikatabathuni</span>
          </a>
          <a
            href="https://www.linkedin.com/in/rushikatabathuni/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            title="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
            <span className="hidden sm:inline">rushikatabathuni</span>
          </a>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-foreground hover:bg-muted">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-2 pl-3 border-l border-border min-w-0">
            <div className="text-right min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-foreground hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
