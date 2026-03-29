import { useEffect } from 'react'
import { useLessonStore } from '@/stores/lessonStore'

export function useLesson(topicId: number) {
  const store = useLessonStore()

  useEffect(() => {
    if (store.topicId !== topicId) {
      store.loadLesson(topicId)
    }
  }, [topicId])

  return {
    topicInfo: store.topicInfo,
    progress: store.progress,
    quizQuestions: store.quizQuestions,
    exercises: store.exercises,
    isLoading: store.isLoading,
    error: store.error,
    setProgress: store.setProgress,
    reset: store.reset,
  }
}
