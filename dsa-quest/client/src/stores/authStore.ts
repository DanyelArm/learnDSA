import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'
import type { AuthUser } from '@dsa-quest/shared'

interface AuthState {
  token: string | null
  user: AuthUser | null
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  updateUser: (updates: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
            email,
            password,
          })
          const { token, user } = res.data
          localStorage.setItem('dsa-quest-token', token)
          set({ token, user, isLoading: false })
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Login failed'
          set({ error: msg, isLoading: false })
          throw err
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
            username,
            email,
            password,
          })
          const { token, user } = res.data
          localStorage.setItem('dsa-quest-token', token)
          set({ token, user, isLoading: false })
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Registration failed'
          set({ error: msg, isLoading: false })
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('dsa-quest-token')
        set({ token: null, user: null, error: null })
      },

      clearError: () => set({ error: null }),

      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name: 'dsa-quest-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
