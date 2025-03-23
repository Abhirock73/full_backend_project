import {User} from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js';
import uploadOnCloudinary from "../utils/cloudinary.js"
import {ApiResponse} from '../utils/ApiResponse.js'
const userRegister = async (req,res) =>{
    try {
        
        // get the data from frontend
        // check not empty
        // check already exist or not
        // upload avatar to cloudinary
        // remove password and refrence token from response
        // check for user creation 
        // return res
       const { username, email, fullname, password} = req.body;
       if(
            [username,email,password,fullname].some((val) => val?.trim() === "")
       ){
          throw new ApiError(400,"fielad are required");
       }

        const existed =await  User.findOne({
          $or:[{email},{username}]
        })
        if(existed){
            throw new ApiError(400," User already exist");
        }

        const avatarLoacalPath = req.files?.avatar[0]?.path;
        let coverImageLoacalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght>0){
            coverImageLoacalPath = req.files.coverImage[0].path;
        }
        if(!avatarLoacalPath) {
            throw new ApiError(401,"upload file must");
        }
        const avatar = await uploadOnCloudinary(avatarLoacalPath);
        const coverImage = await uploadOnCloudinary(coverImageLoacalPath);
        
        if(!avatar){
            throw new ApiError(401,"upload file must");
        }
        const user = await User.create({
            email:email,
            username:username,
            fullname:fullname,
            password:password,
            avatar:avatar.url,
            coverImage:coverImage?.url||""
        });
        const userCreated =await User.findById(user._id).select(
            "-password -refreshToken"
        );
        if(!userCreated){
              throw new ApiError(400);
        }
        res.status(201).json(
            new ApiResponse(userCreated,200)
        )
        
 
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
}

export { userRegister };
