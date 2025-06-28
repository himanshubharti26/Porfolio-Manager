import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError} from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { deleteImage, uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const  generateAccessAndRefreshToken = async (userId)=>{
    try{
        const fetchedUser = await user.findById(userId);
        const accessToken =  fetchedUser.generateAccessToken();
        const refreshToken = fetchedUser.generateRefreshToken();
        fetchedUser.refreshToken = refreshToken;
        await fetchedUser.save({ validateBeforeSave:false });
        return {accessToken, refreshToken};
    }catch(e){
        throw new ApiError("Somthing went wrong while generating access and refresh token", 500)
    }
}
const registerUser = asyncHandler(async(req, res)=>{
    // get user details from frontend
    // validation
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them on cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName, userName, email, password}= req.body
    console.log("email:", email, fullName, userName, password);

    if([fullName, userName, email, password].some(
        (field)=>field?.trim()==="")){
            throw new ApiError("All fields are required", 400);
    }

    const existedUser = await user.findOne({
        $or:[{userName}, {email}]
    })

    if(existedUser){
        throw new ApiError("User with email or username exists", 409)
    }

    const avatarLocalPath = req.files?.avatar[0]?.path || undefined;
    let coverImageLocalPath;
    if( req.files?.coverImage){
        coverImageLocalPath  = req.files?.coverImage[0]?.path;
    }   
     
    console.log("avatarLocalPath:",avatarLocalPath, coverImageLocalPath);
    if(!avatarLocalPath){
        throw new ApiError("Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage;
    if(coverImageLocalPath){
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    if(!avatar){
        throw new ApiError("Avatar is required");
    }

    const newUser = await user.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        password,

    })
    
    const createdUser = await user.findById(newUser._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError("Somthing went wrong while registring the user", 500);
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    ) 

})

const loginUser = asyncHandler(async (req, res)=>{
    //take user data from body, username/email, password
    // check if user exists
    // check password
    // generate access token
    // return access token with expiry of 15 mins in cookies

    const {email, userName, password} = req.body;
    if(!email && !userName){
        throw new ApiError("Email or username is required", 400)
    }

    const userVal = await user.findOne({$or:[{email}, {userName}]});
    if(!userVal){
        throw new ApiError("User not found", 404);
    }

    const validPassword = await userVal.isPasswordCorrect(password);
    if(!validPassword){
        throw new ApiError("Invalid credentials", 400)
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(userVal._id);

    userVal.refreshToken = refreshToken;
    await userVal.save();

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        "user": userVal,
                        accessToken,
                        refreshToken
                    },
                    "User logged in successfully"
                )
            )
    

})

const logoutUser = asyncHandler(async(req, res)=>{
    const fetchedUser = await user.findByIdAndUpdate(
        req.user._id, 
        {$set:{refreshToken:"", }},
        {new:true}
    );

    const options = {
        httpOnly: true,
        secure: true,
    }
    res.status(200).cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            fetchedUser,
            "User logged out successfully"
        )
    );


})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized request");
        }
        
        const  decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
       const User =  await user.findById(decodedToken?._id);
       if(!User){
        throw new ApiError(401, "Invalid refresh token");
       }
    
       if(incomingRefreshToken !== User?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used");
       }
       const options = {
        httpOnly:true,
        secure:true
       }
       const {accessToken, refreshToken} = await generateAccessAndRefreshToken(User._id);
       return res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {accessToken, refreshToken},
                        "Access token refreshed"
                    )
                )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token") 
    }
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body;
    const User = await user.findById(req.user.id);
    const correct = User.isPasswordCorrect(oldPassword);
    if(!correct){
        throw new ApiError("Invalid old password", 402);
    }

    User.password = newPassword;
    await User.save({validateBeforeSave:false});

    return res.status(200)
            .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully"));
})

const updateUserDetails = asyncHandler(async(req, res)=>{
    const {fullName, email} = req.body;
    if(!fullName || !email){
        throw new ApiError("Email and fullName are required",400);
    }

    // const User = await user.findById(req.user?._id)
    // User.fullName = fullName;
    // User.email = email;
    // const newUser = await User.save();
    // return res.status(200)
    //     .json(200,newUser,"User details updated successfully");

    const newUser = await user.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {
            new:true
        }
    ).select("-password")
    console.log("new User", newUser);
    return res.status(200)
        .json(new ApiResponse(200,newUser,"User details updated successfully"));
})

const updateUserAvtar = asyncHandler(async(req, res)=>{
    // console.log("request.file ===>", req.file);
    const avtarLocalPath = req.file?.path;
    if(!avtarLocalPath){
        throw new ApiError("Avtar file is missing", 400);
    }
    const avatar = await uploadOnCloudinary(avtarLocalPath);
    if(!avatar.url){
        throw new ApiError("Error while uploading avatar on cloudinary", 400);
    }
    const oldImageTobeDeleted = req.user?.avatar;

     const User = await user.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatar?.url
            },
            
    });
    if(!User){
        throw new ApiError("Error in updating the avatar image url", 400);
    }

    const deletedImageResponse = await deleteImage(oldImageTobeDeleted);
    console.log("deleted image response ===>", deletedImageResponse);
    return res
    .status(200)
    .json(new ApiResponse(200,User, "Avatar updated successfully"));
})

const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path;
    console.log("coverImageLocalPath",coverImageLocalPath);
    if(!coverImageLocalPath){
        throw new ApiError("Error in cover image uploaded", 400);
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        throw new ApiError("Error while uploading coverImage on cloudinary");
    }
   const oldImageTobeDeleted = req.user?.coverImage;

    const User = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url,
            }
            
        },
        {
            new:true 
        }
    )
    if(!User){
        throw new ApiError("Error in updating the cover image url", 400);
    }

    const deletedImageResponse = await deleteImage(oldImageTobeDeleted);
    console.log("deleted image response ===>", deletedImageResponse);
    return res
    .status(200)
    .json(new ApiResponse(200, User,"coverImage updated successfully"));
})

const getUserChannelProfile = asyncHandler(async(req, res)=>{

    const userName = req.params.userName;
    if(!userName?.trim()){
        throw new ApiError("User name is required", 400);
    }

    const channel = await user.aggregate([
        {
            $match:{
                userName:userName.toLowerCase()
            }
            
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            },
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCoount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id, "$subscribers.subscriber"]},
                        then:true,
                        else:false         
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                userName:1,
                subscribersCount:1,
                channelsSubscribedToCoount:1,
                isSubscribed:1,
                email:1,
                avatar:1,
                coverImage:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError("Channel does not exists", 400);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "channel info fetched successfully")
    );

})


const getWatchHistory = asyncHandler(async(req, res)=>{
    const User = user.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        userName:1,
                                        avatar:1
                                    }
                                }
                                
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }

                ]
            }
        }
        
    ])

    if(!videos?.length){
        throw new ApiError("No videos found", 400);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, User[0].watchHistory,"Watch history fetched successfully")
    );
})
export {
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateUserDetails,
    updateUserAvtar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}

