const { StockModel } = require("../model/StockModel");
const { round2, istDateString } = require("../utils/helpers");
const {
  PRICE_TICK_MS,
  PRICE_VOLATILITY_PERCENT,
  CIRCUIT_LIMIT_PERCENT,
} = require("../config/constants");

// Indian stocks trade in steps of 5 paise
const roundToTick = (price) => round2(Math.round(price * 20) / 20);

// One step of the simulated market: every stock moves a little at random.
// The moves are equally likely to be up or down, so there is no way to
// predict them and no built-in profit.
// `random` can be replaced in tests.
async function tickPrices(random = Math.random) {
  const stocks = await StockModel.find({});
  const today = istDateString();

  const ops = stocks.map((stock) => {
    let { prevClose, prevCloseDate } = stock;

    // A new day has started: today's change is measured from yesterday's close
    if (!prevClose || prevCloseDate !== today) {
      prevClose = stock.price;
      prevCloseDate = today;
    }

    const move = (random() * 2 - 1) * (PRICE_VOLATILITY_PERCENT / 100);
    const low = prevClose * (1 - CIRCUIT_LIMIT_PERCENT / 100);
    const high = prevClose * (1 + CIRCUIT_LIMIT_PERCENT / 100);

    // Round to a valid price, then make sure it is still inside the circuit limits
    const lowestTick = Math.ceil(low * 20 - 1e-9) / 20;
    const highestTick = Math.floor(high * 20 + 1e-9) / 20;
    const price = round2(
      Math.min(highestTick, Math.max(lowestTick, roundToTick(stock.price * (1 + move))))
    );
    const changePercent = round2(((price - prevClose) / prevClose) * 100);

    return {
      updateOne: {
        filter: { _id: stock._id },
        update: { $set: { price, prevClose, prevCloseDate, changePercent } },
      },
    };
  });

  if (ops.length > 0) await StockModel.bulkWrite(ops);
}

function startPriceEngine() {
  let running = false;

  const timer = setInterval(async () => {
    if (running) return; // previous tick is still going, skip this one
    running = true;
    try {
      await tickPrices();
    } catch (err) {
      console.error("Price update failed:", err.message);
    } finally {
      running = false;
    }
  }, PRICE_TICK_MS);

  timer.unref(); // does not keep the process alive on its own
  return timer;
}

module.exports = { tickPrices, startPriceEngine };
