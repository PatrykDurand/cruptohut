import { Request, Response } from 'express'
import { body } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../types'
import { handleRequest } from '../../utils/request.utils'

export default {
    method: 'post',
    path: '/api/admin/session',
    validators: [body('status').isIn(['Active', 'Blocked'])],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.CREATED,
            messages: { uniqueConstraintFailed: 'User not found' },
            execute: async () => {
                const { status } = req.body
                const time = new Date()
                return await prisma.session.create({
                    data: {
                        status,
                        time,
                    },
                })
            },
        }),
} as TRoute
