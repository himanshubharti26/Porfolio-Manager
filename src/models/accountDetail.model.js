import mongoose, { Schema } from "mongoose";

const accountDetailSchema = new Schema(
  {
    userLoginDetailId: {
      type: String,
    },
    credit: {
      type: String,
    },
    debit: {
      type: String,
    },
    runningBalance: {
      type: String,
    },
    orderDetailId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const auditAction = mongoose.model("AccountDetail", accountDetailSchema);
