import { Request, Response } from 'express'
import { TRoute } from '../../../../../../../Documents/Project/cruptohut-main/src/backend/routes/types'
export default {
    method: 'get',
    path: '/api/status',
    validators: [],
    handler: async (req: Request, res: Response) => {
        res.send(`I'm alive!`)
    },
} as TRoute
