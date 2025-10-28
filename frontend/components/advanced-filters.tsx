"use client"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export function AdvancedFilters({
  filters,
  onFiltersChange,
}: {
  filters: any
  onFiltersChange: (filters: any) => void
}) {
  const sourceTypes = ["Journal Article", "Review", "Meta-Analysis", "Clinical Trial", "Case Study"]
  const meshTerms = ["COVID-19", "Diabetes", "Cancer", "Cardiovascular", "Neurology"]

  const toggleSourceType = (type: string) => {
    const updated = filters.sourceType.includes(type)
      ? filters.sourceType.filter((t: string) => t !== type)
      : [...filters.sourceType, type]
    onFiltersChange({ ...filters, sourceType: updated })
  }

  const toggleMeshTerm = (term: string) => {
    const updated = filters.meshTerms.includes(term)
      ? filters.meshTerms.filter((t: string) => t !== term)
      : [...filters.meshTerms, term]
    onFiltersChange({ ...filters, meshTerms: updated })
  }

  return (
    <Card className="border-border bg-muted/20">
      <CardContent className="pt-6 space-y-4">
        {/* Date Range */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Date Range</p>
          <div className="flex gap-2">
            <Input
              type="date"
              value={filters.dateRange.from}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, from: e.target.value },
                })
              }
              className="bg-input border-border"
            />
            <Input
              type="date"
              value={filters.dateRange.to}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, to: e.target.value },
                })
              }
              className="bg-input border-border"
            />
          </div>
        </div>

        {/* Source Type */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Source Type</p>
          <div className="flex flex-wrap gap-2">
            {sourceTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleSourceType(type)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.sourceType.includes(type)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* MeSH Terms */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">MeSH Terms</p>
          <div className="flex flex-wrap gap-2">
            {meshTerms.map((term) => (
              <button
                key={term}
                onClick={() => toggleMeshTerm(term)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.meshTerms.includes(term)
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(filters.sourceType.length > 0 || filters.meshTerms.length > 0) && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Active Filters</p>
            <div className="flex flex-wrap gap-2">
              {[...filters.sourceType, ...filters.meshTerms].map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    if (filters.sourceType.includes(filter)) {
                      toggleSourceType(filter)
                    } else {
                      toggleMeshTerm(filter)
                    }
                  }}
                >
                  {filter}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
