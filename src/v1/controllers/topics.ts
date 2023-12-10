import type { Request, Response, NextFunction } from 'express'
import { BadRequestError } from '../errors/httpErrors'
import { prisma } from '../config/db'
import genCode from '../utils/genCode'
import { v4 as uuidv4 } from 'uuid'
// import type { Flashcards } from '@prisma/client'

/**
 * @method GET
 * @route /topic/:topicId/flashcards/share
 * @param req
 * @param res
 */

const shareFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topicId } = req.params

    // throw error if no parameter is provided
    if (topicId == null) throw new BadRequestError('Incomplete Parameter')

    const topic = await prisma.topic.findUnique({
      where: { topicId }
    })
    if (topic == null) {
      throw new BadRequestError('Invalid Parameter')
    }

    // generate share code if it does not exist
    if (topic.shareCode == null) {
      const shareCode = genCode()

      await prisma.topic.update({
        where: { topicId },
        data: { shareCode }
      })
      res.status(201).json({ shareCode })
    } else {
      res.status(201).json({ shareCode: topic.shareCode })
    }
  } catch (err) {
    next(err)
  }
}

/**
 * @method POST
 * @route  /topics/:topicId/flashcards/copy
 * @param req
 * @param res
 */

const copyFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topicId } = req.params
    const { shareCode, userId } = req.body

    // throw error if parameter or request body is not provided
    if (topicId == null || shareCode == null || userId == null) {
      throw new BadRequestError('Incomplete Parameter')
    }

    const topic = await prisma.topic.findUnique({
      where: { topicId }
    })
    const topicWithFlashcards = await prisma.topic.findUnique({
      where: { topicId },
      include: {
        Flashcards: true
      }
    })

    // throw error if topic does not exist
    if (topic == null || topicWithFlashcards == null) {
      throw new BadRequestError('Invalid Parameter')
    }

    // throw error if share code does not match or does not exist
    if (topic.shareCode !== shareCode) {
      throw new BadRequestError('Share code does not match')
    }

    const user = await prisma.user.findUnique({ where: { userId } })
    if (user == null) {
      throw new BadRequestError('User not found')
    }

    // check if the user already has the topic i.e the user is the owner of the topic
    const topicAlreadyExists = await prisma.user.findUnique({
      where: {
        userId,
        Topics: {
          some: {
            topicId
          }
        }
      }
    })
    if (topicAlreadyExists !== null) {
      throw new BadRequestError('Topic already exists in user account')
    }

    // check if the user already has already copied the topic before
    const topicAlreadyCopied = await prisma.user.findUnique({
      where: {
        userId,
        CopiedTopics: {
          some: {
            topicId
          }
        }
      }
    })

    if (topicAlreadyCopied !== null) {
      throw new BadRequestError('Topic already copied before')
    }

    // create a new topic with the same flashcards
    const NewTopicId = uuidv4()
    await prisma.topic.create({
      data: {
        ...topic,
        topicId: NewTopicId,
        shareCode: null,
        userId
      }
    })

    // copy flashcards from old topic to new topic but with new topic id
    await prisma.flashcards.createMany({
      data: topicWithFlashcards.Flashcards.map((flashcard) => ({
        ...flashcard,
        flashcard_id: uuidv4(),
        topicId: NewTopicId
      }))
    })

    // create a new copy logger to keep track of the user that copied the topic
    await prisma.copyLogger.create({
      data: {
        userId,
        topicId
      }
    })

    res.status(201).json({ topicId: NewTopicId, userId, status: 'success' })
  } catch (err) {
    next(err)
  }
}

export { shareFlashcard, copyFlashcard }
