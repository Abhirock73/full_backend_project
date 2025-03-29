import express from 'express'
import { userRegister , loginUser ,logedOut,RefreshAccessToken, changePassword } from '../controllers/user.controller.js'
const userRouter = express.Router();
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';


userRouter.post('/api/user-register',
    upload.fields([
          {
            name:"avatar",
            maxCount:1
          },{
            name:"coverImage",
            maxCount:1
          }
    ]),
    userRegister);

userRouter.post('/api/user-login',loginUser);

userRouter.post('/api/log_out',verifyJWT,logedOut)

userRouter.post('/api/refresh-token',RefreshAccessToken);

userRouter.put('/api/change_password',verifyJWT,changePassword);

export {userRouter};