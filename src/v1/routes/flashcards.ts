import { Router } from 'express'
import {
  createFlashcard,
  deleteFlashcard,
  updateFlashcard,
  updateFlashcardRating
} from '../controllers/flashcards'
import auth from '../middlewares/authMiddleware'
const router = Router()

router.use(auth)
router.post('/manual-create', createFlashcard)
router.patch('/:flashcardId', updateFlashcard)
router.patch('/:flashcardId/rating', updateFlashcardRating)
router.delete('/:flashcardId', deleteFlashcard)

export default router
