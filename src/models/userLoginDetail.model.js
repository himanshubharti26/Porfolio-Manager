import mongoose, {Schema} from "mongoose";

// ID INT PK
// ID_USER_DETAIL INT FK - USER_DETAIL.ID
// FIRST_NAME VARCHAR
// LAST_NAME VARCHAR
// EMAIL_ADDRESS VARCHAR
// USER_STATUS VARCHAR
// CREATED_ON TIMESTAMP
// CREATED_BY VARCHAR
// MODIFIED_ON TIMESTAMP
// MODIFIED_BY

const userLoginDetailSchema = new Schema({
    id:{
        type: Number,
        required: true,
        Unique: true,
        
    },
    userDetailId:{
        type: Number,
        required: true,
        ref: "UserDetail",
        index: true,
        unique: true,
        trim: true,
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
    userStatus:{
        type: String,
        enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
        default: "ACTIVE",
    },

    createdBy:{
        type: String,
        default: "admin"
    },
    modifiedBy:{
        type: String,
        default: "admin"
    },
},{
    timestamps: {
        createdOn:{
            type: Date,
            default: Date.now()
        },
        modifiedOn: {
            type: Date,
            default: Date.now()
        }
    }
});


export const userLoginDetail = mongoose.model("UserLoginDetail", userLoginDetailSchema);