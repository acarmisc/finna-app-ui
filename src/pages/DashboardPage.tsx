import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiClient } from '@/services/apiClient'
import { useAuthStore } from '@/store/auth'
import { AppShell } from '@/components/layout'
import { AlertsList } from '@/features/alerts/AlertsList'
import CONFIG from '@/config/env'

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const apiClient = getApiClient()
        
        // Fetch dashboard stats
        const statsResponse = await apiClient.getDashboardStats('mtd')
        setStats(statsResponse.data)
        
        // Fetch costs
        const costsResponse = await apiClient.getCosts()
        console.log('Costs data:', costsResponse.data)
        
        // Fetch alerts
        const alertsResponse = await apiClient.getAlerts()
        console.log('Alerts data:', alertsResponse.data)
        
      } catch (err) {
        if (err instanceof Error && err.message.includes('401')) {
          logout()
          navigate('/login')
        } else {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [logout, navigate])

  if (loading) {
    return (
      <AppShell title={CONFIG.APP_NAME} onLogout={logout}>
        <div className="p-6">Loading dashboard data...</div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title={CONFIG.APP_NAME} onLogout={logout}>
        <div className="p-6 text-red-500">Error: {error}</div>
      </AppShell>
    )
  }

  return (
    <AppShell title={CONFIG.APP_NAME} onLogout={logout}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg">
            <div className="text-sm text-gray-500">Total Cost (MTD)</div>
            <div className="text-2xl font-bold">${stats?.totals?.total?.toFixed(2) || '0.00'}</div>
          </div>
          
          <div className="bg-card p-4 rounded-lg">
            <div className="text-sm text-gray-500">Azure Cost</div>
            <div className="text-2xl font-bold text-blue-600">${stats?.totals?.azure?.toFixed(2) || '0.00'}</div>
          </div>
          
          <div className="bg-card p-4 rounded-lg">
            <div className="text-sm text-gray-500">GCP Cost</div>
            <div className="text-2xl font-bold text-green-600">${stats?.totals?.gcp?.toFixed(2) || '0.00'}</div>
          </div>
          
          <div className="bg-card p-4 rounded-lg">
            <div className="text-sm text-gray-500">LLM Cost</div>
            <div className="text-2xl font-bold text-purple-600">${stats?.totals?.llm?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Daily Cost Trend</h2>
            <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
              <div className="text-gray-500">Chart would display here</div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Active Alerts</h2>
            <AlertsList limit={5} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
