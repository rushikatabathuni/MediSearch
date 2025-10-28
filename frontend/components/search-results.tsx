"use client"

import type React from "react"
import type { SearchResponse } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, BarChart3, Clock, Users, Shield, ExternalLink, FileText } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface SearchResultsProps {
  search: SearchResponse | null
}

export function SearchResults({ search }: SearchResultsProps) {
  if (!search) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">No results to display</p>
        </CardContent>
      </Card>
    )
  }

  const { query, answer, sources, validation, processing_time_ms } = search

  // Safe value getter with fallback
  const getValidationValue = (path: string): number => {
    try {
      if (!validation || typeof validation !== 'object') return 0
      
      const parts = path.split('.')
      let value: unknown = validation
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = (value as Record<string, unknown>)[part]
        } else {
          return 0
        }
      }
      
      return typeof value === 'number' ? value : 0
    } catch {
      return 0
    }
  }

  const overallConfidence = getValidationValue('overall_confidence')
  const clinicalConfidence = getValidationValue('clinical_expert.confidence')
  const statisticalConfidence = getValidationValue('statistical_validator.confidence')
  const contradictionConfidence = getValidationValue('contradiction_detector.confidence')
  const contradictionLevel = validation?.contradiction_detector?.contradiction_level || 'unknown'

  return (
    <div className="space-y-6">
      {/* Answer Section */}
      <Card className="border-border">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardTitle className="flex items-center justify-between text-xl">
            <span className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Search Results
            </span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {processing_time_ms ? `${(processing_time_ms / 1000).toFixed(1)}s` : 'N/A'}
            </Badge>
          </CardTitle>
          <CardDescription>Query: "{query}"</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h2: ({...props}) => (
                  <h2 className="text-xl font-bold mt-6 mb-3 text-foreground border-b pb-2" {...props} />
                ),
                h3: ({...props}) => (
                  <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />
                ),
                p: ({...props}) => (
                  <p className="mb-3 leading-relaxed text-foreground" {...props} />
                ),
                ul: ({...props}) => (
                  <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />
                ),
                li: ({...props}) => (
                  <li className="text-foreground leading-relaxed" {...props} />
                ),
                strong: ({...props}) => (
                  <strong className="font-semibold text-foreground" {...props} />
                ),
                a: ({...props}) => (
                  <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
                ),
              }}
            >
              {answer}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Agent Validation */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Multi-Agent Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Confidence */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Overall Confidence</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {overallConfidence > 0 ? `${Math.round(overallConfidence * 100)}%` : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallConfidence * 100}%` }}
                />
              </div>
            </div>

            {/* Agent Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Clinical Expert */}
              <div className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Clinical Expert</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {clinicalConfidence > 0 ? `${Math.round(clinicalConfidence * 100)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex justify-between">
                    <span>Clinical Relevance:</span>
                    <span className="font-medium">
                      {clinicalConfidence > 0 ? `${Math.round(clinicalConfidence * 100)}%` : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Statistical Validator */}
              <div className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Statistical Validator</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {statisticalConfidence > 0 ? `${Math.round(statisticalConfidence * 100)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex justify-between">
                    <span>Statistical Score:</span>
                    <span className="font-medium">
                      {statisticalConfidence > 0 ? `${Math.round(statisticalConfidence * 100)}%` : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Contradiction Detector */}
              <div className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Contradiction Detector</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {contradictionConfidence > 0 ? `${Math.round(contradictionConfidence * 100)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex justify-between">
                    <span>Contradiction Level:</span>
                    <span className={`font-medium capitalize ${
                      contradictionLevel === 'low' 
                        ? 'text-green-600 dark:text-green-400' 
                        : contradictionLevel === 'medium'
                          ? 'text-amber-600 dark:text-amber-400'
                          : contradictionLevel === 'high'
                            ? 'text-red-600 dark:text-red-400'
                            : ''
                    }`}>
                      {contradictionLevel}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sources ({sources.length})</CardTitle>
            <CardDescription>Retrieved from medical literature database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sources.map((source, index) => {
              const getPaperUrl = (): string | null => {
                const paperId = source.paper_id
                
                if (source.source === 'pubmed' || paperId.includes('pubmed')) {
                  const pmid = paperId.replace(/[^0-9]/g, '')
                  return pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : null
                } else if (source.source === 'medline' || paperId.includes('medline')) {
                  const pmid = paperId.replace(/[^0-9]/g, '')
                  return pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : null
                } else if (source.source === 'clinical_trial' || paperId.includes('clinical')) {
                  const nctId = paperId.match(/NCT\d+/i)?.[0]
                  return nctId ? `https://clinicaltrials.gov/study/${nctId}` : null
                } else if (source.metadata && 'doi' in source.metadata && typeof source.metadata.doi === 'string') {
                  return `https://doi.org/${source.metadata.doi}`
                }
                return null
              }

              const paperUrl = getPaperUrl()

              // Safe MeSH terms extraction
              const getMeshTerms = (): string[] => {
                if (!source.metadata || !('mesh_terms' in source.metadata)) return []
                
                const meshTerms = source.metadata.mesh_terms
                
                if (Array.isArray(meshTerms)) {
                  return meshTerms.filter((term): term is string => typeof term === 'string')
                } else if (typeof meshTerms === 'string') {
                    return meshTerms.split(',').map((t: string) => t.trim()).filter(Boolean)
                }
                
                return []
              }

              const meshTerms = getMeshTerms()

              return (
                <div key={`${source.paper_id}-${index}`} className="p-4 border border-border rounded-lg space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    {paperUrl ? (
                      <a
                        href={paperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm text-primary hover:underline flex-1 flex items-start gap-2"
                      >
                        <span>[{index + 1}] {source.title}</span>
                        <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0" />
                      </a>
                    ) : (
                      <h4 className="font-semibold text-sm flex-1">
                        [{index + 1}] {source.title}
                      </h4>
                    )}
                    <Badge variant="outline">{source.source}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span>{Math.round((source.relevance_score || 0) * 100)}% Relevance</span>
                    {paperUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          View Paper <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">{source.chunk_text}</p>
                  
                  {(source.metadata?.journal || source.metadata?.publication_date) && (
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                      {source.metadata.journal && <span>📚 {source.metadata.journal}</span>}
                      {source.metadata.publication_date && <span>📅 {source.metadata.publication_date}</span>}
                    </div>
                  )}
                  
                  {meshTerms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {meshTerms.slice(0, 5).map((term, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          🏷️ {term}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
