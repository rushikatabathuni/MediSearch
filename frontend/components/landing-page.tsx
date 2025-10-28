"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Brain,
  Zap,
  Shield,
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Github,
  Linkedin,
} from "lucide-react"

import { DatabaseInfoBanner } from "./database-info-banner"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-border/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MediSearch
            </h1>
          </div>
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 text-primary-foreground border-0"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Medical Research</span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
            Medical Research,
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Reimagined
            </span>
          </h2>

          <p className="text-sm font-semibold text-primary mb-6">BY RUSHI KATABATHUNI</p>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 text-balance max-w-2xl mx-auto">
            Harness the power of AI to search medical literature with semantic understanding. Get validated insights
            from multiple expert agents in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 text-primary-foreground border-0 text-base h-12"
            >
              Start Searching <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        <div className="relative mt-20 mb-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-2xl" />
          <div className="relative bg-gradient-to-br from-card to-muted/50 border border-border/60 rounded-3xl p-8 sm:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

            {/* Search Input Preview */}
            <div className="relative mb-12">
              <div className="flex items-center gap-3 bg-muted/50 border border-border/40 rounded-xl px-4 py-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <input
                  type="text"
                  placeholder="Search medical literature with AI..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                  disabled
                />
              </div>
            </div>

            {/* Multi-Agent Validation Flow */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Brain, title: "Clinical Expert", desc: "Validates clinical relevance", delay: "0s" },
                { icon: TrendingUp, title: "Statistical Validator", desc: "Checks methodology & data", delay: "0.2s" },
                { icon: Shield, title: "Contradiction Detector", desc: "Identifies conflicts", delay: "0.4s" },
              ].map((agent, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4 hover:border-primary/40 transition-all duration-300"
                  style={{ animation: `slideIn 0.6s ease-out ${agent.delay}` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <agent.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-sm mb-1">{agent.title}</h4>
                      <p className="text-xs text-muted-foreground">{agent.desc}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Result Preview */}
            <div className="mt-8 pt-8 border-t border-border/40">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-foreground">Results Validated & Ready</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Get confidence scores, evidence tracing, and citations in your preferred format
              </p>
            </div>
          </div>

          {/* Animation keyframes */}
          <style>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      </section>

      <DatabaseInfoBanner />
      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center mb-16">
          <h3 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Powerful Features</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for next-generation medical research
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              title: "Semantic Search",
              desc: "Understand meaning beyond keywords with AI-powered semantic analysis",
            },
            {
              icon: Shield,
              title: "Multi-Agent Validation",
              desc: "Clinical experts, statisticians, and contradiction detectors verify results",
            },
            {
              icon: TrendingUp,
              title: "Confidence Scoring",
              desc: "Get reliability metrics and evidence tracing for every result",
            },
            { icon: Zap, title: "Lightning Fast", desc: "Search millions of papers and get results in milliseconds" },
            { icon: BookOpen, title: "Citation Export", desc: "Export in APA, BibTeX, and JSON formats instantly" },
            {
              icon: Sparkles,
              title: "Smart History",
              desc: "Track searches, compare results, and revisit research instantly",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="border-border/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
            >
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-3xl blur-2xl" />
          <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-3xl p-12 sm:p-16 text-center">
            <h3 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Ready to Transform Your Research?</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of researchers using MediSearch for faster, smarter medical literature discovery.
            </p>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 text-primary-foreground border-0 text-base h-12"
            >
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8 sm:py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">MediSearch</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/rushikatabathuni"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="GitHub"
              >
                <Github className="w-5 h-5 text-foreground hover:text-primary" />
              </a>
              <a
                href="https://huggingface.co/rushikatabathuni"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="HuggingFace"
              >
                <svg className="w-5 h-5 text-foreground hover:text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 10 15.5 10 14 10.67 14 11.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 10 8.5 10 7 10.67 7 11.5 7.67 13 8.5 13zm3.5 6c-2.33 0-4.31-1.46-5.12-3.5h10.24c-.81 2.04-2.79 3.5-5.12 3.5z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/rushikatabathuni/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-foreground hover:text-primary" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
