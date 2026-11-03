import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import GeneralContext from "./GeneralContext";
import { formatINR, errorMessage } from "../utils/format";

const QUICK_AMOUNTS = [10000, 50000, 100000];

const buttonBase = {
  border: "none",
  cursor: "pointer",
  fontSize: "inherit",
  fontFamily: "inherit",
};

const Funds = () => {
  const { dataVersion, priceVersion } = useContext(GeneralContext);

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // "ADD", "WITHDRAW" or null (panel closed)
  const [panel, setPanel] = useState(null);
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/summary")
      .then((res) => {
        if (cancelled) return;
        setSummary(res.data);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Could not load funds"));
      });

    return () => {
      cancelled = true;
    };
  }, [dataVersion, priceVersion, reloadKey]);

  const openPanel = (type) => {
    setPanel(type);
    setAmount("");
    setFormError("");
    setNotice("");
  };

  const closePanel = () => {
    setPanel(null);
    setFormError("");
  };

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!amount || !(value > 0)) {
      setFormError("Enter an amount greater than 0");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      const res = await api.post(
        panel === "ADD" ? "/funds/add" : "/funds/withdraw",
        { amount: value }
      );
      setNotice(res.data.message);
      setPanel(null);
      setReloadKey((k) => k + 1); // reload the numbers
    } catch (err) {
      setFormError(errorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <p style={{ color: "#df514c" }}>{error}</p>;
  if (!summary) return <p>Loading...</p>;

  const totalPnlClass = summary.totalPnl >= 0 ? "profit" : "loss";
  const isAdd = panel === "ADD";

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI </p>
        <button
          className="btn btn-green"
          style={buttonBase}
          onClick={() => openPanel("ADD")}
        >
          Add funds
        </button>
        <button
          className="btn btn-blue"
          style={buttonBase}
          onClick={() => openPanel("WITHDRAW")}
        >
          Withdraw
        </button>
      </div>

      {notice && (
        <p style={{ color: "#4caf50", textAlign: "right", fontSize: "0.85rem" }}>
          {notice}
        </p>
      )}

      {panel && (
        <div
          style={{
            margin: "16px 0 0 auto",
            padding: "16px 20px",
            maxWidth: "380px",
            border: "1px solid #eee",
            borderRadius: "4px",
            background: "#fafafa",
          }}
        >
          <p style={{ margin: 0, fontWeight: 500 }}>
            {isAdd ? "Add funds" : "Withdraw funds"}
          </p>
          <p style={{ margin: "4px 0 12px", fontSize: "0.75rem", color: "#9b9b9b" }}>
            This is a simulation. No real money is moved.
            {!isAdd && ` Available: ₹${formatINR(summary.funds)}`}
          </p>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount in ₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "2px",
              fontSize: "1rem",
            }}
          />

          {isAdd && (
            <div style={{ margin: "10px 0" }}>
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  style={{
                    ...buttonBase,
                    marginRight: "8px",
                    padding: "4px 10px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "2px",
                    fontSize: "0.8rem",
                  }}
                >
                  ₹{q.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          )}

          {formError && (
            <p style={{ color: "#df514c", fontSize: "0.8rem", margin: "8px 0" }}>
              {formError}
            </p>
          )}

          <div style={{ marginTop: "12px" }}>
            <button
              className={isAdd ? "btn btn-green" : "btn btn-blue"}
              style={{ ...buttonBase, opacity: submitting ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Please wait..." : isAdd ? "Add funds" : "Withdraw"}
            </button>
            <button
              className="btn btn-grey"
              style={{ ...buttonBase, background: "#d4d4d4", color: "#666" }}
              onClick={closePanel}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">{formatINR(summary.funds)}</p>
            </div>
            <div className="data">
              <p>Invested in holdings</p>
              <p className="imp">{formatINR(summary.invested)}</p>
            </div>
            <div className="data">
              <p>Current value of holdings</p>
              <p className="imp">{formatINR(summary.currentValue)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Net deposits</p>
              <p>{formatINR(summary.netDeposits)}</p>
            </div>
            <div className="data">
              <p>Total account value</p>
              <p>{formatINR(summary.totalValue)}</p>
            </div>
            <div className="data">
              <p>Total P&L since start</p>
              <p
                className={totalPnlClass}
                style={summary.totalPnl < 0 ? { color: "#df514c" } : undefined}
              >
                {formatINR(summary.totalPnl)}
              </p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <Link className="btn btn-blue">Open Account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
