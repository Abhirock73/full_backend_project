import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

const verifyJWT = async(req,res,next)=>{
    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        if(!token) {
            throw new ApiError(400,"no cookie no header");
        }
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(400,"not found")
        }

        req.user = user

        next();

        
    } catch (error) {
        throw new ApiError(500, error.message)
        
    }
}

export { verifyJWT };