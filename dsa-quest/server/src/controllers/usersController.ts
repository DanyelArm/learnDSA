import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prismaClient'
import { AppError } from '../middleware/errorHandler'

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        xp: true,
        level: true,
        currentTopicId: true,
        createdAt: true,
      },
    })

    if (!user) throw new AppError(404, 'User not found')
    res.json({ data: user })
  } catch (err) {
    next(err)
  }
}
