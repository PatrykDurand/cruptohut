import express from 'express'
import getStatus from './status/get.status'
import postUser from './user/post.user'
import loginUser from './user/login.user'
import verifyUser from './admin/verify.user'
import toggleAccountStatus from './admin/block-unblock-account'
import editUser from './user/edit.user'
const router = express.Router()

// home page route
router.get('/', (req, res) => {
    res.send('Example home page')
})

// api routes
const apiRoutes = [getStatus, postUser, loginUser, verifyUser, toggleAccountStatus, editUser]

apiRoutes.forEach((route) =>
    router[route.method](route.path, route.validators, route.handler),
)

export default router