import express from 'express'
import { userRegister } from '../controllers/user.controller.js'
const userRouter = express.Router();
import {upload} from '../middlewares/multer.middleware.js'



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


export {userRouter};