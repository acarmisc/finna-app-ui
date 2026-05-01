import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '@/services/apiClient'

const client = getApiClient()

// ------------------------------------------------
// Auth
// ------------------------------------------------
export function useLoginMutation() {
  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      client.login(data.username, data.password),
  })
}

// ------------------------------------------------
// Costs
// ------------------------------------------------
export function useCostTotals(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['costs', 'totals', params],
    queryFn: async () => {
      const res = await client.getCostTotals(params)
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useDailyCosts(params?: { startDate?: string; endDate?: string; provider?: string }) {
  return useQuery({
    queryKey: ['costs', 'daily', params],
    queryFn: async () => {
      const res = await client.getDailyCosts(params)
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useCosts(params?: { provider?: string; project?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['costs', params],
    queryFn: async () => {
      const res = await client.getCosts(params)
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useCostsBySku(params?: { provider?: string; limit?: number }) {
  return useQuery({
    queryKey: ['costs', 'by-sku', params],
    queryFn: async () => {
      const res = await client.getCostsBySku(params)
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

// ------------------------------------------------
// Alerts
// ------------------------------------------------
export function useAlerts(params?: { status?: string; severity?: string; limit?: number }) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const res = await client.getAlerts(params)
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useAlertStats() {
  return useQuery({
    queryKey: ['alerts', 'stats'],
    queryFn: async () => {
      const res = await client.getAlertStats()
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.acknowledgeAlert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['alerts', 'stats'] })
    },
  })
}

// ------------------------------------------------
// Projects / Configs
// ------------------------------------------------
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await client.getProjects()
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['projects', slug],
    queryFn: async () => {
      const res = await client.getProject(slug)
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    enabled: !!slug,
  })
}

export function useConnections() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const res = await client.getConnections()
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useConnection(id: string) {
  return useQuery({
    queryKey: ['connections', id],
    queryFn: async () => {
      const res = await client.getConnection(id)
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    enabled: !!id,
  })
}

export function useTestConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.testConnection(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connections'] }),
  })
}

export function useDeleteConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteConnection(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connections'] }),
  })
}

export function useCreateConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => client.createConnection(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connections'] }),
  })
}

// ------------------------------------------------
// Extractors / Runs
// ------------------------------------------------
export function useExtractorRuns(params?: { configId?: string; limit?: number }) {
  return useQuery({
    queryKey: ['extractor-runs', params],
    queryFn: async () => {
      const res = await client.getExtractorRuns(params)
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useExtractorStatus(limit = 50) {
  return useQuery({
    queryKey: ['extractor-status', limit],
    queryFn: async () => {
      const res = await client.getExtractorStatus(limit)
      if (res.error) throw new Error(res.error.message || 'API error')
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

// ------------------------------------------------
// Dashboard
// ------------------------------------------------
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // Combine: costs totals + alert stats + extractor runs
      const [totals, alerts, runs] = await Promise.all([
        client.getCostTotals(),
        client.getAlertStats(),
        client.getExtractorRuns({ limit: 5 }),
      ])
      return {
        costs: totals.data,
        alerts: alerts.data,
        runs: runs.data,
      }
    },
    placeholderData: (prev) => prev,
  })
}
