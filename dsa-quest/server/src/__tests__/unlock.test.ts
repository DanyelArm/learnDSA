import { describe, it } from 'vitest'

describe('Linear unlock logic', () => {
  it.todo('topic with order=1 is always unlocked (no prerequisite)')
  it.todo('topic with order=N is locked when topic N-1 challengeCompleted=false')
  it.todo('topic with order=N is available when topic N-1 challengeCompleted=true')
  it.todo('completing challenge creates/updates UserProgress and unlocks next topic')
  it.todo('GET /api/topics includes userProgress with nodeState for each topic')
})
