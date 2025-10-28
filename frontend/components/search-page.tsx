"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import type { SearchResponse, SearchFilters as APISearchFilters, SearchHistoryItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { SearchHeader } from "./search-header"
import { SearchResults } from "./search-results"
import { SearchHistory } from "./search-history"
import { AdvancedFilters } from "./advanced-filters"
import { Search, Loader2 } from "lucide-react"
import { DatabaseInfoBanner } from "./database-info-banner"

export function SearchPage() {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("search")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<{
    dateRange: { from: string; to: string }
    sourceType: string[]
    meshTerms: string[]
  }>({
    dateRange: { from: "", to: "" },
    sourceType: [],
    meshTerms: [],
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      })
      return
    }

    if (searchQuery.trim().length < 3) {
      toast({
        title: "Error",
        description: "Search query must be at least 3 characters",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    try {
      // Build API filters
      const apiFilters: APISearchFilters | undefined = 
        filters.sourceType.length > 0 || filters.dateRange.from || filters.meshTerms.length > 0
          ? {
              source_types: filters.sourceType.length > 0 ? filters.sourceType as any[] : undefined,
              date_range: filters.dateRange.from || filters.dateRange.to
                ? {
                    start_date: filters.dateRange.from || undefined,
                    end_date: filters.dateRange.to || undefined,
                  }
                : undefined,
              mesh_terms: filters.meshTerms.length > 0 ? filters.meshTerms : undefined,
            }
          : undefined

      // Call real API
      const response = await apiClient.search({
        query: searchQuery,
        top_k: 10,
        filters: apiFilters,
      })

      setSearchResult(response)
      setActiveTab("results")
      
      toast({
        title: "Success",
        description: `Found ${response.sources.length} sources in ${(response.processing_time_ms / 1000).toFixed(1)}s`,
      })
    } catch (error: any) {
      console.error("Search error:", error)
      toast({
        title: "Search Failed",
        description: error.message || "Failed to perform search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleViewFromHistory = (search: SearchHistoryItem) => {
    // Convert history item to SearchResponse format for display
    const viewResult: SearchResponse = {
      query: search.query,
      answer: search.answer,
      sources: [], // Sources not stored in history summary
      validation: {
        overall_confidence: search.overall_confidence,
        clinical_expert: {
          confidence: 0,
          clinical_relevance: 0,
          reasoning: "View from history",
          flags: [],
          safety_concerns: []
        },
        statistical_validator: {
          confidence: 0,
          statistical_score: 0,
          reasoning: "View from history",
          flags: [],
          methodology_notes: ""
        },
        contradiction_detector: {
          confidence: 0,
          contradiction_level: "unknown",
          reasoning: "View from history",
          flags: [],
          conflicting_sources: []
        }
      },
      processing_time_ms: search.processing_time_ms,
      timestamp: search.created_at
    }
    
    setSearchResult(viewResult)
    setActiveTab("results")
    
    toast({
      title: "Loaded from History",
      description: `Viewing: ${search.query.substring(0, 50)}...`,
    })
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader user={user} onLogout={handleLogout} />

      <div className="container mx-auto p-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="results" disabled={!searchResult}>
              Results
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <DatabaseInfoBanner />
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Medical Literature Search</CardTitle>
                <CardDescription>
                  Search medical literature with AI-powered semantic understanding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Enter your medical query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-input border-border"
                    disabled={isSearching}
                    minLength={3}
                    maxLength={500}
                  />
                  <Button type="submit" disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </form>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-border"
                >
                  Advanced Filters
                </Button>

                {showFilters && (
                  <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
                )}

                {/* Quick Start */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quick Start Examples</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Benefits of exercise for type 2 diabetes",
                      "Statin efficacy in elderly patients",
                      "Side effects of metformin",
                      "Latest treatments for hypertension",
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setSearchQuery(example)}
                        className="p-3 text-left text-sm rounded-lg border border-border hover:bg-card transition-colors"
                        disabled={isSearching}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character counter */}
                <p className="text-sm text-muted-foreground">
                  {searchQuery.length}/500 characters
                  {searchQuery.length > 0 && searchQuery.length < 3 && " (minimum 3)"}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            {searchResult ? (
              <SearchResults search={searchResult} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Perform a search to see results
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <SearchHistory 
              onDelete={(id) => console.log("Deleted:", id)}
              onView={handleViewFromHistory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
