import mongoose, { Schema } from "mongoose";
import { LoginStatusType } from "../constants.js";

const auditUserLoginSchema = new Schema(
  {
    userLoginDetailId: {
      type: Schema.Types.ObjectId,
      ref: "UserLoginDetail",
      required: true,
    },
    sessionID: {
      type: String,
      required: true,
      trim: true,
    },
    loginStatus: {
      type: String,
      enum: Object.values(LoginStatusType),
      required: true,
    },
    loginDateTime: {
      type: Date,
      default: Date.now,
    },
    logoutDateTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const AuditUserLogin = mongoose.model(
  "AuditUserLogin",
  auditUserLoginSchema
);
