import {User} from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js';
import uploadOnCloudinary from "../utils/cloudinary.js"
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';

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

        let coverImageLoacalPath = undefined;

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

const changePassword = async(req,res)=>{
    try {
        const {oldPassword,newPassword} = req.body
        const user = await User.findOne(user?._id);// add this router with jwt middleware
        const isMatch = await user.isPasswordCorrect(oldPassword);
        if(!isMatch)
        {
            throw new ApiError(403,"Wrong password");
        }
        user.password = newPassword ;
        await user.save({ validateBeforeSave: false });
        res.status(200).json(new ApiResponse({},200,"successfully change password"));
    } catch (error) {
        throw new ApiError(500,error.message);
    }
}

const getCurrentUser = async(req,res)=>{
    return res.status(200).json(new ApiResponse(req.user,200,"user fetch successfully"));
      
}

const updateAccountDetails = async(req,res)=>{
    try {
        const { fullname , email } = req.body;
        if(!fullname || !email){
            throw new ApiError(404,"full name or email can't be empty");
        }
        const user = await User.findOne(req.user?._id);
        if(!user){
            throw new ApiError(404,"can't find the user");
        }
        user.fullname = fullname;
        user.email = email;
        await user.save({ validateBeforeSave: false });

        res.status(200).json(new ApiResponse({},200,"successfully updated"))
    
    } catch (error) {
       throw new ApiError(500,"internal server Error");
    }
}

// update the avatar of user this router will be calledby two middle ware

const updateAvatar = async(req,res)=>{
    try {
       
        const avatarLoacalPath = req.file?.path;

        if(!avatarLoacalPath){
            throw new ApiError(404, "file must be selected");
        }
        const response = await uploadOnCloudinary(avatarLoacalPath);

        if(!response.url){
            throw new ApiError(404, "failed to upload the file");
        }
        const toSend = await User.findByIdAndUpdate(req.user?._id,
            {
               $set:{avatar:response.url}
            },
            {
               new:true
            }
        ).select("-password");

        res
        .status(200)
        .json(new ApiResponse(toSend,200));
        
    } catch (error) {
         throw new ApiError(500, error.message);
    }
}

const updateCoverImage = async(req,res)=>{
    try {
        const path = req.file?.path;
        if(!path){
            throw new ApiError(404,"not file seleted")
        }
        // upload in cloudinary
        const response = await uploadOnCloudinary(path);
        if(!response.url){
            throw new ApiError(404,"failed to upload in cloudinary");
        }
        const notifyUser = await User.findByIdAndUpdate(req.user?._id,
            {
                $set:{coverImage: response.url}
            },
            {
                new:true//retriev that updated  schema
            }
        ).select("-password")

        res
        .status(200)
        .json(new ApiResponse(notifyUser,200));


    } catch (error) {
        throw new ApiError(500,error.message)
    }
}

const getUserChannelProfile = async(req,res)=>{
    try {
        const {username} = req.params;

        if(!username?.trim()){
            throw new ApiError(500,"username is missing");
        }

        const channel =  await User.aggregate(
            [
                // stage :1 find document with this username (=1)
                {
                    $match: {
                        username:username
                    }
                },
                {
                    $lookup:{
                        from:"subscriptions",
                        localField:"_id",
                        foreignField:"channel",
                        as: "subscribers"

                    }
                },
                {
                    $lookup:{
                        from:"subscriptions",
                        localField:"_id",
                        foreignField:"subscriber",
                        as: "subscribed"

                    }
                },
                {
                    $addFields:{
                        subscriberCount:{
                            $size: "$subscribers"
                        },
                        channelSubscribeTo:{
                              $size: "$subscribed"
                        },
                        isSubscribed:{
                            $cond:{

                                $if: { $in: [req.user?._id, "subscribers.subscriber"] },
                                then: true ,
                                else: false
                            }
                        }
                    }
                },
                {
                    $project:{
                        fullname:1,
                        username:1,
                        subscriberCount:1,
                        channelSubscribeTo:1,
                        isSubscribed:1,
                        avatar:1,
                        coverImage:1,
                        email:1
                    }
                }

            ]
        )

        if(!channel?.length){
            throw new ApiError(404,"no such channel found");
        }

        return res.
               status(200).
               json(
                  new ApiResponse( channel[0], 200, "successfully fetched")
               )
        
    } catch (error) {
         throw new ApiError(500,"error from getUserProfile catch block : ",error.message);
    }
}

const getUserHistory = async(req,res)=>{
    try {
        // req.user._id = String
       const user =  await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(String(req.user._id)),
                }
            },
            {
                $lookup:{
                    from: "videos",
                    localField:"watchHistory",
                    foreignField:"_id",
                    as: "watchHistory",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as: "owner",
                                pipeline:[
                                    {
                                        $project:{
                                            avatar:1,
                                            fullname:1,
                                            username:1
                                        }
                                    }
                                ]
                            }
                        }
                    ]

                }
            }
        ])

        if(!user.length){
            throw ApiError(404,"not history found")
        }

        return res.status(200).json(new ApiResponse(user[0].watchHistory,200));


    } catch (error) {
        throw new ApiError(500,"error from getUserHistory catch block: ",error);
    }
}

export {
     userRegister,
     loginUser,
     logedOut,
     RefreshAccessToken,
     updateAccountDetails,
     changePassword,
     getCurrentUser,
     updateAvatar,
     updateCoverImage,
     getUserChannelProfile,
     getUserHistory
 };
