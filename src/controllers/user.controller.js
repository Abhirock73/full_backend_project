import {User} from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js';
import uploadOnCloudinary from "../utils/cloudinary.js"
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'

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

const loginUser = async (req,res) => {

    try {
        // fetch the username email
        // find the in databse 
        // check passwprd
        // send access token and refresh token
        // send by cookies

        const {email,username, password} = req.body;
        
        
        if(!email && !username){
            throw new ApiError(400,"Email or Username must field")
        }

        const user = await User.findOne({
            $or: [{ email }, { username }]
        });

        if(!user){
            throw new ApiError(404,"user not Found");
        }
        console.log(password);
        if(!password){
            throw new ApiError(400,"plz enter password");
        }

        const matches = await user.isPasswordCorrect(password);
        console.log(matches);
        if(!matches) {
            throw new ApiError(400," entered password is incorrect ");
        }
        const AccessToken = await user.generateAccessToken();
        const AccessRefreshToken = await user.generateAccessRefreshToken();

        user.refreshToken = AccessRefreshToken ;
        await user.save({ validateBeforeSave: false });

        
        const option={
            httpOnly:true,
            secure:true
        }

        res.
        status(200).
        cookie("accessToken",AccessToken,option).
        cookie("refreshToken",AccessRefreshToken,option).
        json(
            new ApiResponse(
                {
                    AccessRefreshToken,
                    AccessToken
                },
                200,
                "loggined successfully"
            )
        )
    }
    catch (e) {
        throw new ApiError(500,e.message);
    }

}

const logedOut = async(req,res)=>{

    await User.findByIdAndDelete(
        req.user._id,
        {
            $set:{refreshToken:undefined}
        },
        {
            new:true
        }
    )

    const option={
        httpOnly:true,
        secure:true
    }

    res.
    status(200).
    clearCookie("accessToken",AccessToken,option).
    clearCookie("refreshToken",AccessRefreshToken,option).
    json(
        new ApiResponse(
            {},
            200,
            "successfully logged out"
        )
    )


}

const RefreshAccessToken = async(req,res)=>{

    try {
        const  incomingRefreshToken = req.body || req.cookies?.accessToken;
    
        if(!incomingRefreshToken){
            throw new ApiError(401);
        }
    
        const decode = jwt.verify(incomingRefreshToken,process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findOne(decode?._id);
        if(!user){
            throw new ApiError(400,"unautherized error")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
             throw new ApiError(404,"Access denied");
        }
    
        const AccessToken = await user.generateAccessToken();
        const AccessRefreshToken = await user.generateAccessRefreshToken();
    
        user.refreshToken = AccessRefreshToken ;
        await user.save({ validateBeforeSave: false });
    
        
        const option={
            httpOnly:true,
            secure:true
        }
    
        res.
        status(200).
        cookie("accessToken",AccessToken,option).
        cookie("refreshToken",AccessRefreshToken,option).
        json(
            new ApiResponse(
                {
                    AccessRefreshToken,
                    AccessToken
                },
                200,
                "loggined successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500,error.message);
    }
}


export {
     userRegister,
     loginUser,
     logedOut,
     RefreshAccessToken
 };
