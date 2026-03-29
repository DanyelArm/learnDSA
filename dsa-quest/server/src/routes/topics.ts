import { Router } from 'express'
import { listTopics, getProgress, submitQuiz, completeExercise } from '../controllers/topicsController'
import { authenticate } from '../middleware/authenticate'
import { validate } from '../middleware/validate'
import { QuizSubmitSchema, ExerciseCompleteSchema } from '../schemas/topicSchemas'

const router = Router()

router.get('/', listTopics)
router.get('/:id/progress', authenticate, getProgress)
router.post('/:id/quiz', authenticate, validate(QuizSubmitSchema), submitQuiz)
router.post('/:id/exercise/:stage', authenticate, validate(ExerciseCompleteSchema), completeExercise)

export default router
