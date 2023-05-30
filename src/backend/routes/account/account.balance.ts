import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'
import { getUser } from '../../utils/session.utils'

export default {
    method: 'get',
    path: '/api/account/balance',
    validators: [authorize, body('accountNumber').not().isEmpty()],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.CREATED,
            messages: {},
            execute: async () => {
                const { accountNumber } = req.body
                const { ...userSession } = getUser()
                const userId = userSession.userId
                // Find sender's account
                const account = await prisma.account.findFirst({
                    where: {
                        AND: [
                            { userID: userId },
                            { accountNumber: accountNumber },
                        ],
                    },
                })

                if (!account) {
                    throw new Error('Account not found')
                }

                return { balance: account.balance }
            },
        }),
} as TRoute
