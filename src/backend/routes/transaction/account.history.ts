import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'
import { getUser } from '../../utils/session.utils'

export default {
    method: 'get',
    path: '/api/account/transaction-history',
    validators: [authorize, body('accountNumber').not().isEmpty()],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.OK,
            messages: { uniqueConstraintFailed: 'Account not found' },
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
                    throw {
                        status: StatusCodes.BAD_REQUEST,
                        message: 'Account not found',
                        isCustomError: true,
                    } as TCustomError
                }

                const transactions = await prisma.transaction.findMany({
                    where: {
                        OR: [
                            { senderAccountId: account.accountId },
                            { recipientAccountNumber: account.accountNumber },
                        ],
                    },
                })

                return transactions
            },
        }),
} as TRoute
