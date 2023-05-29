import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../../database'
import { body } from 'express-validator'
import { handleRequest, TCustomError } from '../../utils/request.utils'
import { TRoute } from '../../routes/types'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

export default {
    method: 'post',
    path: '/api/user/reset_password',
    validators: [body('email').isEmail()],
    handler: async (req: Request, res: Response) =>
        handleRequest({
            req,
            res,
            responseSuccessStatus: StatusCodes.OK,
            messages: {},
            execute: async () => {
                const { email } = req.body

                const user = await prisma.user.findUnique({ where: { email } })

                if (!user) {
                    throw {
                        status: StatusCodes.NOT_FOUND,
                        message: 'No user with that email',
                        isCustomError: true,
                    } as TCustomError
                }

                const token = jwt.sign(
                    { userId: user.userId, email: user.email },
                    'cryptokey',
                    { expiresIn: '1h' },
                )

                const transport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'cryptohut34@gmail.com',
                        pass: 'quxuuppdkkqkzabj',
                    },
                })

                const mailOptions = {
                    from: 'cryptohut34@gmail.com',
                    to: email,
                    subject: 'Password Reset Link',
                    text: `Hello ${user.name}, Click on the link below to reset your password: 
                    http://localhost:3000/reset_password/${token}`,
                }

                transport.sendMail(mailOptions, (error) => {
                    if (error) {
                        throw {
                            status: StatusCodes.BAD_REQUEST,
                            message: 'Error sending email',
                            isCustomError: true,
                        } as TCustomError
                    }
                })

                return {
                    message: 'Email sent',
                }
            },
        }),
} as TRoute
