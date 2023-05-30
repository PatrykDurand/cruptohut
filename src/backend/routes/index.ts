import express from 'express'
import getStatus from './status/get.status'
import postUser from './user/post.user'
import loginUser from './user/login.user'
import verifyUser from './admin/verify.user'
import accountTransfer from './transaction/account.transfer'
import accountHistory from './transaction/account.history'
import toggleAccountStatus from './admin/block-unblock-account'
import resetPassword from './user/reset.password'
import changePassword from './user/change.password'
import accountDeposit from './account/account.deposit'
import deleteRecipient from './user/delete.recipient'
import viewRecipient from './user/view.recipient'
import addRecipient from './user/add.recipient'
import editUser from './user/edit.user'
import accountBalance from './account/account.balance'
import loginAdmin from './admin/login.admin'
import accountBalanceConvertCurrency from './account/account.balance.convertCurrency'
import blockUnblockSession from './admin/block-unblock-session'
import blockUnblockAccount from './admin/block-unblock-account'

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
    resetPassword,
    changePassword,
    deleteRecipient,
    viewRecipient,
    addRecipient,
    accountTransfer,
    accountHistory,
    toggleAccountStatus,
    editUser,
    accountBalance,
    accountDeposit,
    loginAdmin,
    accountBalanceConvertCurrency,
    blockUnblockAccount,
    blockUnblockSession,
]

apiRoutes.forEach((route) =>
    router[route.method](route.path, route.validators, route.handler),
)

export default router
