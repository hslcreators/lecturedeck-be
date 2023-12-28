import {z} from "zod"
enum Rating {
    VERY_BAD = 'VERY_BAD',
    BAD = 'BAD',
    NEUTRAL = 'NEUTRAL',
    GOOD = 'GOOD',
    VERY_GOOD = 'VERY_GOOD',
  }
const validRatings = [
    Rating.VERY_BAD,
    Rating.BAD,
    Rating.NEUTRAL,
    Rating.GOOD,
    Rating.VERY_GOOD,
  ] as const;
const flashcardSchema = z.object({
    question: z.string().min(5),
    answer: z.string(),
    topicId: z.string()
});
const ratingSchema = z.enum(validRatings)
type Flashcard = z.infer<typeof flashcardSchema>;
export {
    flashcardSchema,
    ratingSchema,
    Rating,
    type Flashcard
}