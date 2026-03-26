import { useEffect } from 'react'
import { useTopicsStore } from '@/stores/topicsStore'

export function useTopics() {
  const { topics, isLoading, error, fetchTopics } = useTopicsStore()

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  return { topics, isLoading, error }
}
