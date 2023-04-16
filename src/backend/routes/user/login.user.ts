import { Request, Response } from 'express'
import { body } from 'express-validator'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { prisma } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/database'
import { TRoute } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/routes/types'
import { handleRequest, TCustomError } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/utils/request.utils'
import { createHash } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/utils/hash.utils'
import { createToken } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/utils/jwt.utils'
const SALT = (process.env.PASSWORD_SALT as string) ?? 'XYZ'
const SECRET = (process.env.TOKEN_SECRET as string) ?? 'XYZ'
export default {
    method: 'get',
    path: '/api/login',
    validators: [body('email').isEmail(), body('password').not().isEmpty()],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.OK,
            responseFailStatus: StatusCodes.UNAUTHORIZED,
            execute: async () => {
                const { email, password } = req.body
                const passwordHash = createHash(password, SALT)
                const user = await prisma.user.findFirst({ where: { email } })
                const passwordValid = user
                    ? user.password === passwordHash
                    : false
                if (!user || !passwordValid)
                    throw {
                        status: StatusCodes.UNAUTHORIZED,
                        message: ReasonPhrases.UNAUTHORIZED,
                        isCustomError: true,
                    } as TCustomError
                return {
                    token: createToken(user, SECRET, '7d'),
                }
            },
        }),
} as TRoute
