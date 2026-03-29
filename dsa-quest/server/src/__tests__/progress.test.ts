import { describe, it, expect } from 'vitest'
import { calculateQuizScore } from '../controllers/topicsController'

describe('Quiz scoring', () => {
  it('calculates score as (correct / total) * 100 rounded', () => {
    expect(calculateQuizScore([0, 1, 2, 3], [0, 1, 2, 3])).toBe(100)
    expect(calculateQuizScore([0, 1, 0, 3], [0, 1, 2, 3])).toBe(75)
  })
  it('returns quizPassed=true when score >= 80', () => {
    expect(calculateQuizScore([0, 1, 2, 3, 0], [0, 1, 2, 3, 0])).toBe(100)
    // 4/5 = 80
    const score = calculateQuizScore([0, 1, 2, 3, 9], [0, 1, 2, 3, 0])
    expect(score).toBe(80)
    expect(score >= 80).toBe(true)
  })
  it('returns quizPassed=false when score < 80', () => {
    const score = calculateQuizScore([0, 1, 2, 9, 9], [0, 1, 2, 3, 0])
    expect(score).toBe(60)
    expect(score >= 80).toBe(false)
  })
  it('score of exactly 80% is passing', () => {
    expect(calculateQuizScore([0, 1, 2, 3, 9], [0, 1, 2, 3, 0]) >= 80).toBe(true)
  })
})
