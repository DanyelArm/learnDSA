import { Router } from 'express'
import { listTopics } from '../controllers/topicsController'

const router = Router()

router.get('/', listTopics)

export default router
