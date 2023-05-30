import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { body } from 'express-validator'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { TRoute } from '../types'
import jwt from 'jsonwebtoken'

export default {
    method: 'post',
    path: '/api/user/change_password',
    validators: [body('token').isString(), body('newPassword').isString()],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.OK,
            messages: {},
            execute: async () => {
                const { token, newPassword } = req.body

                let decodedToken
                let email: string | undefined
                try {
                    decodedToken = jwt.verify(token, 'cryptokey')
                } catch (err) {
                    throw {
                        status: StatusCodes.BAD_REQUEST,
                        message: 'Invalid Token',
                        isCustomError: true,
                    } as TCustomError
                }
                if (
                    typeof decodedToken === 'object' &&
                    'email' in decodedToken
                ) {
                    email = decodedToken.email
                }

                if (!email) {
                    throw {
                        status: StatusCodes.BAD_REQUEST,
                        message: 'Invalid Token',
                        isCustomError: true,
                    } as TCustomError
                }

                const user = await prisma.user.findUnique({
                    where: { email: email },
                })

                if (!user) {
                    throw {
                        status: StatusCodes.NOT_FOUND,
                        message: 'User not found',
                        isCustomError: true,
                    } as TCustomError
                }

                // Update the user's password
                await prisma.user.update({
                    where: { email: email },
                    data: { password: newPassword },
                })

                return {
                    message: 'Password updated successfully',
                }
            },
        }),
} as TRoute
