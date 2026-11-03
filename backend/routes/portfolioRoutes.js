const express = require("express");

const { UserModel } = require("../model/UserModel");
const { OrdersModel } = require("../model/OrdersModel");
const { StockModel } = require("../model/StockModel");
const { requireAuth } = require("../middleware/auth");
const { getHoldingsWithPrices } = require("../utils/portfolio");
const { round2, signedPercent, startOfTodayIST } = require("../utils/helpers");

const router = express.Router();

// GET /allHoldings
router.get("/allHoldings", requireAuth, async (req, res) => {
  try {
    res.json(await getHoldingsWithPrices(req.userId));
  } catch (err) {
    console.error("allHoldings error:", err);
    res.status(500).json({ message: "Could not load holdings" });
  }
});

// GET /allPositions
// Today's trades, netted per stock (this is how delivery trades appear on the
// day they happen). Worked out from today's executed orders.
router.get("/allPositions", requireAuth, async (req, res) => {
  try {
    const [orders, stocks] = await Promise.all([
      OrdersModel.find({
        userId: req.userId,
        status: "EXECUTED",
        createdAt: { $gte: startOfTodayIST() },
      }),
      StockModel.find({}),
    ]);

    const bySymbol = new Map(stocks.map((s) => [s.name, s]));
    const book = new Map();

    for (const o of orders) {
      const row = book.get(o.name) || {
        buyQty: 0,
        buyValue: 0,
        sellQty: 0,
        sellValue: 0,
      };
      if (o.mode === "BUY") {
        row.buyQty += o.qty;
        row.buyValue += o.qty * o.price;
      } else {
        row.sellQty += o.qty;
        row.sellValue += o.qty * o.price;
      }
      book.set(o.name, row);
    }

    const positions = [...book.entries()]
      .map(([name, r]) => {
        const stock = bySymbol.get(name);
        const qty = r.buyQty - r.sellQty;
        const fallback = r.buyQty ? r.buyValue / r.buyQty : r.sellValue / r.sellQty;
        const ltp = stock ? stock.price : fallback;
        const dayChange = stock ? stock.changePercent : 0;

        // average price of the side that is still open (0 if fully closed)
        const avg = qty > 0 ? r.buyValue / r.buyQty : qty < 0 ? r.sellValue / r.sellQty : 0;
        // profit already booked on sold shares + open shares marked to the last price
        const pnl = r.sellValue - r.buyValue + qty * ltp;

        return {
          product: "CNC",
          name,
          qty,
          avg: round2(avg),
          price: ltp,
          pnl: round2(pnl),
          day: signedPercent(dayChange),
          isLoss: dayChange < 0,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json(positions);
  } catch (err) {
    console.error("allPositions error:", err);
    res.status(500).json({ message: "Could not load positions" });
  }
});

// GET /summary  -> numbers for the Summary and Funds pages
router.get("/summary", requireAuth, async (req, res) => {
  try {
    const [user, holdings] = await Promise.all([
      UserModel.findById(req.userId),
      getHoldingsWithPrices(req.userId),
    ]);
    if (!user) return res.status(401).json({ message: "User not found" });

    // money put in minus money taken out (older accounts fall back to openingBalance)
    const netDeposits =
      user.netDeposits !== undefined ? user.netDeposits : user.openingBalance;

    const invested = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
    const currentValue = holdings.reduce((sum, h) => sum + h.price * h.qty, 0);
    const pnl = currentValue - invested;

    res.json({
      name: user.name,
      funds: round2(user.funds),
      openingBalance: round2(user.openingBalance),
      netDeposits: round2(netDeposits),
      holdingsCount: holdings.length,
      invested: round2(invested),
      currentValue: round2(currentValue),
      pnl: round2(pnl),
      pnlPercent: invested > 0 ? round2((pnl / invested) * 100) : 0,
      totalValue: round2(user.funds + currentValue),
      totalPnl: round2(user.funds + currentValue - netDeposits),
    });
  } catch (err) {
    console.error("summary error:", err);
    res.status(500).json({ message: "Could not load summary" });
  }
});

module.exports = router;
