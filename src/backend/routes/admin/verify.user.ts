import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../types'
import { handleRequest } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'

function generateAccountNumber() {
    return Math.floor(100000000 + Math.random() * 900000000).toString()
}

export default {
    method: 'post',
    path: '/api/admin/accountverify',
    validators: [
        authorize,
        body('userId').not().isEmpty(),
        body('accountType').not().isEmpty(),
    ],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.CREATED,
            messages: { uniqueConstraintFailed: 'User not found' },
            execute: async () => {
                const { userId, accountType } = req.body

                let accountNumber = generateAccountNumber().toString()
                let existingAccount = await prisma.account.findUnique({
                    where: { accountNumber },
                })

                while (existingAccount) {
                    accountNumber = generateAccountNumber().toString()
                    existingAccount = await prisma.account.findUnique({
                        where: { accountNumber },
                    })
                }

                const account = await prisma.account.create({
                    data: {
                        accountNumber,
                        accountType,
                        user: {
                            connect: { userId },
                        },
                    },
                })

                return await prisma.user.update({
                    where: { userId },
                    data: {
                        isVerified: true,
                    },
                    include: {
                        accounts: true,
                    },
                })
            },
        }),
} as TRoute
