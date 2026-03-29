import { z } from 'zod'

export const QuizSubmitSchema = z.object({
  answers: z.array(z.number().int().min(0)).min(1),
})
export type QuizSubmitInput = z.infer<typeof QuizSubmitSchema>

export const ExerciseCompleteSchema = z.object({
  attempts: z.number().int().min(1).default(1),
})
export type ExerciseCompleteInput = z.infer<typeof ExerciseCompleteSchema>
