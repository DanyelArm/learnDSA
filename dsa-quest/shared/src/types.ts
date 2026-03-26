export interface AuthUser {
  id: number
  username: string
  email: string
  xp: number
  level: number
  currentTopicId: number | null
}

export interface TopicDTO {
  id: number
  order: number
  title: string
  slug: string
  description: string
  visualizationType: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  details?: unknown
}

export type TopicStage = 'theory' | 'practice' | 'challenge'

export type NodeState = 'locked' | 'available' | 'completed' | 'mastered'
