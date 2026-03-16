import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useUserPositions,
  useVaults,
} from '@yo-protocol/react'
import { VAULTS, formatTokenAmount } from '@yo-protocol/core'
import { ArrowUpRight, LayoutDashboard } from 'lucide-react'

const VAULT_COLORS: Record<string, string> = {
  yoUSD: '#00FF8B',
  yoETH: '#627EEA',
  yoBTC: '#FFAF4F',
  yoEUR: '#4E6FFF',
  yoGOLD: '#FFBF00',
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { positions, isLoading: posLoading } = useUserPositions(address)
  const { vaults } = useVaults()

  const getVaultConfig = (addr: string) =>
    vaults?.find((v: any) => v.contracts.vaultAddress.toLowerCase() === addr.toLowerCase())

  const getVaultId = (addr: string) =>
    Object.entries(VAULTS).find(([, v]) => v.address.toLowerCase() === addr.toLowerCase())?.[0]

  const activePositions = positions?.filter((p) => p.position.shares > 0n) ?? []

  const totalAssetsUsd = activePositions.reduce((acc, p: any) => {
    const vaultAddr = p.vault?.address || p.vault; // handle both possible structures
    const config = getVaultConfig(vaultAddr as string)
    const assets = Number(formatTokenAmount(p.position.assets, (config as any)?.asset?.decimals ?? 6))
    return acc + assets
  }, 0)

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 rounded-full bg-yo-neon-dim border border-yo-neon/20 flex items-center justify-center">
          <ArrowUpRight size={28} className="text-yo-neon" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center">Connect your wallet</h2>
        <p className="text-yo-muted text-center max-w-xs">
          See your savings portfolio, P&L, and transaction history across all YO vaults.
        </p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">My Savings</h1>
        <p className="text-yo-muted text-sm mt-1">Your active positions on Base</p>
      </motion.div>

      {/* Total balance card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-yo-card border border-yo-border rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-yo-neon/5 blur-2xl" />
        <p className="text-xs text-yo-muted uppercase tracking-widest mb-2">Total Balance</p>
        <p className="text-4xl font-bold text-white">
          ${totalAssetsUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-yo-neon mt-2">Across {activePositions.length} active vault{activePositions.length !== 1 ? 's' : ''}</p>
      </motion.div>

      {/* Positions */}
      <section>
        <h2 className="text-sm font-semibold text-yo-muted uppercase tracking-widest mb-4">
          Active Positions
        </h2>
        {posLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-yo-card animate-pulse" />
            ))}
          </div>
        ) : activePositions.length === 0 ? (
          <div className="rounded-2xl border border-yo-border bg-yo-card p-8 text-center">
            <p className="text-yo-muted">No active positions. Deposit into a vault to start saving.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activePositions.map(({ vault, position }: any, i) => {
              const config = getVaultConfig(vault.address)
              const vaultId = getVaultId(vault.address) ?? ''
              const accent = VAULT_COLORS[vaultId] ?? '#D6FF34'
              const assets = formatTokenAmount(position.assets, config?.underlying?.decimals ?? 6)

              return (
                <motion.div
                  key={vault.address}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between bg-yo-card border border-yo-border rounded-2xl px-5 py-4 hover:border-yo-border/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-yo-black border border-yo-border flex items-center justify-center">
                      <LayoutDashboard size={18} style={{ color: accent }} />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{(config as any)?.name ?? vaultId}</p>
                      <p className="text-xs text-yo-muted">{(config as any)?.asset?.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {assets} {(config as any)?.asset?.symbol}
                    </p>
                    <p className="text-xs font-medium text-yo-neon">
                      Connected
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
