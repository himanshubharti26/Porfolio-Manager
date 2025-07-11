import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    userName:{
        type: String,
        required: true,
        Unique: true,
        trim: true,
        index: true,
        lowercase:true
    },
    email:{
        type: String,
        unique:true,
        lowercase:true,
        trim: true,
        required:true
    },
    fullName:{
        type: String,
        trim: true,
        required:true
    },
    password:{
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken:{
        type:String, 
    }
},{timestamps:true});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        fullName: this.fullName,
        userName:this.userName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)   
}
export const user = mongoose.model("User", userSchema);
