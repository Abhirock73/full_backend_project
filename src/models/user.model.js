import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            lowercase:true,
            index:true,
            unique:true,
            trim:true
        },
        email:{
            type:String,
            unique:true,
            required:true,
            
        },
        fullname:{
            type:String,
            required:true,
            
        },
        avatar:{
            type:String,// stoting the url
            required:true,
            
        },
        coverImage :{
            type:String// stoting the url
            
        },
        watchHistory:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:true
        },
        refreshToken:{
            type:String
        }
    },{timestamps:true}
);


userSchema.pre("save", async function (next){
       if(!this.isModified("password")) return next();
       this.password = bcrypt.hash(this.password,10)
       next();
});

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function (){
       return jwt.sign(
           {
            _id: this._id,
            username: this.username,
            fullname: this.fullname,
            emial:this.email
           },
           process.env.ACCESS_TOKEN_SECRET,
           {
               expiresIn: process.env.ACCESS_TOKEN_EXPIRY
           }
       )
}

userSchema.methods.generateAccessRefreshToken = function (){
    return jwt.sign(
        {
         _id: this._id,
        
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}




export const User = mongoose.model("User",userSchema);