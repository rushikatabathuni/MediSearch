"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { SearchHistoryItem } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SearchHistoryProps {
  onDelete: (id: string) => void
  onView?: (search: SearchHistoryItem) => void
}

export function SearchHistory({ onDelete, onView }: SearchHistoryProps) {
  const [searches, setSearches] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getHistory(20, 0)
      setSearches(response.searches)
      setTotal(response.total)
    } catch (error: any) {
      console.error("Failed to load history:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load search history",
        variant: "destructive",
      })
      setSearches([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this search?")) return

    try {
      await apiClient.deleteSearch(id)
      setSearches(searches.filter(s => s.id !== id))
      setTotal(total - 1)
      onDelete(id)
      toast({
        title: "Success",
        description: "Search deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete search",
        variant: "destructive",
      })
    }
  }

  const handleView = (search: SearchHistoryItem) => {
    if (onView) {
      onView(search)
    } else {
      // Store in sessionStorage and navigate to search page
      sessionStorage.setItem('viewSearch', JSON.stringify(search))
      router.push('/?view=true')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Loading history...</p>
        </CardContent>
      </Card>
    )
  }

  if (!searches || searches.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No search history yet. Perform a search to see it here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Search History</CardTitle>
          <CardDescription>Total: {total} searches</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-sm">{search.query}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{search.answer}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(search.created_at).toLocaleString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {(search.overall_confidence * 100).toFixed(0)}% Confidence
                    </Badge>
                    <span>{search.sources_count} Sources</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(search)}
                    title="View full details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(search.id)}
                    title="Delete search"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
