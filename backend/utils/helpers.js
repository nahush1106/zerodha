// Round money to 2 decimals
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// "+1.25%" / "-0.40%"
const signedPercent = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // India is UTC+5:30

// Midnight today in Indian time, returned as a Date.
// Used to decide which orders count as "today's" positions.
function startOfTodayIST() {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}

// Today's date in Indian time, like "2026-11-02"
function istDateString() {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

module.exports = { round2, signedPercent, startOfTodayIST, istDateString };
