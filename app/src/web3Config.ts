import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'YO Savings',
  projectId: 'yo-savings-hackathon', // Replace with your WalletConnect project ID
  chains: [base],
  ssr: false,
})
