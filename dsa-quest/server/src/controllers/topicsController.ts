import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prismaClient'

export async function listTopics(_req: Request, res: Response, next: NextFunction) {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        title: true,
        slug: true,
        description: true,
        visualizationType: true,
      },
    })
    res.json({ data: topics })
  } catch (err) {
    next(err)
  }
}
