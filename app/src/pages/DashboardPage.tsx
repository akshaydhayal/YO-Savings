import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAccount, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useUserPositions, usePrices } from '@yo-protocol/react'
import { VAULTS } from '@yo-protocol/core'
import { ArrowUpRight, TrendingUp, Zap, BarChart3, Wallet, PieChart, Activity } from 'lucide-react'
import { formatUnits } from 'viem'

const F    = "'Outfit', system-ui, sans-serif"
const FNUM = "'DM Mono', 'Fira Code', monospace"

const SYMBOL_TO_CG: Record<string, string> = {
  'WETH': 'ethereum',  'ETH': 'ethereum',
  'cbBTC': 'bitcoin',  'BTC': 'bitcoin',
  'USDC': 'usd-coin',  'EURC': 'euro-coin',
  'XAUt': 'tether-gold', 'USDT': 'tether',
}

const VAULT_COLORS: Record<string, string> = {
  yoUSD: '#00FF8B', yoETH: '#627EEA', yoBTC: '#FFAF4F',
  yoEUR: '#4E6FFF', yoGOLD: '#FFBF00', yoUSDT: '#26A17B',
}

const CARD: React.CSSProperties = {
  background: 'rgba(13,17,23,0.75)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 20,
  backdropFilter: 'blur(12px)',
}
const LABEL: React.CSSProperties = {
  fontSize: 9, fontWeight: 600,
  color: 'rgba(148,163,184,0.65)',
  textTransform: 'uppercase', letterSpacing: '0.2em',
}

function MiniBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  const w = 6, gap = 3, h = 32
  return (
    <svg width={values.length * (w + gap) - gap} height={h} viewBox={`0 0 ${values.length * (w + gap) - gap} ${h}`}>
      {values.map((v, i) => {
        const barH = Math.max((v / max) * h, 2)
        return <rect key={i} x={i * (w + gap)} y={h - barH} width={w} height={barH} rx={2} fill={i === values.length - 1 ? color : `${color}55`} />
      })}
    </svg>
  )
}

const DonutChart = ({ slices, isLoading }: { slices: { pct: number; color: string }[]; isLoading?: boolean }) => {
  const r = 40, circ = 2 * Math.PI * r
  let cumulative = 0
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      {isLoading ? (
        <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={12} />
      ) : (
        slices.map((s, i) => {
          const dash = (s.pct / 100) * circ
          const offset = -(cumulative / 100) * circ + circ / 4
          cumulative += s.pct
          return <circle key={i} cx={50} cy={50} r={r} fill="none" stroke={s.color} strokeWidth={12} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={offset} />
        })
      )}
      <circle cx={50} cy={50} r={35} fill="rgba(13,17,23,0.95)" />
    </svg>
  )
}

const Skeleton = ({ width, height, borderRadius = 8 }: { width: string | number; height: string | number; borderRadius?: number }) => (
  <div style={{ width, height, borderRadius, background: 'rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
    <motion.div
      animate={{ x: ['-100%', '100%'] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }}
    />
  </div>
)

export default function DashboardPage() {
  const { address, isConnected }    = useAccount()
  const chainId                     = useChainId()
  const { positions, isLoading: posLoading } = useUserPositions(address)
  const { prices, isLoading: priceLoading }  = usePrices()
  const isLoading = posLoading || priceLoading

  // ─── Build enriched list straight from positions (NOT from useVaults) ───────
  // This is the approach that reliably works — positions is the source of truth.
  const enriched = useMemo(() => {
    if (!positions) return []

    return positions
      .filter((p: any) => {
        try { return p.position?.shares > 0n } catch { return false }
      })
      .map((p: any) => {
        // Extract vault address — p.vault can be string OR { id: "yoETH" } OR { address: string }
        const rawVault   = p.vault
        const rawId      = typeof rawVault === 'string' ? rawVault : (rawVault?.id || '')
        const vaultAddr  = typeof rawVault === 'string' ? rawVault : (rawVault?.contracts?.vaultAddress || rawVault?.address || rawId)

        // Try direct ID match first ("yoETH"), then fallback to address
        let vaultId = ''
        let vaultConfig = undefined

        if (VAULTS[rawId as keyof typeof VAULTS]) {
          vaultId = rawId
          vaultConfig = VAULTS[rawId as keyof typeof VAULTS]
        } else {
          const vaultEntry = Object.entries(VAULTS).find(
            ([, v]) => v.address.toLowerCase() === vaultAddr.toLowerCase()
          )
          vaultId = vaultEntry?.[0] ?? ''
          vaultConfig = vaultEntry?.[1]
        }

        const symbol        = vaultConfig?.underlying?.symbol ?? rawVault?.asset?.symbol ?? '?'
        const decimals      = vaultConfig?.underlying?.decimals ?? rawVault?.asset?.decimals ?? 6
        const name          = vaultId || rawVault?.name || 'Vault'
        
        const shareSymbol   = rawVault?.shareAsset?.symbol ?? vaultId
        const shareDecimals = rawVault?.shareAsset?.decimals ?? decimals
        const sharePrice    = Number(rawVault?.sharePrice?.formatted || 1)

        const yield1d      = Number(rawVault?.yield?.['1d'] || 0)
        const yield30d     = Number(rawVault?.yield?.['30d'] || 0)

        const sharesBigInt = p.position.shares as bigint
        const tokenAmount  = formatUnits(sharesBigInt, shareDecimals)
        const tokenNum     = Number(tokenAmount)
        const cgId         = SYMBOL_TO_CG[symbol] ?? symbol.toLowerCase()
        const oraclePrice  = (prices as any)?.[cgId] ?? 0
        const price        = sharePrice * oraclePrice
        const usdValue     = tokenNum * price
        const accent       = VAULT_COLORS[vaultId] ?? '#d6ff34'
        const spark        = [0.65, 0.7, 0.68, 0.78, 0.85, 0.92, 1].map(r => Math.max(tokenNum * r, 0))

        return { vaultId, name, symbol, shareSymbol, decimals, accent, tokenAmount, tokenNum, usdValue, price, oraclePrice, spark, vaultAddr, yield1d, yield30d }
      })
      .filter((e: any) => e.vaultId !== '')   // only if we successfully resolved
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, prices, chainId])

  const totalUsd = enriched.reduce((s: number, p: any) => s + p.usdValue, 0)
  const topPos   = enriched.reduce((best: any, p: any) => (!best || p.usdValue > best.usdValue) ? p : best, null)
  const donut    = enriched.map((p: any) => ({
    pct: totalUsd > 0 ? (p.usdValue / totalUsd) * 100 : 100 / enriched.length,
    color: p.accent,
  }))

  // ── Not connected ────────────────────────────────────────────────────────────
  if (!isConnected) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 24, fontFamily: F }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(214,255,52,0.07)', border: '1px solid rgba(214,255,52,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ArrowUpRight size={24} color="#d6ff34" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: F, fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Connect your wallet</h2>
        <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: 14, maxWidth: 300, lineHeight: 1.6, margin: 0 }}>See your savings portfolio, yield analytics, and allocation breakdown.</p>
      </div>
      <ConnectButton />
    </div>
  )

  // ── Connected ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: 9, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Portfolio Secure</span>
          </div>
          <h1 style={{ fontFamily: F, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.022em', margin: 0 }}>Financial Overview</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ height: 38, padding: '0 16px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', fontFamily: F, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
            Export History
          </button>
          <Link to="/sip" style={{ height: 38, padding: '0 16px', borderRadius: 11, background: '#d6ff34', color: '#05070A', fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={13} />New Savings Plan
          </Link>
        </div>
      </header>

      {/* ── Top Metrics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="dash-metric-grid">
        {[
          {
            label: 'Net Savings Value', Icon: TrendingUp, accent: '#d6ff34',
            value: isLoading ? <Skeleton width={120} height={32} /> : (totalUsd > 0
              ? <span style={{ color: '#fff' }}>${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              : <span style={{ color: 'rgba(255,255,255,0.3)' }}>$0.00</span>),
            sub: isLoading ? <Skeleton width={100} height={12} /> : <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><ArrowUpRight size={11} />Earning Yield Now</span>,
          },
          {
            label: 'Active Capital', Icon: Zap, accent: '#627EEA',
            value: isLoading ? <Skeleton width={40} height={32} /> : <span style={{ color: '#fff' }}>{enriched.length}</span>,
            sub: <span style={{ color: 'rgba(148,163,184,0.6)' }}>Positions Active</span>,
          },
          {
            label: 'Total Est. Yield', Icon: BarChart3, accent: '#10b981',
            value: isLoading ? <Skeleton width={80} height={32} /> : <span style={{ color: '#10b981' }}>
              ${enriched.reduce((s, p) => s + (p.usdValue * (p.yield30d / 100)), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>,
            sub: <span style={{ color: 'rgba(148,163,184,0.6)' }}>Estimated Annual</span>,
          },
          {
            label: 'Top Asset', Icon: PieChart, accent: topPos?.accent ?? '#fff',
            value: isLoading ? <Skeleton width={80} height={32} /> : <span style={{ color: topPos?.accent ?? '#fff' }}>{topPos?.symbol ?? 'N/A'}</span>,
            sub: isLoading ? <Skeleton width={90} height={12} /> : <span style={{ color: 'rgba(148,163,184,0.6)' }}>{topPos && totalUsd > 0 ? `${((topPos.usdValue / totalUsd) * 100).toFixed(0)}% Dominance` : '—'}</span>,
          },
        ].map(({ label, Icon, accent, value, sub }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06 }}
            style={{ ...CARD, padding: '22px 22px', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={13} color="rgba(148,163,184,0.6)" />
              </div>
              <span style={LABEL}>{label}</span>
            </div>
            <p style={{ fontFamily: FNUM, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 6px' }}>{value}</p>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row (only if positions found) ── */}
      {enriched.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 14, marginBottom: 20 }} className="dash-charts-grid">
          {/* Donut */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ ...CARD, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChart size={13} color="rgba(148,163,184,0.6)" />
              </div>
              <span style={LABEL}>Portfolio Allocation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <DonutChart slices={donut} isLoading={isLoading} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {isLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                      <Skeleton width={60} height={12} />
                    </div>
                  ))
                ) : (
                  enriched.map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.accent, flexShrink: 0 }} />
                      <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: '#fff' }}>{p.symbol}</span>
                      <span style={{ fontFamily: F, fontSize: 10, color: 'rgba(148,163,184,0.55)' }}>
                        {totalUsd > 0 ? `${((p.usdValue / totalUsd) * 100).toFixed(0)}%` : '—'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Asset Performance */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ ...CARD, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={13} color="rgba(148,163,184,0.6)" />
              </div>
              <span style={LABEL}>Asset Performance</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {enriched.map((p: any, i: number) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: `${p.accent}18`, border: `1px solid ${p.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={13} color={p.accent} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: '#fff' }}>{p.name}</div>
                          {p.yield30d > 0 && (
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '1px 5px', borderRadius: 4, letterSpacing: '0.02em' }}>
                              {p.yield30d.toFixed(1)}% APY
                            </div>
                          )}
                        </div>
                        <div style={{ fontFamily: F, fontSize: 10, color: 'rgba(148,163,184,0.55)', marginTop: 1 }}>{p.shareSymbol} · Base Mainnet</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: FNUM, fontSize: 13, fontWeight: 600, color: '#fff' }}>
                        {p.usdValue > 0 ? `$${p.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Price loading…</span>}
                      </div>
                      <div style={{ fontFamily: FNUM, fontSize: 10, color: 'rgba(148,163,184,0.5)', marginTop: 2 }}>{parseFloat(p.tokenAmount).toPrecision(6)} {p.shareSymbol}</div>
                    </div>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 100 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: totalUsd > 0 ? `${Math.max((p.usdValue / totalUsd) * 100, 2)}%` : '10%' }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: '100%', background: p.accent, borderRadius: 100 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Positions Table ── */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
            <Zap size={10} color="#d6ff34" />
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(148,163,184,0.8)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Active Positions</span>
          </div>
          <h3 style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>Allocated Assets</h3>
        </div>

        <div style={{ ...CARD, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '0 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1.2fr 100px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 8 }}>
                {['Vault', 'Token Balance', 'USD Value', 'Token Price', 'Status'].map(h => <span key={h} style={LABEL}>{h}</span>)}
              </div>
              {Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1.2fr 100px', padding: '16px 0', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Skeleton width={38} height={38} borderRadius={11} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Skeleton width={100} height={14} />
                      <Skeleton width={60} height={10} />
                    </div>
                  </div>
                  <Skeleton width={60} height={14} />
                  <Skeleton width={80} height={14} />
                  <Skeleton width={70} height={14} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <Skeleton width={40} height={10} />
                    <Skeleton width={50} height={14} borderRadius={100} />
                  </div>
                </div>
              ))}
            </div>
          ) : enriched.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={20} color="rgba(148,163,184,0.25)" />
              </div>
              <div>
                <p style={{ fontFamily: F, color: 'rgba(148,163,184,0.5)', fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>No active positions found.</p>
                <Link to="/" style={{ fontFamily: F, color: '#d6ff34', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>Start Saving Now →</Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 0.8fr 100px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 8 }}>
                {['Vault', 'Token Balance', 'USD Value', 'Price', 'APY', 'Status'].map(h => (
                  <span key={h} style={LABEL}>{h}</span>
                ))}
              </div>
              {enriched.map((p: any, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                  style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 0.8fr 100px', padding: '16px 20px', alignItems: 'center', borderBottom: i === enriched.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)', gap: 8, transition: 'background 0.18s', cursor: 'default' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                >
                  {/* Vault */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: `${p.accent}14`, border: `1px solid ${p.accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <TrendingUp size={15} color={p.accent} />
                    </div>
                    <div>
                      <p style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{p.name || p.vaultAddr.slice(0, 10) + '…'}</p>
                      <p style={{ fontFamily: F, fontSize: 9, color: 'rgba(148,163,184,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Base Mainnet · {p.symbol}</p>
                    </div>
                  </div>
                  {/* Token Balance */}
                  <div>
                    <p style={{ fontFamily: FNUM, fontSize: 13, color: '#fff', margin: 0 }}>{parseFloat(p.tokenAmount).toPrecision(6)}</p>
                    <p style={{ fontFamily: F, fontSize: 9, color: 'rgba(148,163,184,0.5)', margin: '2px 0 0', textTransform: 'uppercase' }}>{p.shareSymbol}</p>
                  </div>
                  {/* USD Value */}
                  <div>
                    <p style={{ fontFamily: FNUM, fontSize: 13, color: p.usdValue > 0 ? '#fff' : 'rgba(255,255,255,0.3)', margin: 0 }}>
                      {p.usdValue > 0 ? `$${p.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : '—'}
                    </p>
                    <p style={{ fontFamily: F, fontSize: 9, color: 'rgba(148,163,184,0.5)', margin: '2px 0 0', textTransform: 'uppercase' }}>Current Value</p>
                  </div>
                  {/* Token Price */}
                  <div>
                    <p style={{ fontFamily: FNUM, fontSize: 13, color: '#fff', margin: 0 }}>
                      ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  {/* APY */}
                  <div>
                    <p style={{ fontFamily: FNUM, fontSize: 13, color: '#10b981', fontWeight: 600, margin: 0 }}>
                      {p.yield30d ? `${p.yield30d.toFixed(2)}%` : '—'}
                    </p>
                    <p style={{ fontFamily: F, fontSize: 9, color: 'rgba(148,163,184,0.5)', margin: '2px 0 0', textTransform: 'uppercase' }}>30D Avg</p>
                  </div>
                  {/* Sparkline */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                    <MiniBar values={p.spark} color={p.accent} />
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 100, background: 'rgba(214,255,52,0.06)', border: '1px solid rgba(214,255,52,0.12)' }}>
                      <Zap size={7} color="#d6ff34" />
                      <span style={{ fontFamily: F, fontSize: 8, fontWeight: 700, color: '#d6ff34', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .dash-metric-grid { grid-template-columns: repeat(2, 1fr) !important; } .dash-charts-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) { .dash-metric-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
