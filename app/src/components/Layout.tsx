import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import { TrendingUp, LayoutDashboard, Target, Zap } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Vaults', icon: Zap },
  { href: '/dashboard', label: 'My Savings', icon: LayoutDashboard },
  { href: '/sip', label: 'Smart SIP', icon: Target },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-yo-black font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-yo-border bg-yo-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-yo-neon flex items-center justify-center">
              <TrendingUp size={16} className="text-black" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white group-hover:text-yo-neon transition-colors">
              YO Savings
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-yo-neon-dim text-yo-neon'
                      : 'text-yo-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'address',
              }}
            />
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 text-yo-muted hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <div className={`w-5 h-0.5 bg-current transition-all mb-1 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <div className={`w-5 h-0.5 bg-current transition-all mb-1 ${mobileOpen ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-yo-border px-4 py-3 flex flex-col gap-1"
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-yo-neon-dim text-yo-neon'
                      : 'text-yo-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </motion.div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-yo-border py-6 text-center text-yo-muted text-xs">
        Built with{' '}
        <a
          href="https://yo.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yo-neon hover:underline"
        >
          YO Protocol
        </a>{' '}
        · Savings on Base
      </footer>
    </div>
  )
}
