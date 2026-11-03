const rateLimit = require("express-rate-limit");

const tooMany = (message) => (req, res) => res.status(429).json({ message });

const common = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
};

// Wrong passwords: 10 failed tries per 15 minutes per IP.
// Successful logins are not counted.
const loginLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: tooMany("Too many login attempts. Please try again in 15 minutes."),
});

// New accounts: 20 per hour per IP
const signupLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 20,
  handler: tooMany(
    "Too many accounts created from this network. Please try again later."
  ),
});

// Orders: 60 per minute per user (used after requireAuth, so req.userId exists)
const orderLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: (req) => String(req.userId),
  handler: tooMany("You are placing orders too fast. Please slow down."),
});

module.exports = { loginLimiter, signupLimiter, orderLimiter };
