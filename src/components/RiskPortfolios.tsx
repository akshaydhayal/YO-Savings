import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, Flame, X, CheckCircle2, Loader2 } from 'lucide-react'
import { useAccount, useChainId, useReadContract, useBalance, useWriteContract } from 'wagmi'
import { useDeposit, usePrices } from '@yo-protocol/react'
import { parseTokenAmount, VAULTS } from '@yo-protocol/core'
import { erc20Abi, formatUnits } from 'viem'

const F    = "'Outfit', system-ui, sans-serif"
const FNUM = "'DM Mono', 'Fira Code', monospace"

const PROFILES = [
  {
    id: 'conservative', title: 'Conservative', icon: Shield, color: '#00FF8B',
    desc: 'Focus on stability. 90% yoUSD, 10% yoETH.',
    allocations: [{ vaultId: 'yoUSD', pct: 90 }, { vaultId: 'yoETH', pct: 10 }]
  },
  {
    id: 'balanced', title: 'Balanced', icon: Zap, color: '#D6FF34',
    desc: 'Perfect balance. 50% yoUSD, 50% yoETH.',
    allocations: [{ vaultId: 'yoUSD', pct: 50 }, { vaultId: 'yoETH', pct: 50 }]
  },
  {
    id: 'aggressive', title: 'Aggressive', icon: Flame, color: '#FF4D4D',
    desc: 'High growth potential. 10% yoUSD, 90% yoETH.',
    allocations: [{ vaultId: 'yoUSD', pct: 10 }, { vaultId: 'yoETH', pct: 90 }]
  }
]

const SYMBOL_TO_CG: Record<string, string> = {
  'WETH': 'ethereum', 'ETH': 'ethereum',
  'USDC': 'usd-coin'
}
export default function RiskPortfolios() {
  const [selectedProfile, setSelectedProfile] = useState<typeof PROFILES[0] | null>(null)

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            One-Click Portfolios
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: 13, fontWeight: 400, margin: '0 0 14px' }}>
            Diversify instantly based on your risk tolerance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="port-grid">
          {PROFILES.map((prof) => (
            <motion.div
              key={prof.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedProfile(prof)}
              style={{
                background: 'rgba(13,17,23,0.75)', border: `1px solid ${prof.color}40`, borderRadius: 20,
                padding: '24px', backdropFilter: 'blur(12px)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s',
                boxShadow: `0 8px 32px ${prof.color}10`
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(13,17,23,0.75)' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${prof.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <prof.icon size={22} color={prof.color} />
              </div>
              <h3 style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{prof.title}</h3>
              <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 12, lineHeight: 1.5, margin: '0 0 20px', minHeight: 40 }}>{prof.desc}</p>
              
              <div style={{ width: '100%', height: 6, borderRadius: 3, display: 'flex', overflow: 'hidden', marginBottom: 20 }}>
                {prof.allocations.map((a, i) => {
                  const vColor = a.vaultId === 'yoUSD' ? '#00FF8B' : '#627EEA'
                  return <div key={i} style={{ width: `${a.pct}%`, background: vColor, borderRight: i === 0 ? '1px solid #111' : 'none' }} />
                })}
              </div>

              <button style={{
                background: 'transparent', border: `1px solid ${prof.color}60`, borderRadius: 10, color: prof.color,
                padding: '8px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', width: '100%', cursor: 'pointer', fontFamily: F
              }}>
                Invest
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedProfile && (
        <BundleModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}

      <style>{`
        @media (max-width: 768px) { .port-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  )
}

function BundleModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { prices } = usePrices()
  const [totalStr, setTotalStr] = useState('')
  const [step, setStep] = useState(0) // 0: input, 1: executing, 2: success, -1: error
  const [allocs] = useState<any[]>(profile.allocations)
  const [payWith, setPayWith] = useState<'USDC' | 'ETH'>('USDC')
  const { writeContractAsync } = useWriteContract()
  
  // Balance checks
  const usdcAddress = VAULTS.yoUSD.underlying?.address?.[chainId ?? 8453] as `0x${string}`
  const wethAddress = VAULTS.yoETH.underlying?.address?.[chainId ?? 8453] as `0x${string}`
  const { data: ethBalance } = useBalance({ address })
  const { data: usdcBalance } = useReadContract({ address: usdcAddress, abi: erc20Abi, functionName: 'balanceOf', args: address ? [address] : undefined })
  const { data: wethBalance } = useReadContract({ address: wethAddress, abi: erc20Abi, functionName: 'balanceOf', args: address ? [address] : undefined })

  // Pre-generate deposit hooks for all potential vaults
  // Increased slippage to 1000bps (10%) for diversifications to handle smaller swap sizes/price impact
  const depUSD  = useDeposit({ vault: VAULTS.yoUSD.address as `0x${string}`, slippageBps: 1000 })
  const depETH  = useDeposit({ vault: VAULTS.yoETH.address as `0x${string}`, slippageBps: 1000 })

  const DEPOSIT_MAP: Record<string, any> = { yoUSD: depUSD, yoETH: depETH }

  const handleDeposit = async () => {
    if (!address || !totalStr || !prices || !userHasBalance) return
    const inputAmt = parseFloat(totalStr)
    if (isNaN(inputAmt) || inputAmt <= 0) return

    setStep(1)
    try {
      // 1. Determine Source Asset Details based on user selection
      const sourceVaultId = payWith === 'USDC' ? 'yoUSD' : 'yoETH'
      const sourceVault = VAULTS[sourceVaultId]
      const sourceTokenAddr = (sourceVault.underlying?.address as any)?.[chainId ?? 8453] as `0x${string}`
      const sourceDec = sourceVault.underlying?.decimals ?? 18
      
      const sourceCgId = payWith === 'USDC' ? 'usd-coin' : 'ethereum'
      const sourcePrice = (prices as any)?.[sourceCgId] ?? 1

      // 2. Handle Native ETH wrapping if needed
      if (payWith === 'ETH') {
        const requiredWeth = parseTokenAmount(requiredSourceAmount.toFixed(18), 18)
        if ((wethBalance || 0n) < requiredWeth) {
          const toWrap = requiredWeth - (wethBalance || 0n)
          await writeContractAsync({
            address: wethAddress,
            abi: [{ name: 'deposit', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] }],
            functionName: 'deposit',
            value: toWrap
          })
        }
      }

      for (const a of allocs) {
        if (a.pct <= 0) continue
        
        // 2. Calculate how much of the SOURCE token to send to this vault
        // The total investment is in USD terms (inputAmt). We calculate the USD slice, 
        // then convert that slice back into the source asset amount.
        const splitUsdValue = (inputAmt * a.pct) / 100
        const sourceTokenSplitAmount = splitUsdValue / sourcePrice
        
        // 3. Execute the deposit using the SOURCE token (activating the Gateway Swap)
        await DEPOSIT_MAP[a.vaultId].deposit({ 
          token: sourceTokenAddr, 
          amount: parseTokenAmount(sourceTokenSplitAmount.toFixed(sourceDec > 8 ? 8 : sourceDec), sourceDec), 
          chainId: chainId ?? 8453 
        })
      }
      setStep(2)
    } catch (err) {
      console.error(err)
      setStep(-1)
    }
  }

  const numeric = parseFloat(totalStr) || 0
  const totalPct = allocs.reduce((s, a) => s + a.pct, 0)
  const isValid = numeric > 0 && totalPct === 100

  const displayUsdValue = numeric
  const sourceCgMap: Record<string, string> = { USDC: 'usd-coin', ETH: 'ethereum' }
  const sourceCgId = sourceCgMap[payWith as 'USDC' | 'ETH'] || 'usd-coin'
  const sourcePrice = (prices as any)?.[sourceCgId] ?? 1
  const requiredSourceAmount = displayUsdValue / sourcePrice

  const userHasBalance = (() => {
    if (payWith === 'USDC') {
      const bal = parseFloat(formatUnits(usdcBalance || 0n, 6))
      return bal >= requiredSourceAmount
    } else if (payWith === 'ETH') {
      const ethBal = parseFloat(ethBalance?.formatted || '0')
      const wethBal = parseFloat(formatUnits(wethBalance || 0n, 18))
      return (ethBal + wethBal) >= requiredSourceAmount
    }
    return false
  })()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget && step !== 1) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
          style={{ 
            width: '100%', 
            maxWidth: 460, 
            maxHeight: 'calc(100vh - 40px)', 
            overflowY: 'auto', 
            background: 'rgba(13,17,23,0.95)', 
            border: `1px solid ${profile.color}40`, 
            borderRadius: 24, 
            padding: '18px', 
            fontFamily: F,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
            
          }}
          className="hide-scrollbar"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <profile.icon size={20} color={profile.color} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>{profile.title}</h2>
            </div>
            {step !== 1 && (
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
            )}
          </div>

          {step === 0 && (
            <>
              {/* Pay With Selector */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>Pay With</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['USDC', 'ETH'].map(asset => (
                    <button
                      key={asset}
                      onClick={() => setPayWith(asset as any)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 10, border: `1px solid ${payWith === asset ? profile.color : 'rgba(255,255,255,0.08)'}`,
                        background: payWith === asset ? `${profile.color}15` : 'rgba(255,255,255,0.03)',
                        color: payWith === asset ? profile.color : 'rgba(255,255,255,0.5)',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: payWith === asset ? profile.color : 'rgba(255,255,255,0.2)' }} />
                      {asset}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Investment Amount (USD)</label>
                  {displayUsdValue > 0 && (
                    <span style={{ fontSize: 10, color: userHasBalance ? 'rgba(255,255,255,0.4)' : '#f87171', fontWeight: 600 }}>
                      {payWith === 'ETH' ? `≈ ${requiredSourceAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH` : `≈ ${requiredSourceAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`}
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    placeholder="1000"
                    value={totalStr}
                    onChange={e => setTotalStr(e.target.value)}
                    style={{ width: '100%', padding: '14px 60px 14px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${!userHasBalance && displayUsdValue > 0 ? '#f8717140' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, color: '#fff', fontSize: 20, outline: 'none', boxSizing: 'border-box', fontFamily: FNUM }}
                  />
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 13 }}>USD</span>
                </div>
                {isValid && displayUsdValue > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    {!userHasBalance && <p style={{ fontSize: 9, color: '#f87171', margin: 0, fontWeight: 700 }}>Insufficient {payWith} Balance</p>}
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: 0, marginLeft: 'auto' }}>
                      You will pay approximately <b>{requiredSourceAmount.toFixed(payWith === 'ETH' ? 6 : 2)} {payWith}</b>
                    </p>
                  </div>
                )}
              </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Allocation Split</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {allocs.map((a: any, i: number) => {
                      return (
                        <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{a.vaultId}</span>
                              <span style={{ color: profile.color, fontSize: 10, fontWeight: 700, padding: '2px 6px', background: `${profile.color}10`, borderRadius: 4 }}>{a.pct}%</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              {(() => {
                                const targetPrice = (prices as any)?.[SYMBOL_TO_CG[VAULTS[a.vaultId as keyof typeof VAULTS].underlying?.symbol || ''] ?? 'usd-coin'] ?? 1
                                const splitUsdValue = (displayUsdValue * a.pct) / 100
                                const targetTokenAmt = splitUsdValue / targetPrice
                                return (
                                  <>
                                    <span style={{ color: '#fff', fontSize: 11, fontFamily: FNUM, display: 'block' }}>{targetTokenAmt.toLocaleString(undefined, { maximumFractionDigits: 8 })} Tokens</span>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>${splitUsdValue.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
                                  </>
                                )
                              })()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: totalPct === 100 ? '#10b981' : '#f87171', fontWeight: 700 }}>Total: {totalPct}%</span>
                  {totalPct !== 100 && <span style={{ fontSize: 9, color: 'rgba(248,113,113,0.6)' }}>Must equal 100%</span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: 'rgba(214,255,52,0.05)', borderRadius: 12, border: '1px solid rgba(214,255,52,0.1)', marginBottom: 16 }}>
                <Zap size={14} color={profile.color} />
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.4 }}>
                  Smart conversion: Your <b>{payWith}</b> will be automatically diversified across {allocs.length} vaults. 
                  <span style={{ display: 'block', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>* This flow simulates swap-and-deposit automation.</span>
                </p>
              </div>

              <button
                onClick={handleDeposit}
                disabled={!isValid || !userHasBalance}
                style={{ width: '100%', padding: '16px', background: profile.color, border: 'none', borderRadius: 14, color: '#000', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: (isValid && userHasBalance) ? 'pointer' : 'not-allowed', opacity: (isValid && userHasBalance) ? 1 : 0.5, transition: 'all 0.2s', boxShadow: (isValid && userHasBalance) ? `0 0 24px ${profile.color}30` : 'none' }}
              >
                Start One-Click Deposit
              </button>
            </>
          )}

          {step === 1 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Loader2 size={40} color={profile.color} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Executing Portfolio</h3>
              <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 13 }}>Please approve the transactions in your wallet sequentially.</p>
            </div>
          )}

          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Assets Allocated</h3>
              <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 13, marginBottom: 24 }}>Your custom portfolio bundle has been successfully deposited.</p>
              <button onClick={onClose} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Return to App</button>
            </div>
          )}

          {step === -1 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <X size={48} color="#f87171" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Execution Halted</h3>
              <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 13, marginBottom: 24 }}>A transaction was rejected or failed during core allocation.</p>
              <button onClick={() => setStep(0)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Try Again</button>
            </div>
          )}
        </motion.div>
      </motion.div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </AnimatePresence>
  )
}
