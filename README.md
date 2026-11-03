# Zerodha Clone: a full-stack paper-trading demo

> **Educational demo project.** It is not affiliated with Zerodha or any broker.
> All money, prices and trades are simulated. No real securities are traded.
> Please don't enter real financial information or reuse a real password.

A MERN-stack web app made of three parts: a marketing website, a trading
dashboard, and a REST API. Users sign up, get ₹1,00,000 of virtual cash, and buy
and sell stocks whose prices move on their own.

**Live demo:https://zerodha-frontend-lx49.onrender.com
**Screenshots:<img width="959" height="429" alt="image" src="https://github.com/user-attachments/assets/593cfd30-0f44-400e-9ac5-9a90532e855a" />
<img width="959" height="413" alt="image" src="https://github.com/user-attachments/assets/6d2fd69f-6047-4bc4-8efe-b793cf99ad97" />



## Features

- Marketing website with signup and login (React, Bootstrap, React Router)
- Accounts with hashed passwords (bcrypt) and JWT login
- Dashboard: watchlist with search, Summary, Orders, Holdings, Positions, Funds
- Buy and sell at the live market price, with checks for cash and holdings
- Simulated market: prices move every few seconds within a ±10% daily limit
- Holdings with live P&L; average price recalculated on repeat buys
- Simulated Add funds / Withdraw, with profit calculated correctly
- Every user sees only their own data
- Rejected orders are recorded with the reason

## How it works

```
 Landing site  --(login/signup)-->  Backend API  <--(token)--  Dashboard
 React :3000                        Express :3002              React :3001
                                        |
                                  MongoDB Atlas
```

Login returns a JWT. The landing site sends it to the dashboard once, the
dashboard keeps it and sends it with every request.

**Trading rules**

- Orders are market orders filled at the server's current price. The browser
  cannot choose a price.
- A buy takes cash and adds shares in one atomic step each, so simultaneous
  orders cannot overspend or oversell. (Tested with 25 parallel orders.)
- Prices move randomly up or down by at most 0.25% every 5 seconds and can never
  go more than 10% from the previous close. There is no built-in profit.
- Positions show today's trades (India time), netted per stock.
- Overall profit = cash + value of holdings − net deposits.

## Security

Passwords hashed with bcrypt, login tokens expire after 7 days, rate limiting on
login (10 failed tries per 15 minutes), signup and orders, security headers
(helmet), CORS limited to the two sites, input validation on every route, and
the server refuses to start with a weak `JWT_SECRET`.

## Run it locally

You need Node.js 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # then edit .env (see the table below)
npm run dev               # or: npm start

# 2. Landing site (new terminal)
cd frontend
npm install
npm start                 # http://localhost:3000

# 3. Dashboard (new terminal)
cd dashboard
npm install
npm start                 # http://localhost:3001
```

On Windows PowerShell use `copy .env.example .env`.

### Settings

| App | Variable | Meaning |
|---|---|---|
| backend | `MONGO_URL` | MongoDB connection string |
| backend | `JWT_SECRET` | random string, at least 32 characters |
| backend | `FRONTEND_URL`, `DASHBOARD_URL` | allowed website addresses (CORS) |
| backend | `PORT` | default 3002 |
| frontend | `REACT_APP_API_URL`, `REACT_APP_DASHBOARD_URL` | where the API and dashboard live |
| dashboard | `REACT_APP_API_URL`, `REACT_APP_FRONTEND_URL` | where the API and landing site live |

`REACT_APP_*` values are written into the website when it is built, so set them
before building.

## Deploy (Render + MongoDB Atlas)

`render.yaml` describes all three services. In short:

1. Create a free MongoDB Atlas cluster, a database user, and allow network
   access from anywhere (Render's free plan has no fixed IP).
2. Push this repo to GitHub.
3. In Render choose **New > Blueprint**, pick the repo, and fill in the
   variables it asks for.
4. Set the backend's `FRONTEND_URL` / `DASHBOARD_URL` and the sites'
   `REACT_APP_*` to the final `onrender.com` addresses, then redeploy.

On Render's free plan the backend sleeps after 15 minutes without traffic and
takes about a minute to wake up. Prices only move while it is awake.

## Known limitations

- Market orders only (no limit, stop or short selling), no brokerage or taxes
- Prices are simulated, not real market data
- No password reset or email verification
- Run a single backend instance (the price engine runs inside it)
- The dashboard is built for desktop screens
- Free MongoDB Atlas clusters are for learning and testing

## Project structure

```
backend/    Express API: routes/, services/ (trading, prices), middleware/, schemas/
frontend/   Marketing site (React + Bootstrap)
dashboard/  Trading dashboard (React)
render.yaml Render deployment blueprint
```
