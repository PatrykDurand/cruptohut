import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../types'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { getUser } from '../../utils/session.utils'

export default {
    method: 'get',
    path: '/api/recipient/view',
    validators: [authorize],
    handler: async (req: Request, res: Response): Promise<void> => {
        await handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.OK,
            responseFailStatus: StatusCodes.UNAUTHORIZED,
            execute: async () => {
                const { ...userSession } = getUser()
                const userId = userSession.userId
                const user = await prisma.user.findUnique({
                    where: { userId },
                    include: { recipients: true },
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
