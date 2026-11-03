// Change these in dashboard/.env (see .env.example) instead of editing code.
// Restart `npm start` after changing .env.
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
export const FRONTEND_URL =
  process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

// How often prices and numbers refresh (milliseconds)
export const PRICE_POLL_MS = Number(process.env.REACT_APP_PRICE_POLL_MS) || 5000;
