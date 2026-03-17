import { useVaults, useTotalTvl } from '@yo-protocol/react'
import { motion } from 'framer-motion'
import { Globe, Zap, BarChart3 } from 'lucide-react'

const F    = "'Outfit', system-ui, sans-serif"
const FNUM = "'DM Mono', 'Fira Code', monospace"

export default function HeroStats() {
  const { vaults } = useVaults()
  const { tvl }    = useTotalTvl()

  const currentTvlPoint = tvl?.[tvl.length - 1] as any
  const totalTvl = currentTvlPoint?.tvl
    ? `$${Number(currentTvlPoint.tvl).toLocaleString()}`
    : currentTvlPoint?.value
    ? `$${Number(currentTvlPoint.value).toLocaleString()}`
    : '—'

  const items = [
    { label: 'Total Value Locked', value: totalTvl,                        icon: BarChart3, accent: '#d6ff34',  isNum: true },
    { label: 'Network',            value: 'Base Mainnet',                  icon: Globe,     accent: '#627EEA',  isNum: false },
    { label: 'Active Vaults',      value: vaults ? `${vaults.length}` : '—', icon: Zap,    accent: '#00FF8B',  isNum: true },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 48 }}
      className="hero-stats-grid">
      {items.map(({ label, value, icon: Icon, accent, isNum }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(13,17,23,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 18,
            padding: '18px 20px',
            position: 'relative', overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            fontFamily: F,
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'}
        >
          {/* corner glow */}
          <div aria-hidden style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={13} color={accent} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.22em' }}>
              {label}
            </span>
          </div>

          <p style={{
            fontFamily: isNum ? FNUM : F,
            fontSize: 20, fontWeight: isNum ? 500 : 600,
            color: '#fff', letterSpacing: isNum ? '-0.02em' : '-0.01em',
            margin: 0,
          }}>
            {value}
          </p>
        </motion.div>
      ))}

      <style>{`
        @media (max-width: 640px) {
          .hero-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}




// import { useVaults, useTotalTvl } from '@yo-protocol/react'
// import { motion } from 'framer-motion'
// import { Globe, Zap, BarChart3 } from 'lucide-react'

// export default function HeroStats() {
//   const { vaults } = useVaults()
//   const { tvl } = useTotalTvl()

//   const currentTvlPoint = tvl?.[tvl.length - 1] as any
//   const totalTvl = currentTvlPoint?.tvl
//     ? `$${Number(currentTvlPoint.tvl).toLocaleString()}`
//     : currentTvlPoint?.value
//     ? `$${Number(currentTvlPoint.value).toLocaleString()}`
//     : '—'

//   const items = [
//     { label: 'Total Value Locked', value: totalTvl, icon: BarChart3, color: 'var(--color-yo-neon)' },
//     { label: 'Network', value: 'Base Mainnet', icon: Globe, color: 'var(--color-yo-eth)' },
//     { label: 'Active Vaults', value: vaults ? `${vaults.length}` : '—', icon: Zap, color: 'var(--color-yo-usd)' },
//   ]

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
//       {items.map(({ label, value, icon: Icon, color }, i) => (
//         <motion.div
//           key={label}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 + i * 0.1 }}
//           className="glass glass-hover rounded-2xl p-5 relative overflow-hidden group border-white/5"
//         >
//           {/* Subtle Glow */}
//           <div 
//             className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-3xl opacity-5 transition-opacity group-hover:opacity-10"
//             style={{ background: color }}
//           />

//           <div className="flex items-center gap-2.5 mb-2.5">
//             <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5">
//               <Icon size={14} style={{ color }} />
//             </div>
//             <p className="text-[8px] font-bold text-yo-muted uppercase tracking-[0.3em]">{label}</p>
//           </div>
//           <p className="text-lg font-extrabold text-white tracking-tight">{value}</p>
//         </motion.div>
//       ))}
//     </div>
//   )
// }
