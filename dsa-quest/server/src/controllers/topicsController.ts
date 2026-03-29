import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prismaClient'
import { AppError } from '../middleware/errorHandler'
import type { NodeState } from '@dsa-quest/shared'

// Pure helper: derive NodeState for a topic given sorted progress map
export function deriveNodeState(
  topicOrder: number,
  progressByOrder: Map<number, { quizPassed: boolean; challengeCompleted: boolean } | null>
): NodeState {
  if (topicOrder === 1) {
    const p = progressByOrder.get(1)
    if (!p) return 'available'
    if (p.challengeCompleted) return 'completed'
    return 'in-progress' as NodeState
  }
  const prev = progressByOrder.get(topicOrder - 1)
  if (!prev?.challengeCompleted) return 'locked'
  const curr = progressByOrder.get(topicOrder)
  if (!curr) return 'available'
  if (curr.challengeCompleted) return 'completed'
  return 'in-progress' as NodeState
}

// Pure helper: calculate quiz score as percentage
export function calculateQuizScore(answers: number[], correctAnswers: number[]): number {
  const correct = answers.filter((a, i) => a === correctAnswers[i]).length
  return Math.round((correct / correctAnswers.length) * 100)
}

// GET /api/topics — extended to include userProgress + nodeState
export async function listTopics(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    const topics = await prisma.topic.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, order: true, title: true, slug: true, description: true, visualizationType: true },
    })

    const progressByOrder = new Map<number, { quizPassed: boolean; challengeCompleted: boolean } | null>()
    if (userId) {
      const progressRows = await prisma.userProgress.findMany({
        where: { userId },
        select: { topicId: true, quizPassed: true, challengeCompleted: true },
      })
      // build map topicId -> progress
      const byTopicId = new Map(progressRows.map((p) => [p.topicId, p]))
      for (const t of topics) {
        progressByOrder.set(t.order, byTopicId.get(t.id) ?? null)
      }
    }

    const data = topics.map((t) => ({
      ...t,
      userProgress: userId ? (progressByOrder.get(t.order) ?? null) : null,
      nodeState: userId ? deriveNodeState(t.order, progressByOrder) : (t.order === 1 ? 'available' : 'locked'),
    }))

    res.json({ data })
  } catch (err) {
    next(err)
  }
}

// GET /api/topics/:id/progress
export async function getProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const topicId = Number(req.params.id)
    if (isNaN(topicId)) throw new AppError(400, 'Invalid topic id')

    // Also return topic info + quiz questions + exercise starters for this topic
    const [topic, progress, questions, exercises] = await Promise.all([
      prisma.topic.findUnique({ where: { id: topicId }, select: { title: true, theoryContent: true, order: true } }),
      prisma.userProgress.findUnique({ where: { userId_topicId: { userId, topicId } } }),
      prisma.quizQuestion.findMany({ where: { topicId } }),
      prisma.exercise.findMany({ where: { topicId } }),
    ])

    if (!topic) throw new AppError(404, 'Topic not found')

    const questionsDTO = questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options) as string[],
    }))
    const exercisesDTO = exercises.map((e) => ({
      ...e,
      stage: e.stage as 'practice' | 'challenge',
      testCases: JSON.parse(e.testCases),
      hints: JSON.parse(e.hints) as string[],
    }))

    res.json({ data: { topic, progress: progress ?? null, questions: questionsDTO, exercises: exercisesDTO } })
  } catch (err) {
    next(err)
  }
}

// POST /api/topics/:id/quiz
export async function submitQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const topicId = Number(req.params.id)
    if (isNaN(topicId)) throw new AppError(400, 'Invalid topic id')

    // Check existing progress — no re-grading once passed
    const existing = await prisma.userProgress.findUnique({
      where: { userId_topicId: { userId, topicId } },
    })
    if (existing?.quizPassed) throw new AppError(403, 'Quiz already passed for this topic')

    const questions = await prisma.quizQuestion.findMany({ where: { topicId } })
    if (questions.length === 0) throw new AppError(404, 'No quiz questions found for topic')

    const { answers } = req.body as { answers: number[] }
    if (answers.length !== questions.length) throw new AppError(400, 'Answer count does not match question count')

    const correctAnswers = questions.map((q) => q.correctAnswer)
    const score = calculateQuizScore(answers, correctAnswers)
    const quizPassed = score >= 80

    const progress = await prisma.userProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { quizScore: score, quizPassed, theoryCompleted: true },
      create: { userId, topicId, quizScore: score, quizPassed, theoryCompleted: true },
    })

    res.json({ data: { progress, score, quizPassed } })
  } catch (err) {
    next(err)
  }
}

// POST /api/topics/:id/exercise/:stage  (stage = 'practice' | 'challenge')
export async function completeExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const topicId = Number(req.params.id)
    const stage = req.params.stage as 'practice' | 'challenge'
    if (isNaN(topicId)) throw new AppError(400, 'Invalid topic id')
    if (stage !== 'practice' && stage !== 'challenge') throw new AppError(400, 'Invalid stage')

    const progress = await prisma.userProgress.findUnique({
      where: { userId_topicId: { userId, topicId } },
    })

    // Server-side stage gate enforcement
    if (stage === 'practice' && !progress?.quizPassed) {
      throw new AppError(403, 'Must pass quiz before attempting practice')
    }
    if (stage === 'challenge' && !progress?.practiceCompleted) {
      throw new AppError(403, 'Must complete practice before attempting challenge')
    }

    const { attempts = 1 } = req.body as { attempts?: number }
    const updateData =
      stage === 'practice'
        ? { practiceCompleted: true, practiceAttempts: (progress?.practiceAttempts ?? 0) + attempts }
        : { challengeCompleted: true, challengeAttempts: (progress?.challengeAttempts ?? 0) + attempts }

    const updated = await prisma.userProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: updateData,
      create: { userId, topicId, ...updateData },
    })

    res.json({ data: { progress: updated } })
  } catch (err) {
    next(err)
  }
}
