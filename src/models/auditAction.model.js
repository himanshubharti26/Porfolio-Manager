import mongoose, { Schema, Types } from "mongoose";

const auditActionSchema = new Schema(
  {
    userLoginDetailId: {
      type: Schema.Types.ObjectId,
      ref: "UserLoginDetail",
      required: true,
    },
    userAction: {
      type: String,
      required: true,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const AuditAction = mongoose.model("AuditAction", auditActionSchema);
