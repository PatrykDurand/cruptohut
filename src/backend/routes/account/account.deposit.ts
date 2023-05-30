import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../types'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'
import { getUser } from '../../utils/session.utils'

export default {
    method: 'post',
    path: '/api/account/deposit',
    validators: [
        authorize,
        body('accountNumber').not().isEmpty(),
        body('source').not().isEmpty(),
        body('amount').isDecimal(),
    ],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.OK,
            messages: {},
            execute: async () => {
                const { accountNumber, source, amount } = req.body
                const { ...userSession } = getUser()
                const userId = userSession.userId

                const userAccount = await prisma.account.findFirst({
                    where: {
                        AND: [
                            { userID: userId },
                            { accountNumber: accountNumber },
                        ],
                    },
                })

                if (!userAccount) {
                    throw {
                        status: StatusCodes.NOT_FOUND,
                        message: 'Account not found',
                        isCustomError: true,
                    } as TCustomError
                }

                await prisma.account.update({
                    where: { accountId: userAccount.accountId },
                    data: {
                        balance: {
                            increment: parseFloat(amount).toFixed(2),
                        },
                    },
                })

                await prisma.transaction.create({
                    data: {
                        senderAccountId: userAccount.accountId,
                        recipientAccountNumber: accountNumber,
                        amount: amount,
                        date: new Date(),
                        title: `Money transfer from ${source}`,
                    },
                })

                return {
                    message: 'Transfer successful',
                }
            },
        }),
} as TRoute
