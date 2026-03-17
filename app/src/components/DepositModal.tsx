import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, Zap, ArrowUpRight, AlertCircle, ArrowDownLeft } from 'lucide-react'
import { useDeposit, useRedeem, useUserPosition, usePrices } from '@yo-protocol/react'
import { parseTokenAmount, VAULTS } from '@yo-protocol/core'
import { useAccount, useChainId, useReadContract, useBalance } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'

const F    = "'Outfit', system-ui, sans-serif"
const FNUM = "'DM Mono', 'Fira Code', monospace"

export default function DepositModal({
  vaultId, vault, accentColor, onClose,
}: {
  vaultId: string
  vault: any
  accentColor: string
  onClose: () => void
}) {
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const { address }         = useAccount()
  const chainId             = useChainId()
  const decimals            = (vault.asset?.decimals || vault.underlying?.decimals) ?? 6
  const vaultAddress        = vault.contracts?.vaultAddress || vault.address
  const { position }        = useUserPosition(vaultAddress, address)
  const actualVaultConfig   = VAULTS[vaultId as keyof typeof VAULTS]
  const tokenAddress        = actualVaultConfig?.underlying?.address?.[chainId ?? 8453]
  const { prices }          = usePrices()

  // Native ETH balance (fallback for UI/debugging if needed, but we rely on ERC20 tokenAddress)
  useBalance({ address })

  // Bulletproof ERC20 token balance explicitly read from the contract
  const { data: erc20BalanceRaw } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!tokenAddress && !!address,
    }
  })

  // -- Deposit Hook --
  const { deposit, step: depStep, isLoading: isDepLoading, isError: isDepError, error: depError, isSuccess: isDepSuccess, reset: resetDep } = useDeposit({
    vault: vaultAddress as `0x${string}`,
    slippageBps: 50,
  })

  // -- Redeem Hook --
  const { redeem, step: redStep, isLoading: isRedLoading, isError: isRedError, error: redError, isSuccess: isRedSuccess, reset: resetRed } = useRedeem({
    vault: vaultAddress as `0x${string}`,
  })

  const isLoading = action === 'deposit' ? isDepLoading : isRedLoading
  const isSuccess = action === 'deposit' ? isDepSuccess : isRedSuccess
  const isError   = action === 'deposit' ? isDepError : isRedError
  const error     = action === 'deposit' ? depError : redError
  const step      = action === 'deposit' ? depStep : redStep

  // -- Balances --
  // Use explicit ERC20 balance if tokenAddress is available; otherwise it's 0.
  const userWalletBalanceBigInt = (erc20BalanceRaw as bigint) || 0n
  const userWalletBalance = formatUnits(userWalletBalanceBigInt, decimals)

  const userPortfolioAssetsBigInt = position?.assets || 0n
  const userPortfolioSharesBigInt = position?.shares || 0n
  const userPortfolioShares = formatUnits(userPortfolioSharesBigInt, decimals) // vault shares usually have same decimals

  const activeBalance = action === 'deposit' ? userWalletBalance : userPortfolioShares

  const handleDeposit = async () => {
    if (!tokenAddress || !address || !amount) return
    try {
      await deposit({
        token: tokenAddress as `0x${string}`,
        amount: parseTokenAmount(amount, decimals),
        chainId: chainId ?? 8453,
      })
    } catch (_) { /* handled by hook */ }
  }

  const handleWithdraw = async () => {
    if (!address || !amount || userPortfolioSharesBigInt === 0n) return
    try {
      let sharesToBurn = 0n
      // If withdrawing MAX
      if (amount === userPortfolioShares) {
        sharesToBurn = userPortfolioSharesBigInt
      } else {
        sharesToBurn = parseTokenAmount(amount, decimals)
      }
      await redeem(sharesToBurn)
    } catch (_) { /* handled by hook */ }
  }

  const numericAmount = parseFloat(amount)
  const isValid       = !isNaN(numericAmount) && numericAmount > 0

  const stepLabel: Record<string, string> = {
    idle:              action === 'deposit' ? 'Deposit' : 'Withdraw',
    'switching-chain': 'Switching to Base…',
    approving:         'Approving token…',
    depositing:        'Depositing…',
    redeeming:         'Withdrawing…', // using redeeming or waiting based on hook step
    waiting:           'Confirming…',
    success:           'Success!',
    error:             'Failed — Try Again',
  }

  const assetSymbol = vault.asset?.symbol || vault.underlying?.symbol

  const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
    'WETH': 'ethereum',
    'ETH': 'ethereum',
    'cbBTC': 'bitcoin', // YO uses 'bitcoin' instead of 'coinbase-wrapped-btc' for its cbBTC vault pricing usually, but we can check prices['bitcoin']
    'BTC': 'bitcoin',
    'USDC': 'usd-coin',
    'EURC': 'euro-coin',
    'XAUt': 'tether-gold',
    'USDT': 'tether',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 420, background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', fontFamily: F }}
        >
          {/* ── Modal header ── */}
          <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: `${accentColor}15`, border: `1px solid ${accentColor}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color={accentColor} />
              </div>
              <div>
                <h2 style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', margin: '0 0 2px' }}>
                  {vault.name ?? vaultId}
                </h2>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                  {action === 'deposit' ? 'Deposit' : 'Withdraw'} · Base
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(148,163,184,0.6)', transition: 'all 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.6)' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Toggle Switch ── */}
            {!isSuccess && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4 }}>
                <button
                  onClick={() => { setAction('deposit'); setAmount(''); resetDep(); resetRed(); }}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.2s',
                    background: action === 'deposit' ? 'rgba(214,255,52,0.1)' : 'transparent',
                    color: action === 'deposit' ? '#d6ff34' : 'rgba(148,163,184,0.6)',
                  }}
                >
                  Deposit
                </button>
                <button
                  onClick={() => { setAction('withdraw'); setAmount(''); resetDep(); resetRed(); }}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.2s',
                    background: action === 'withdraw' ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: action === 'withdraw' ? '#fff' : 'rgba(148,163,184,0.6)',
                  }}
                >
                  Withdraw
                </button>
              </div>
            )}

            {/* ── Amount input ── */}
            {!isSuccess && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    {action === 'deposit' ? 'Amount to Save' : 'Amount to Withdraw'}
                  </label>
                  <button
                    onClick={() => setAmount(activeBalance)}
                    style={{ fontFamily: FNUM, fontSize: 10, fontWeight: 500, color: action === 'deposit' ? '#d6ff34' : '#fff', background: action === 'deposit' ? 'rgba(214,255,52,0.07)' : 'rgba(255,255,255,0.08)', border: action === 'deposit' ? '1px solid rgba(214,255,52,0.15)' : '1px solid rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.04em', transition: 'background 0.15s' }}
                  >
                    MAX: {activeBalance}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    disabled={isLoading}
                    style={{
                      width: '100%', height: 68, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 14, padding: '0 100px 0 16px',
                      fontFamily: FNUM, fontSize: 24, fontWeight: 400, color: '#fff',
                      outline: 'none', transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = action === 'deposit' ? 'rgba(214,255,52,0.38)' : 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                    onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  />
                  <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, padding: '5px 11px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
                    <span style={{ fontFamily: FNUM, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em' }}>
                      {action === 'withdraw' ? `yo${assetSymbol}` : assetSymbol}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Actual Value In USD/Asset ── */}
            {!isSuccess && action === 'withdraw' && amount && (
              <div style={{ textAlign: 'right', marginTop: -9 }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(148,163,184,0.6)', fontFamily: F }}>
                  Actual value:{' ~'}
                  {(() => {
                    const actualUnderlyingBigInt = (parseTokenAmount(amount, decimals) * userPortfolioAssetsBigInt) / (userPortfolioSharesBigInt || 1n)
                    const actualUnderlyingFormatted = formatUnits(actualUnderlyingBigInt, decimals)
                    const coingeckoId = SYMBOL_TO_COINGECKO_ID[assetSymbol as string] || assetSymbol?.toLowerCase()
                    const price = prices?.[coingeckoId] || 0
                    const fiatValue = parseFloat(actualUnderlyingFormatted) * price
                    if (price > 0 && fiatValue > 0) {
                      return fiatValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    }
                    return `${actualUnderlyingFormatted} ${assetSymbol}`
                  })()}
                </span>
              </div>
            )}

            {/* ── Info row ── */}
            {!isSuccess && action === 'deposit' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13 }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 7px' }}>
                    Expected APY
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d6ff34', display: 'inline-block', boxShadow: '0 0 5px rgba(214,255,52,0.7)', animation: 'depPulse 2s ease-in-out infinite' }} />
                    <span style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: '#d6ff34', letterSpacing: '0.04em' }}>LIVE</span>
                  </div>
                </div>
                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13 }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 7px' }}>
                    Deposit Fee
                  </p>
                  <p style={{ fontFamily: FNUM, fontSize: 14, fontWeight: 500, color: '#10b981', margin: 0, letterSpacing: '-0.01em' }}>
                    0%
                  </p>
                </div>
              </div>
            )}

            {/* ── Success state ── */}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0 8px' }}
              >
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={32} color="#10b981" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontFamily: F, fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>{action === 'deposit' ? 'Deposit Successful' : 'Withdraw Successful'}</h3>
                  <p style={{ color: 'rgba(148,163,184,0.55)', fontSize: 13, fontWeight: 400, margin: 0 }}>
                    {action === 'deposit' ? 'Your assets are now earning smart yield.' : 'Your assets have been returned to your wallet.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Error state ── */}
            {isError && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 12 }}>
                <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: F, fontSize: 12, fontWeight: 400, color: '#f87171', margin: 0, lineHeight: 1.55 }}>
                  {error?.message || 'Transaction encountered an error. Please try again.'}
                </p>
              </div>
            )}

            {/* ── CTA ── */}
            <motion.button
              onClick={isSuccess ? onClose : (action === 'deposit' ? handleDeposit : handleWithdraw)}
              disabled={(!isSuccess && !isValid) || isLoading}
              whileTap={{ scale: 0.975 }}
              style={{
                width: '100%', height: 52, borderRadius: 14, border: 'none',
                cursor: (isLoading || (!isSuccess && !isValid)) ? 'not-allowed' : 'pointer',
                background: action === 'deposit' ? '#d6ff34' : '#fff', 
                color: '#05070A',
                fontFamily: F, fontSize: 13, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                transition: 'box-shadow 0.25s, opacity 0.2s',
                boxShadow: action === 'deposit' ? '0 0 24px rgba(214,255,52,0.16)' : '0 0 24px rgba(255,255,255,0.16)',
                opacity: (!isSuccess && !isValid) ? 0.38 : 1,
                marginTop: 2,
              }}
              onMouseEnter={e => { if (!isLoading && (isSuccess || isValid)) (e.currentTarget as HTMLButtonElement).style.boxShadow = action === 'deposit' ? '0 0 40px rgba(214,255,52,0.32)' : '0 0 40px rgba(255,255,255,0.32)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = action === 'deposit' ? '0 0 24px rgba(214,255,52,0.16)' : '0 0 24px rgba(255,255,255,0.16)' }}
            >
              {isLoading && <Loader2 size={16} style={{ animation: 'depSpin 0.8s linear infinite' }} />}
              <span>{isSuccess ? 'Done' : (stepLabel[step] || (action === 'deposit' ? 'Deposit' : 'Withdraw'))}</span>
              {!isLoading && !isSuccess && (action === 'deposit' ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />)}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes depPulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes depSpin  { to{transform:rotate(360deg)} }
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        input[type='number'] { -moz-appearance:textfield; }
      `}</style>
    </AnimatePresence>
  )
}

