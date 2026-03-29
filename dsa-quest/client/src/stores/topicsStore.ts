import { create } from 'zustand'
import { api } from '@/lib/api'
import type { TopicDTO } from '@dsa-quest/shared'

interface TopicsState {
  topics: TopicDTO[]
  isLoading: boolean
  error: string | null
  fetchTopics: () => Promise<void>
  invalidate: () => void
}

export const useTopicsStore = create<TopicsState>()((set, get) => ({
  topics: [],
  isLoading: false,
  error: null,

  fetchTopics: async () => {
    if (get().topics.length > 0) return // already loaded
    set({ isLoading: true, error: null })
    try {
      const res = await api.get<{ data: TopicDTO[] }>('/topics')
      set({ topics: res.data.data, isLoading: false })
    } catch {
      set({ error: 'Failed to load topics', isLoading: false })
    }
  },

  invalidate: () => set({ topics: [] }), // clears cache so next fetchTopics re-fetches
}))
