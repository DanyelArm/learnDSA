import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const { token, user, isLoading, error, login, register, logout, clearError } = useAuthStore()
  return {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  }
}
