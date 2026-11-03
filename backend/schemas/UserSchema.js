const { Schema } = require("mongoose");

const { STARTING_FUNDS } = require("../config/constants");

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // bcrypt hash, never the real password
    password: { type: String, required: true },

    // Virtual cash available for trading
    funds: { type: Number, default: STARTING_FUNDS },
    // What the account started with
    openingBalance: { type: Number, default: STARTING_FUNDS },
    // Money put in minus money taken out (starting funds + added - withdrawn).
    // Overall profit = cash + value of holdings - netDeposits.
    netDeposits: { type: Number, default: STARTING_FUNDS },
  },
  { timestamps: true }
);

module.exports = { UserSchema };
