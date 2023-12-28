import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db'
import { signup } from '../../validators/auth'
import bcrypt from 'bcrypt'
import createToken from '../utils/createToken'
import { BadRequestError, UnAuthorizedError } from '../errors/httpErrors'
import { z } from 'zod'
import genHash from '../utils/genHash'
import { sendMail } from '../utils/sendMail'
/**
 * @method POST
 * @route /api/v1/auth/register
 * @param req
 * @param res
 */
const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // read the body from the Request.
    const { email, username, password } = req.body
    console.log(email, password, username)
    // validate the body for correct data.
    const validatedUser = signup.safeParse({
      email,
      username,
      password
    })
    // throw the error to the error handler
    if (!validatedUser.success) {
      throw new BadRequestError(
        validatedUser.error.format() as unknown as string
      )
    }
    // check if we have the provided email or username in the db.
    const users = await prisma.user.count({
      where: { OR: [{ email }, { username }] }
    })
    if (users > 0) {
      throw new BadRequestError('The username or email already exists!')
    }
    // hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // create the user
    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username
      }
    })
    // create a token - which is just their id (keep it light.)
    const token = createToken({ userId: createdUser.userId })
    // send the created user data and token back to the client.
    res.status(201).json({
      user: {
        email: createdUser.email,
        username: createdUser.username,
        joinedAt: createdUser.joinedAt,
        userId: createdUser.userId
      },
      message: 'Successfully created the user.',
      token
    })
  } catch (err) {
    next(err)
  }
}
/**
 * @method POST
 * @route /api/v1/auth/login
 */
const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // read response data
    const { email, password } = req.body
    // find a user with the unique email
    const user = await prisma.user.findUnique({ where: { email } })
    if (user == null) {
      throw new UnAuthorizedError('User could not be authorized')
    }
    // compare the password with what is in the db.
    const isPassword = await bcrypt.compare(password, user.password)
    if (!isPassword) throw new BadRequestError('password does not match')
    // create a token - which is just their id (keep it light.)
    const token = createToken({ userId: user.userId })
    // send user data and token back to the client.
    res.status(201).json({
      user: {
        email: user.email,
        username: user.username,
        joinedAt: user.joinedAt,
        userId: user.userId
      },
      message: 'Successfully logged in user.',
      token
    })
  } catch (err) {
    next(err)
  }
}
/**
 * @method PATCH
 * @route /api/v1/auth/password-reset
 */
const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // validate email
    const emailValidator = z.object({
      email: z.string().email().trim()
    })
    const { email } = req.body
    const isValidEmail = emailValidator.safeParse({ email })
    if (!isValidEmail.success) {
      throw new BadRequestError(
        isValidEmail.error.format() as unknown as string
      )
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (user == null) {
      throw new BadRequestError(
        'a user with the given email address does not exist!'
      )
    }

      // set a 30 minutes expiration Time
      const now = new Date()
      const expirationTime = new Date(now.getTime() + (30 * 60 * 1000)) // add 30 minutes in milliseconds
      const hash = genHash(32);
      let createdToken = await prisma.token.upsert({
        where : {
          userId: user.userId
        },
        create: {
          userId: user.userId,
          token: hash,
          expires_at: expirationTime
        },
        update: {
          token: hash,
          expires_at: expirationTime
        }
      })
    
    const html = `<h3>Lecture Deck</h3> <h1>Password Reset </h1> <div> <p>a password change was requested for your account, please click the button below to reset your password </p> <p>Note: <strong>the link expires in 30 minutes</strong></p> <a href="${process.env.BASE_URL}/password-reset/${user.userId}/${createdToken.token}" style="padding: 12px 10px;color:white;background-color:#3583e8;border-radius:6px;text-decoration: none;font-size: 17px;margin-top: 6px;display: block;max-width: fit-content;">Reset password</a> </div>`
    await sendMail(user.email, 'Password Reset Email', html)
    res.status(201).json({ message: 'Successfully sent a reset email', createdToken })
  } catch (err) {
    next(err)
  }
}
/**
 * @method PATCH
 * @route /api/v1/password-reset/:userId/:token
 * @param req 
 * @param res 
 * @param next 
 */
const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // vaidate password
    const passwordValidator = z.object({
      password: z.string().min(8).max(255)
    })
    const { password } = req.body
    const isValidPassword = passwordValidator.safeParse({ password })
    if (!isValidPassword.success) {
      throw new BadRequestError(
        isValidPassword.error.format() as unknown as string
      )
    }
    // find the user
    const user = await prisma.user.findUnique({
      where: { userId: req.params.userId }
    })
    if (user == null) {
      throw new BadRequestError('invalid link or expired')
    }
    // check if the  user has a token.
    const q = {
      where: { AND: [{ userId: user.userId, token: req.params.token }] }
    }
    const token = await prisma.token.findFirst(q)
    if (token == null) {
      throw new BadRequestError('invalid link or expired')
    }
    // check if it has expired
    const currentTime = new Date()
    const hasExpired = currentTime > token.expires_at
    // delete the token either ways (not a bug)
    await prisma.token.delete({ where: { token_id: token.token_id } })
    if (hasExpired) {
      throw new BadRequestError('expired token, try generating a new one!')
    } else {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      await prisma.user.update({
        where: { userId: user.userId },
        data: {
          password: hashedPassword
        }
      })
      const jwtToken = createToken({ userId: user.userId })
      res.status(200).json({
        user: {
          email: user.email,
          username: user.username,
          joinedAt: user.joinedAt,
          userId: user.userId
        },
        message: 'successfull reset password',
        token: jwtToken
      })
    }
  } catch (err) {
    next(err)
  }
}

export { loginUser, createUser, resetPassword, updatePassword }
