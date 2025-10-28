import { type NextRequest, NextResponse } from "next/server"
import type { CompareRequest, CompareResponse } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body: CompareRequest = await request.json()
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ detail: "Missing authorization header" }, { status: 401 })
    }

    if (!body.search_ids || body.search_ids.length < 2) {
      return NextResponse.json({ detail: "At least 2 search IDs required" }, { status: 400 })
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/v1/compare/`, {
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

    const compareResponse: CompareResponse = await response.json()
    return NextResponse.json(compareResponse, { status: 200 })
  } catch (error) {
    console.error("Compare error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
