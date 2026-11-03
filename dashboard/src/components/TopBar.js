import React, { useContext } from "react";

import Menu from "./Menu";
import GeneralContext from "./GeneralContext";

// A simple index worked out from the watchlist stocks:
// it starts at 1000 and moves with the average day change of the stocks.
const TopBar = () => {
  const { stocks } = useContext(GeneralContext);

  const avgChange = stocks.length
    ? stocks.reduce((sum, s) => sum + parseFloat(s.percent), 0) / stocks.length
    : 0;
  const indexValue = 1000 * (1 + avgChange / 100);
  const color = avgChange < 0 ? "rgb(223, 73, 73)" : "rgb(76, 175, 80)";

  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">Demo index</p>
          <p className="index-points" style={{ color }}>
            {indexValue.toFixed(2)}
          </p>
          <p className="percent">
            {avgChange >= 0 ? "+" : ""}
            {avgChange.toFixed(2)}%
          </p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
