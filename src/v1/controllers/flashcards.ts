import { type NextFunction, type Request, type Response } from 'express'

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
  } catch (err) {}
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
  } catch (err) {}
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
  } catch (err) {}
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
  } catch (err) {}
}

export {
  createFlashcard,
  deleteFlashcard,
  updateFlashcard,
  updateFlashcardRating
}
