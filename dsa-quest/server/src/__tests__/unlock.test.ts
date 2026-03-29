import { describe, it, expect } from 'vitest'
import { deriveNodeState } from '../controllers/topicsController'

type ProgressMap = Map<number, { quizPassed: boolean; challengeCompleted: boolean } | null>

describe('Linear unlock logic — deriveNodeState', () => {
  it('topic order=1 with no progress row is "available"', () => {
    const m: ProgressMap = new Map([[1, null]])
    expect(deriveNodeState(1, m)).toBe('available')
  })
  it('topic order=1 with challengeCompleted=true is "completed"', () => {
    const m: ProgressMap = new Map([[1, { quizPassed: true, challengeCompleted: true }]])
    expect(deriveNodeState(1, m)).toBe('completed')
  })
  it('topic order=2 is "locked" when topic 1 challengeCompleted=false', () => {
    const m: ProgressMap = new Map([
      [1, { quizPassed: true, challengeCompleted: false }],
      [2, null],
    ])
    expect(deriveNodeState(2, m)).toBe('locked')
  })
  it('topic order=2 is "available" when topic 1 challengeCompleted=true', () => {
    const m: ProgressMap = new Map([
      [1, { quizPassed: true, challengeCompleted: true }],
      [2, null],
    ])
    expect(deriveNodeState(2, m)).toBe('available')
  })
  it('topic order=2 is "completed" when its own challengeCompleted=true', () => {
    const m: ProgressMap = new Map([
      [1, { quizPassed: true, challengeCompleted: true }],
      [2, { quizPassed: true, challengeCompleted: true }],
    ])
    expect(deriveNodeState(2, m)).toBe('completed')
  })
})
