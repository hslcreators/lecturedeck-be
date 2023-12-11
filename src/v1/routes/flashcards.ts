import { Router } from 'express'
import {
  createFlashcard,
  deleteFlashcard,
  updateFlashcard,
  updateFlashcardRating
} from '../controllers/flashcards'
const router = Router()

router.post('/manual-create', createFlashcard)
router.patch('/:flashcardId', updateFlashcard)
router.patch('/:flashcardId/rating', updateFlashcardRating)
router.delete('/:flashcardId', deleteFlashcard)

export default router
