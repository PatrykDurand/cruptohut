import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../types'
import { authorize } from '../../utils/middleware.utils'
import { body, validationResult } from 'express-validator'
import { getCurrencyRate } from '../../utils/nbp.utils'
import { getUser } from '../../utils/session.utils'

export default {
    method: 'get',
    path: '/api/account/balance/convertCurrency',
    validators: [
        authorize,
        body('accountNumber').not().isEmpty(),
        body('currencyCode').not().isEmpty(),
    ],
    handler: async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() })
            return
        }

        try {
            const { accountNumber, currencyCode } = req.body
            const { ...userSession } = getUser()
            const userId = userSession.userId
            const account = await prisma.account.findFirst({
                where: {
                    AND: [{ userID: userId }, { accountNumber: accountNumber }],
                },
            })

            if (!account) {
                throw new Error('Account not found')
            }

            const currencyRate = await getCurrencyRate(currencyCode)
            const balanceInCurrency = Number(account.balance) / currencyRate

            const response = {
                balanceInCurrency: balanceInCurrency.toFixed(2),
                currencyCode: currencyCode,
            }

            res.status(StatusCodes.CREATED).json(response)
        } catch (error) {
            const errorWithMessage = error as Error
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: errorWithMessage.message,
            })
        }
    },
} as TRoute
