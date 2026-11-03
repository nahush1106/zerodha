const { Schema } = require("mongoose");

const OrdersSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", index: true },
    name: String,
    qty: Number,
    price: Number,
    mode: { type: String, enum: ["BUY", "SELL"] },
    // PENDING while being processed, then EXECUTED or REJECTED
    status: {
      type: String,
      enum: ["PENDING", "EXECUTED", "REJECTED"],
      default: "PENDING",
    },
    // Reason shown to the user when an order is rejected
    statusMessage: String,
  },
  { timestamps: true } // adds createdAt / updatedAt
);

module.exports = { OrdersSchema };
