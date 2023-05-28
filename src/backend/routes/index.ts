import express from 'express'
import getStatus from './status/get.status'
import postUser from './user/post.user'
import loginUser from './user/login.user'
import verifyUser from './admin/verify.user'
import toggleAccountStatus from './admin/block-unblock-account'
import accountBalance from './user/account.balance'
import addRecipient from './user/add.recipient'
import viewRecipient from "./user/view.recipient";
import deleteRecipient from "./user/delete.recipient";
const router = express.Router()

// home page route
router.get('/', (req, res) => {
    res.send('Example home page')
})

// api routes
const apiRoutes = [
    getStatus,
    postUser,
    loginUser,
    verifyUser,
    toggleAccountStatus,
    accountBalance,
    addRecipient,
    viewRecipient,
    deleteRecipient
]

apiRoutes.forEach((route) =>
    router[route.method](route.path, route.validators, route.handler),
)

export default router
