import type {
  SearchRequest,
  SearchResponse,
  HealthCheck,
  UserCreate,
  UserLogin,
  Token,
  User,
  SearchHistoryResponse,
  CompareRequest,
  CompareResponse,
  CitationRequest,
  CitationResponse,
} from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class APIClient {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  }

  private async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `/api${endpoint}`
    const token = this.getToken()

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || `API Error: ${response.status}`)
    }

    return response.json()
  }

  // Authentication
  async register(data: UserCreate): Promise<User> {
    return this.fetchAPI<User>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(credentials: UserLogin): Promise<Token> {
    const response = await this.fetchAPI<Token>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", response.access_token)
    }
    return response
  }

  async getCurrentUser(): Promise<User> {
    return this.fetchAPI<User>("/v1/auth/me")
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  // Search
  async search(request: SearchRequest): Promise<SearchResponse> {
    return this.fetchAPI<SearchResponse>("/v1/medical/search", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async checkHealth(): Promise<HealthCheck> {
    return this.fetchAPI<HealthCheck>("/v1/medical/health")
  }

  // History
  async getHistory(limit = 20, skip = 0): Promise<SearchHistoryResponse> {
    return this.fetchAPI<SearchHistoryResponse>(`/v1/history/?limit=${limit}&skip=${skip}`)
  }

  async getSearchDetail(searchId: string): Promise<SearchResponse> {
    return this.fetchAPI<SearchResponse>(`/v1/history/${searchId}`)
  }

  async deleteSearch(searchId: string): Promise<void> {
    await this.fetchAPI(`/v1/history/${searchId}`, {
      method: "DELETE",
    })
  }

  // Compare
  async compareSearches(request: CompareRequest): Promise<CompareResponse> {
    return this.fetchAPI<CompareResponse>("/v1/compare/", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // Citations
  async exportCitations(request: CitationRequest): Promise<CitationResponse> {
    return this.fetchAPI<CitationResponse>("/v1/citations/", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }
}

export const apiClient = new APIClient()
