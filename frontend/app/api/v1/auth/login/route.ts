import { type NextRequest, NextResponse } from "next/server"
import type { UserLogin, Token } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body: UserLogin = await request.json()

    if (!body.email || !body.password) {
      return NextResponse.json({ detail: "Missing email or password" }, { status: 400 })
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const token: Token = await response.json()
    return NextResponse.json(token, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
