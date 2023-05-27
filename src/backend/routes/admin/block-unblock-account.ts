import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'
import {body} from "express-validator";



export default {
    method: 'post',
    path: '/api/admin/toggleaccountstatus',
    validators: [
        authorize,
        body('accountNumber').not().isEmpty(),
    ],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.CREATED,
            messages: { uniqueConstraintFailed: 'User not found' },
            execute: async () => {

                const { accountNumber } = req.body
                const account = await prisma.account.findUnique({
                    where: { accountNumber }
                });

                if (!account) {
                    throw new Error('Account not found');
                }

                return await prisma.account.update({

                    where: {accountId: account.accountId},
                    data:{
                        accountStatus: account.accountStatus === 'Active' ? 'Blocked' : 'Active',
                    }

                })


            },

        }),

} as TRoute