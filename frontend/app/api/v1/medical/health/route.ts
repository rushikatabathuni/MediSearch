import { type NextRequest, NextResponse } from "next/server"
import type { HealthCheck } from "@/types"

export async function GET(request: NextRequest) {
  try {
    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/v1/medical/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      return NextResponse.json({ detail: "Backend service unavailable" }, { status: response.status })
    }

    const health: HealthCheck = await response.json()
    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: {
          chromadb: false,
          groq_api: false,
          embedding_model: false,
        },
      },
      { status: 503 },
    )
  }
}
