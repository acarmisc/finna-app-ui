// Comprehensive API Client Service
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { useAuthStore } from '../store/auth'
import { API_BASE_URL } from '../api/client'

// Enhanced API Client with better error handling and typing
export class FinnaApiClientClass {
  private instance: AxiosInstance
  
  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    this.setupInterceptors()
  }
  
  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error))
      }
    )
    
    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout()
        }
        return Promise.reject(this.handleError(error))
      }
    )
  }
  
  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with a status code outside 2xx
      const status = error.response.status
      const data = error.response.data
      
      if (typeof data === 'object' && data !== null && 'message' in data) {
        return new Error(`API Error ${status}: ${data.message}`)
      }
      
      return new Error(`API Error ${status}: ${JSON.stringify(data)}`)
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network Error: No response from server')
    } else {
      // Something happened in setting up the request
      return new Error(`Request Error: ${error.message}`)
    }
  }
  
  // Auth methods
  async login(username: string, password: string): Promise<{ token: string }> {
    try {
      const response = await this.instance.post('/api/v1/auth/token', { username, password })
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
  
  // Cost methods
  async getCosts(params?: {
    provider?: string
    project?: string
    startDate?: string
    endDate?: string
  }): Promise<any> {
    return this.instance.get('/api/v1/costs', { params })
  }
  
  async getCostTotals(params?: { startDate?: string; endDate?: string }): Promise<any> {
    return this.instance.get('/api/v1/costs/totals', { params })
  }
  
  async getDailyCosts(params?: {
    startDate?: string
    endDate?: string
    provider?: string
  }): Promise<any> {
    return this.instance.get('/api/v1/costs/daily', { params })
  }
  
  async getCostsBySku(params?: { provider?: string; limit?: number }): Promise<any> {
    return this.instance.get('/api/v1/costs/by-sku', { params })
  }
  
  // Alert methods
  async getAlerts(params?: {
    status?: string
    severity?: string
    limit?: number
  }): Promise<any> {
    return this.instance.get('/api/v1/alerts', { params })
  }
  
  async getAlertStats(): Promise<any> {
    return this.instance.get('/api/v1/alerts/stats')
  }
  
  async acknowledgeAlert(id: string): Promise<any> {
    return this.instance.post(`/api/v1/alerts/${id}/acknowledge`)
  }
  
  // Project methods
  async getProjects(): Promise<any> {
    return this.instance.get('/api/v1/projects')
  }
  
  async getProject(slug: string): Promise<any> {
    return this.instance.get(`/api/v1/projects/${slug}`)
  }
  
  // Config methods
  async getConnections(): Promise<any> {
    return this.instance.get('/api/v1/config')
  }
  
  async getConnection(id: string): Promise<any> {
    return this.instance.get(`/api/v1/config/${id}`)
  }
  
  async testConnection(id: string): Promise<any> {
    return this.instance.post(`/api/v1/config/${id}/test`)
  }
  
  async createConnection(data: any): Promise<any> {
    return this.instance.post('/api/v1/config', data)
  }
  
  async deleteConnection(id: string): Promise<any> {
    return this.instance.delete(`/api/v1/config/${id}`)
  }
  
  // Extractor methods
  async getExtractors(params?: { provider?: string; limit?: number }): Promise<any> {
    return this.instance.get('/api/v1/extractors', { params })
  }
  
  async getExtractorRuns(params?: { configId?: string; limit?: number }): Promise<any> {
    return this.instance.get('/api/v1/extractors/runs', { params })
  }
  
  async triggerExtractor(data: { config_id: string; extractor_type?: string }): Promise<any> {
    return this.instance.post('/api/v1/extractors/trigger', data)
  }
  
  // Dashboard methods
  async getDashboardStats(range?: 'mtd' | '7d' | '30d' | '90d'): Promise<any> {
    return this.instance.get('/api/v1/dashboard/stats', { params: { range } })
  }
}

// Singleton instance
export const apiClient = new FinnaApiClientClass()

export function getApiClient(): FinnaApiClientClass {
  return apiClient
}

export type { FinnaApiClientClass as FinnaApiClient }
