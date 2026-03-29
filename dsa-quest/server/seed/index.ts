import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { topicsData } from './topics.data'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding topics...')

  for (const topic of topicsData) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        title: topic.title,
        description: topic.description,
        order: topic.order,
        visualizationType: topic.visualizationType,
      },
      create: topic,
    })
  }

  console.log(`✓ Seeded ${topicsData.length} topics.`)

  // Seed quiz questions and exercises for topic 01-big-o
  const contentDir = path.resolve(__dirname, '../../client/src/content/topics/01-big-o')

  const quizData: Array<{
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }> = JSON.parse(fs.readFileSync(path.join(contentDir, 'quiz.json'), 'utf-8'))

  const bigOTopic = await prisma.topic.findFirst({ where: { order: 1 } })
  if (bigOTopic) {
    // Delete existing rows first for idempotency
    await prisma.quizQuestion.deleteMany({ where: { topicId: bigOTopic.id } })
    await prisma.quizQuestion.createMany({
      data: quizData.map((q) => ({
        topicId: bigOTopic.id,
        question: q.question,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    })
    console.log(`✓ Seeded ${quizData.length} quiz questions for Big-O.`)

    const exerciseData = JSON.parse(
      fs.readFileSync(path.join(contentDir, 'exercise.json'), 'utf-8'),
    )
    await prisma.exercise.deleteMany({ where: { topicId: bigOTopic.id } })
    for (const ex of [exerciseData.practice, exerciseData.challenge]) {
      await prisma.exercise.create({
        data: {
          topicId: bigOTopic.id,
          stage: ex.stage,
          title: ex.title,
          description: ex.description,
          starterCode: ex.starterCode,
          testCases: JSON.stringify(ex.testCases),
          hints: JSON.stringify(ex.hints),
          timeBonusThreshold: ex.timeBonusThreshold ?? null,
          functionName: ex.functionName,
        },
      })
    }
    console.log('✓ Seeded practice and challenge exercises for Big-O.')

    // Update the theory content on the Topic row
    const theoryMd = fs.readFileSync(path.join(contentDir, 'theory.md'), 'utf-8')
    await prisma.topic.update({
      where: { id: bigOTopic.id },
      data: { theoryContent: theoryMd },
    })
    console.log('✓ Updated theoryContent for Big-O topic.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
