import { z } from 'zod'
const bodyValidator = z.object({
  title: z.string().trim(),
  description: z.string().trim()
})
type BodyValidator = z.infer<typeof bodyValidator>

const copyFlashcardValidator = z.object({
  shareCode: z.string().trim(),
  userId: z.string().trim()
})

type CopyFlashcardValidator = z.infer<typeof copyFlashcardValidator>

export {
  bodyValidator,
  type BodyValidator,
  copyFlashcardValidator,
  type CopyFlashcardValidator
}
