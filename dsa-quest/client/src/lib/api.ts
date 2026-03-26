import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
  // Lazy import to avoid circular dependency
  const token = localStorage.getItem('dsa-quest-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dsa-quest-token')
      localStorage.removeItem('dsa-quest-user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
