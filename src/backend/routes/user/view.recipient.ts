import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'

export default {
    method: 'get',
    path: '/api/recipient/view',
    validators: [authorize],
    handler: async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.body

        const user = await prisma.user.findUnique({
            where: { userId },
            include: { recipients: true },
        })

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' })
            return
        }

        res.status(StatusCodes.OK).json(user.recipients)
    },
} as TRoute
