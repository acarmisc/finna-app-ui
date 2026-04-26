import React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { token, loading } = useAuthStore()

  // If authentication is required and no token, redirect to login
  if (requireAuth && !token && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If not authenticated but auth not required, redirect to login
  if (!requireAuth && !token && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
