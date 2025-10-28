import { type NextRequest, NextResponse } from "next/server"
import type { UserCreate, User } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body: UserCreate = await request.json()

    // Validate input
    if (!body.email || !body.password || !body.full_name) {
      return NextResponse.json({ detail: "Missing required fields" }, { status: 400 })
    }

    if (body.password.length < 8) {
      return NextResponse.json({ detail: "Password must be at least 8 characters" }, { status: 422 })
    }

    if (body.full_name.length < 2) {
      return NextResponse.json({ detail: "Full name must be at least 2 characters" }, { status: 422 })
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const user: User = await response.json()
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
