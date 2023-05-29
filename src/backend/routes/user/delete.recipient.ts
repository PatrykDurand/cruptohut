import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'

export default {
    method: 'delete',
    path: '/api/recipient/delete',
    validators: [
        authorize,
        body('userId').not().isEmpty(),
        body('recipientId').not().isEmpty(),
    ],

    handler: async (req: Request, res: Response): Promise<void> => {
        const { userId, recipientId } = req.body

        const user = await prisma.user.findUnique({
            where: { userId },
            include: { recipients: true },
        })

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' })
            return
        }

        const recipientIndex = user.recipients.findIndex(
            (recipient) => recipient.recipientId === recipientId,
        )

        if (recipientIndex === -1) {
            res.status(StatusCodes.NOT_FOUND).json({
                error: 'Recipient not found',
            })
            return
        }

        await prisma.recipient.delete({
            where: { recipientId },
        })

        res.status(StatusCodes.OK).json({ alert: 'recipient deleted' })
    },
} as TRoute
