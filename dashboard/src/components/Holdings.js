import React, { useState, useEffect, useContext } from "react";

import api from "../api";
import GeneralContext from "./GeneralContext";
import { VerticalGraph } from "./VerticalGraph";
import { formatINR, splitMoney, errorMessage } from "../utils/format";

// Shows 31,428.95 with the decimals in a smaller <span>
const Money = ({ value }) => {
  const [whole, decimals] = splitMoney(value);
  return (
    <>
      {whole}.<span>{decimals}</span>
    </>
  );
};

const Holdings = () => {
  const { dataVersion, priceVersion } = useContext(GeneralContext);

  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reload whenever an order is placed (dataVersion changes)
  useEffect(() => {
    let cancelled = false;

    api
      .get("/allHoldings")
      .then((res) => {
        if (cancelled) return;
        setAllHoldings(res.data);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Could not load holdings"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataVersion, priceVersion]);

  if (loading) return <h3 className="title">Loading holdings...</h3>;

  if (error) {
    return (
      <>
        <h3 className="title">Holdings</h3>
        <p style={{ color: "#df514c" }}>{error}</p>
      </>
    );
  }

  if (allHoldings.length === 0) {
    return (
      <>
        <h3 className="title">Holdings (0)</h3>
        <div className="orders">
          <div className="no-orders">
            <p>You don't have any holdings yet</p>
            <p style={{ fontSize: "0.9rem" }}>
              Hover over a stock in your watchlist and click Buy to get started.
            </p>
          </div>
        </div>
      </>
    );
  }

  const totalInvestment = allHoldings.reduce((sum, s) => sum + s.avg * s.qty, 0);
  const currentValue = allHoldings.reduce((sum, s) => sum + s.price * s.qty, 0);
  const totalPnl = currentValue - totalInvestment;
  const totalPnlPercent =
    totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  const labels = allHoldings.map((subArray) => subArray["name"]);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <tbody>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>

            {allHoldings.map((stock) => {
              const curValue = stock.price * stock.qty;
              const isProfit = curValue - stock.avg * stock.qty >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={stock.name}>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{stock.price.toFixed(2)}</td>
                  <td>{curValue.toFixed(2)}</td>
                  <td className={profClass}>
                    {(curValue - stock.avg * stock.qty).toFixed(2)}
                  </td>
                  <td className={profClass}>{stock.net}</td>
                  <td className={dayClass}>{stock.day}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>
            <Money value={totalInvestment} />
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            <Money value={currentValue} />
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5>
            {formatINR(totalPnl)} ({totalPnl >= 0 ? "+" : ""}
            {totalPnlPercent.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
      <VerticalGraph data={data} />
    </>
  );
};

export default Holdings;
