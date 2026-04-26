// API hooks based on React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '@/services/apiClient'
import { 
  CostListResponse, CostTotalsResponse, CostDailyResponse, 
  CostBySkuResponse, AlertListResponse, AlertStatsResponse,
  ExtractorListResponse, ProjectResponse, CloudConfigResponse
} from '@/types/api'

// --- Cost Hooks ---

export function useCosts(params?: { provider?: string, project?: string, startDate?: string, endDate?: string }) {
  return useQuery<CostListResponse, Error>({
    queryKey: ['costs', params],
    queryFn: async () => {
      const res = await getApiClient().getCosts(params)
      return res.data as CostListResponse
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useCostTotals(params?: { startDate?: string, endDate?: string }) {
  return useQuery<CostTotalsResponse, Error>({
    queryKey: ['costs', 'totals', params],
    queryFn: async () => {
      const res = await getApiClient().getCostTotals(params)
      return res.data as CostTotalsResponse
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useDailyCosts(params?: { startDate?: string, endDate?: string, provider?: string }) {
  return useQuery<CostDailyResponse, Error>({
    queryKey: ['costs', 'daily', params],
    queryFn: async () => {
      const res = await getApiClient().getDailyCosts(params)
      return res.data as CostDailyResponse
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useCostsBySku(params?: { provider?: string, limit?: number }) {
  return useQuery<CostBySkuResponse, Error>({
    queryKey: ['costs', 'by-sku', params],
    queryFn: async () => {
      const res = await getApiClient().getCostsBySku(params)
      return res.data as CostBySkuResponse
    },
  })
}

// --- Alert Hooks ---

export function useAlerts(params?: { status?: string, severity?: string, limit?: number }) {
  return useQuery<AlertListResponse, Error>({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const res = await getApiClient().getAlerts(params)
      return res.data as AlertListResponse
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useAlertStats() {
  return useQuery<AlertStatsResponse, Error>({
    queryKey: ['alerts', 'stats'],
    queryFn: async () => {
      const res = await getApiClient().getAlertStats()
      return res.data as AlertStatsResponse
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => getApiClient().acknowledgeAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alerts', 'stats'] })
    },
  })
}

// --- Config/Project Hooks ---

export function useConnections() {
  return useQuery<CloudConfigResponse[], Error>({
    queryKey: ['connections'],
    queryFn: async () => {
      const res = await getApiClient().getConnections()
      return res.data as CloudConfigResponse[]
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useProjects() {
  return useQuery<ProjectResponse[], Error>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await getApiClient().getProjects()
      return res.data as ProjectResponse[]
    },
    placeholderData: (previousData) => previousData,
  })
}

// --- Extractor Hooks ---

export function useExtractors(params?: { provider?: string, limit?: number }) {
  return useQuery<ExtractorListResponse, Error>({
    queryKey: ['extractors', params],
    queryFn: async () => {
      const res = await getApiClient().getExtractors(params)
      return res.data as ExtractorListResponse
    },
  })
}
