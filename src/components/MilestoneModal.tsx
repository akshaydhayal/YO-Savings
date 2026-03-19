import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, Target, ArrowRight, AlertCircle } from 'lucide-react'
import { useAccount } from 'wagmi'

const F    = "'Outfit', system-ui, sans-serif"
const FNUM = "'DM Mono', 'Fira Code', monospace"

export default function MilestoneModal({
  vaultId, vault, accentColor, onClose, onSuccess
}: {
  vaultId: string
  vault: any
  accentColor: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [goalName, setGoalName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const { address } = useAccount()

  const assetSymbol = vault.asset?.symbol || vault.underlying?.symbol || 'Tokens'

  const handleSave = async () => {
    if (!address || !targetAmount || !goalName) return
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address.toLowerCase(),
          vaultId,
          name: goalName,
          targetAmount: parseFloat(targetAmount)
        })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to save milestone')
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const numericAmount = parseFloat(targetAmount)
  const isValid = !isNaN(numericAmount) && numericAmount > 0

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
          {/* Header */}
          <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: `${accentColor}15`, border: `1px solid ${accentColor}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={18} color={accentColor} />
              </div>
              <div>
                <h2 style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', margin: '0 0 2px' }}>
                  Set Savings Goal
                </h2>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                  {vault.name ?? vaultId} · {assetSymbol}
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
            {!isSuccess ? (
              <>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 9, display: 'block' }}>
                    Goal Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Car, Vacation"
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    disabled={isLoading}
                    style={{
                      width: '100%', height: 50, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 12, padding: '0 16px',
                      fontFamily: F, fontSize: 14, color: '#fff',
                      outline: 'none', transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = `rgba(214,255,52,0.38)`; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                    onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 9, display: 'block' }}>
                    Target Amount
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      placeholder="1000"
                      value={targetAmount}
                      onChange={e => setTargetAmount(e.target.value)}
                      disabled={isLoading}
                      style={{
                        width: '100%', height: 68, boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: 14, padding: '0 100px 0 16px',
                        fontFamily: FNUM, fontSize: 24, fontWeight: 400, color: '#fff',
                        outline: 'none', transition: 'border-color 0.2s, background 0.2s',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = `rgba(214,255,52,0.38)`; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
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

                {error && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 12 }}>
                    <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontFamily: F, fontSize: 12, fontWeight: 400, color: '#f87171', margin: 0, lineHeight: 1.55 }}>
                      {error}
                    </p>
                  </div>
                )}

                <motion.button
                  onClick={handleSave}
                  disabled={!isValid || !goalName || isLoading}
                  whileTap={{ scale: 0.975 }}
                  style={{
                    width: '100%', height: 52, borderRadius: 14, border: 'none',
                    cursor: (isLoading || !isValid || !goalName) ? 'not-allowed' : 'pointer',
                    background: accentColor, 
                    color: '#05070A',
                    fontFamily: F, fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    transition: 'box-shadow 0.25s, opacity 0.2s',
                    boxShadow: `0 0 24px ${accentColor}25`,
                    opacity: (!isValid) ? 0.38 : 1,
                    marginTop: 2,
                  }}
                  onMouseEnter={e => { if (!isLoading && isValid) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 40px ${accentColor}50` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 24px ${accentColor}25` }}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>Set Goal</span>
                  {!isLoading && <ArrowRight size={15} />}
                </motion.button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0 8px' }}
              >
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={32} color="#10b981" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontFamily: F, fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Goal Set!</h3>
                  <p style={{ color: 'rgba(148,163,184,0.55)', fontSize: 13, fontWeight: 400, margin: 0 }}>
                    Your visual milestone is active. Keep depositing to reach it.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
      <style>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        input[type='number'] { -moz-appearance:textfield; }
      `}</style>
    </AnimatePresence>
  )
}
