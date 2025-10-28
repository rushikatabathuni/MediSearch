import { type NextRequest, NextResponse } from "next/server"
import type { User } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ detail: "Missing authorization header" }, { status: 401 })
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
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

    const user: User = await response.json()
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
