import React, { useState, useEffect, useCallback, useContext } from "react";

import api from "../api";
import { PRICE_POLL_MS } from "../config";
import { errorMessage } from "../utils/format";
import BuyActionWindow from "./BuyActionWindow";

const GeneralContext = React.createContext({
  // Live watchlist (refreshes every few seconds)
  stocks: [],
  stocksLoading: true,
  stocksError: "",
  // priceVersion goes up every time prices refresh. dataVersion goes up when an
  // order is placed. Pages list them in their useEffect so they reload.
  priceVersion: 0,
  dataVersion: 0,
  // Order window
  orderWindow: null,
  openBuyWindow: (uid) => {},
  openSellWindow: (uid) => {},
  closeOrderWindow: () => {},
  handleOrderPlaced: () => {},
});

export const GeneralContextProvider = (props) => {
  const [stocks, setStocks] = useState([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState("");
  const [priceVersion, setPriceVersion] = useState(0);
  const [dataVersion, setDataVersion] = useState(0);

  // null = closed, otherwise { uid, mode: "BUY" | "SELL" }
  const [orderWindow, setOrderWindow] = useState(null);

  const loadStocks = useCallback(async () => {
    try {
      const res = await api.get("/stocks");
      setStocks(res.data);
      setStocksError("");
      setPriceVersion((v) => v + 1);
    } catch (err) {
      setStocksError(errorMessage(err, "Could not load watchlist"));
    } finally {
      setStocksLoading(false);
    }
  }, []);

  // Load now, then refresh regularly (skipped while the tab is hidden)
  useEffect(() => {
    loadStocks();
    const timer = setInterval(() => {
      if (!document.hidden) loadStocks();
    }, PRICE_POLL_MS);
    return () => clearInterval(timer);
  }, [loadStocks]);

  const openBuyWindow = (uid) => setOrderWindow({ uid, mode: "BUY" });
  const openSellWindow = (uid) => setOrderWindow({ uid, mode: "SELL" });
  const closeOrderWindow = () => setOrderWindow(null);

  const handleOrderPlaced = () => {
    setDataVersion((v) => v + 1);
    setOrderWindow(null);
    loadStocks();
  };

  return (
    <GeneralContext.Provider
      value={{
        stocks,
        stocksLoading,
        stocksError,
        priceVersion,
        dataVersion,
        orderWindow,
        openBuyWindow,
        openSellWindow,
        closeOrderWindow,
        handleOrderPlaced,
      }}
    >
      {props.children}
    </GeneralContext.Provider>
  );
};

// Draws the Buy / Sell window when one is open. Placed inside the dashboard.
export const OrderWindowHost = () => {
  const { orderWindow, stocks, closeOrderWindow, handleOrderPlaced } =
    useContext(GeneralContext);

  if (!orderWindow) return null;

  const stock = stocks.find((s) => s.name === orderWindow.uid);

  return (
    <BuyActionWindow
      // key makes the window reset if you open it for a different stock
      key={`${orderWindow.mode}-${orderWindow.uid}`}
      uid={orderWindow.uid}
      mode={orderWindow.mode}
      price={stock ? stock.price : null}
      onClose={closeOrderWindow}
      onPlaced={handleOrderPlaced}
    />
  );
};

export default GeneralContext;
