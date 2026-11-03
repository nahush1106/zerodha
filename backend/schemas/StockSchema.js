const { Schema } = require("mongoose");

const StockSchema = new Schema({
  name: { type: String, required: true, unique: true },
  // Last traded price. This is the price every order is filled at.
  price: { type: Number, required: true },
  // Day change in percent, measured from prevClose
  changePercent: { type: Number, default: 0 },
  // Where the stock closed on the previous day, and the (Indian) date it was set
  prevClose: Number,
  prevCloseDate: String,
});

module.exports = { StockSchema };
