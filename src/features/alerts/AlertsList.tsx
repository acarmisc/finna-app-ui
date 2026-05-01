import { useEffect, useState } from 'react'
import { getApiClient } from '@/services/apiClient'
import { z } from 'zod/v4'

type AlertSchema = {
  id: string
  name: string
  description: string
  status: string
}

export function AlertsList({ limit = 5 }: { limit?: number }) {
  const [alerts, setAlerts] = useState<AlertSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const apiClient = getApiClient()
        const response = await apiClient.getAlerts({ limit, status: 'firing' })
        setAlerts(response.data.alerts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAlerts()
  }, [limit])

  if (loading) {
    return <div className="space-y-2">Loading alerts...</div>
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>
  }

  if (alerts.length === 0) {
    return <div className="text-gray-500 text-sm">No active alerts</div>
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div key={alert.id} className="p-2 bg-red-50 rounded border-l-2 border-red-500">
          <div className="font-medium text-sm">{alert.name}</div>
          <div className="text-xs text-gray-600">{alert.description}</div>
        </div>
      ))}
    </div>
  )
}
