import React, { useState, useEffect, useContext } from "react";

import api from "../api";
import GeneralContext from "./GeneralContext";
import { compact, errorMessage } from "../utils/format";

const LOSS_COLOR = { color: "#df514c" };

const Summary = () => {
  const { dataVersion, priceVersion } = useContext(GeneralContext);

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

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
        if (!cancelled) setError(errorMessage(err, "Could not load summary"));
      });

    return () => {
      cancelled = true;
    };
  }, [dataVersion, priceVersion]);

  if (error) return <p style={{ color: "#df514c" }}>{error}</p>;
  if (!summary) return <p>Loading...</p>;

  const isProfit = summary.pnl >= 0;

  return (
    <>
      <div className="username">
        <h6>Hi, {summary.name}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{compact(summary.funds)}</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>0</span>{" "}
            </p>
            <p>
              Net deposits <span>{compact(summary.netDeposits)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({summary.holdingsCount})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3
              className={isProfit ? "profit" : "loss"}
              style={isProfit ? undefined : LOSS_COLOR}
            >
              {compact(summary.pnl)}{" "}
              <small>
                {isProfit ? "+" : ""}
                {summary.pnlPercent.toFixed(2)}%
              </small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>{compact(summary.currentValue)}</span>{" "}
            </p>
            <p>
              Investment <span>{compact(summary.invested)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <p style={{ color: "#9b9b9b", fontSize: "0.75rem", maxWidth: "520px" }}>
        This is an educational demo project and is not affiliated with Zerodha.
        All money, prices and trades are simulated. No real securities are
        traded.
      </p>
    </>
  );
};

export default Summary;
