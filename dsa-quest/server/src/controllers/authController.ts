import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prismaClient'
import { signToken } from '../lib/jwt'
import { AppError } from '../middleware/errorHandler'
import type { RegisterInput, LoginInput } from '../schemas/authSchemas'

function safeUser(user: { id: number; username: string; email: string; xp: number; level: number; currentTopicId: number | null }) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    xp: user.xp,
    level: user.level,
    currentTopicId: user.currentTopicId,
  }
}

export async function register(
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { username, email, password } = req.body

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      throw new AppError(
        409,
        existing.email === email ? 'Email already in use' : 'Username already taken',
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    })

    const token = signToken({ sub: user.id, email: user.email })
    res.status(201).json({ token, user: safeUser(user) })
  } catch (err) {
    next(err)
  }
}

export async function login(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new AppError(401, 'Invalid credentials')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'Invalid credentials')
    }

    const token = signToken({ sub: user.id, email: user.email })
    res.json({ token, user: safeUser(user) })
  } catch (err) {
    next(err)
  }
}
