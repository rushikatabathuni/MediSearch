import { type NextRequest, NextResponse } from "next/server"
import type { SearchHistoryResponse } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ detail: "Missing authorization header" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "20"
    const skip = searchParams.get("skip") || "0"

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/v1/history/?limit=${limit}&skip=${skip}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const history: SearchHistoryResponse = await response.json()
    return NextResponse.json(history, { status: 200 })
  } catch (error) {
    console.error("Get history error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
