import mongoose, { Schema } from "mongoose";

const auditActionSchema = new Schema(
  {
    userLoginDetailId: {
      type: Schema.Types.ObjectId,
      ref: "UserLoginDetail",
      required: true,
    },
    sessionID: {
      type: String,
    },
    loginStatus: {
      type: String,
    },
    loginDateTime: {
      type: String,
    },
    logoutDateTime: {
      type: String,
    },
  },
  { timestamps: true }
);

export const auditAction = mongoose.model("AuditAction", auditActionSchema);
