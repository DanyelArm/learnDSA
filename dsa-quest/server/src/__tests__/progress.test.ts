import { describe, it } from 'vitest'

describe('Progress API', () => {
  it.todo('GET /api/topics/:id/progress returns UserProgress when row exists')
  it.todo('GET /api/topics/:id/progress returns null progress when no row exists yet')
  it.todo('POST /api/topics/:id/quiz returns 400 if quizPassed already true')
  it.todo('POST /api/topics/:id/quiz upserts UserProgress row with correct score')
  it.todo('POST /api/topics/:id/exercise/:stage returns 403 if stage gate not met')
})
