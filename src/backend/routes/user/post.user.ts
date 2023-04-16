import { Request, Response } from 'express'
import { body } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { v4 } from 'uuid'
import { prisma } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/database'
import { TRoute } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/routes/types'
import { handleRequest } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/utils/request.utils'
import { createHash } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/utils/hash.utils'
import { authorize } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/utils/middleware.utils'
const SALT = (process.env.PASSWORD_SALT as string) ?? 'XYZ'
export default {
    method: 'post',
    path: '/api/user',
    validators: [
        authorize,
        body('email').isEmail(),
        body('password').not().isEmpty(),
    ],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.CREATED,
            messages: { uniqueConstraintFailed: 'Email must be unique.' },
            execute: async () => {
                const { email, name, password } = req.body
                const passwordHash = createHash(password, SALT)
                return await prisma.user.create({
                    data: {
                        id: v4(),
                        name,
                        email,
                        password: passwordHash,
                    },
                })
            },
        }),
} as TRoute
