import React from "react";

// Shown at the very top of every page
function DemoBanner() {
  return (
    <div
      style={{
        background: "#fff8e1",
        borderBottom: "1px solid #ffe082",
        color: "#6d5200",
        fontSize: "13px",
        textAlign: "center",
        padding: "6px 12px",
      }}
    >
      Educational demo project, not affiliated with Zerodha. All money, prices
      and trades are simulated.
    </div>
  );
}

export default DemoBanner;
