import mongoose, { Schema } from "mongoose";

const auditActionSchema = new Schema(
  {
    userLoginDetailId: {
      type: String,
    },
    sessionId: {
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
