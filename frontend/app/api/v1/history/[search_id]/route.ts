import { type NextRequest, NextResponse } from "next/server"
import type { SearchResponse } from "@/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ search_id: string }> }) {
  try {
    const { search_id } = await params
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ detail: "Missing authorization header" }, { status: 401 })
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/v1/history/${search_id}`, {
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

    const searchDetail: SearchResponse = await response.json()
    return NextResponse.json(searchDetail, { status: 200 })
  } catch (error) {
    console.error("Get search detail error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ search_id: string }> }) {
  try {
    const { search_id } = await params
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ detail: "Missing authorization header" }, { status: 401 })
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/v1/history/${search_id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    return NextResponse.json({ message: "Search deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete search error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
