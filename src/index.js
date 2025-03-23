
import dotenv from 'dotenv'
import connectionDB from './db/index2.js';
import { app } from './app.js';
dotenv.config();

connectionDB()
.then(()=>{
    app.listen( process.env.PORT || 8000 , ()=>{
         console.log("listening at 800 port");
    });
})
.catch((err)=>{
    console.log("there is something went wrong: ", err);
})