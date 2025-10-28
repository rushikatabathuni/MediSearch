import { type NextRequest, NextResponse } from "next/server"
import type { SearchRequest, SearchResponse } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()

    if (!body.query || body.query.length < 3) {
      return NextResponse.json({ detail: "Query must be at least 3 characters" }, { status: 400 })
    }

    const authHeader = request.headers.get("Authorization")

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const response = await fetch(`${backendUrl}/api/v1/medical/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const searchResponse: SearchResponse = await response.json()
    return NextResponse.json(searchResponse, { status: 200 })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
