import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'YoVest',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'yo_default', // Add your own in production
  chains: [base],
  ssr: false,
})
