import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { useAuthStore } from './store/auth'
import { LoginComponent } from './components/auth/LoginComponent'
import { Dashboard, Projects, Costs, Alerts, Configs } from './pages/Pages'
import { ProtectedRoute, AppShell } from './components/layout'

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore()
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    checkAuth()
    const token = localStorage.getItem('finna_token')
    setHasToken(!!token)
  }, [checkAuth])

  if (!hasToken) {
    return <LoginComponent onLogin={() => setHasToken(true)} />
  }

  return children
}

function AppWithRoutes() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <ProtectedRoute>
      <AppShell title="FinOps Console" onLogout={handleLogout}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/costs" element={<Costs />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/configs" element={<Configs />} />
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<div className="text-white">404 - Not Found</div>} />
        </Routes>
      </AppShell>
    </ProtectedRoute>
  )
}

function Root() {
  useEffect(() => {
    const storedToken = localStorage.getItem('finna_token')
    if (storedToken) {
      useAuthStore.getState().setToken(storedToken)
    }
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
