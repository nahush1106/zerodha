const express = require("express");

const { UserModel } = require("../model/UserModel");
const { requireAuth } = require("../middleware/auth");
const { round2 } = require("../utils/helpers");
const { MAX_FUNDS_TRANSACTION } = require("../config/constants");

const router = express.Router();

const rupees = (n) =>
  `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Returns the amount as a number, or null if it is not a valid money amount
function parseAmount(raw) {
  if (typeof raw !== "number" && typeof raw !== "string") return null;
  if (typeof raw === "string" && raw.trim() === "") return null;

  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  // no more than 2 decimal places
  if (Math.round(amount * 100) / 100 !== amount) return null;

  return amount;
}

// Shared checks for add / withdraw. Sends the error and returns null if invalid.
function validAmount(req, res) {
  const amount = parseAmount(req.body.amount);

  if (amount === null) {
    res
      .status(400)
      .json({ message: "Enter a valid amount (up to 2 decimal places)" });
    return null;
  }
  if (amount > MAX_FUNDS_TRANSACTION) {
    res.status(400).json({
      message: `You can transfer up to ${rupees(MAX_FUNDS_TRANSACTION)} at a time`,
    });
    return null;
  }
  return amount;
}

// POST /funds/add  { amount }   (simulated: no real money is moved)
router.post("/funds/add", requireAuth, async (req, res) => {
  try {
    const amount = validAmount(req, res);
    if (amount === null) return;

    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { $inc: { funds: amount, netDeposits: amount } },
      { new: true }
    );
    if (!user) return res.status(401).json({ message: "User not found" });

    res.json({ message: `${rupees(amount)} added`, funds: round2(user.funds) });
  } catch (err) {
    console.error("funds/add error:", err);
    res.status(500).json({ message: "Could not add funds" });
  }
});

// POST /funds/withdraw  { amount }
router.post("/funds/withdraw", requireAuth, async (req, res) => {
  try {
    const amount = validAmount(req, res);
    if (amount === null) return;

    // Only succeeds if enough cash is available (one atomic step)
    const user = await UserModel.findOneAndUpdate(
      { _id: req.userId, funds: { $gte: amount } },
      { $inc: { funds: -amount, netDeposits: -amount } },
      { new: true }
    );

    if (!user) {
      const current = await UserModel.findById(req.userId);
      const available = current ? current.funds : 0;
      return res.status(400).json({
        message: `Insufficient funds. Available ${rupees(round2(available))}`,
      });
    }

    res.json({
      message: `${rupees(amount)} withdrawn`,
      funds: round2(user.funds),
    });
  } catch (err) {
    console.error("funds/withdraw error:", err);
    res.status(500).json({ message: "Could not withdraw funds" });
  }
});

module.exports = router;
