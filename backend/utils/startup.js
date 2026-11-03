const { StockModel } = require("../model/StockModel");
const { UserModel } = require("../model/UserModel");
const STOCKS = require("../data/stocks");
const { STARTING_FUNDS } = require("../config/constants");
const { round2, istDateString } = require("./helpers");

// price / (1 + change%) gives the previous close
const previousClose = (price, changePercent) =>
  round2(price / (1 + changePercent / 100));

// Adds any stock from data/stocks.js that is missing. Existing prices are kept.
async function seedStocks() {
  const today = istDateString();

  await StockModel.bulkWrite(
    STOCKS.map((s) => ({
      updateOne: {
        filter: { name: s.name },
        update: {
          $setOnInsert: {
            ...s,
            prevClose: previousClose(s.price, s.changePercent),
            prevCloseDate: today,
          },
        },
        upsert: true,
      },
    }))
  );

  // Stocks saved by an older version of the app have no prevClose yet
  const old = await StockModel.find({ prevClose: { $exists: false } });
  for (const stock of old) {
    stock.prevClose = previousClose(stock.price, stock.changePercent || 0);
    stock.prevCloseDate = today;
    await stock.save();
  }
}

// Brings older accounts up to date
async function migrateUsers() {
  // 1. Accounts created before funds existed get the starting balance
  const funds = await UserModel.updateMany(
    { funds: { $exists: false } },
    { $set: { funds: STARTING_FUNDS, openingBalance: STARTING_FUNDS } }
  );
  if (funds.modifiedCount > 0) {
    console.log(`Gave starting funds to ${funds.modifiedCount} existing user(s)`);
  }

  // 2. Accounts created before netDeposits existed: it starts equal to openingBalance
  const deposits = await UserModel.updateMany(
    { netDeposits: { $exists: false } },
    [
      {
        $set: {
          netDeposits: { $ifNull: ["$openingBalance", STARTING_FUNDS] },
        },
      },
    ],
    { updatePipeline: true }
  );
  if (deposits.modifiedCount > 0) {
    console.log(`Updated ${deposits.modifiedCount} existing user(s) for fund transfers`);
  }
}

module.exports = { seedStocks, migrateUsers };
