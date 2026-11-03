module.exports = {
  // Every new account starts with this much virtual cash
  STARTING_FUNDS: 100000,
  // Largest quantity allowed in a single order
  MAX_ORDER_QTY: 10000,
  // Largest single "add funds" / "withdraw" amount (simulated money)
  MAX_FUNDS_TRANSACTION: 500000,

  // ----- Simulated market -----
  // How often prices move (milliseconds)
  PRICE_TICK_MS: 5000,
  // Biggest move per tick, in percent (up or down)
  PRICE_VOLATILITY_PERCENT: 0.25,
  // A stock can never go further than this % from its previous close
  CIRCUIT_LIMIT_PERCENT: 10,
};
