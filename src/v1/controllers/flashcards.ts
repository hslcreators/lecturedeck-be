import { type NextFunction, type Request, type Response } from 'express'
import { flashcardSchema, ratingSchema } from '../../validators/flashcards'
import { BadRequestError, NotFoundError } from '../errors/httpErrors'
import { prisma } from '../config/db'
import { generateColorCode } from '../utils/generateColorCode'

/**
 * @method POST
 * @param req
 * @param res
 * @param next
 * @route /flashcards/manual-create
 */
const createFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // read the body
    const { question, answer, topicId } = req.body
    // validate the body
    const validatedFlashcard = flashcardSchema.safeParse({
      question,
      answer,
      topicId
    })
    // throw the error to the error handler
    if (!validatedFlashcard.success) {
      throw new BadRequestError(
        validatedFlashcard.error.format() as unknown as string
      )
    }
    // generate the color code
    const colorCode = generateColorCode()
    // create the flashcard
    const createdFlashcard = await prisma.flashcards.create({
      data: {
        answer,
        colorCode,
        question,
        topicId,
        rating: 'NEUTRAL'
      }
    })
    // send the created flashcard back to the client.
    res.status(201).json({
      flashcard: {
        answer,
        colorCode,
        question,
        topicId,
        rating: 'NEUTRAL',
        createdAt: createdFlashcard.createdAt
      },
      status: 'success'
    })
  } catch (err) {
    next(err)
  }
}
/**
 * @method DELETE
 * @param req
 * @param res
 * @param next
 * @route /flashcards/:flashcardId
 */
const deleteFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { flashcardId } = req.params
    // might be a redundant check
    if (flashcardId === undefined || typeof flashcardId !== 'string') {
      throw new BadRequestError('flashcardId is missing')
    }
    // delete the requested flashcard
    const deletedFlashcard = await prisma.flashcards.delete({
      where: {
        flashcard_id: flashcardId
      }
    })
    // if flashcard does not exist.
    if (!deletedFlashcard) {
      throw new NotFoundError('flashcard does not exist')
    }
    res.status(202).json({
      status: 'success',
      flashcardId
    })
  } catch (err) {
    next(err)
  }
}
/**
 * @method PATCH
 * @param req
 * @param res
 * @param next
 * @route /flashcards/:flashcardId/rating
 */
const updateFlashcardRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get flashcard id
    const { flashcardId } = req.params
    // read the body
    const { rating } = req.body
    // validate it
    const validatedRating = ratingSchema.safeParse({
      rating
    })
    // throw the error to the error handler
    if (!validatedRating.success) {
      throw new BadRequestError(
        validatedRating.error.format() as unknown as string
      )
    }
    // update the rating
    const updatedFlashcard = await prisma.flashcards.update({
      where: {
        flashcard_id: flashcardId
      },
      data: {
        rating
      }
    })
    res.status(200).json({
      flashcardRating: updatedFlashcard.rating,
      status: 'success'
    })
  } catch (err) {
    next(err)
  }
}
/**
 * @method PUT
 * @param req
 * @param res
 * @param next
 * @route /flashcards/:flashcardId
 */
const updateFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // read req parameter
    const { flashcardId } = req.params
    // find a unique flashcard
    const flashcard = await prisma.flashcards.findUnique({
      where: {
        flashcard_id: flashcardId
      },
      select: {
        answer: true,
        question: true
      }
    })
    if (flashcard === null) {
      throw new BadRequestError('flashcard not found!')
    }
    const answer = req.body?.answer || flashcard.answer
    const question = req.body?.question || flashcard.question
    let updatedAt
    // update updated_at based on if anything was changed
    if (answer !== flashcard.answer || question !== flashcard.question) {
      updatedAt = new Date()
    }
    const updatedFlashcards = await prisma.flashcards.update({
      where: {
        flashcard_id: flashcardId
      },
      data: {
        question,
        answer,
        updatedAt
      }
    })
    res.status(200).json({
      flashcards: updatedFlashcards,
      status: 'success'
    })
  } catch (err) {
    next(err)
  }
}

export {
  createFlashcard,
  deleteFlashcard,
  updateFlashcard,
  updateFlashcardRating
}
