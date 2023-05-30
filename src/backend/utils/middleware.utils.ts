import { Request, Response, NextFunction } from 'express'
import { verifyToken } from './jwt.utils'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { setUser } from './session.utils'

const SECRET = (process.env.TOKEN_SECRET as string) ?? 'XYZ'
export const authorize = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization
    const parsedToken = token?.replace('Bearer ', '')
    const result = verifyToken(parsedToken ?? '', SECRET)
    if (!token || !result.isValid) {
        res.send(StatusCodes.UNAUTHORIZED).json({
            errors: [ReasonPhrases.UNAUTHORIZED],
        })
    } else {
        if (req.path.includes('admin')) {
            if (result.content.role !== 'admin') {
                res.send(StatusCodes.UNAUTHORIZED).json({
                    errors: [ReasonPhrases.UNAUTHORIZED],
                })
            }
        }
        setUser(result.content)
        next()
    }
}
