# Trading Platform Frontend

A modern cryptocurrency trading platform built with Next.js and TypeScript. The application provides real-time cryptocurrency market data, trading functionality, portfolio management, wallet operations, and live price updates through WebSocket integration.

## Features

### Authentication & Security

- User registration and login
- JWT-based authentication
- Protected routes
- Two-factor authentication support
- Password reset via OTP verification

### Trading

- Market buy and sell orders
- Limit buy and sell orders
- Pending order management
- Order history tracking
- Real-time price updates

### Portfolio Management

- Portfolio overview
- Asset holdings tracking
- Profit & Loss (PnL) monitoring
- Portfolio performance analysis

### Wallet

- Balance overview
- Deposit funds
- Withdraw funds
- Transaction history

### Market Data

- Cryptocurrency market list
- Coin search functionality
- Trending cryptocurrencies
- Top market capitalization rankings
- Coin detail pages
- Real-time market prices
- Interactive candlestick charts

### Real-Time Features

- Binance price stream integration
- WebSocket/STOMP live updates
- Instant market data synchronization
- Real-time portfolio valuation

---

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### State Management

- Zustand
- TanStack React Query

### Data Visualization

- Lightweight Charts

### Communication

- Axios
- WebSocket
- STOMP
- SockJS

### UI Components

- Shadcn UI
- Radix UI
- Lucide React

---

## Project Structure

```text
src
├── app
│   ├── (auth)
│   │   ├── login
│   │   └── register
│   └── (dashboard)
│       ├── dashboard
│       │   ├── trade
│       │   ├── wallet
│       │   ├── portfolio
│       │   ├── orders
│       │   └── charts
│
├── components
│   ├── chart
│   ├── dashboard
│   ├── trade
│   ├── wallet
│   └── ui
│
├── lib
│   ├── api
│   │   ├── auth.api.ts
│   │   ├── coins.api.ts
│   │   ├── wallet.api.ts
│   │   ├── portfolio.api.ts
│   │   └── orders.api.ts
│
├── store
│   ├── auth.store.ts
│   └── price.store.ts
│
├── types
└── hooks
```

---

## Screens

### Authentication

- Login
- Register
- Two-Factor Authentication

### Dashboard

- Market Overview
- Trading Interface
- Portfolio Dashboard
- Wallet Management
- Order History

---

## Backend Integration

This frontend is designed to work with the Trading Platform Backend:

### Main APIs

- Authentication
- User Profile
- Wallet
- Orders
- Portfolio
- Cryptocurrency Market Data

### Real-Time Communication

- WebSocket/STOMP connection
- Live cryptocurrency price updates
- Real-time trading information

---

## Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api

NEXT_PUBLIC_WS_URL=http://localhost:8080/api/ws

NEXT_PUBLIC_APP_NAME=Trading Platform
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/trading-platform-frontend.git
```

Install dependencies:

```bash
npm install
```

or

```bash
npm ci
```

---

## Run Locally

Development mode:

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:3000
```

---

## Build for Production

```bash
npm run build
```

Start production server:

```bash
npm start
```

---

## Architecture Overview

```text
                +----------------+
                |   Next.js FE   |
                +--------+-------+
                         |
                  REST APIs
                         |
                         v
                +----------------+
                | Spring Boot BE |
                +--------+-------+
                         |
         +---------------+---------------+
         |                               |
         v                               v
     MySQL                           Redis
         |
         v
  CoinGecko API

WebSocket Flow:
Binance Stream
       |
       v
Spring Boot WebSocket
       |
       v
Next.js Client
```

---

## Key Implementations

### Authentication

- JWT token management
- Persistent login sessions
- Protected route handling

### Trading Engine Integration

- Market order execution
- Limit order placement
- Pending order cancellation
- Balance validation

### State Management

- Zustand for client-side state
- React Query for server state
- Optimized caching strategies

### Real-Time Data

- Live cryptocurrency prices
- Portfolio value updates
- Instant market synchronization

---

## Future Improvements

- TradingView chart integration
- Dark/Light theme support
- Multi-language support
- Push notifications
- Advanced portfolio analytics
- Admin dashboard

---

## Author

**Phuoc Nguyen**

Software Engineer | Full-Stack Developer

GitHub: https://github.com/nguyenphuoc1509
