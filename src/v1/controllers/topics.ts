/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import type { Request, Response, NextFunction } from 'express'
import { BadRequestError } from '../errors/httpErrors'
import { prisma } from '../config/db'
import genHash from '../utils/genHash'
import { v4 as uuidv4 } from 'uuid'
// import type { Flashcards } from '@prisma/client'
import { bodyValidator, copyFlashcardValidator } from '../../validators/topic'

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
      throw new BadRequestError('Topic not found')
    }

    // generate share code if it does not exist
    if (topic.shareCode == null) {
      const shareCode = genHash(10)

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

    const isBodyValid = copyFlashcardValidator.safeParse({ shareCode, userId })
    if (!isBodyValid.success) {
      throw new BadRequestError(isBodyValid.error.format() as unknown as string)
    }

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

/**
 * @method GET
 * @route  /topics?page=:page
 * @param req
 * @param res
 */

const getTopics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1 } = req.query
    const { user } = req as UserPayload & Request

    const pageNumber = Number(page)

    // check if page query is a number
    if (isNaN(pageNumber)) {
      throw new BadRequestError('Page query must be a number')
    }

    // check if page query is a positive number
    if (pageNumber <= 0) {
      throw new BadRequestError('Page query must be a positive number')
    }

    // check for total topics
    const totalTopics = await prisma.topic.count({
      where: { userId: user.userId }
    })

    // calculate max page number
    const maxPageNumber = Math.ceil(totalTopics / 10)

    // check if page query is greater than max page number
    if (pageNumber > maxPageNumber) {
      throw new BadRequestError(
        `Page query exceeds max page number of ${maxPageNumber}`
      )
    }

    const topics = await prisma.topic.findMany({
      where: { userId: user.userId },
      skip: (pageNumber - 1) * 10,
      take: 10
    })

    const pageSize = topics.length

    res.status(200).json({
      data: topics,
      status: 'success',
      page: pageNumber,
      pages: maxPageNumber,
      pageSize
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @method GET
 * @route  /topics/:topicId/flashcards
 * @param req
 * @param res
 */

const getFlashCards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topicId } = req.params
    const { user } = req as UserPayload & Request

    if (topicId == null) {
      throw new BadRequestError('no parameter topicId')
    }

    // check if user as the topic in their record
    const topic = await prisma.topic.findUnique({
      where: { topicId, userId: user.userId }
    })

    if (topic == null) {
      throw new BadRequestError('User does not have the topic')
    }

    const flashcards = await prisma.flashcards.findMany({
      where: {
        topicId
      }
    })

    // check if no flashcards
    if (flashcards.length === 0) {
      throw new BadRequestError('No flashcards for the topic')
    }

    res.status(200).json({ data: flashcards, status: 'success' })
  } catch (err) {
    next(err)
  }
}

/**
 * @method POST
 * @route  /topics/manual-create
 * @param req
 * @param res
 */

const createTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description } = req.body
    const { user } = req as UserPayload & Request

    // check if body is valid
    const isBodyValid = bodyValidator.safeParse({ title, description })
    if (!isBodyValid.success) {
      throw new BadRequestError(isBodyValid.error.format() as unknown as string)
    }

    // name and description doesnt uniquely identify a topic so we  check if topic already exists

    const topic = await prisma.topic.create({
      data: {
        name: title,
        description,
        userId: user.userId
      }
    })

    // send created topic back to user
    res.status(200).json({ topic, status: 'success' })
  } catch (err) {
    next(err)
  }
}

/**
 * @method DELETE
 * @route  /topics/:topicId
 * @param req
 * @param res
 */

const deleteTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topicId } = req.params
    const { user } = req as UserPayload & Request

    if (topicId == null) {
      throw new BadRequestError('no parameter topicId')
    }

    // check if user as the topic in their record
    const topic = await prisma.topic.findUnique({
      where: { topicId, userId: user.userId }
    })

    if (topic == null) {
      throw new BadRequestError('User does not have the topic')
    }

    // delete topic
    await prisma.topic.delete({
      where: { topicId }
    })

    res.status(200).json({ status: 'success', message: 'Topic deleted' })
  } catch (err) {
    next(err)
  }
}

/**
 * @method PATCH
 * @route   /topics/:topicId
 * @param req
 * @param res
 */

const updateTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description } = req.body
    const { topicId } = req.params
    const { user } = req as UserPayload & Request

    if (topicId == null) {
      throw new BadRequestError('no parameter topicId')
    }

    //  check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { topicId, userId: user.userId }
    })

    if (topic == null) {
      throw new BadRequestError('User does not have the topic')
    }

    let updatedTopic

    // update topic
    if (title || description) {
      if (title) {
        updatedTopic = await prisma.topic.update({
          where: { topicId },
          data: { name: title }
        })
      }
      if (description) {
        updatedTopic = await prisma.topic.update({
          where: { topicId },
          data: { description }
        })
      }
    } else {
      throw new BadRequestError('No data to update')
    }

    res.status(200).json({ updatedTopic, status: 'success' })
  } catch (err) {
    next(err)
  }
}

export {
  shareFlashcard,
  copyFlashcard,
  getTopics,
  getFlashCards,
  createTopic,
  deleteTopic,
  updateTopic
}
