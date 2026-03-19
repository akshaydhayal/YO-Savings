# YoVest · Smart DeFi Savings on Base

> **YoVest** (Yo + Invest) is a simple savings app on Base that helps you grow your money in high-yield vaults. From automatic savings plans to gifting yield and building streaks, YoVest makes DeFi savings easy and social for everyone.

**YoVest** is a consumer-focused savings and investment platform built on the [Yo Protocol](https://yoprotocol.com/). It makes earning interest on your crypto as easy as using a traditional savings account.

![YoVest Hero Banner](https://placehold.co/1200x400/05070A/ffffff?text=YoVest+Banner)

## ✨ Features

### 1. Simple High-Yield Vaults
Grow your crypto with curated vaults for **yoUSD** and **yoETH**.
- **Real-time Interest**: Watch your balance grow every second.
- **Easy Deposits**: One-click interactions to put your money to work.

### 2. SIP (Savings Planner)
Build a habit by setting up a recurring savings plan.
- **Automatic Schedule**: Save Daily, Weekly, or Monthly.
- **Synced Everywhere**: Your plans are securely saved and synced across all your devices.

### 3. Yo-Gift (Social Gifting)
Send "Yield-Bearing" gifts directly to your friends' wallets.
- **Personal Touch**: Attach a message and a digital card to your gift.
- **Instant Value**: Your friend starts earning interest the second they receive the gift.

### 4. Savings Streaks
Stay motivated with a Duolingo-style streak system.
- **Keep it Burning**: Build your streak by saving consistently every week.
- **Rewards**: Earn special badges as you hit major savings milestones.

### 3. Integrated Dashboard
A single source of truth for your financial health.
- **Portfolio Tracking**: View total balance, active yield, and portfolio composition.
- **Interactive Analytics**: Monitor historical trends and earnings growth.

## 🛠 Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Vanilla CSS + Framer Motion (Animations)
- **Web3**: Wagmi + RainbowKit + Viem
- **Protocol**: Yo Protocol SDK & React Hooks
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB (Mongoose)

## 📸 Demo Screenshots

| Dashboard | SIP Planner |
| :---: | :---: |
| ![Dashboard Demo](https://placehold.co/400x300/05070A/ffffff?text=Dashboard+UI) | ![SIP Demo](https://placehold.co/400x300/05070A/ffffff?text=SIP+Planner+UI) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- a MongoDB Cluster
- Vercel CLI (optional for local API testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akshaydhayal/YoVest-Savings.git
   cd YoVest-Savings
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

The project is optimized for **Vercel**.
- The `api/` folder contains serverless functions for the SIP database.
- **Note**: Ensure you add `MONGODB_URI` to your Vercel Environment Variables.

---

Built for the **Base** Ecosystem.
