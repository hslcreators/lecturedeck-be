import { type NextFunction, type Request, type Response } from 'express'
import { flashcardSchema, ratingSchema } from '../../validators/flashcards'
import { BadRequestError, NotFoundError, UnAuthorizedError } from '../errors/httpErrors'
import { prisma } from '../config/db'
import { generateColorCode } from '../utils/generateColorCode'

const validateFlashcardOwner = async (flashcardId: string, userId: string) => {
    // Find the flashcard
    const foundFlashcard = await prisma.flashcards.findUnique({
      where: {
        flashcard_id: flashcardId,
      },
    });
  
    if (foundFlashcard === null) {
      throw new NotFoundError('Flashcard does not exist!');
    }
  
    // Check if the user owns this flashcard
    const userTopic = await prisma.topic.findUnique({
      where: {
        topicId: foundFlashcard.topicId,
        userId: userId,
      },
    });
  
    if (userTopic === null) {
      throw new UnAuthorizedError('User does not own this flashcard!');
    }
  
    // Return the found flashcard 
    return foundFlashcard;
  };
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
    const {user} = req as Request & UserPayload
    const { flashcardId } = req.params
    // might be a redundant check
    if (flashcardId === undefined || typeof flashcardId !== 'string') {
      throw new BadRequestError('flashcardId is missing')
    }
    // validate flashcard owner
    await validateFlashcardOwner(flashcardId, user.userId);
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
    // get logged in user
    const {user} = req as Request & UserPayload;
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
    // validate flashcard owner
     await validateFlashcardOwner(flashcardId, user.userId);
    // update the rating
    const updatedFlashcard = await prisma.flashcards.update({
      where: {
        flashcard_id: flashcardId
      },
      data: {
        rating,
        updatedAt: new Date()
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
    // get logged in user
    const {user} = req as Request & UserPayload;
    // read req parameter
    const { flashcardId } = req.params
    // validate flashcard owner
    await validateFlashcardOwner(flashcardId, user.userId);
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
