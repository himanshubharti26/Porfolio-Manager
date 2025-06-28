import mongoose, { Schema } from "mongoose";

const securityDetailSchema = new Schema(
  {
    securityName: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  { timestamps: true }
);

export const securityDetail = mongoose.model(
  "SecurityDetail",
  securityDetailSchema
);
