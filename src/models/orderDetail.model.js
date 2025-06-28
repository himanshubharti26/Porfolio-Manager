import mongoose from "mongoose";
import { Schema } from "mongoose";
import { OrderStatusType, TransactionType } from "../constants.js";

// ID INT PK
// ID_SECURITY_DETAIL INT FK - SECURITY_DETAIL.ID
// ORDER_REF_NO VARCHAR
// ORDER_STATUS VARCHAR
// TRANSACTION_TYPE VARCHAR
// ORDER_VALUE VARCHAR
// CREATED_ON TIMESTAMP
// CREATED_BY INT FK - USER_LOGIN_DETAIL.ID

const orderDetailSchema = new Schema(
  {
    securityDetailId: {
      type: Schema.Types.ObjectId,
      ref: "SecurityDetail",
    },
    orderRefNo: {
      type: String,
      required: true,
      trim: true,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatusType),
      default: OrderStatusType.PENDING,
    },
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    orderValue: {
      type: Number,
      required: true,
    },
    createdOn: { type: Date, default: Date.now() },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "UserLoginDetail",
    },
  },
  { timestamps: true }
);

export const orderDetail = mongoose.model("OrderDetail", orderDetailSchema);
