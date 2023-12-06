/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { createUser, loginUser, resetPassword, updatePassword } from '../controllers/auth'
const router = Router()

router.post('/login', loginUser)
router.post('/register', createUser)
router.patch('/password-reset', resetPassword)
router.patch('/password-reset/:userId/:token', updatePassword)

export default router