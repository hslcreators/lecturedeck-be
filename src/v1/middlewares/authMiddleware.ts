import Jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { UnAuthorizedError } from '../errors/httpErrors'
import { type NextFunction } from 'express'
import { prisma } from '../config/db'
type AuthHeaders = Headers & {
  'x-auth-token': string
}
const auth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const headers = (req.headers as AuthHeaders)['x-auth-token']
    //The token is received like this  "Bearer Token" where the Token is the actual JsonWebToken.
    const token = headers?.split(' ')[1]
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!token) {
      throw new UnAuthorizedError('A Token is required for Authentication!')
    }
    const decoded = Jwt.verify(token, process.env.JWT_SECRET as string)
    const user = await prisma.user.findUnique({
      where: { userId: (decoded as UserToken)?.userId },
      select: {
        email: true,
        username: true,
        userId: true,
        joinedAt: true
      }
    })
    if (user == null) {
      throw new UnAuthorizedError('no user exists with this token!')
    }
    (req as UserPayload & Request).user = user
    next()
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      next(new UnAuthorizedError('Token is invalid'))
    } else if (err instanceof TokenExpiredError) {
      next(new UnAuthorizedError('Token has expired'))
    } else {
      next(err)
    }
  }
}
export default auth
