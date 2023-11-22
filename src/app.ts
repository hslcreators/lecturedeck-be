/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import cors from 'cors'
import ApiRouter from './v1/routes'
import { errorHandler } from './v1/middlewares/errorMiddleware'
import { NotFoundError } from './v1/errors/httpErrors'
import morgan from 'morgan'
const app = express()

const Whitelist = ['http://localhost:5173/']
app.use(express.json())
app.use(cors({ origin: Whitelist, exposedHeaders: 'X-Auth-Token' }))
app.use(morgan('dev'))
app.use('/api/v1', ApiRouter)
// catch all route
app.use((req, _res, next) => {
  next(new NotFoundError(`invalid route! ${req.url}`))
})
app.use(errorHandler)
export default app
