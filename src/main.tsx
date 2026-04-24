import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { getApiClient } from './services/apiClient'
import { LoginComponent } from './components/auth/LoginComponent'

function Dashboard() {
  const [summary, setSummary] = useState<any>(null)
  useEffect(() => {
    getApiClient().getCostTotals().then(r => { if (!r.error) setSummary(r.data) })
  }, [])
  return (
    <div>
      <h2>Dashboard</h2>
      {summary ? (
        <div>
          <p>Providers: {Object.keys(summary.totals || {}).join(', ') || 'none'}</p>
          <pre>{JSON.stringify(summary.totals, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

function Costs() {
  const [costs, setCosts] = useState<any>(null)
  useEffect(() => {
    getApiClient().getCosts().then(r => { if (!r.error) setCosts(r.data) })
  }, [])
  return (
    <div>
      <h2>Cost Explorer</h2>
      {costs ? <pre>{JSON.stringify(costs, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  )
}

function AlertsView() {
  const [alerts, setAlerts] = useState<any>(null)
  useEffect(() => {
    getApiClient().getAlerts().then(r => { if (!r.error) setAlerts(r.data) })
  }, [])
  return (
    <div>
      <h2>Alerts</h2>
      {alerts ? <pre>{JSON.stringify(alerts, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  )
}

function ConfigView() {
  const [configs, setConfigs] = useState<any>(null)
  useEffect(() => {
    getApiClient().getConnections().then(r => { if (!r.error) setConfigs(r.data) })
  }, [])
  return (
    <div>
      <h2>Configuration</h2>
      {configs ? <pre>{JSON.stringify(configs, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  )
}

function App() {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('finna-auth-token')
    if (token) setAuthenticated(true)
  }, [])

  if (!authenticated) {
    return <LoginComponent onLogin={() => setAuthenticated(true)} />
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <nav style={{ width: '200px', backgroundColor: '#1a1a2e', padding: '20px', color: 'white' }}>
          <h2>FinOps</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '10px 0' }}><a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</a></li>
            <li style={{ margin: '10px 0' }}><a href="/costs" style={{ color: 'white', textDecoration: 'none' }}>Costs</a></li>
            <li style={{ margin: '10px 0' }}><a href="/alerts" style={{ color: 'white', textDecoration: 'none' }}>Alerts</a></li>
            <li style={{ margin: '10px 0' }}><a href="/config" style={{ color: 'white', textDecoration: 'none' }}>Config</a></li>
            <li style={{ margin: '10px 0' }}><a href="/login" onClick={(e) => { e.preventDefault(); localStorage.removeItem('finna-auth-token'); window.location.reload(); }} style={{ color: 'white', textDecoration: 'none' }}>Logout</a></li>
          </ul>
        </nav>
        <main style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/login" element={<LoginComponent onLogin={() => setAuthenticated(true)} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/costs" element={<Costs />} />
            <Route path="/alerts" element={<AlertsView />} />
            <Route path="/config" element={<ConfigView />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

const rootEl = document.getElementById('root')
if (rootEl) createRoot(rootEl).render(<App />)
