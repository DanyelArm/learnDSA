import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'
import { AppError } from './errorHandler'

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string }
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Unauthorized')
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyToken(token)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch {
    throw new AppError(401, 'Unauthorized')
  }
}
