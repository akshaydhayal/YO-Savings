import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useUserPositions, useVaults } from '@yo-protocol/react'
import { VAULTS, formatTokenAmount } from '@yo-protocol/core'
import { ArrowUpRight, TrendingUp, Zap, BarChart3, Wallet } from 'lucide-react'

const F    = "'Outfit', system-ui, sans-serif"
const FNUM = "'DM Mono', 'Fira Code', monospace"

const VAULT_COLORS: Record<string, string> = {
  yoUSD:  '#00FF8B',
  yoETH:  '#627EEA',
  yoBTC:  '#FFAF4F',
  yoEUR:  '#4E6FFF',
  yoGOLD: '#FFBF00',
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { positions }            = useUserPositions(address)
  const { vaults }               = useVaults()

  const getVaultConfig = (addr: any) => {
    const searchAddr = (addr?.address || addr)?.toString().toLowerCase()
    return vaults?.find((v: any) => v.contracts.vaultAddress.toLowerCase() === searchAddr)
  }

  const getVaultId = (addr: any) => {
    const searchAddr = (addr?.address || addr)?.toString().toLowerCase()
    return Object.entries(VAULTS).find(([, v]) => v.address.toLowerCase() === searchAddr)?.[0]
  }

  const activePositions = positions?.filter((p) => p.position.shares > 0n) ?? []

  const totalAssetsUsd = activePositions.reduce((acc, p: any) => {
    const config = getVaultConfig(p.vault)
    const assets = Number(formatTokenAmount(p.position.assets, (config as any)?.asset?.decimals ?? 6))
    return acc + assets
  }, 0)

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!isConnected) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 24, fontFamily: F }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '1px solid rgba(214,255,52,0.15)', animation: 'dashRing 2.8s ease-in-out infinite' }} />
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(214,255,52,0.07)', border: '1px solid rgba(214,255,52,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowUpRight size={24} color="#d6ff34" />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: F, fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Connect your wallet</h2>
        <p style={{ color: 'rgba(148,163,184,0.55)', fontSize: 14, fontWeight: 400, maxWidth: 300, lineHeight: 1.6, margin: 0 }}>
          See your savings portfolio, P&L, and transaction history across all YO vaults.
        </p>
      </div>
      <ConnectButton />
      <style>{`@keyframes dashRing { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }`}</style>
    </div>
  )

  // ── Connected ─────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: F, paddingTop: 12 }}>

      {/* ── Page header ── */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32, padding: '0 2px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: 9, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Portfolio Secure</span>
          </div>
          <h1 style={{ fontFamily: F, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.022em', margin: 0 }}>
            Financial Overview
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ height: 38, padding: '0 16px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', fontFamily: F, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.18s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)' }}>
            Export History
          </button>
          <Link to="/sip" style={{ height: 38, padding: '0 16px', borderRadius: 11, background: '#d6ff34', color: '#05070A', fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 20px rgba(214,255,52,0.16)', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 32px rgba(214,255,52,0.32)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 20px rgba(214,255,52,0.16)' }}>
            <Zap size={13} />
            New Savings Plan
          </Link>
        </div>
      </header>

      {/* ── Metric cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }} className="dash-metric-grid">
        {/* Net value */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: 'rgba(13,17,23,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 22px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
          <div aria-hidden style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(214,255,52,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={13} color="rgba(148,163,184,0.6)" />
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Net Savings Value</span>
          </div>
          <p style={{ fontFamily: FNUM, fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
            ${totalAssetsUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, opacity: 0.85 }}>
            <ArrowUpRight size={11} /> +2.4% Est. Yield 24h
          </p>
        </motion.div>

        {/* Active capital */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'rgba(13,17,23,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 22px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={13} color="rgba(148,163,184,0.6)" />
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Active Capital</span>
          </div>
          <p style={{ fontFamily: FNUM, fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            {activePositions.length}
          </p>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            Positions Active
          </p>
        </motion.div>

        {/* Total earned */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: 'rgba(13,17,23,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 22px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={13} color="rgba(148,163,184,0.6)" />
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Total Earned</span>
          </div>
          <p style={{ fontFamily: FNUM, fontSize: 28, fontWeight: 500, color: '#10b981', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            $0.00
          </p>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            Real-time Accrual
          </p>
        </motion.div>
      </div>

      {/* ── Positions list ── */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
            <Zap size={10} color="#d6ff34" />
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Active Positions</span>
          </div>
          <h3 style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
            Allocated Assets
          </h3>
        </div>

        <div style={{ background: 'rgba(13,17,23,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
          {activePositions.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={20} color="rgba(148,163,184,0.25)" />
              </div>
              <div>
                <p style={{ fontFamily: F, color: 'rgba(148,163,184,0.5)', fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>No active positions found.</p>
                <Link to="/" style={{ fontFamily: F, color: '#d6ff34', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
                  Start Saving Now →
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {activePositions.map((pos: any, i) => {
                const config    = getVaultConfig(pos.vault)
                const vaultId   = getVaultId(pos.vault) ?? ''
                const accent    = VAULT_COLORS[vaultId] ?? '#D6FF34'
                const isLast    = i === activePositions.length - 1

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      padding: '16px 20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.18s',
                      gap: 12,
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                  >
                    {/* Left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accent}12`, border: `1px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                        <TrendingUp size={16} color={accent} />
                      </div>
                      <div>
                        <p style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', margin: '0 0 3px' }}>
                          {(config as any)?.name || vaultId}
                        </p>
                        <p style={{ fontFamily: F, fontSize: 10, fontWeight: 500, color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
                          Base Mainnet
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: FNUM, fontSize: 14, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em', margin: '0 0 5px' }}>
                        {formatTokenAmount(pos.position.assets, (config as any)?.asset?.decimals || 6)}{' '}
                        <span style={{ fontFamily: F, fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.4)' }}>
                          {(config as any)?.asset?.symbol}
                        </span>
                      </p>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, background: 'rgba(214,255,52,0.06)', border: '1px solid rgba(214,255,52,0.12)' }}>
                        <Zap size={8} color="#d6ff34" />
                        <span style={{ fontFamily: F, fontSize: 9, fontWeight: 600, color: '#d6ff34', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Growth Live</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .dash-metric-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 769px) and (max-width: 1024px) { .dash-metric-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  )
}



// import { motion } from 'framer-motion'
// import { Link } from 'react-router-dom'
// import { useAccount } from 'wagmi'
// import { ConnectButton } from '@rainbow-me/rainbowkit'
// import {
//   useUserPositions,
//   useVaults,
// } from '@yo-protocol/react'
// import { VAULTS, formatTokenAmount } from '@yo-protocol/core'
// import { ArrowUpRight, TrendingUp, Zap } from 'lucide-react'

// const VAULT_COLORS: Record<string, string> = {
//   yoUSD: '#00FF8B',
//   yoETH: '#627EEA',
//   yoBTC: '#FFAF4F',
//   yoEUR: '#4E6FFF',
//   yoGOLD: '#FFBF00',
// }

// export default function DashboardPage() {
//   const { address, isConnected } = useAccount()
//   const { positions } = useUserPositions(address)
//   const { vaults } = useVaults()

//   const getVaultConfig = (addr: any) => {
//     const searchAddr = (addr?.address || addr)?.toString().toLowerCase()
//     return vaults?.find((v: any) => v.contracts.vaultAddress.toLowerCase() === searchAddr)
//   }

//   const getVaultId = (addr: any) => {
//     const searchAddr = (addr?.address || addr)?.toString().toLowerCase()
//     return Object.entries(VAULTS).find(([, v]) => v.address.toLowerCase() === searchAddr)?.[0]
//   }

//   const activePositions = positions?.filter((p) => p.position.shares > 0n) ?? []

//   const totalAssetsUsd = activePositions.reduce((acc, p: any) => {
//     const config = getVaultConfig(p.vault)
//     const assets = Number(formatTokenAmount(p.position.assets, (config as any)?.asset?.decimals ?? 6))
//     return acc + assets
//   }, 0)

//   if (!isConnected) {
//     return (
//       <div className="flex flex-col items-center justify-center py-24 gap-6">
//         <div className="w-16 h-16 rounded-full bg-yo-neon-dim border border-yo-neon/20 flex items-center justify-center">
//           <ArrowUpRight size={28} className="text-yo-neon" />
//         </div>
//         <h2 className="text-2xl font-bold text-white text-center">Connect your wallet</h2>
//         <p className="text-yo-muted text-center max-w-xs">
//           See your savings portfolio, P&L, and transaction history across all YO vaults.
//         </p>
//         <ConnectButton />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-12">
//       <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1 pt-4">
//         <div className="space-y-2">
//           <div className="inline-flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-yo-accent/10 border border-yo-accent/20">
//             <span className="w-1.5 h-1.5 rounded-full bg-yo-accent" />
//             <span className="text-[10px] font-bold text-yo-accent tracking-widest uppercase">Portfolio Secure</span>
//           </div>
//           <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Overview</h1>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <button className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest transition-all hover:bg-white/10">
//             Export History
//           </button>
//           <Link to="/sip" className="h-9 px-4 rounded-xl bg-yo-neon text-black text-[10px] font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(214,255,52,0.3)] flex items-center">
//             New Savings Plan
//           </Link>
//         </div>
//       </header>

//       {/* Metrics Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="glass rounded-[32px] p-8 space-y-4 relative overflow-hidden group border-white/[0.03]">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-yo-neon/5 blur-3xl -mr-16 -mt-16 group-hover:bg-yo-neon/10 transition-colors" />
//           <div className="flex items-center gap-3 text-yo-muted">
//             <div className="p-2 rounded-lg bg-white/5 border border-white/5">
//               <TrendingUp size={14} />
//             </div>
//             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Net Savings Value</span>
//           </div>
//           <div className="space-y-1">
//             <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
//               ${totalAssetsUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//             </h2>
//             <p className="text-[10px] font-bold text-yo-accent tracking-widest uppercase flex items-center gap-1.5 opacity-80">
//               <ArrowUpRight size={12} />
//               +2.4% Est. Yield 24h
//             </p>
//           </div>
//         </div>

//         <div className="glass rounded-[32px] p-8 space-y-4 border-white/[0.03]">
//           <div className="flex items-center gap-3 text-yo-muted">
//             <div className="p-2 rounded-lg bg-white/5 border border-white/5">
//               <Zap size={14} />
//             </div>
//             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Active Capital</span>
//           </div>
//           <div className="space-y-1">
//             <h2 className="text-2xl font-bold text-white tracking-tight">{activePositions.length} Positions</h2>
//             <p className="text-[10px] font-bold text-yo-muted tracking-widest uppercase opacity-60">Across Asset Classes</p>
//           </div>
//         </div>

//         <div className="glass rounded-[32px] p-8 space-y-4 border-white/[0.03]">
//           <div className="flex items-center gap-3 text-yo-muted">
//             <div className="p-2 rounded-lg bg-white/5 border border-white/5">
//               <TrendingUp size={14} />
//             </div>
//             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Total Earned</span>
//           </div>
//           <div className="space-y-1">
//             <h2 className="text-2xl font-bold text-yo-accent tracking-tight">$0.00</h2>
//             <p className="text-[10px] font-bold text-yo-muted tracking-widest uppercase opacity-60">Real-time Accrual</p>
//           </div>
//         </div>
//       </div>

//       {/* Portfolio Table/List */}
//       <div className="space-y-6">
//         <div className="flex flex-col items-center text-center space-y-1">
//           <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 mb-2">
//             <Zap size={10} className="text-yo-neon" />
//             <span className="text-[9px] font-black text-yo-muted uppercase tracking-widest">Active Positions</span>
//           </div>
//           <h3 className="text-sm font-bold text-white tracking-tight">Allocated Assets</h3>
//         </div>

//         <div className="glass rounded-[32px] overflow-hidden border-white/[0.03]">
//           {activePositions.length === 0 ? (
//             <div className="py-20 text-center space-y-4">
//               <p className="text-yo-muted text-sm font-medium">No active positions found.</p>
//               <Link to="/" className="text-yo-neon text-xs font-bold uppercase tracking-widest hover:underline text-glow-neon">
//                 Start Saving Now
//               </Link>
//             </div>
//           ) : (
//             <div className="divide-y divide-white/[0.03]">
//               {activePositions.map((pos: any, i) => {
//                 const config = getVaultConfig(pos.vault)
//                 const vaultId = getVaultId(pos.vault) ?? ''
//                 const accent = VAULT_COLORS[vaultId] ?? '#D6FF34'
                
//                 return (
//                   <motion.div
//                     key={i}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: i * 0.1 }}
//                     className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-colors shadow-inner relative overflow-hidden">
//                         <div className="absolute inset-0 opacity-10" style={{ background: accent }} />
//                         <TrendingUp size={16} style={{ color: accent }} />
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-white tracking-tight">{(config as any)?.name || vaultId}</p>
//                         <p className="text-[10px] font-bold text-yo-muted uppercase tracking-widest">Base Mainnet</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-bold text-white tracking-tight">
//                         {formatTokenAmount(pos.position.assets, (config as any)?.asset?.decimals || 6)} {(config as any)?.asset?.symbol}
//                       </p>
//                       <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yo-neon-dim border border-yo-neon/10 text-[8px] font-bold text-yo-neon uppercase tracking-widest">
//                         <Zap size={8} />
//                         Growth Live
//                       </div>
//                     </div>
//                   </motion.div>
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
