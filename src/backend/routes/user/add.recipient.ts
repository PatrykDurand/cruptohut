import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../database';
import { TRoute } from '../../routes/types';
import { handleRequest } from '../../utils/request.utils';
import { authorize } from '../../utils/middleware.utils';
import { body } from 'express-validator';

export default {
    method: 'post',
    path: '/api/recipient/add',
    validators: [
        authorize,
        body('userId').not().isEmpty(),
        body('name').not().isEmpty(),
        body('surname').not().isEmpty(),
        body('accountNumber').not().isEmpty(),
    ],
    handler: async (req: Request, res: Response): Promise<void> => {
        const { userId, name, surname, accountNumber } = req.body;

        const user = await prisma.user.findUnique({
            where: { userId },
        });

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
            return;
        }

        const recipient = await prisma.recipient.create({
            data: {
                name,
                surname,
                accountNumber,
                trusted: true,
                user: {
                    connect: { userId },
                },
            },
        });

        res.status(StatusCodes.CREATED).json(recipient);
    },
} as TRoute;
