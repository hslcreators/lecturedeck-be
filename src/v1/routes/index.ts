import express from 'express'
import auth from './auth'
import topics from './topics'
import flashcards from './flashcards'
const Router = express.Router()
Router.get('/', (_req, res) => {
  res.json({ message: 'welcome to v1 of the letureDeck api!' })
})
Router.use('/auth', auth)
Router.use('/topics', topics)
Router.use('/flashcards', flashcards)
export default Router
