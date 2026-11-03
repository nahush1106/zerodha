const { Schema } = require("mongoose");

const HoldingsSchema = new Schema({
  // Whose holding this is
  userId: { type: Schema.Types.ObjectId, ref: "user", index: true },
  name: String,
  qty: Number,
  avg: Number,

  // Old fields from the seed data. Live prices now come from the "stocks"
  // collection, so new holdings do not use these.
  price: Number,
  net: String,
  day: String,
});

// One holding row per user per stock.
// partialFilterExpression ignores the old seed rows that have no userId.
HoldingsSchema.index(
  { userId: 1, name: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

module.exports = { HoldingsSchema };
