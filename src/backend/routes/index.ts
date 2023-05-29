import express from 'express'
import getStatus from './status/get.status'
import postUser from './user/post.user'
import loginUser from './user/login.user'
import verifyUser from './admin/verify.user'
import accountTransfer from './transaction/account.transfer'
import accountHistory from './transaction/account.history'
import toggleAccountStatus from './admin/block-unblock-account'
import accountDeposit from './user/account.deposit'
import deleteRecipient from './user/delete.recipient'
import viewRecipient from './user/view.recipient'
import addRecipient from './user/add.recipient'
import editUser from './user/edit.user'
import accountBalance from './account/account.balance'
import accountBalanceConvertCurrency from './account/account.balance.convertCurrency'

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
    deleteRecipient,
    viewRecipient,
    addRecipient,
    accountTransfer,
    accountHistory,
    toggleAccountStatus,
    editUser,
    accountBalance,
    accountDeposit,
    accountBalanceConvertCurrency,
]

apiRoutes.forEach((route) =>
    router[route.method](route.path, route.validators, route.handler),
)

export default router
