import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'

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
                const account = await prisma.account.findUnique({
                    where: { accountNumber },
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
