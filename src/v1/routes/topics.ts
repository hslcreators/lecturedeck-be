/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { shareFlashcard, copyFlashcard } from '../controllers/topics'

const router = express.Router()

router.get('/:topicId/flashcards/share', shareFlashcard)
router.post('/:topicId/flashcards/copy', copyFlashcard)

export default router
