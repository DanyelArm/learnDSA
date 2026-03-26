import { PrismaClient } from '@prisma/client'
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
