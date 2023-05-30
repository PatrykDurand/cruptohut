import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'
import { getUser } from '../../utils/session.utils'

export default {
    method: 'post',
    path: '/api/recipient/add',
    validators: [
        authorize,
        body('name').not().isEmpty(),
        body('surname').not().isEmpty(),
        body('accountNumber').not().isEmpty(),
    ],
    handler: async (req: Request, res: Response): Promise<void> => {
        await handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.OK,
            responseFailStatus: StatusCodes.UNAUTHORIZED,
            execute: async () => {
                const { name, surname, accountNumber } = req.body
                const { ...userSession } = getUser()
                const userId = userSession.userId

                const user = await prisma.user.findUnique({
                    where: { userId },
                    include: { recipients: true },
                })

                if (!user) {
                    res.status(StatusCodes.NOT_FOUND).json({
                        error: 'User not found',
                    })
                    return
                }

                const recipient = await prisma.recipient.create({
                    data: {
                        name,
                        surname,
                        accountNumber,
                        trusted: true,
                        user: {
                            connect: { userId },
                        },
                    },
                })

                if (!user) {
                    throw {
                        status: StatusCodes.NOT_FOUND,
                        message: 'User not found',
                        isCustomError: true,
                    } as TCustomError
                }

                return {
                    message: user.recipients,
                }
            },
        })
    },
} as TRoute
