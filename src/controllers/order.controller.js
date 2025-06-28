import { OrderStatusType, TransactionType } from "../constants.js";
import { orderDetail } from "../models/orderDetail.model.js";
import { securityDetail } from "../models/securityDetail.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { stockId, quantity } = req.body;

  if (!stockId || !quantity) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Missing required fields: stockId or quantity"
        )
      );
  }

  if (!mongoose.Types.ObjectId.isValid(stockId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid stockId format"));
  }

  const stock = await securityDetail.findById(stockId);

  if (!stock) {
    return res.status(404).json(new ApiResponse(404, null, "Stock not found"));
  }

  const orderValue = stock.price * quantity;

  const newOrder = await orderDetail.create({
    securityDetailId: stock._id,
    orderRefNo: `ORD-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    orderStatus: OrderStatusType.PENDING,
    transactionType: TransactionType.BUY,
    orderValue,
    createdBy: req.UserLoginDetail?._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newOrder, "Purchase order created successfully")
    );
});

const createSellOrder = asyncHandler(async (req, res) => {
  const { stockId, quantity } = req.body;

  if (!stockId || !quantity) {
    throw new ApiError(400, "Missing required fields: stockId or quantity");
  }

  if (!mongoose.Types.ObjectId.isValid(stockId)) {
    throw new ApiError(400, "Invalid stockId format");
  }

  const stock = await securityDetail.findById(stockId);
  if (!stock) {
    throw new ApiError(404, "Stock not found");
  }

  if (typeof stock.price !== "number" || stock.price <= 0) {
    throw new ApiError(400, "Invalid stock price");
  }

  if (typeof quantity !== "number" || quantity <= 0) {
    throw new ApiError(400, "Invalid quantity");
  }

  const orderValue = stock.price * quantity;

  const newOrder = await orderDetail.create({
    securityDetailId: stock._id,
    orderRefNo: `ORD-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    orderStatus: OrderStatusType.PENDING,
    transactionType: TransactionType.SELL,
    orderValue,
    createdBy: req.UserLoginDetail?._id || null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newOrder, "Sell order created successfully"));
});

export { createPurchaseOrder, createSellOrder };
