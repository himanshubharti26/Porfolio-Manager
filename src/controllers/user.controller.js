import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError} from "../utils/ApiError.js";
import { userDetail } from "../models/userDetail.model.js";
// import { deleteImage, uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
// import { userDetail } from "../models/userDetail.model.js";

const  generateAccessAndRefreshToken = async (userId)=>{
    try{
        const fetchedUser = await userDetail.findById(userId);
        console.log("fetchedUser:", fetchedUser);
        const accessToken =  fetchedUser.generateAccessToken();
        console.log("accessToken:", accessToken);
        const refreshToken = fetchedUser.generateRefreshToken();
        console.log("refreshToken:", refreshToken);
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

    const {firstName, lastName, email, password}= req.body
    console.log("email:", email, firstName, lastName, password);

    if([firstName, lastName, email, password].some(
        (field)=>field?.trim()==="")){
            throw new ApiError("All fields are required", 400);
    }

    const existedUser = await userDetail.findOne({
        email
    })

    if(existedUser){
        throw new ApiError("User with email or username exists", 409)
    }

    // const avatarLocalPath = req.files?.avatar[0]?.path || undefined;
    // let coverImageLocalPath;
    // if( req.files?.coverImage){
    //     coverImageLocalPath  = req.files?.coverImage[0]?.path;
    // }   
     
    // console.log("avatarLocalPath:",avatarLocalPath, coverImageLocalPath);
    // if(!avatarLocalPath){
    //     throw new ApiError("Avatar file is required")
    // }

    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // let coverImage;
    // if(coverImageLocalPath){
    //     coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // }

    // if(!avatar){
    //     throw new ApiError("Avatar is required");
    // }

    const newUser = await userDetail.create({
        firstName,
        lastName,
        email,
        password,

    })
    
    const createdUser = await userDetail.findById(newUser._id).select(
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

    const userVal = await userDetail.findOne({$or:[{email}, {userName}]});
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
        
       const User =  await userDetail.findById(decodedToken?._id);
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
    const User = await userDetail.findById(req.user.id);
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
    const {firstName, lastName, email} = req.body;
    if(!firstName || !lastName || !email){
        throw new ApiError("Email, firsyName, lastName are required",400);
    }

    // const User = await user.findById(req.user?._id)
    // User.fullName = fullName;
    // User.email = email;
    // const newUser = await User.save();
    // return res.status(200)
    //     .json(200,newUser,"User details updated successfully");

    const newUser = await userDetail.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                firstName,
                lastName,
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






export {
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateUserDetails,
}