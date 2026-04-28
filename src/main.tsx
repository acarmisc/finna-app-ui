import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { useAuthStore } from './store/auth'
import LoginComponent from './components/auth/LoginComponent'
import { AppShell } from './components/layout'
import './index.css'

// Real page components
import {
  DashboardPage,
  ProjectsListPage,
  ProjectDetailPage,
  CostsPage,
  ConfigsListPage,
  ConfigCreatePage,
  AlertsPage,
  SettingsPage,
  RunHistoryPage,
  DataSourcesPage,
} from './pages'

// Hash-based router
function HashRouter({ children }: { children: (hash: string) => React.ReactNode }) {
  const [hash, setHash] = useState(() => window.location.hash.replace(/^#/, '') || '/dashboard')
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.replace(/^#/, '') || '/dashboard')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return <>{children(hash)}</>
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore()
  const [hasToken, setHasToken] = useState(false)
  useEffect(() => {
    checkAuth()
    const token = localStorage.getItem('finna_token')
    setHasToken(!!token)
  }, [checkAuth])
  if (!hasToken) return <LoginComponent onLogin={() => setHasToken(true)} />
  return <>{children}</>
}

function AppWithRoutes() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <HashRouter>
      {(hash) => {
        // Ensure hash starts with /
        const path = hash.startsWith('/') ? hash : '/dashboard'
        const cfg = path.match(/^\/configs\/new/) ? 'new' : null
        const detail = path.match(/^\/projects\/(.+)/)

        let page: React.ReactNode = null
        if (path === '/dashboard')       page = <DashboardPage />
        else if (path === '/projects')   page = <ProjectsListPage />
        else if (cfg === 'new')          page = <ConfigCreatePage />
        else if (path === '/configs')    page = <ConfigsListPage />
        else if (detail)                 page = <ProjectDetailPage />
        else if (path === '/costs')      page = <CostsPage />
        else if (path === '/alerts')     page = <AlertsPage />
        else if (path === '/settings')   page = <SettingsPage />
        else if (path === '/runs')       page = <RunHistoryPage />
        else if (path === '/sources')    page = <DataSourcesPage />
        else                             page = <DashboardPage />

        return (
          <AppShell title="FinOps Console" onLogout={handleLogout}>
            {page}
          </AppShell>
        )
      }}
    </HashRouter>
  )
}

function Root() {
  useEffect(() => {
    const storedToken = localStorage.getItem('finna_token')
    if (storedToken) useAuthStore.getState().setToken(storedToken)
    // Set initial hash if none
    if (!window.location.hash) window.location.hash = '#/dashboard'
  }, [])
  return (
    <BrowserRouter>
      <AuthWrapper>
        <AppWithRoutes />
      </AuthWrapper>
    </BrowserRouter>
  )
}

const rootEl = document.getElementById('root')
if (rootEl) createRoot(rootEl).render(<Root />)
