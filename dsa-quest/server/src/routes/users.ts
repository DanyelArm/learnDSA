import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { getMe } from '../controllers/usersController'

const router = Router()

router.get('/me', authenticate, getMe)

export default router
