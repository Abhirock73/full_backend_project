import mongoose from "mongoose";
import User from "./user.model.js"

const subscriptionSchema = new mongoose.Schema({

    subscriber:{
        type:mongoose.Schema.Types.ObjectId,// jo subscribe kiya
        ref:"User"
    },

    channel:{
        type:mongoose.Schema.Types.ObjectId,// jisko subscribe kiya
        ref:"User"
    }, 
} , 
{timestamps:true});


export const subscription = mongoose.model("subscription",subscriptionSchema);