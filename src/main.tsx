import React, { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { LoginComponent } from './components/auth/LoginComponent'

function Root() {
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
      <App onLogout={() => { localStorage.removeItem('finna-auth-token'); setAuthenticated(false) }} />
    </BrowserRouter>
  )
}

const rootEl = document.getElementById('root')
if (rootEl) createRoot(rootEl).render(<Root />)
