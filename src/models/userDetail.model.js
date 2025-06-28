import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import { refreshAccessToken } from "../controllers/user.controller";

const userSchema = new Schema({

    firstName:{
        type: String,
        required: true,
        trim: true,
       
    },
     lastName:{
        type: String,
        required: true,
        trim: true,
       
    },
    email:{
        type: String,
        unique:true,
        lowercase:true,
        trim: true,
        required:true
    },
    
    password:{
        type: String,
        required: [true, 'Password is required']
    },

    createdBy:{
        type: String,
        default: "admin"
    },
   
    modifiedBy:{
        type: String,
        default: "admin"
    },  
    refreshAccessToken: {
        type: String,
        default: null
    },  
},
{timestamps: {
        createdOn:{
            type: Date,
            default: Date.now()
        },
        modifiedOn: {
            type: Date,
            default: Date.now()
        }
    }
}
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}


userSchema.methods.generateAccessToken = function(){
    console.log("Generating access token for user:", this._id);
    try{
        const token =  jwt.sign({
        _id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName:this.lastName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
        return token;
    }catch(error){
        console.error("Error generating access token:", error);
        throw new Error("Error generating access token");
    }   
}
userSchema.methods.generateRefreshToken = function(){
    console.log("Generating refresh token for user:", this._id);
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)   
}
export const userDetail = mongoose.model("UserDetail", userSchema);
