import mongoose, { Schema } from "mongoose";

const auditActionSchema = new Schema(
  {
    userLoginDetailId: {
      type: String,
    },
    userAction: {
      type: String,
    },
    startDateTime: {
      type: String,
    },
    endDateTime: {
      type: String,
    },
  },
  { timestamps: true }
);

export const auditAction = mongoose.model("AuditAction", auditActionSchema);
