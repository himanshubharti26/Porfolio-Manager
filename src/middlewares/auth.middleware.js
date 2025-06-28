import { user } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async(req, res, next)=>{
        try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
            console.log("verifyJWT fetched token ==>", token, "\n", "cookie:", req.cookies.accessToken);
            if(!token){
                throw new ApiError("Unauthorised request", 401); 
    
            }
            let fetchedUser;
            try{
                const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                const User = await user.findById( decodedToken._id).select("-password");
                fetchedUser = User;

            }catch(error){
                console.log("Error in verifying token or user does not exist", error);
            }
           
            console.log("fetched user ===>", fetchedUser,);
            if(!fetchedUser){
                throw new ApiError("Unauthorized user, invalid token", 401);
            }
    
            req.user = fetchedUser;
    
            next();
        } catch (error) {
                return error;
        }
})

export {verifyJWT};