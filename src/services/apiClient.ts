interface APIError {
  error: string
  message?: string
  detail?: string
}

interface ApiResponse<T> {
  data?: T
  error?: APIError
  status: number
}

export class APIClient {
  private baseUrl: string
  private token: string | null

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'http://localhost:8000'
    this.token = typeof window !== 'undefined' ? localStorage.getItem('finna-auth-token') : null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...Object.fromEntries(new Headers(options.headers).entries()),
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    try {
      const resp = await fetch(this.baseUrl + endpoint, { ...options, headers, credentials: 'include' })
      if (!resp.ok) {
        let parsed: any = { error: 'api_error' }
        try { parsed = await resp.json() } catch {}
        return { status: resp.status, error: { error: parsed.error || 'api_error', message: parsed.message, detail: parsed.detail } }
      }
      const data = await resp.json()
      return { data, status: resp.status }
    } catch (e: any) {
      return { status: 0, error: { error: 'network_error', message: e.message || 'Unknown error' } }
    }
  }

  async login(username: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const r = await this.request<{ token: string }>('/api/v1/auth/token', { method: 'POST', body: JSON.stringify({ username, password }) })
    if (r.data?.token) {
      this.token = r.data.token
      localStorage.setItem('finna-auth-token', r.data.token)
    }
    return r
  }

  async getConnections(): Promise<ApiResponse<any[]>> { return this.request('/api/v1/config') }
  async getCosts(params?: { provider?: string, project?: string, startDate?: string, endDate?: string }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return this.request(`/api/v1/costs${qs ? '?' + qs : ''}`)
  }
  async getCostTotals(params?: { startDate?: string, endDate?: string }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return this.request(`/api/v1/costs/totals${qs ? '?' + qs : ''}`)
  }
  async getAlerts(params?: { status?: string, severity?: string, limit?: number }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as any).toString()
    return this.request(`/api/v1/alerts${qs ? '?' + qs : ''}`)
  }
  async getRuns(limit = 50): Promise<ApiResponse<any[]>> { return this.request(`/api/v1/extractors/status?limit=${limit}`) }
  async runExtractor(type: string, provider: string, configId?: string): Promise<ApiResponse<any>> {
    return this.request('/api/v1/extractors/run', { method: 'POST', body: JSON.stringify({ extractor_type: type, provider, config_id: configId }) })
  }
  async getProjects(): Promise<ApiResponse<any[]>> { return this.request('/api/v1/config/projects') }
  async healthCheck(): Promise<ApiResponse<any>> { return this.request('/api/v1/health') }
}

let client: APIClient | null = null
export function getApiClient(): APIClient {
  if (!client) client = new APIClient()
  return client
}
export default getApiClient
