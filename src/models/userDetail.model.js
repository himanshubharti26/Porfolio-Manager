import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    id:{
        type: String,
        required: true,
        Unique: true,
        trim: true,
        index: true,
        lowercase:true
    },
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
export const userDetail = mongoose.model("UserDetail", userSchema);
