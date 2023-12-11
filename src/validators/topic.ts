import { z } from 'zod'
const bodyValidator = z.object({
  title: z.string().trim(),
  description: z.string().trim()
})
type BodyValidator = z.infer<typeof bodyValidator>

export { bodyValidator, type BodyValidator }
