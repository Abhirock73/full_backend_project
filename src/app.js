import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors({
      origin:process.env.ORIGIN,
      credentials:true,
}));


app.use(express.json({limit: "16kb"}))// simply telling that user can send data in form of json also
app.use(express.urlencoded({extended: true,limit: "16kb"}));
app.use(express.static("public"))
app.use(cookieParser());

// importing routes
import { userRouter } from './routes/user.routes.js';

app.use(userRouter);


export { app };