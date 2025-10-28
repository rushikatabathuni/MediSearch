"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SearchHistoryItem } from "@/types"

interface ComparisonViewProps {
  searches: SearchHistoryItem[]
}

export function ComparisonView({ searches }: ComparisonViewProps) {
  // Safe check for undefined/null searches
  if (!searches || searches.length < 2) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Perform at least 2 searches to compare results</p>
        </CardContent>
      </Card>
    )
  }

  const recentSearches = searches.slice(0, 2)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Compare Searches</h2>
        <p className="text-muted-foreground">Side-by-side comparison of your recent searches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentSearches.map((search) => (
          <Card key={search.id} className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">{search.query}</CardTitle>
              <CardDescription>{new Date(search.created_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sources Found</p>
                <p className="text-2xl font-bold text-foreground mt-1">{search.sources_count || 0}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Overall Confidence</p>
                <Badge variant="outline" className="text-lg border-border">
                  {(search.overall_confidence * 100).toFixed(0)}%
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Answer Preview</p>
                <p className="text-sm text-foreground line-clamp-3">{search.answer}</p>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Processing Time: {search.processing_time_ms ? `${(search.processing_time_ms / 1000).toFixed(1)}s` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
