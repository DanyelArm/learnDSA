import type { QuizQuestionDTO } from '@dsa-quest/shared'

export const QUIZ_PASS_THRESHOLD = 80

export function shuffleQuestions(questions: QuizQuestionDTO[]): QuizQuestionDTO[] {
  const arr = [...questions]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export interface QuizScoreResult {
  score: number
  quizPassed: boolean
  correctCount: number
  total: number
}

export function scoreQuiz(answers: number[], questions: QuizQuestionDTO[]): QuizScoreResult {
  const correctCount = answers.filter((a, i) => a === questions[i].correctAnswer).length
  const score = Math.round((correctCount / questions.length) * 100)
  return { score, quizPassed: score >= QUIZ_PASS_THRESHOLD, correctCount, total: questions.length }
}

export function getQuestionResult(
  answer: number,
  question: QuizQuestionDTO
): { correct: boolean; explanation: string } {
  return {
    correct: answer === question.correctAnswer,
    explanation: question.explanation,
  }
}
