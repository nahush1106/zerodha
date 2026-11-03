// 1234567.5 -> "12,34,567.50" (Indian grouping)
export const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Returns ["12,34,567", "50"] so the decimals can be styled separately
export const splitMoney = (n) => formatINR(n).split(".");

// 3740 -> "3.74k", 155000 -> "1.55L", 12000000 -> "1.20Cr"
export const compact = (n) => {
  const v = Number(n || 0);
  const a = Math.abs(v);
  if (a >= 1e7) return (v / 1e7).toFixed(2) + "Cr";
  if (a >= 1e5) return (v / 1e5).toFixed(2) + "L";
  if (a >= 1e3) return (v / 1e3).toFixed(2) + "k";
  return v.toFixed(2);
};

// Pulls the server's error message out of an axios error
export const errorMessage = (err, fallback) =>
  (err && err.response && err.response.data && err.response.data.message) ||
  fallback;
