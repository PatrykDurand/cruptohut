import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../types'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'
import { getUser } from '../../utils/session.utils'

export default {
    method: 'patch',
    path: '/api/user/edit',
    validators: [
        authorize,
        body()
            .custom((body) => {
                const keys = Object.keys(body)
                const validUpdates = [
                    'userId',
                    'email',
                    'name',
                    'surname',
                    'address',
                    'birthDate',
                    'idCardNumber',
                ]
                return keys.every((key) => validUpdates.includes(key))
            })
            .withMessage('Invalid fields in update'),
    ],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.OK,
            messages: {},
            execute: async () => {
                const { ...updates } = req.body
                const { ...userSession } = getUser()
                const userId = userSession.userId

                const user = await prisma.user.update({
                    where: { userId: Number(userId) },
                    data: updates,
                })

                if (!user) {
                    throw {
                        status: StatusCodes.NOT_FOUND,
                        message: 'User not found',
                        isCustomError: true,
                    } as TCustomError
                }

                return user
            },
        }),
} as TRoute
