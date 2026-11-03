require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const marketRoutes = require("./routes/marketRoutes");
const orderRoutes = require("./routes/orderRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const fundsRoutes = require("./routes/fundsRoutes");
const { loginLimiter, signupLimiter } = require("./middleware/rateLimit");
const { seedStocks, migrateUsers } = require("./utils/startup");
const { startPriceEngine } = require("./services/priceEngine");

// ---- Refuse to start with a weak or missing secret ----
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32 || secret.startsWith("replace-me")) {
  console.error(
    "JWT_SECRET is missing or too weak. Use a random string of at least 32 characters.\n" +
      "Generate one with:\n" +
      "  node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
  );
  process.exit(1);
}

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

// Allowed browser origins. Trailing slashes are removed so
// "https://site.onrender.com/" and "https://site.onrender.com" both work.
const clean = (url) => url.trim().replace(/\/+$/, "");
const allowedOrigins = [
  clean(process.env.FRONTEND_URL || "http://localhost:3000"),
  clean(process.env.DASHBOARD_URL || "http://localhost:3001"),
];

const app = express();

// The app runs behind the host's proxy. This makes req.ip the real visitor IP
// (needed for rate limiting). Set TRUST_PROXY=0 if you run without a proxy.
app.set("trust proxy", Number(process.env.TRUST_PROXY || 1));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: allowedOrigins }));
app.use(bodyParser.json());

// Used by the host to check that the server is alive
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/auth/login", loginLimiter);
app.use("/auth/signup", signupLimiter);
app.use("/auth", authRoutes);
app.use("/", marketRoutes); // GET /stocks
app.use("/", orderRoutes); // POST /newOrder, GET /allOrders
app.use("/", portfolioRoutes); // GET /allHoldings, /allPositions, /summary
app.use("/", fundsRoutes); // POST /funds/add, /funds/withdraw

// Start the server only after the database is connected
mongoose
  .connect(uri)
  .then(async () => {
    console.log("DB connected!");
    await seedStocks();
    await migrateUsers();

    // Keep this on a single server instance (see README)
    if (process.env.DISABLE_PRICE_ENGINE !== "true") startPriceEngine();

    app.listen(PORT, () => {
      console.log(`App started on port ${PORT}!`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
