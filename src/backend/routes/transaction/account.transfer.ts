import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'

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

                // Find sender's account
                const senderAccount = await prisma.account.findUnique({
                    where: { accountNumber: senderAccountNumber },
                })
                if (!senderAccount) {
                    throw new Error('Account not found')
                }
                if (senderAccount.accountStatus !== 'Active') {
                    throw new Error('Account is not active')
                }

                // Find recipient's account
                const recipientAccount = await prisma.account.findUnique({
                    where: { accountNumber: recipientAccountNumber },
                })
                if (!recipientAccount) {
                    throw new Error('Account not found')
                }
                if (recipientAccount.accountStatus !== 'Active') {
                    throw new Error('Account is not active')
                }

                // Check if sender has sufficient funds
                if (senderAccount.balance < amount) {
                    throw new Error('Insufficient funds')
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
                        title: 'Money transfer',
                    },
                })

                res.status(StatusCodes.OK).json({
                    message: 'Transfer successful',
                })
            },
        })
    },
} as TRoute
