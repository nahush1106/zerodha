import React, { useState, useEffect, useContext } from "react";

import api from "../api";
import GeneralContext from "./GeneralContext";
import { formatINR, errorMessage } from "../utils/format";

const formatTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const Orders = () => {
  const { dataVersion } = useContext(GeneralContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api
      .get("/allOrders")
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Could not load orders"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataVersion]);

  if (loading) return <h3 className="title">Loading orders...</h3>;

  if (error) {
    return (
      <>
        <h3 className="title">Orders</h3>
        <p style={{ color: "#df514c" }}>{error}</p>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <p style={{ fontSize: "0.9rem" }}>
            Hover over a stock in your watchlist and click Buy or Sell.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h3 className="title">Orders ({orders.length})</h3>

      <div className="order-table">
        <table>
          <tbody>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Price</th>
              <th>Value</th>
              <th>Status</th>
            </tr>

            {orders.map((order) => {
              const rejected = order.status === "REJECTED";

              return (
                <tr key={order.id}>
                  <td>{formatTime(order.createdAt)}</td>
                  <td
                    style={{
                      color: order.mode === "BUY" ? "#4184f3" : "#df514c",
                      fontWeight: 500,
                    }}
                  >
                    {order.mode}
                  </td>
                  <td>{order.name}</td>
                  <td>{order.qty}</td>
                  <td>{order.price.toFixed(2)}</td>
                  <td>{formatINR(order.qty * order.price)}</td>
                  <td className={rejected ? "loss" : "profit"}>
                    {order.status}
                    {rejected && order.statusMessage && (
                      <div style={{ fontSize: "0.7rem", fontWeight: 400 }}>
                        {order.statusMessage}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Orders;
