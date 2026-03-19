# Project Guide: YO Savings & SIP

A category-defining DeFi savings experience that combines premium personal wealth management with a semi-automated Systematic Investment Plan (SIP).

## Project Overview
This project transforms YO Protocol vaults into a consumer-friendly "Savings Account" on **Base Mainnet**. The goal is to provide a premium UX for long-term wealth building with "One-Click" systematic saving.

---

## 🧭 Technical Logistics

### 1. Network & Chain
*   **Target**: **Base Mainnet**. 
    *   **Phase 1** will focus exclusively on Base to ensure a fast, low-fee experience.
    *   **Base** is the only chain currently supporting Merkl rewards in the SDK, providing extra yield for users.

### 2. Can we build an SIP without custom contracts?
**Yes, using a "One-Click SIP" approach.**
*   **The Signature Constraint**: Standard wallets (like MetaMask) require a manual signature for every transaction. No app can "silently" move funds from an EOA wallet without a custom contract (like a Safe module).
*   **The Hackathon Solution**: We will implement a **Semi-Automated SIP**.
    1.  **Goal Setting**: User specifies a goal (e.g., "Save $100 every Week").
    2.  **Tracking**: The app monitors the schedule.
    3.  **One-Click Execution**: When a deposit is due, the app shows a prominent "Execute SIP" button. The app prepares the transaction (`useDeposit`) with the correct amount. The user just clicks "Sign" in their wallet.
    4.  **Result**: Frictionless, systematic saving that requires **zero custom smart contracts**.

---

## ✨ Key Features

### Phase 1: The "Elite" Savings Dashboard (MVP)
*   **Vault Selection**: Visual grid of all YO vaults with live APY stats.
*   **Portfolio Snapshot**: Aggregated assets and P&L tracking (`useUserPerformance`).
*   **SIP Interface**: A "Set Goal" section where users define their saving frequency and targets.
*   **Smart Reminders**: visual indicators when the user is "On Track" or "Due for a SIP."

### Phase 2: "Gift a Future"
*   **Frictionless Gifting**: Deposit to a specified `recipient` address natively through the SDK.
*   **Visual Receipts**: Beautiful "Success" cards for social sharing.

---

## 🚀 Build Steps

1.  **Setup**: Initialize Vite + React + Tailwind v4 + YO React SDK.
2.  **Design**: Apply the official YO dark-theme aesthetic (#000 background, #D6FF34 neon accent).
3.  **Dashboard**: Fetch and display vault stats and user positions on Base.
4.  **SIP Logic**: Create the "Goal Tracker" UI and the "One-Click SIP" transaction trigger.
5.  **Refinement**: Add smooth animations and mobile responsiveness.





















Yo Protocol Savings App - Feature Proposals
Based on the available @yo-protocol/react hooks (useDeposit, useRedeem, useUserPosition, useVaults, usePrices) and typical patterns for a consumer-friendly DeFi app, here are several engaging and practical features we could implement:

1. Goal-Based Savings (Visual Milestones)
Instead of just depositing money, users can create specific "Goals" (e.g., "New Car", "Emergency Fund", "Vacation"). How it works:

Users assign a target amount to a vault position.
We display a beautiful progress bar showing their total savings + accumulated yield pushing them towards their goal.
Confetti animations when a goal is reached.

2. Interactive Yield Calculator & Projections
A visual tool to show the magic of compound interest. How it works:

A slider where users input a monthly deposit amount and time horizon (1 year, 5 years).
Using current APYs from useVaultState(), we render a graph (recharts is already in the project) comparing "Your Deposits" vs "Yo Protocol Yield".
Highly engaging way to encourage deposits.
3. "One-Click" Diversified Portfolios (Baskets)
Retail users often don't know which vault to pick. How it works:

We create "Risk Profiles" directly in the UI: Conservative (100% yoUSD), Balanced (50% yoUSD / 50% yoETH), Aggressive (100% yoETH).
A single "Deposit" button automatically splits their funds across the chosen vaults using multiple useDeposit calls under the hood.


4. Smart Rebalancing Alerts
Make the app feel like a premium robo-advisor. How it works:

If the user has funds in a vault whose APY drops drastically, and another vault's APY rises, a banner appears: "Optimization Opportunity: Move $500 from Vault A to Vault B for +2% APY".
A 1-click button handles the useRedeem and useDeposit flow.
5. "Bank vs. Yo" Comparison Dashboard
A gamified analytics section. How it works:

Pull the user's total earned yield.
Calculate what they would have earned at an average bank rate (0.5%).
Display a massive number: "You've earned $450 more than your traditional bank!"
Recommendation for Next Steps
Since we just finalized the SIP (Systematic Investment Plan) feature, Goal-Based Savings or the Interactive Yield Calculator would naturally complement it perfectly, turning the app from a simple dashboard into a true financial planner.











Yo-Gift: Simplified Direct Design
Instead of complex "Claim Links," we will implement Direct Gifting. You send yield-bearing assets directly to a friend's wallet, and we use MongoDB to attach the "Social" experience (message, theme, notification).

1. The Direct Flow (Sender)
Choose Recipient: Users enter their friend's wallet address or Base Name (e.g., akshay.base).
Configure Gift:
Amount (e.g., $10 USDC).
Vault (e.g., yoUSD).
Message: "Hope this grows fast! Happy Birthday!"
Execute Transaction:
We trigger useDeposit on the Yo Protocol.
Immediately after (or as part of a batch if supported), the shares are transferred to the friend's address.
Log Social Metadata: The app saves the sender, recipient, and message in the MongoDB gifts collection.
2. The Recipient Experience (Dashboard)
Login: Friend connects their wallet to YoVest.
Surprise Popup: The app checks the MongoDB gifts collection: "You have a Gift! akshay.base sent you $10 in yoUSD! 🎁"
Display Message: A beautiful overlay shows the sender's message and the digital card theme.
Active Portfolio: The gifted $10 is already in their dashboard, earning yield.
3. Why this is "Simple & Practical"
Low Gas: No specialized escrow contract needed.
Immediate Value: The moment the transaction is confirmed, the recipient is earning yield.
Social Connection: Using MongoDB to carry the "Message" means the on-chain data stays clean, but the user experience stays "Human."
4. Technical Change
Update the api/models/Gift.ts to focus on recipientAddress instead of claimCode.