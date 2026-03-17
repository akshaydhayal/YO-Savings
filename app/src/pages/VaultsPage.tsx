import { motion } from 'framer-motion'
import { useVaults, useUserPositions } from '@yo-protocol/react'
import { useAccount } from 'wagmi'
import { TrendingUp, Zap } from 'lucide-react'
import VaultCard from '../components/VaultCard'
import HeroStats from '../components/HeroStats'

const F = "'Outfit', system-ui, sans-serif"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export default function VaultsPage() {
  const { address }            = useAccount()
  const { vaults, isLoading }  = useVaults()
  const { positions }          = useUserPositions(address)

  const getPosition = (vaultAddress: string) =>
    positions?.find((p: any) => {
      const addr = p.vault?.address || p.vault
      return typeof addr === 'string' && addr.toLowerCase() === vaultAddress?.toLowerCase()
    })

  return (
    <div style={{ fontFamily: F }}>

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', padding: '48px 16px 40px', position: 'relative', marginBottom: 8 }}
      >
        {/* Ambient glow behind title */}
        <div aria-hidden style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(214,255,52,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d6ff34', display: 'inline-block', boxShadow: '0 0 6px rgba(214,255,52,0.8)' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#d6ff34', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Built on Base</span>
          </div>
          <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Institutional Grade</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: F, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.08, margin: '0 0 14px' }}>
          Professional{' '}
          <span style={{ color: '#d6ff34' }}>Yield</span>{' '}
          for{' '}
          <br />
          <span style={{ background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Modern Capital.
          </span>
        </h1>

        <p style={{ color: 'rgba(148,163,184,0.65)', fontSize: 15, fontWeight: 400, maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.65 }}>
          Non-custodial savings architecture built for stability, transparency, and superior capital efficiency.
        </p>

        {/* Trust strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, opacity: 0.4, transition: 'opacity 0.3s' }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '0.85'}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '0.4'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Base Mainnet</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>YO Protocol</span>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <HeroStats />

      {/* ── Vault grid ── */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            Investment Vaults
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.55)', fontSize: 13, fontWeight: 400, margin: '0 0 14px' }}>
            Earn real-time yield on your favourite assets.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(214,255,52,0.06)', border: '1px solid rgba(214,255,52,0.12)' }}>
            <TrendingUp size={11} color="#d6ff34" />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#d6ff34', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Live APY Tracking</span>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="vault-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 240, borderRadius: 20, background: 'rgba(13,17,23,0.7)', animation: 'vaultPulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}
            className="vault-grid"
          >
            {vaults?.map((vault, i) => {
              const vaultAddr = (vault as any).contracts?.vaultAddress || (vault as any).address
              return (
                <VaultCard
                  key={vaultAddr || i}
                  vault={vault}
                  position={getPosition(vaultAddr || '')}
                />
              )
            })}
          </motion.div>
        )}
      </section>

      <style>{`
        @keyframes vaultPulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @media (max-width: 1024px) { .vault-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .vault-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}



// import { motion } from 'framer-motion'
// import { useVaults, useUserPositions } from '@yo-protocol/react'
// import { useAccount } from 'wagmi'
// import { TrendingUp, Zap } from 'lucide-react'
// import VaultCard from '../components/VaultCard'
// import HeroStats from '../components/HeroStats'

// const container = {
//   hidden: {},
//   show: { transition: { staggerChildren: 0.1 } },
// }

// export default function VaultsPage() {
//   const { address } = useAccount()
//   const { vaults, isLoading } = useVaults()
//   const { positions } = useUserPositions(address)

//   const getPosition = (vaultAddress: string) =>
//     positions?.find((p: any) => {
//       const addr = p.vault?.address || p.vault;
//       return typeof addr === 'string' && addr.toLowerCase() === vaultAddress?.toLowerCase();
//     })

//   return (
//     <div className="space-y-6">
//       {/* Hero - Centered & Professional Scale */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
//         className="text-center space-y-8 mb-24 relative px-4 pt-4"
//       >
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yo-neon/5 blur-[120px] -z-10 rounded-full" />
        
//         <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
//           <div className="flex items-center gap-1.5">
//             <span className="w-1.5 h-1.5 rounded-full bg-yo-neon animate-pulse" />
//             <span className="text-[10px] font-bold text-yo-neon tracking-[0.2em] uppercase">Built on Base</span>
//           </div>
//           <div className="w-px h-3 bg-white/10 mx-1" />
//           <span className="text-[10px] font-bold text-yo-muted tracking-widest uppercase">Institutional Grade</span>
//         </div>
        
//         <div className="max-w-3xl mx-auto space-y-6">
//           <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
//             Professional <span className="text-neon">Yield</span> for <br />
//             <span className="text-gradient">Modern Capital.</span>
//           </h1>
//           <p className="text-yo-muted text-base max-w-xl mx-auto leading-relaxed font-medium opacity-80">
//             Non-custodial savings architecture built for stability, transparency, and superior capital efficiency.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
//           <div className="flex items-center gap-2">
//             <TrendingUp size={16} />
//             <span className="text-[10px] font-bold uppercase tracking-widest">Base Mainnet</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Zap size={16} />
//             <span className="text-[10px] font-bold uppercase tracking-widest">YO Protocol</span>
//           </div>
//         </div>
//       </motion.div>

//       <HeroStats />

//       <section className="mt-12 mb-20">
//         <div className="flex flex-col items-center text-center mb-10">
//           <h2 className="text-2xl font-black text-white tracking-tight">Investment Vaults</h2>
//           <p className="text-yo-muted text-sm font-medium mt-1">Earn real-time yield on your favorite assets.</p>
//           <div className="flex items-center gap-2 text-[10px] font-black text-yo-neon uppercase tracking-widest mt-4 px-3 py-1 rounded-full bg-yo-neon/5 border border-yo-neon/10">
//             <TrendingUp size={12} />
//             Live APY Tracking
//           </div>
//         </div>
//         {isLoading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="h-56 rounded-2xl bg-yo-card animate-pulse" />
//             ))}
//           </div>
//         ) : (
//           <motion.div
//             variants={container}
//             initial="hidden"
//             animate="show"
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
//           >
//             {vaults?.map((vault, i) => {
//               const vaultAddr = (vault as any).contracts?.vaultAddress || (vault as any).address;
//               return (
//                 <VaultCard
//                   key={vaultAddr || i}
//                   vault={vault}
//                   position={getPosition(vaultAddr || '')}
//                 />
//               );
//             })}
//           </motion.div>
//         )}
//       </section>
//     </div>
//   )
// }
