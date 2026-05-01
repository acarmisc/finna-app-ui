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

// Runtime API base URL: in GKE proxy /api to backend
const getEnv = () => {
  try { return (import.meta as any).env } catch { return undefined }
}
const API_BASE_URL = getEnv()?.VITE_API_BASE_URL
  || (typeof window !== 'undefined' && (window as any).__FINNA_API_URL)
  || '/api'

export class APIClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL
  }

  private getToken(): string | null {
    return typeof window !== 'undefined'
      ? localStorage.getItem('finna_token')
      : null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...Object.fromEntries(new Headers(options.headers).entries()),
    }
    const token = this.getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const url = endpoint.startsWith('http') ? endpoint : this.baseUrl + endpoint
      const resp = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })

      if (!resp.ok) {
        let parsed: any = { error: 'api_error' }
        try { parsed = await resp.json() } catch {}
        return {
          status: resp.status,
          error: {
            error: parsed.error || parsed.detail || 'api_error',
            message: parsed.message || parsed.detail,
            detail: parsed.detail,
          },
        }
      }

      const data = await resp.json()
      return { data, status: resp.status }
    } catch (e: any) {
      return { status: 0, error: { error: 'network_error', message: e.message || 'Network error' } }
    }
  }

  async login(
    username: string,
    password: string
  ): Promise<ApiResponse<{ token: string; access_token?: string }>> {
    const r = await this.request<{
      token?: string
      access_token?: string
      token_type?: string
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    const token = r.data?.access_token || r.data?.token
    if (token) {
      localStorage.setItem('finna_token', token)
    }
    return { data: { token: token || '' }, status: r.status, error: r.error }
  }

  // --- Configuration ---
  async getConnections(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/config')
  }
  async getProjects(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/config/projects')
  }
  async getProject(slug: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/config/projects/${slug}`)
  }
  async getConnection(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/config/${id}`)
  }
  async testConnection(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/config/${id}/test`, { method: 'POST' })
  }
  async createConnection(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/v1/config', { method: 'POST', body: JSON.stringify(data) })
  }
  async deleteConnection(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/config/${id}`, { method: 'DELETE' })
  }

  // --- Costs ---
  async getCosts(params?: {
    provider?: string
    project?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return this.request(`/api/v1/costs${qs ? '?' + qs : ''}`)
  }
  async getCostTotals(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return this.request(`/api/v1/costs/totals${qs ? '?' + qs : ''}`)
  }
  async getDailyCosts(params?: {
    startDate?: string
    endDate?: string
    provider?: string
  }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return this.request(`/api/v1/costs/daily${qs ? '?' + qs : ''}`)
  }
  async getCostsBySku(params?: {
    provider?: string
    limit?: number
  }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return this.request(`/api/v1/costs/by-sku${qs ? '?' + qs : ''}`)
  }

  // --- Alerts ---
  async getAlerts(params?: {
    status?: string
    severity?: string
    limit?: number
  }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as any).toString()
    return this.request(`/api/v1/alerts${qs ? '?' + qs : ''}`)
  }
  async getAlertStats(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/alerts/stats')
  }
  async getActiveAlerts(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/alerts/active')
  }
  async acknowledgeAlert(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  // --- Extractors ---
  async getExtractorStatus(limit = 50): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/extractors/status?limit=${limit}`)
  }
  async getExtractors(params?: {
    provider?: string
    limit?: number
  }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return this.request(`/api/v1/extractors${qs ? '?' + qs : ''}`)
  }
  async getExtractorRuns(params?: {
    configId?: string
    limit?: number
  }): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return this.request(`/api/v1/extractors/runs${qs ? '?' + qs : ''}`)
  }
  async runExtractor(
    type: string,
    provider: string,
    configId?: string
  ): Promise<ApiResponse<any>> {
    return this.request('/api/v1/extractors/run', {
      method: 'POST',
      body: JSON.stringify({
        extractor_type: type,
        provider,
        config_id: configId,
      }),
    })
  }
  async triggerExtractor(data: {
    config_id: string
    extractor_type?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/api/v1/extractors/run', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // --- Health ---
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/healthz')
  }

  // --- Profile ---
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/auth/profile')
  }
}

let client: APIClient | null = null
export function getApiClient(): APIClient {
  if (!client) client = new APIClient()
  return client
}

export default getApiClient
