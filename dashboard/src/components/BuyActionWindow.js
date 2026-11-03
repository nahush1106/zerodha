import React, { useState } from "react";

import api from "../api";
import { formatINR, errorMessage } from "../utils/format";

import "./BuyActionWindow.css";

// Used for both Buy and Sell (mode = "BUY" or "SELL").
// Orders are market orders: they are filled at the current price on the
// server, so the price below is for information and cannot be edited.
const BuyActionWindow = ({ uid, mode, price, onClose, onPlaced }) => {
  const isBuy = mode !== "SELL";
  const color = isBuy ? "#4184f3" : "#ff5722";

  const [stockQuantity, setStockQuantity] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const orderValue = (Number(stockQuantity) || 0) * (price || 0);

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    try {
      await api.post("/newOrder", {
        name: uid,
        qty: Number(stockQuantity),
        mode: isBuy ? "BUY" : "SELL",
      });
      onPlaced(); // refreshes the pages and closes this window
    } catch (err) {
      // e.g. "Insufficient funds..." or "You only hold 3 shares of INFY"
      setError(errorMessage(err, "Could not place the order. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <div className="container" id="buy-window" style={{ cursor: "default" }}>
      <div className="header" style={{ background: color }}>
        <h3>
          {isBuy ? "Buy" : "Sell"} {uid} <span>NSE</span>
        </h3>
      </div>

      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              step="1"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Market price</legend>
            <input
              type="text"
              name="price"
              id="price"
              readOnly
              value={price == null ? "" : price.toFixed(2)}
              style={{ background: "#f7f7f7", color: "#666" }}
            />
          </fieldset>
        </div>

        <p style={{ color: "#9b9b9b", fontSize: "0.7rem", margin: "6px 0 0" }}>
          Filled instantly at the market price when you confirm.
        </p>

        {error && (
          <p style={{ color: "#df514c", fontSize: "0.8rem", margin: "6px 0 0" }}>
            {error}
          </p>
        )}
      </div>

      <div className="buttons">
        <span>
          {isBuy ? "Margin required" : "Approx. proceeds"} ₹{formatINR(orderValue)}
        </span>
        <div>
          <button
            className="btn btn-blue"
            style={{
              border: "none",
              cursor: submitting ? "wait" : "pointer",
              background: color,
              opacity: submitting ? 0.7 : 1,
            }}
            onClick={handleSubmit}
            disabled={submitting || price == null}
          >
            {submitting ? "Placing..." : isBuy ? "Buy" : "Sell"}
          </button>
          <button
            className="btn btn-grey"
            style={{ border: "none", cursor: "pointer" }}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
