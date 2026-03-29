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

export type NodeState = 'locked' | 'available' | 'in-progress' | 'completed' | 'mastered'

export interface TestCase {
  input: unknown[]   // array of arguments to pass to the function
  expected: unknown  // expected return value (JSON-comparable)
}

export interface TestResult {
  input: unknown[]
  expected: unknown
  actual: unknown
  stdout: string
  passed: boolean
}

export interface UserProgressDTO {
  id: number
  topicId: number
  theoryCompleted: boolean
  quizScore: number | null
  quizPassed: boolean
  practiceCompleted: boolean
  practiceAttempts: number
  challengeCompleted: boolean
  challengeAttempts: number
  hintsUsed: number
  xpEarned: number
}

export interface QuizQuestionDTO {
  id: number
  topicId: number
  question: string
  options: string[]       // deserialized from JSON string in DB
  correctAnswer: number   // index into options[]
  explanation: string
}

export interface ExerciseDTO {
  id: number
  topicId: number
  stage: 'practice' | 'challenge'
  title: string
  description: string
  starterCode: string
  testCases: TestCase[]    // deserialized from JSON string in DB
  hints: string[]          // deserialized; length 3
  timeBonusThreshold: number | null
  functionName: string
}

export interface TopicWithProgressDTO extends TopicDTO {
  userProgress: UserProgressDTO | null
  nodeState: NodeState
}
