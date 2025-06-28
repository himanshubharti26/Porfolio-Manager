import mongoose, { Schema } from "mongoose";

const accountDetailSchema = new Schema(
  {
    userLoginDetailId: {
      type: Schema.Types.ObjectId,
      ref: "UserLoginDetail",
      require: true,
    },
    credit: {
      type: Number,
    },
    debit: {
      type: Number,
    },
    runningBalance: {
      type: Number,
    },
    orderDetailId: {
      type: Schema.Types.ObjectId,
      ref: "OrderDetail"
    },
  },
  { timestamps: true }
);

export const auditAction = mongoose.model("AccountDetail", accountDetailSchema);
