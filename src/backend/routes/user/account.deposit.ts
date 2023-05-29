import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'

export default {
    method: 'post',
    path: '/api/account/deposit',
    validators: [
        authorize,
        body('userId').isInt(),
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
                const { userId, accountNumber, source, amount } = req.body

                const userAccount = await prisma.account.findFirst({
                    where: {
                        AND: [
                            { userID: userId },
                            { accountNumber: accountNumber },
                        ],
                    },
                })

                if (!userAccount) {
                    throw new Error('Account not found')
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
                        senderAccountId: 1,
                        recipientAccountNumber: accountNumber,
                        amount: amount,
                        date: new Date(),
                        title: `Money transfer from ${source}`,
                    },
                })

                res.status(StatusCodes.OK).json({
                    message: 'Transfer successful',
                })
            },
        }),
} as TRoute
