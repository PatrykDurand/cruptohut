import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import {body} from 'express-validator'


export default {
    method: 'patch',
    path: '/api/user/edit',
    validators: [
        authorize,
        body().custom(body => {
            const keys = Object.keys(body)
            const validUpdates = [ 'userId','email', 'name', 'surname', 'address', 'birthDate', 'idCardNumber']
            return keys.every(key => validUpdates.includes(key))
        }).withMessage('Invalid fields in update')
    ],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.OK,
            messages: {},
            execute: async () => {

                const { userId , ...updates } = req.body

                const user = await prisma.user.update({
                    where: { userId: Number(userId) },
                    data: updates
                })

                if (!user) {
                    throw new Error('User not found')
                }

                return user
            },
        }),
} as TRoute