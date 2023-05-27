import { Request, Response } from 'express'
import { body } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../../routes/types'
import { handleRequest } from '../../utils/request.utils'
import { authorize } from '../../utils/middleware.utils'

export default {
    method: 'post',
    path: '/api/recipients/add',
    validators: [
        authorize,
        body('userID').isNumeric(),
        body('name').not().isEmpty(),
        body('surname').not().isEmpty(),
        body('accountNumber').not().isEmpty(),
        body('trusted').isBoolean(),
    ],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.CREATED,
            execute: async () => {
                const { userID, name, surname, accountNumber, trusted } =
                    req.body
                return await prisma.recipient.create({
                    data: {
                        userID,
                        name,
                        surname,
                        accountNumber,
                        trusted: Boolean(trusted),
                    },
                })
            },
        }),
} as TRoute
