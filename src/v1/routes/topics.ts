/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import {
  shareFlashcard,
  copyFlashcard,
  getTopics,
  getFlashCards,
  createTopic,
  deleteTopic,
  updateTopic
} from '../controllers/topics'
import auth from '../middlewares/authMiddleware'

const router = express.Router()

router.get('/:topicId/flashcards/share', shareFlashcard)
router.post('/:topicId/flashcards/copy', copyFlashcard)
router.use(auth as any)
router.get('/', getTopics)
router.get('/:topicId/flashcards', getFlashCards)
router.post('/manual-create', createTopic)
router.delete('/:topicId', deleteTopic)
router.patch('/:topicId', updateTopic)

export default router
