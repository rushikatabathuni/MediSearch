"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, X, TrendingUp } from "lucide-react"

export function DatabaseInfoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const topTopics = [
    { name: "COVID-19", count: 1649 },
    { name: "Cancer", count: 1574 },
    { name: "Mental Health", count: 1415 },
    { name: "Surgery", count: 1010 },
    { name: "Liver Disease", count: 606 },
    { name: "Brain/Neurology", count: 527 },
    { name: "Diabetes", count: 451 },
    { name: "Drug Therapy", count: 445 },
    { name: "Infections", count: 417 },
    { name: "Heart Disease", count: 347 },
    { name: "Stroke", count: 330 },
    { name: "Hypertension", count: 140 }
  ]

  return (
    <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle className="text-lg">Database Coverage</CardTitle>
              <CardDescription className="mt-1">
                <span className="font-semibold text-blue-700 dark:text-blue-300">40,891 medical papers</span> from MEDLINE
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-semibold text-foreground">Top Medical Topics (Paper Count):</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {topTopics.map((topic) => (
              <Badge 
                key={topic.name} 
                variant="secondary" 
                className="text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                {topic.name} <span className="ml-1 text-blue-600 dark:text-blue-400">({topic.count})</span>
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 text-base">💡</span>
            <span>
              This is a curated subset of MEDLINE for demonstration purposes. 
              Search works best for the topics listed above. For comprehensive medical research, 
              consult full databases like PubMed or clinical guidelines.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
