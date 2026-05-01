import { useState, useEffect, useCallback } from 'react'
import { getApiClient } from '../services/apiClient'

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('finna-auth-token')
    setAuthenticated(!!token)
    setLoading(false)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('finna-auth-token')
    setAuthenticated(false)
    window.location.reload()
  }, [])

  return { authenticated, loading, setAuthenticated, logout }
}

export function useCostTotals(params?: { startDate?: string, endDate?: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    getApiClient().getCostTotals(params)
      .then(r => { 
        if (r.error) {
          setError(r.error.message || 'Failed to load totals')
        } else {
          setData(r.data)
        }
      })
      .catch(e => setError(e.message || 'Network error'))
      .finally(() => setLoading(false))
  }, [JSON.stringify(params)])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}

export function useDailyCosts(params?: { startDate?: string, endDate?: string, provider?: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    getApiClient().getDailyCosts(params)
      .then(r => { 
        if (r.error) {
          setError(r.error.message || 'Failed to load daily costs')
        } else {
          setData(r.data)
        }
      })
      .catch(e => setError(e.message || 'Network error'))
      .finally(() => setLoading(false))
  }, [JSON.stringify(params)])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}

export function useCosts(params?: { provider?: string; project?: string; startDate?: string; endDate?: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    getApiClient().getCosts(params)
      .then(r => { 
        if (r.error) {
          setError(r.error.message || 'Failed to load costs')
        } else {
          setData(r.data)
        }
      })
      .catch(e => setError(e.message || 'Network error'))
      .finally(() => setLoading(false))
  }, [JSON.stringify(params)])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}

export function useAlerts(params?: { status?: string; severity?: string; limit?: number }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setRefreshing(true)
    setError('')
    getApiClient().getAlerts(params)
      .then(r => { 
        if (r.error) {
          setError(r.error.message || 'Failed to load alerts')
        } else {
          setData(r.data)
        }
      })
      .catch(e => setError(e.message || 'Network error'))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }, [JSON.stringify(params)])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, refreshing, error, refresh }
}

export function useAlertStats() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    getApiClient().getAlertStats()
      .then(r => { 
        if (r.error) {
          setError(r.error.message || 'Failed to load alert stats')
        } else {
          setData(r.data)
        }
      })
      .catch(e => setError(e.message || 'Network error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}

export function useConnections() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    getApiClient().getConnections()
      .then(r => { 
        if (r.error) {
          setError(r.error.message || 'Failed to load connections')
        } else {
          setData(r.data)
        }
      })
      .catch(e => setError(e.message || 'Network error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}

export function useProjects() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    getApiClient().getProjects()
      .then(r => { 
        if (r.error) {
          setError(r.error.message || 'Failed to load projects')
        } else {
          setData(r.data)
        }
      })
      .catch(e => setError(e.message || 'Network error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}
