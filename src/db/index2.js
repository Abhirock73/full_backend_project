import mongoose  from "mongoose";
import { DB_NAME } from '../constants.js';


const connectionDB = async ()=>{
    try {
        const connectionIns =  await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        
        console.log(`connected database !! HOST ${connectionIns.connection.host}`);

    } catch (error) {
        console.log("ERROR from connection file: ",error.message);
    }
}

export default connectionDB;
