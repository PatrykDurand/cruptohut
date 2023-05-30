import { Request, Response } from 'express'
import { body } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { TRoute } from '../types'
import { handleRequest } from '../../utils/request.utils'
import { createHash } from '../../utils/hash.utils'
const SALT = (process.env.PASSWORD_SALT as string) ?? 'XYZ'

export default {
    method: 'post',
    path: '/api/user',
    validators: [
        body('email').isEmail(),
        body('password').not().isEmpty(),
        body('name').not().isEmpty(),
        body('surname').not().isEmpty(),
        body('address').not().isEmpty(),
        body('birthDate').not().isEmpty(),
        body('idCardNumber').not().isEmpty(),
    ],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.CREATED,
            messages: { uniqueConstraintFailed: 'Email must be unique.' },
            execute: async () => {
                const {
                    email,
                    password,
                    name,
                    surname,
                    address,
                    birthDate,
                    idCardNumber,
                } = req.body
                const passwordHash = createHash(password, SALT)
                const formattedDate = new Date(birthDate).toISOString()
                return await prisma.user.create({
                    data: {
                        email,
                        password: passwordHash,
                        name,
                        surname,
                        address,
                        birthDate: formattedDate,
                        idCardNumber,
                    },
                })
            },
        }),
} as TRoute
