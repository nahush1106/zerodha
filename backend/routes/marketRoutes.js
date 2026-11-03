const express = require("express");

const { StockModel } = require("../model/StockModel");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /stocks  -> the watchlist
router.get("/stocks", requireAuth, async (req, res) => {
  try {
    const stocks = await StockModel.find({}).sort({ _id: 1 });

    res.json(
      stocks.map((s) => ({
        name: s.name,
        price: s.price,
        percent: `${s.changePercent.toFixed(2)}%`,
        isDown: s.changePercent < 0,
      }))
    );
  } catch (err) {
    console.error("stocks error:", err);
    res.status(500).json({ message: "Could not load watchlist" });
  }
});

module.exports = router;
