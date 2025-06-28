import mongoose, { Schema } from "mongoose";

const accountDetailSchema = new Schema(
  {
    userLoginDetailId: {
      type: Schema.Types.ObjectId,
      ref: "UserLoginDetail",
      require: true,
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
