import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
      origin:process.env.ORIGIN,
      credentials:true,

}));


app.use(express.json(limit= "16kb"))// simply telling that user can send data in form of json also
app.use(express.urlencoded(extended= true,limit= "16kb"));
app.use(cookieParser());
