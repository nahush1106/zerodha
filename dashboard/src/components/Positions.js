import React, { useState, useEffect, useContext } from "react";

import api from "../api";
import GeneralContext from "./GeneralContext";
import { errorMessage } from "../utils/format";

const Positions = () => {
  const { dataVersion, priceVersion } = useContext(GeneralContext);

  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api
      .get("/allPositions")
      .then((res) => {
        if (cancelled) return;
        setPositions(res.data);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Could not load positions"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataVersion, priceVersion]);

  if (loading) return <h3 className="title">Loading positions...</h3>;

  if (error) {
    return (
      <>
        <h3 className="title">Positions</h3>
        <p style={{ color: "#df514c" }}>{error}</p>
      </>
    );
  }

  if (positions.length === 0) {
    return (
      <>
        <h3 className="title">Positions (0)</h3>
        <div className="orders">
          <div className="no-orders">
            <p>You haven't traded anything today</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="title">Positions ({positions.length})</h3>

      <div className="order-table">
        <table>
          <tbody>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg.</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Chg.</th>
            </tr>

            {positions.map((stock) => {
              const profClass = stock.pnl >= 0 ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={stock.name}>
                  <td>{stock.product}</td>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{stock.price.toFixed(2)}</td>
                  <td className={profClass}>{stock.pnl.toFixed(2)}</td>
                  <td className={dayClass}>{stock.day}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Positions;
