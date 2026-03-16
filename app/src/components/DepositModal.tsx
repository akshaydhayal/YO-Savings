import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { useDeposit, useVaultState } from '@yo-protocol/react'
import { parseTokenAmount, type VaultConfig } from '@yo-protocol/core'
import { useAccount, useChainId } from 'wagmi'

interface Props {
  vaultId: string
  vault: VaultConfig
  accentColor: string
  onClose: () => void
}

export default function DepositModal({ vaultId, vault, accentColor, onClose }: { vaultId: string; vault: any; accentColor: string; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const { address } = useAccount()
  const chainId = useChainId()
  const vaultAddress = vault.contracts?.vaultAddress || vault.address
  const { vaultState } = useVaultState(vaultAddress)

  const decimals = (vault.asset?.decimals || vault.underlying?.decimals) ?? 6
  // Handle both possible address structures
  const tokenAddress = vault.asset?.address || (vault.underlying?.address ? (vault.underlying.address[chainId ?? 8453] || vault.underlying.address[8453]) : undefined)

  const { deposit, step, isLoading, isError, error, isSuccess } = useDeposit({
    vault: vaultAddress as `0x${string}`,
    slippageBps: 50,
  })

  const handleDeposit = async () => {
    if (!tokenAddress || !address || !amount) return
    try {
      await deposit({
        token: tokenAddress as `0x${string}`,
        amount: parseTokenAmount(amount, decimals),
        chainId: chainId ?? 8453,
      })
    } catch (e) {
      // handled by hook
    }
  }

  const numericAmount = parseFloat(amount)
  const isValid = !isNaN(numericAmount) && numericAmount > 0

  const stepLabel: Record<string, string> = {
    idle: 'Deposit',
    'switching-chain': 'Switching to Base…',
    approving: 'Approving token…',
    depositing: 'Depositing…',
    waiting: 'Confirming…',
    success: 'Success!',
    error: 'Failed. Try again.',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="w-full max-w-md bg-yo-card rounded-2xl border border-yo-border overflow-hidden"
        >
          <div className="h-0.5 w-full" style={{ background: accentColor }} />
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{vault.name ?? vaultId}</p>
                <p className="text-xs text-yo-muted">{(vault.asset?.symbol || vault.underlying?.symbol)} · Base</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-yo-muted hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {!isSuccess && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-yo-muted">Amount to deposit</label>
                <div className="flex items-center gap-2 bg-yo-black rounded-xl border border-yo-border focus-within:border-yo-neon/50 px-4 py-3">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-transparent text-white text-lg font-semibold outline-none"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-yo-muted font-medium">{(vault.asset?.symbol || vault.underlying?.symbol)}</span>
                </div>
              </div>
            )}

            {!isSuccess && vaultState && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-yo-black/60 rounded-xl p-3">
                  <p className="text-yo-muted text-xs mb-0.5">Yield</p>
                  <p className="font-bold text-yo-neon">Live</p>
                </div>
                <div className="bg-yo-black/60 rounded-xl p-3">
                  <p className="text-yo-muted text-xs mb-0.5">Slippage</p>
                  <p className="font-bold text-white">0.5%</p>
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 size={48} className="text-yo-neon" />
                <p className="text-lg font-bold text-white">Deposit Successful!</p>
              </div>
            )}

            {isError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                {error?.message ?? 'Transaction failed'}
              </div>
            )}

            <button
              onClick={isSuccess ? onClose : handleDeposit}
              disabled={(!isSuccess && !isValid) || isLoading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold bg-yo-neon text-black flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isSuccess ? 'Done' : stepLabel[step] ?? 'Deposit'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
