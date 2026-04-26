import { create } from 'zustand'
import { useMemo } from 'react'

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export interface AuthActions {
  setToken: (token: string | null) => void
  login: (token: string) => void
  logout: () => void
  refreshToken: (token: string) => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  token: null,
  isAuthenticated: false,
  loading: true,

  setToken: (token) => {
    set({ token, isAuthenticated: !!token, loading: false })
  },

  checkAuth: () => {
    const storedToken = localStorage.getItem('finna_token')
    if (storedToken) {
      set({ token: storedToken, isAuthenticated: true, loading: false })
    } else {
      set({ token: null, isAuthenticated: false, loading: false })
    }
  },

  login: (token) => {
    set({ token, isAuthenticated: true, loading: false })
  },

  logout: () => {
    set({ token: null, isAuthenticated: false, loading: false })
    localStorage.removeItem('finna_token')
  },

  refreshToken: (token) => {
    set({ token })
  },
}))

export function useAuth() {
  const { token, isAuthenticated, loading, login, logout, setToken, checkAuth } = useAuthStore()
  
  const authActions = useMemo(() => ({
    login: (token: string) => {
      localStorage.setItem('finna_token', token)
      login(token)
    },
    logout: () => {
      localStorage.removeItem('finna_token')
      logout()
    },
    setToken: (token: string | null) => {
      if (token) {
        localStorage.setItem('finna_token', token)
      } else {
        localStorage.removeItem('finna_token')
      }
      setToken(token)
    },
  }), [login, logout, setToken])

  return {
    token,
    isAuthenticated,
    loading,
    checkAuth,
    ...authActions,
  }
}
