import { create } from 'zustand'
import { api } from '@/lib/api'
import type { UserProgressDTO, QuizQuestionDTO, ExerciseDTO } from '@dsa-quest/shared'

interface TopicInfo {
  title: string
  theoryContent: string
  order: number
}

interface LessonState {
  topicId: number | null
  topicInfo: TopicInfo | null
  progress: UserProgressDTO | null
  quizQuestions: QuizQuestionDTO[]
  exercises: Record<'practice' | 'challenge', ExerciseDTO | null>
  isLoading: boolean
  error: string | null

  loadLesson: (topicId: number) => Promise<void>
  setProgress: (progress: UserProgressDTO) => void
  reset: () => void
}

const initialState = {
  topicId: null,
  topicInfo: null,
  progress: null,
  quizQuestions: [],
  exercises: { practice: null, challenge: null },
  isLoading: false,
  error: null,
}

export const useLessonStore = create<LessonState>()((set) => ({
  ...initialState,

  loadLesson: async (topicId: number) => {
    set({ isLoading: true, error: null, topicId })
    try {
      const res = await api.get<{
        data: {
          topic: TopicInfo
          progress: UserProgressDTO | null
          questions: QuizQuestionDTO[]
          exercises: ExerciseDTO[]
        }
      }>(`/topics/${topicId}/progress`)
      const { topic, progress, questions, exercises } = res.data.data
      const exerciseMap: Record<'practice' | 'challenge', ExerciseDTO | null> = {
        practice: exercises.find((e) => e.stage === 'practice') ?? null,
        challenge: exercises.find((e) => e.stage === 'challenge') ?? null,
      }
      set({ topicInfo: topic ?? null, progress, quizQuestions: questions, exercises: exerciseMap, isLoading: false })
    } catch {
      set({ error: 'Failed to load lesson data', isLoading: false })
    }
  },

  setProgress: (progress: UserProgressDTO) => set({ progress }),
  reset: () => set(initialState),
}))
