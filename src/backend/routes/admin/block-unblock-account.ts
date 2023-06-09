import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../types'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import { body } from 'express-validator'

export default {
    method: 'post',
    path: '/api/admin/toggleaccountstatus',
    validators: [authorize, body('accountNumber').not().isEmpty()],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.CREATED,
            messages: { uniqueConstraintFailed: 'User not found' },
            execute: async () => {
                const { accountNumber } = req.body
                const account = await prisma.account.findUnique({
                    where: { accountNumber },
                })

                if (!account) {
                    throw {
                        status: StatusCodes.NOT_FOUND,
                        message: 'Account not found',
                        isCustomError: true,
                    } as TCustomError
                }

                return await prisma.account.update({
                    where: { accountId: account.accountId },
                    data: {
                        accountStatus:
                            account.accountStatus === 'Active'
                                ? 'Blocked'
                                : 'Active',
                    },
                })
            },
        }),
} as TRoute
