const { UserModel } = require("../model/UserModel");
const { HoldingsModel } = require("../model/HoldingsModel");
const { OrdersModel } = require("../model/OrdersModel");
const { round2 } = require("../utils/helpers");

// An error whose message is safe to show to the user
class TradeError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "TradeError";
    this.status = status;
  }
}

const rupees = (n) => `₹${n.toFixed(2)}`;

// Add shares to a holding (or create it) and recompute the average price.
// This is ONE atomic database update, so many orders arriving at the same
// moment can never overwrite each other. (Needs MongoDB 4.2 or newer.)
async function addToHolding(userId, name, qty, price) {
  const owned = { $ifNull: ["$qty", 0] };
  const oldAvg = { $ifNull: ["$avg", 0] };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await HoldingsModel.updateOne(
        { userId, name },
        [
          {
            $set: {
              // new avg = (old qty * old avg + new qty * price) / total qty
              avg: {
                $cond: [
                  { $gt: [owned, 0] },
                  {
                    $divide: [
                      { $add: [{ $multiply: [owned, oldAvg] }, qty * price] },
                      { $add: [owned, qty] },
                    ],
                  },
                  price,
                ],
              },
              qty: { $add: [owned, qty] },
            },
          },
        ],
        // updatePipeline lets Mongoose accept the array-style update above
        { upsert: true, updatePipeline: true }
      );
      return;
    } catch (err) {
      // Two simultaneous first-time buys can collide on the unique index. Retry once.
      if (err.code === 11000 && attempt === 0) continue;
      throw err;
    }
  }
}

async function executeBuy({ userId, name, qty, price }) {
  const value = round2(qty * price);

  // Take the money only if enough is available. One atomic step, so two
  // orders at the same time can never spend the same money twice.
  const user = await UserModel.findOneAndUpdate(
    { _id: userId, funds: { $gte: value } },
    { $inc: { funds: -value } },
    { new: true }
  );

  if (!user) {
    const current = await UserModel.findById(userId);
    const available = current ? current.funds : 0;
    throw new TradeError(
      `Insufficient funds. Required ${rupees(value)}, available ${rupees(available)}`
    );
  }

  try {
    await addToHolding(userId, name, qty, price);
  } catch (err) {
    // Could not add the shares, so give the money back
    await UserModel.updateOne({ _id: userId }, { $inc: { funds: value } });
    throw err;
  }
}

async function executeSell({ userId, name, qty, price }) {
  const value = round2(qty * price);

  // Remove shares only if the user holds enough (atomic, so no overselling)
  const holding = await HoldingsModel.findOneAndUpdate(
    { userId, name, qty: { $gte: qty } },
    { $inc: { qty: -qty } },
    { new: true }
  );

  if (!holding) {
    const existing = await HoldingsModel.findOne({ userId, name });
    const have = existing ? existing.qty : 0;
    throw new TradeError(
      have === 0
        ? `You don't hold any shares of ${name}`
        : `You only hold ${have} share${have === 1 ? "" : "s"} of ${name}`
    );
  }

  try {
    await UserModel.updateOne({ _id: userId }, { $inc: { funds: value } });
  } catch (err) {
    // Could not credit the money, so put the shares back
    await HoldingsModel.updateOne({ _id: holding._id }, { $inc: { qty } });
    throw err;
  }

  // Sold everything: remove the empty row
  if (holding.qty === 0) {
    await HoldingsModel.deleteOne({ _id: holding._id, qty: 0 });
  }
}

// Records the order, runs it, and marks it EXECUTED or REJECTED.
// Throws TradeError when the order is rejected.
async function placeOrder({ userId, stock, mode, qty, price }) {
  const order = await OrdersModel.create({
    userId,
    name: stock.name,
    qty,
    price,
    mode,
    status: "PENDING",
  });

  try {
    const args = { userId, name: stock.name, qty, price };
    if (mode === "BUY") await executeBuy(args);
    else await executeSell(args);

    order.status = "EXECUTED";
    await order.save();
    return order;
  } catch (err) {
    order.status = "REJECTED";
    order.statusMessage =
      err instanceof TradeError
        ? err.message
        : "Technical error, please try again";
    await order.save();
    throw err;
  }
}

module.exports = { placeOrder, TradeError };
