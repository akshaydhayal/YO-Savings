import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Target, Zap, Menu, X, PieChart } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Vaults', icon: Zap },
  { href: '/portfolios', label: 'Baskets', icon: PieChart },
  { href: '/dashboard', label: 'My Savings', icon: LayoutDashboard },
  { href: '/sip', label: 'Smart SIP', icon: Target },
]

const F = "'Outfit', system-ui, sans-serif"

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#05070A', fontFamily: F, display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(5,7,10,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#d6ff34', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(214,255,52,0.2)' }}>
              <Zap size={18} color="#05070A" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>YoVest</span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hidden-mobile">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 14px', borderRadius: 10,
                    fontSize: 13, fontWeight: 500,
                    textDecoration: 'none',
                    color: active ? '#d6ff34' : 'rgba(148,163,184,0.7)',
                    background: active ? 'rgba(214,255,52,0.07)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(214,255,52,0.15)' : 'transparent'}`,
                    transition: 'all 0.18s',
                    fontFamily: F,
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)' } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(148,163,184,0.7)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' } }}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus={{ smallScreen: 'avatar', largeScreen: 'address' }}
            />
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{ display: 'none', width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}
              className="show-mobile"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 12,
                        fontSize: 14, fontWeight: 500,
                        textDecoration: 'none',
                        color: active ? '#d6ff34' : 'rgba(148,163,184,0.7)',
                        background: active ? 'rgba(214,255,52,0.07)' : 'transparent',
                        transition: 'all 0.18s',
                        fontFamily: F,
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page ── */}
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '16px 24px 32px' }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', fontFamily: F }}>
          Built with{' '}
          <a href="https://yo.xyz" target="_blank" rel="noopener noreferrer"
            style={{ color: '#d6ff34', textDecoration: 'none', fontWeight: 500 }}>
            YO Protocol
          </a>
          {' '}· Yield on Base
        </span>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}



// import { ReactNode, useState } from 'react'
// import { Link, useLocation } from 'react-router-dom'
// import { ConnectButton } from '@rainbow-me/rainbowkit'
// import { motion } from 'framer-motion'
// import { TrendingUp, LayoutDashboard, Target, Zap } from 'lucide-react'

// const NAV = [
//   { href: '/', label: 'Vaults', icon: Zap },
//   { href: '/dashboard', label: 'My Savings', icon: LayoutDashboard },
//   { href: '/sip', label: 'Smart SIP', icon: Target },
// ]

// export default function Layout({ children }: { children: ReactNode }) {
//   const { pathname } = useLocation()
//   const [mobileOpen, setMobileOpen] = useState(false)

//   return (
//     <div className="min-h-screen bg-yo-black font-sans flex flex-col">
//       {/* Header */}
//       <header className="sticky top-0 z-50 border-b border-yo-border bg-yo-black/90 backdrop-blur-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
//           <Link to="/" className="flex items-center gap-2 group">
//             <div className="w-8 h-8 rounded-lg bg-yo-neon flex items-center justify-center">
//               <TrendingUp size={16} className="text-black" />
//             </div>
//             <span className="text-lg font-semibold tracking-tight text-white group-hover:text-yo-neon transition-colors">
//               YO Savings
//             </span>
//           </Link>

//           {/* Desktop Nav */}
//           <nav className="hidden md:flex items-center gap-1">
//             {NAV.map(({ href, label, icon: Icon }) => {
//               const active = pathname === href
//               return (
//                 <Link
//                   key={href}
//                   to={href}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                     active
//                       ? 'bg-yo-neon-dim text-yo-neon'
//                       : 'text-yo-muted hover:text-white hover:bg-white/5'
//                   }`}
//                 >
//                   <Icon size={15} />
//                   {label}
//                 </Link>
//               )
//             })}
//           </nav>

//           <div className="flex items-center gap-3">
//             <ConnectButton
//               chainStatus="icon"
//               showBalance={false}
//               accountStatus={{
//                 smallScreen: 'avatar',
//                 largeScreen: 'address',
//               }}
//             />
//             {/* Mobile hamburger */}
//             <button
//               className="md:hidden p-2 rounded-lg hover:bg-white/10 text-yo-muted hover:text-white transition-colors"
//               onClick={() => setMobileOpen(!mobileOpen)}
//             >
//               <div className={`w-5 h-0.5 bg-current transition-all mb-1 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
//               <div className={`w-5 h-0.5 bg-current transition-all mb-1 ${mobileOpen ? 'opacity-0' : ''}`} />
//               <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
//             </button>
//           </div>
//         </div>

//         {/* Mobile nav */}
//         {mobileOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="md:hidden border-t border-yo-border px-4 py-3 flex flex-col gap-1"
//           >
//             {NAV.map(({ href, label, icon: Icon }) => {
//               const active = pathname === href
//               return (
//                 <Link
//                   key={href}
//                   to={href}
//                   onClick={() => setMobileOpen(false)}
//                   className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
//                     active
//                       ? 'bg-yo-neon-dim text-yo-neon'
//                       : 'text-yo-muted hover:text-white hover:bg-white/5'
//                   }`}
//                 >
//                   <Icon size={16} />
//                   {label}
//                 </Link>
//               )
//             })}
//           </motion.div>
//         )}
//       </header>

//       {/* Page content */}
//       <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10">
//         {children}
//       </main>

//       {/* Footer */}
//       <footer className="border-t border-yo-border py-6 text-center text-yo-muted text-xs">
//         Built with{' '}
//         <a
//           href="https://yo.xyz"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-yo-neon hover:underline"
//         >
//           YO Protocol
//         </a>{' '}
//         · Savings on Base
//       </footer>
//     </div>
//   )
// }
