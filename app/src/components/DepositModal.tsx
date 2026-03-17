import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, Zap, ArrowUpRight, AlertCircle } from 'lucide-react'
import { useDeposit, useVaultState } from '@yo-protocol/react'
import { parseTokenAmount } from '@yo-protocol/core'
import { useAccount, useChainId, useBalance } from 'wagmi'

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
  const [amount, setAmount] = useState('')
  const { address }         = useAccount()
  const chainId             = useChainId()
  const decimals            = (vault.asset?.decimals || vault.underlying?.decimals) ?? 6
  const vaultAddress        = vault.contracts?.vaultAddress || vault.address
  const { vaultState }      = useVaultState(vaultAddress)
  const tokenAddress        = vault.asset?.address
    || (vault.underlying?.address
        ? (vault.underlying.address[chainId ?? 8453] || vault.underlying.address[8453])
        : undefined)

  const { data: balanceData } = useBalance({
    address,
    token: tokenAddress as `0x${string}`,
  })

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
    } catch (_) { /* handled by hook */ }
  }

  const numericAmount = parseFloat(amount)
  const isValid       = !isNaN(numericAmount) && numericAmount > 0

  const stepLabel: Record<string, string> = {
    idle:              'Deposit',
    'switching-chain': 'Switching to Base…',
    approving:         'Approving token…',
    depositing:        'Depositing…',
    waiting:           'Confirming…',
    success:           'Success!',
    error:             'Failed — Try Again',
  }

  const userBalance = vaultState?.userAssetBalance
    ? (Number(vaultState.userAssetBalance) / 10 ** decimals).toFixed(4)
    : '0.00'

  const assetSymbol = vault.asset?.symbol || vault.underlying?.symbol

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
                  Deposit · Base
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

            {/* ── Amount input ── */}
            {!isSuccess && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    Amount to Save
                  </label>
                  <button
                    onClick={() => {
                      if (userBalance && userBalance !== '0.00') setAmount(userBalance)
                    }}
                    style={{ fontFamily: FNUM, fontSize: 10, fontWeight: 500, color: '#d6ff34', background: 'rgba(214,255,52,0.07)', border: '1px solid rgba(214,255,52,0.15)', padding: '2px 8px', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.04em', transition: 'background 0.15s' }}
                  >
                    MAX: {userBalance}
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
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(214,255,52,0.38)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                    onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  />
                  <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, padding: '5px 11px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
                    <span style={{ fontFamily: FNUM, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em' }}>
                      {assetSymbol}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Info row ── */}
            {!isSuccess && (
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
                  <h3 style={{ fontFamily: F, fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Deposit Successful</h3>
                  <p style={{ color: 'rgba(148,163,184,0.55)', fontSize: 13, fontWeight: 400, margin: 0 }}>Your assets are now earning smart yield.</p>
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
              onClick={isSuccess ? onClose : handleDeposit}
              disabled={(!isSuccess && !isValid) || isLoading}
              whileTap={{ scale: 0.975 }}
              style={{
                width: '100%', height: 52, borderRadius: 14, border: 'none',
                cursor: (isLoading || (!isSuccess && !isValid)) ? 'not-allowed' : 'pointer',
                background: '#d6ff34', color: '#05070A',
                fontFamily: F, fontSize: 13, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                transition: 'box-shadow 0.25s, opacity 0.2s',
                boxShadow: '0 0 24px rgba(214,255,52,0.16)',
                opacity: (!isSuccess && !isValid) ? 0.38 : 1,
                marginTop: 2,
              }}
              onMouseEnter={e => { if (!isLoading && (isSuccess || isValid)) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(214,255,52,0.32)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(214,255,52,0.16)' }}
            >
              {isLoading && <Loader2 size={16} style={{ animation: 'depSpin 0.8s linear infinite' }} />}
              <span>{isSuccess ? 'Done' : (stepLabel[step] ?? 'Deposit')}</span>
              {!isLoading && !isSuccess && <ArrowUpRight size={15} />}
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



// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { X, Loader2, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react'
// import { useDeposit, useVaultState } from '@yo-protocol/react'
// import { parseTokenAmount } from '@yo-protocol/core'
// import { useAccount, useChainId } from 'wagmi'

// export default function DepositModal({ vaultId, vault, accentColor, onClose }: { vaultId: string; vault: any; accentColor: string; onClose: () => void }) {
//   const [amount, setAmount] = useState('')
//   const { address } = useAccount()
//   const chainId = useChainId()
//   const decimals = (vault.asset?.decimals || vault.underlying?.decimals) ?? 6
//   const vaultAddress = vault.contracts?.vaultAddress || vault.address
//   const { vaultState } = useVaultState(vaultAddress)
//   // Handle both possible address structures
//   const tokenAddress = vault.asset?.address || (vault.underlying?.address ? (vault.underlying.address[chainId ?? 8453] || vault.underlying.address[8453]) : undefined)

//   const { data: balanceData } = useBalance({
//     address,
//     token: tokenAddress as `0x${string}`,
//   })

//   const { deposit, step, isLoading, isError, error, isSuccess } = useDeposit({
//     vault: vaultAddress as `0x${string}`,
//     slippageBps: 50,
//   })

//   const handleDeposit = async () => {
//     if (!tokenAddress || !address || !amount) return
//     try {
//       await deposit({
//         token: tokenAddress as `0x${string}`,
//         amount: parseTokenAmount(amount, decimals),
//         chainId: chainId ?? 8453,
//       })
//     } catch (e) {
//       // handled by hook
//     }
//   }

//   const numericAmount = parseFloat(amount)
//   const isValid = !isNaN(numericAmount) && numericAmount > 0

//   const stepLabel: Record<string, string> = {
//     idle: 'Deposit',
//     'switching-chain': 'Switching to Base…',
//     approving: 'Approving token…',
//     depositing: 'Depositing…',
//     waiting: 'Confirming…',
//     success: 'Success!',
//     error: 'Failed. Try again.',
//   }

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
//         onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
//       >
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.9, y: 20 }}
//             className="w-full max-w-md glass rounded-[32px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.8)]"
//           >
//             <div className="p-8 space-y-8">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
//                     <Zap size={24} style={{ color: accentColor }} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-white tracking-tight">{vault.name ?? vaultId}</h2>
//                     <p className="text-xs font-bold text-yo-muted uppercase tracking-widest">Deposit Assets · Base</p>
//                   </div>
//                 </div>
//                 <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-yo-muted hover:text-white hover:bg-white/10 transition-all">
//                   <X size={20} />
//                 </button>
//               </div>

//               {!isSuccess && (
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-end px-1">
//                     <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em]">Amount to Save</label>
//                     <p className="text-[10px] font-bold text-yo-neon uppercase">Available: {vaultState?.userAssetBalance ? (Number(vaultState.userAssetBalance) / 10**decimals).toFixed(4) : '0.00'}</p>
//                   </div>
//                   <div className="group relative">
//                     <input
//                       type="number"
//                       placeholder="0.00"
//                       value={amount}
//                       onChange={(e) => setAmount(e.target.value)}
//                       className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl px-6 text-3xl font-bold text-white outline-none focus:border-yo-neon/50 focus:bg-white/[0.08] transition-all placeholder:text-white/10"
//                       disabled={isLoading}
//                     />
//                     <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/5">
//                       <span className="text-sm font-bold text-white">{(vault.asset?.symbol || vault.underlying?.symbol)}</span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {!isSuccess && (
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
//                     <p className="text-[10px] font-bold text-yo-muted uppercase tracking-widest mb-1">Expected APY</p>
//                     <p className="text-lg font-bold text-yo-neon">Live</p>
//                   </div>
//                   <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
//                     <p className="text-[10px] font-bold text-yo-muted uppercase tracking-widest mb-1">Fee</p>
//                     <p className="text-lg font-bold text-white">0%</p>
//                   </div>
//                 </div>
//               )}

//               {isSuccess && (
//                 <div className="flex flex-col items-center gap-6 py-8">
//                   <div className="w-20 h-20 rounded-full bg-yo-neon/10 border border-yo-neon/20 flex items-center justify-center">
//                     <CheckCircle2 size={40} className="text-yo-neon" />
//                   </div>
//                   <div className="text-center space-y-2">
//                     <h3 className="text-2xl font-bold text-white">Deposit Successful</h3>
//                     <p className="text-yo-muted font-medium">Your assets are now earning smart yield.</p>
//                   </div>
//                 </div>
//               )}

//               {isError && (
//                 <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
//                   {error?.message || 'Transaction encountered an error. Please try again.'}
//                 </div>
//               )}

//               <button
//                 onClick={isSuccess ? onClose : handleDeposit}
//                 disabled={(!isSuccess && !isValid) || isLoading}
//                 className="w-full h-16 rounded-2xl text-md font-bold transition-all duration-300 disabled:opacity-30 disabled:grayscale bg-yo-neon text-black hover:shadow-[0_0_40px_rgba(214,255,52,0.3)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
//               >
//                 {isLoading && <Loader2 size={20} className="animate-spin" />}
//                 <span className="uppercase tracking-widest">{isSuccess ? 'Done' : stepLabel[step] ?? 'Deposit'}</span>
//                 {!isLoading && !isSuccess && <ArrowUpRight size={20} />}
//               </button>
//             </div>
//           </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   )
// }
