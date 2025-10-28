import { type NextRequest, NextResponse } from "next/server"
import type { CitationRequest, CitationResponse } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body: CitationRequest = await request.json()
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ detail: "Missing authorization header" }, { status: 401 })
    }

    if (!body.paper_ids || body.paper_ids.length === 0) {
      return NextResponse.json({ detail: "At least one paper ID required" }, { status: 400 })
    }

    if (!["bibtex", "apa", "json"].includes(body.format)) {
      return NextResponse.json({ detail: "Invalid format. Must be bibtex, apa, or json" }, { status: 400 })
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/v1/citations/`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const citationResponse: CitationResponse = await response.json()
    return NextResponse.json(citationResponse, { status: 200 })
  } catch (error) {
    console.error("Citation export error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
