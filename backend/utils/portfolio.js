const { HoldingsModel } = require("../model/HoldingsModel");
const { StockModel } = require("../model/StockModel");
const { signedPercent } = require("./helpers");

// Returns the user's holdings with live price info attached,
// in the same shape the dashboard table expects.
async function getHoldingsWithPrices(userId) {
  const [holdings, stocks] = await Promise.all([
    HoldingsModel.find({ userId }).sort({ name: 1 }),
    StockModel.find({}),
  ]);

  const bySymbol = new Map(stocks.map((s) => [s.name, s]));

  return holdings.map((h) => {
    const stock = bySymbol.get(h.name);
    const price = stock ? stock.price : h.avg;
    const dayChange = stock ? stock.changePercent : 0;
    const netChange = h.avg > 0 ? ((price - h.avg) / h.avg) * 100 : 0;

    return {
      name: h.name,
      qty: h.qty,
      avg: h.avg,
      price,
      net: signedPercent(netChange),
      day: signedPercent(dayChange),
      isLoss: dayChange < 0,
    };
  });
}

module.exports = { getHoldingsWithPrices };
