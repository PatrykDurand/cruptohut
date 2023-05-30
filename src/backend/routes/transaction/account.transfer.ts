import { Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'
import { getUser } from '../../utils/session.utils'

export default {
    method: 'post',
    path: '/api/transfer',
    validators: [
        authorize,
        body('senderAccountNumber').not().isEmpty(),
        body('recipientAccountNumber').not().isEmpty(),
        body('amount').isFloat({ gt: 0 }),
    ],
    handler: async (req: Request, res: Response): Promise<void> => {
        await handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.CREATED,
            execute: async () => {
                const { senderAccountNumber, recipientAccountNumber, amount } =
                    req.body
                const { ...userSession } = getUser()
                const userId = userSession.userId
                // Find sender's account
                const senderAccount = await prisma.account.findFirst({
                    where: {
                        AND: [
                            { userID: userId },
                            { accountNumber: senderAccountNumber },
                        ],
                    },
                })
                if (!senderAccount) {
                    throw {
                        status: StatusCodes.BAD_REQUEST,
                        message: 'Account not found',
                        isCustomError: true,
                    } as TCustomError
                }
                if (senderAccount.accountStatus !== 'Active') {
                    throw {
                        status: StatusCodes.BAD_REQUEST,
                        message: 'Account is not active',
                        isCustomError: true,
                    } as TCustomError
                }

                // Find recipient's account
                const recipientAccount = await prisma.account.findUnique({
                    where: { accountNumber: recipientAccountNumber },
                })
                if (!recipientAccount) {
                    throw {
                        status: StatusCodes.BAD_REQUEST,
                        message: 'Account not found',
                        isCustomError: true,
                    } as TCustomError
                }
                if (recipientAccount.accountStatus !== 'Active') {
                    throw {
                        status: StatusCodes.BAD_REQUEST,
                        message: 'Account is not active',
                        isCustomError: true,
                    } as TCustomError
                }

                // Check if sender has sufficient funds
                if (senderAccount.balance < amount) {
                    throw {
                        status: StatusCodes.BAD_REQUEST,
                        message: 'Insufficient funds',
                        isCustomError: true,
                    } as TCustomError
                }

                // Check if the latest session record is Active or Blocked
                const latestSession = await prisma.session.findFirst({
                    orderBy: { time: 'desc' },
                })
                if (!latestSession) {
                    throw {
                        status: StatusCodes.UNAUTHORIZED,
                        message: 'Session not found',
                        isCustomError: true,
                    } as TCustomError
                }
                if (latestSession.status === 'Blocked') {
                    throw {
                        status: StatusCodes.FORBIDDEN,
                        message: 'Session is blocked',
                        isCustomError: true,
                    } as TCustomError
                }

                // Update account balances
                await prisma.account.update({
                    where: { accountId: senderAccount.accountId },
                    data: { balance: Number(senderAccount.balance) - amount },
                })
                await prisma.account.update({
                    where: { accountId: recipientAccount.accountId },
                    data: {
                        balance: Number(recipientAccount.balance) + amount,
                    },
                })

                // Create transaction record
                await prisma.transaction.create({
                    data: {
                        senderAccountId: senderAccount.accountId,
                        recipientAccountNumber: recipientAccountNumber,
                        amount: amount,
                        date: new Date(),
                        title: `Money transfer from ${senderAccount.accountNumber} to ${recipientAccount.accountNumber}`,
                    },
                })

                return {
                    message: 'Transfer successful',
                }
            },
        })
    },
} as TRoute
