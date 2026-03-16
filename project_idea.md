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
