import { describe, it, expect } from 'vitest'
import { scoreQuiz, shuffleQuestions, getQuestionResult, QUIZ_PASS_THRESHOLD } from '../lib/quizUtils'
import type { QuizQuestionDTO } from '@dsa-quest/shared'

const makeQ = (id: number, correctAnswer: number): QuizQuestionDTO => ({
  id,
  topicId: 1,
  question: `Q${id}`,
  options: ['A', 'B', 'C', 'D'],
  correctAnswer,
  explanation: `Explanation ${id}`,
})

const questions = [makeQ(1, 0), makeQ(2, 1), makeQ(3, 2), makeQ(4, 3), makeQ(5, 0)]

describe('Quiz scoring', () => {
  it('calculates score as (correct / total) * 100 rounded', () => {
    expect(scoreQuiz([0, 1, 2, 3, 0], questions).score).toBe(100)
    expect(scoreQuiz([0, 1, 2, 3, 9], questions).score).toBe(80)
    expect(scoreQuiz([0, 1, 2, 9, 9], questions).score).toBe(60)
  })

  it('returns quizPassed=true when score >= 80', () => {
    expect(scoreQuiz([0, 1, 2, 3, 0], questions).quizPassed).toBe(true)
    expect(scoreQuiz([0, 1, 2, 3, 9], questions).quizPassed).toBe(true) // exactly 80
  })

  it('returns quizPassed=false when score < 80', () => {
    expect(scoreQuiz([0, 1, 2, 9, 9], questions).quizPassed).toBe(false)
    expect(scoreQuiz([9, 9, 9, 9, 9], questions).quizPassed).toBe(false)
  })

  it('QUIZ_PASS_THRESHOLD is 80', () => {
    expect(QUIZ_PASS_THRESHOLD).toBe(80)
  })

  it('getQuestionResult returns correct=true for correct answer', () => {
    expect(getQuestionResult(0, questions[0]).correct).toBe(true)
    expect(getQuestionResult(1, questions[0]).correct).toBe(false)
  })

  it('getQuestionResult returns explanation text', () => {
    const result = getQuestionResult(0, questions[0])
    expect(result.explanation).toBe('Explanation 1')
  })
})

describe('Quiz shuffle', () => {
  it('shuffleQuestions returns an array of the same length', () => {
    expect(shuffleQuestions(questions).length).toBe(5)
  })

  it('shuffleQuestions contains all original questions', () => {
    const shuffled = shuffleQuestions(questions)
    const ids = shuffled.map((q) => q.id).sort()
    expect(ids).toEqual([1, 2, 3, 4, 5])
  })

  it('shuffleQuestions does not mutate the original array', () => {
    const original = [...questions]
    shuffleQuestions(questions)
    expect(questions[0].id).toBe(original[0].id)
  })
})
