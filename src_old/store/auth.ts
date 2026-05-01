import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: { username?: string; email?: string } | null
  loading: boolean
}

interface AuthActions {
  setToken: (token: string | null) => void
  setUser: (user: AuthState['user']) => void
  login: (token: string, user?: AuthState['user']) => void
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      loading: true,

      setToken: (token) => {
        set({ token, isAuthenticated: !!token, loading: false })
      },

      setUser: (user) => {
        set({ user })
      },

      checkAuth: () => {
        const token = localStorage.getItem('finna_token')
        if (token) {
          set({ token, isAuthenticated: true, loading: false })
        } else {
          set({ token: null, isAuthenticated: false, loading: false })
        }
      },

      login: (token, user) => {
        localStorage.setItem('finna_token', token)
        set({ token, isAuthenticated: true, user, loading: false })
      },

      logout: () => {
        localStorage.removeItem('finna_token')
        set({ token: null, isAuthenticated: false, user: null, loading: false })
      },
    }),
    {
      name: 'finna-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)

export function useAuth() {
  return useAuthStore()
}
