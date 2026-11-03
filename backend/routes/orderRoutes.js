const express = require("express");

const { StockModel } = require("../model/StockModel");
const { OrdersModel } = require("../model/OrdersModel");
const { UserModel } = require("../model/UserModel");
const { requireAuth } = require("../middleware/auth");
const { placeOrder, TradeError } = require("../services/trade");
const { round2 } = require("../utils/helpers");
const { MAX_ORDER_QTY } = require("../config/constants");
const { orderLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// POST /newOrder  { name, qty, mode: "BUY" | "SELL" }
// Orders are market orders: they are filled immediately at the stock's current
// price on the server. Any price sent by the browser is ignored, so nobody can
// choose their own price.
router.post("/newOrder", requireAuth, orderLimiter, async (req, res) => {
  try {
    const { name, mode } = req.body;
    const qty = Number(req.body.qty);

    // 1. Check the input
    if (typeof name !== "string" || !["BUY", "SELL"].includes(mode)) {
      return res.status(400).json({ message: "Invalid order" });
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_ORDER_QTY) {
      return res.status(400).json({
        message: `Quantity must be a whole number between 1 and ${MAX_ORDER_QTY}`,
      });
    }

    // 2. The stock must exist. The order is filled at its current price.
    const stock = await StockModel.findOne({ name: name.trim().toUpperCase() });
    if (!stock) {
      return res.status(400).json({ message: "Unknown stock" });
    }
    const price = stock.price;

    // 3. Execute (checks funds / holdings, updates everything)
    const order = await placeOrder({
      userId: req.userId,
      stock,
      mode,
      qty,
      price,
    });

    const user = await UserModel.findById(req.userId).select("funds");

    res.status(201).json({
      message: "Order executed",
      order: {
        id: order._id,
        name: order.name,
        mode: order.mode,
        qty: order.qty,
        price: order.price,
        status: order.status,
      },
      funds: user ? round2(user.funds) : null,
    });
  } catch (err) {
    if (err instanceof TradeError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("newOrder error:", err);
    res.status(500).json({ message: "Could not place order" });
  }
});

// GET /allOrders  -> this user's orders, newest first
router.get("/allOrders", requireAuth, async (req, res) => {
  try {
    const orders = await OrdersModel.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(
      orders.map((o) => ({
        id: o._id,
        name: o.name,
        mode: o.mode,
        qty: o.qty,
        price: o.price,
        status: o.status,
        statusMessage: o.statusMessage || "",
        createdAt: o.createdAt,
      }))
    );
  } catch (err) {
    console.error("allOrders error:", err);
    res.status(500).json({ message: "Could not load orders" });
  }
});

module.exports = router;
