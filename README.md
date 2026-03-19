# YoVest · Smart DeFi Savings on Base

> **YoVest** (Yo + Invest) is a premium DeFi savings platform on Base that makes growing your crypto as simple as a traditional bank account. With automated SIPs, diversified portfolios, and social gifting, YoVest is the ultimate gateway to institutional-grade yield.

Built on the [Yo Protocol](https://yoprotocol.com/).

![YoVest Hero Banner](https://placehold.co/1200x400/05070A/ffffff?text=YoVest+Professional+Savings)

## ✨ Core Features

### 1. Simple High-Yield Vaults
Direct access to curated yield-bearing vaults like **yoUSD** (USDC) and **yoETH** (WETH).
- **Real-Time Growth**: Watch your interest accumulate per-block.
- **Instant Deposits/Withdrawals**: No lockups, full liquidity.

### 2. Portfolio Baskets (New!)
Don't know which vault to pick? Invest in diversified bundles tailored to your risk profile.
- **Conservative**: 90% yoUSD / 10% yoETH.
- **Balanced**: 50/50 split for steady growth.
- **Aggressive**: 90% yoETH / 10% yoUSD for maximum upside.

### 3. Smart SIP (Recurring Savings)
Automate your wealth building with sophisticated recurring plans.
- **Dollar Cost Average**: Save Daily, Weekly, or Monthly.
- **Automated Execution**: Set it and forget it.

### 4. Yo-Gifts (Social Gifting)
Send yield-bearing assets directly to a friend's wallet or Base Name.
- **Celebratory Themes**: Choose from Classic, Gold, Nitro, or Love themes.
- **Personalized Messages**: Attach a special note to your gift.
- **Surprise Experience**: Recipients get a celebratory confetti popup on their dashboard!

### 5. My Savings Dashboard
Unified view of your financial health.
- **Savings Milestones**: Set goals and track your progress visually.
- **Gift Notifications**: Instantly see and claim gifts from friends.
- **Portfolio Analytics**: Deep dive into your total balance and active yield.

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Framer Motion
- **Web3**: Wagmi + RainbowKit + Viem
- **Protocol**: [Yo Protocol SDK](https://github.com/yo-protocol/yo-protocol-sdk)
- **Backend**: Vercel Serverless Functions + MongoDB (Mongoose)
- **Routing**: React Router 6 (Optimized with Vercel SPA rewrites)

## 📸 Interface Preview

| Vaults Page | My Savings |
| :---: | :---: |
| ![Vaults UI](https://github.com/akshaydhayal/YoVest-Savings/blob/main/src/assets/vaults.png) | ![Dashboard UI](https://github.com/akshaydhayal/YoVest-Savings/blob/main/src/assets/dashboard.png) |

| Portfolio Baskets | Smart SIP |
| :---: | :---: |
| ![Baskets UI](https://github.com/akshaydhayal/YoVest-Savings/blob/main/src/assets/baskets.png) | ![Smart SIP UI](https://github.com/akshaydhayal/YoVest-Savings/blob/main/src/assets/sip.png) |

| Yo-Gifts | Gift Look |
| :---: | :---: |
| ![Baskets UI](https://github.com/akshaydhayal/YoVest-Savings/blob/main/src/assets/gifts.png) | ![Gifts UI](https://github.com/akshaydhayal/YoVest-Savings/blob/main/src/assets/gifts_card.png) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Instance (Atlas or Local)
- Base Mainnet Wallet (Metamask, Coinbase Wallet, etc.)

### Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/akshaydhayal/YoVest-Savings.git
   cd YoVest-Savings
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` in the root:
   ```env
   MONGODB_URI=your_mongodb_uri
   ```

3. **Development**
   ```bash
   npm run dev
   ```

## 🌐 Deployment & Configuration

Deployed on **Vercel** for optimal performance.
- Uses `vercel.json` rewrites to support direct navigation/refreshes in SPA mode.
- Serverless API routes handle Gift and SIP metadata persistence.

---

Built with ❤️ for the **Base** Ecosystem.
