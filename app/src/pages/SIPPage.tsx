import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useDeposit } from '@yo-protocol/react'
import { VAULTS, parseTokenAmount } from '@yo-protocol/core'
import {
  Target, Calendar, TrendingUp, CheckCircle2,
  Loader2, Zap, Sparkles, ChevronDown, ArrowRight,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
const PERIODS = ['Daily', 'Weekly', 'Monthly'] as const
type Period = (typeof PERIODS)[number]

interface SIPGoal {
  vaultId: string
  amount: string
  period: Period
  createdAt: number
}

const STORAGE_KEY = 'yo_sip_goals'
const loadGoals = (): SIPGoal[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
const saveGoals = (g: SIPGoal[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(g))

function isDue(goal: SIPGoal): boolean {
  const ms = { Daily: 86_400_000, Weekly: 604_800_000, Monthly: 2_592_000_000 }[goal.period]
  return Date.now() - goal.createdAt >= ms
}

function nextLabel(goal: SIPGoal): string {
  const ms = { Daily: 86_400_000, Weekly: 604_800_000, Monthly: 2_592_000_000 }[goal.period]
  const rem = ms - (Date.now() - goal.createdAt)
  if (rem <= 0) return 'Ready now'
  const h = Math.floor(rem / 3_600_000)
  const d = Math.floor(h / 24)
  return d > 0 ? `in ${d}d ${h % 24}h` : `in ${h}h`
}

// Fonts defined in index.css — no dynamic injection needed
const F_SANS = "'Outfit', system-ui, sans-serif"
const F_MONO = "'DM Mono', 'Fira Code', monospace"

// ─── Grid + orb background ───────────────────────────────────────────────────
function SceneBg() {
  return (
    <>
      <style>{`
        @keyframes sipOrb  { from{transform:translateY(0) scale(1)}   to{transform:translateY(-32px) scale(1.04)} }
        @keyframes sipSpin { to{transform:rotate(360deg)} }
        @keyframes sipRing { 0%,100%{opacity:.35;transform:scale(1)}  50%{opacity:1;transform:scale(1.09)} }
        @keyframes sipIn   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        input[type='number'] { -moz-appearance:textfield; }
        select option { background:#0a0d11; color:#fff; }
      `}</style>

      {/* dot grid */}
      <div aria-hidden style={{
        position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        backgroundImage:[
          'linear-gradient(rgba(214,255,52,0.03) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(214,255,52,0.03) 1px, transparent 1px)',
        ].join(','),
        backgroundSize:'44px 44px',
        maskImage:'radial-gradient(ellipse 90% 55% at 50% 0%, black 25%, transparent 100%)',
      }} />

      {/* ambient orbs */}
      <div aria-hidden style={{ position:'fixed', top:'-10%', left:'16%', width:460, height:460, borderRadius:'50%', background:'radial-gradient(circle, rgba(214,255,52,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:0, animation:'sipOrb 9s ease-in-out infinite alternate' }} />
      <div aria-hidden style={{ position:'fixed', bottom:'4%', right:'6%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:0, animation:'sipOrb 13s ease-in-out infinite alternate-reverse' }} />
    </>
  )
}

// ─── Stat pill ───────────────────────────────────────────────────────────────
function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'10px 22px', borderRadius:14, gap:3,
      background: accent ? 'rgba(214,255,52,0.07)' : 'rgba(255,255,255,0.04)',
      border:`1px solid ${accent ? 'rgba(214,255,52,0.22)' : 'rgba(255,255,255,0.07)'}`,
    }}>
      <span style={{ fontFamily:F_MONO, fontSize:18, fontWeight:500, color:accent ? '#d6ff34' : '#fff', letterSpacing:'-0.02em' }}>
        {value}
      </span>
      <span style={{ fontFamily:F_SANS, fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.18em' }}>
        {label}
      </span>
    </div>
  )
}

// ─── Field label ─────────────────────────────────────────────────────────────
function FL({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily:F_SANS, fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.22em', margin:'0 0 9px 1px' }}>
      {children}
    </p>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function SIPPage() {
  const { isConnected } = useAccount()
  const [goals, setGoals] = useState<SIPGoal[]>(loadGoals)
  const [form,  setForm]  = useState({ vaultId: Object.keys(VAULTS)[0] ?? 'yoUSD', amount: '', period: 'Weekly' as Period })
  const [busy,  setBusy]  = useState(false)

  const totalPerPeriod = goals.reduce((s, g) => s + (parseFloat(g.amount) || 0), 0)
  const dueCt          = goals.filter(isDue).length

  const addGoal = () => {
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return
    setBusy(true)
    setTimeout(() => {
      const updated = [...goals, { ...form, createdAt: Date.now() }]
      setGoals(updated); saveGoals(updated)
      setForm(f => ({ ...f, amount: '' }))
      setBusy(false)
    }, 500)
  }

  const removeGoal = (idx: number) => {
    const updated = goals.filter((_, i) => i !== idx)
    setGoals(updated); saveGoals(updated)
  }

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!isConnected) return (
    <div style={{ minHeight:'100vh', background:'#05070A', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', fontFamily:F_SANS }}>
      <SceneBg />
      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
        style={{ position:'relative', zIndex:1, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:24, padding:32 }}
      >
        <div style={{ position:'relative', width:80, height:80 }}>
          <div style={{ position:'absolute', inset:-9, borderRadius:'50%', border:'1px solid rgba(214,255,52,0.18)', animation:'sipRing 2.8s ease-in-out infinite' }} />
          <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(214,255,52,0.08)', border:'1px solid rgba(214,255,52,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Sparkles size={28} color="#d6ff34" />
          </div>
        </div>
        <div>
          <h1 style={{ fontFamily:F_SANS, fontSize:34, fontWeight:700, color:'#fff', margin:'0 0 10px', letterSpacing:'-0.025em', lineHeight:1.1 }}>
            Automate Your<br /><span style={{ color:'#d6ff34' }}>DeFi Savings</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, fontWeight:400, lineHeight:1.65 }}>
            Schedule recurring deposits into high-yield YO vaults.
          </p>
        </div>
        <ConnectButton />
      </motion.div>
    </div>
  )

  // ── Connected ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#05070A', fontFamily:F_SANS, position:'relative', overflowX:'hidden' }}>
      <SceneBg />

      <div style={{ maxWidth:660, margin:'0 auto', padding:'58px 24px 96px', position:'relative', zIndex:1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}
          style={{ textAlign:'center', marginBottom:28 }}
        >
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:100, background:'rgba(214,255,52,0.08)', border:'1px solid rgba(214,255,52,0.2)', marginBottom:18 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#d6ff34', boxShadow:'0 0 6px rgba(214,255,52,0.9)' }} />
            <span style={{ fontSize:10, fontWeight:600, color:'#d6ff34', letterSpacing:'0.2em', textTransform:'uppercase' }}>
              Automated Savings
            </span>
          </div>

          {/* Title — Outfit 700 at a size that doesn't stretch */}
          <h1 style={{
            fontFamily:F_SANS, fontSize:40, fontWeight:700,
            color:'#fff', margin:0,
            letterSpacing:'-0.022em', lineHeight:1.08,
          }}>
            Recurring SIP
          </h1>
          <p style={{ color:'rgba(255,255,255,0.38)', fontSize:13, fontWeight:400, marginTop:9, letterSpacing:'0.01em' }}>
            Scheduled. Consistent. Compounding.
          </p>
        </motion.div>

        {/* Stats row */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.1 }}
            style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:30 }}
          >
            <StatPill label="Active Plans"  value={String(goals.length)} />
            <StatPill label="Per Period"    value={`$${totalPerPeriod.toFixed(2)}`} accent />
            <StatPill label="Due Now"       value={dueCt > 0 ? `${dueCt} plan${dueCt > 1 ? 's' : ''}` : '—'} />
          </motion.div>
        )}

        {/* Form card */}
        <motion.div
          initial={{ opacity:0, y:20, scale:0.985 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ delay:0.07, duration:0.6, ease:[0.16,1,0.3,1] }}
          style={{
            background:'rgba(13,17,23,0.75)',
            border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:22, padding:'28px 26px 26px',
            position:'relative', overflow:'hidden',
            backdropFilter:'blur(20px)',
            marginBottom:12,
          }}
        >
          {/* Corner glow decoration */}
          <div aria-hidden style={{ position:'absolute', top:-50, right:-50, width:170, height:170, borderRadius:'50%', background:'radial-gradient(circle, rgba(214,255,52,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />

          {/* Vault + frequency row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            {/* Vault selector */}
            <div>
              <FL>Vault</FL>
              <div style={{ position:'relative' }}>
                <select
                  value={form.vaultId}
                  onChange={e => setForm(f => ({ ...f, vaultId: e.target.value }))}
                  style={{
                    width:'100%', height:46,
                    background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(255,255,255,0.09)',
                    borderRadius:11, padding:'0 38px 0 13px',
                    fontSize:13, fontWeight:600, color:'#fff',
                    fontFamily:F_SANS, outline:'none', appearance:'none', cursor:'pointer',
                    transition:'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor='rgba(214,255,52,0.38)'; e.currentTarget.style.background='rgba(255,255,255,0.07)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
                >
                  {Object.keys(VAULTS).map(id => <option key={id} value={id}>{id}</option>)}
                </select>
                <ChevronDown size={13} color="rgba(255,255,255,0.35)"
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
              </div>
            </div>

            {/* Frequency toggle */}
            <div>
              <FL>Frequency</FL>
              <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:11, padding:3, height:46, gap:2 }}>
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => setForm(f => ({ ...f, period:p }))}
                    style={{
                      flex:1, borderRadius:9, border:'none', cursor:'pointer',
                      fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase',
                      fontFamily:F_SANS, transition:'all 0.18s',
                      background: form.period === p ? '#d6ff34' : 'transparent',
                      color:       form.period === p ? '#05070A'  : 'rgba(255,255,255,0.38)',
                      boxShadow:   form.period === p ? '0 2px 10px rgba(214,255,52,0.22)' : 'none',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amount input */}
          <div style={{ marginBottom:20 }}>
            <FL>Amount per cycle</FL>
            <div style={{ position:'relative' }}>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                style={{
                  width:'100%', height:62,
                  background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:13, padding:'0 108px 0 16px',
                  fontSize:24, fontWeight:400, color:'#fff',
                  fontFamily:F_MONO, outline:'none',
                  transition:'border-color 0.2s, background 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor='rgba(214,255,52,0.38)'; e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
                onBlur={e  => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.background='rgba(255,255,255,0.03)' }}
              />
              <div style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:8, padding:'4px 10px' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#2775CA', flexShrink:0 }} />
                <span style={{ fontFamily:F_MONO, fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.7)', letterSpacing:'0.04em' }}>USDC</span>
              </div>
            </div>
          </div>

          {/* CTA button */}
          <motion.button
            onClick={addGoal}
            disabled={busy || !form.amount || parseFloat(form.amount) <= 0}
            whileTap={{ scale:0.975 }}
            style={{
              width:'100%', height:50, borderRadius:13, border:'none',
              cursor: (busy || !form.amount || parseFloat(form.amount) <= 0) ? 'not-allowed' : 'pointer',
              background: busy ? 'rgba(214,255,52,0.55)' : '#d6ff34',
              color:'#05070A',
              fontFamily:F_SANS, fontSize:12, fontWeight:700,
              letterSpacing:'0.1em', textTransform:'uppercase',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              transition:'box-shadow 0.3s, opacity 0.2s',
              boxShadow: busy ? 'none' : '0 0 24px rgba(214,255,52,0.16)',
              opacity: (!form.amount || parseFloat(form.amount) <= 0) ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!busy) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(214,255,52,0.32)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(214,255,52,0.16)' }}
          >
            {busy
              ? <><Loader2 size={15} style={{ animation:'sipSpin 0.8s linear infinite' }} /> Adding Plan…</>
              : <><TrendingUp size={15} /> Initialize SIP Plan <ArrowRight size={13} /></>
            }
          </motion.button>
        </motion.div>

        {/* Hint */}
        <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.2)', fontWeight:400, marginBottom:40, letterSpacing:'0.02em' }}>
          Plans execute manually — come back when the timer shows "Ready now"
        </p>

        {/* Goals list */}
        <AnimatePresence mode="popLayout">
          {goals.length > 0 && (
            <motion.div key="list" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, padding:'0 2px' }}>
                <span style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.26em' }}>
                  Active Strategies
                </span>
                <span style={{ fontFamily:F_MONO, fontSize:10, color:'rgba(255,255,255,0.2)' }}>
                  {goals.length} plan{goals.length > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {goals.map((goal, i) => {
                  const due   = isDue(goal)
                  const vault = VAULTS[goal.vaultId as keyof typeof VAULTS]
                  return (
                    <GoalRow
                      key={`${goal.vaultId}-${goal.createdAt}`}
                      goal={goal} vault={vault} due={due} index={i}
                      onRemove={() => removeGoal(i)}
                      onExecuted={() => {
                        const updated = goals.map((g, gi) => gi === i ? { ...g, createdAt:Date.now() } : g)
                        setGoals(updated); saveGoals(updated)
                      }}
                    />
                  )
                })}
              </div>
            </motion.div>
          )}

          {goals.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{
                background:'rgba(255,255,255,0.015)',
                border:'1px dashed rgba(255,255,255,0.07)',
                borderRadius:22, padding:'48px 32px',
                textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:12,
              }}
            >
              <div style={{ width:50, height:50, borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Calendar size={20} color="rgba(255,255,255,0.22)" />
              </div>
              <div>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, fontWeight:600, margin:0 }}>No active savings plans</p>
                <p style={{ color:'rgba(255,255,255,0.22)', fontSize:12, fontWeight:400, marginTop:5 }}>Initialize your first SIP above to start compounding.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── GoalRow ──────────────────────────────────────────────────────────────────
function GoalRow({
  goal, vault, due, index, onRemove, onExecuted,
}: {
  goal: SIPGoal; vault: any; due: boolean; index: number
  onRemove: () => void; onExecuted: () => void
}) {
  const { address } = useAccount()
  const { deposit, isLoading, isSuccess } = useDeposit({
    vault: vault?.address as `0x${string}`,
    slippageBps: 50,
  })

  useEffect(() => { if (isSuccess) onExecuted() }, [isSuccess])

  const handleExecute = async () => {
    if (!vault || !address) return
    const tokenAddress = vault.asset?.address
      ?? (vault.underlying?.address
          ? (vault.underlying.address[8453] ?? vault.underlying.address[Object.keys(vault.underlying.address)[0]])
          : undefined)
    const decimals = (vault.asset?.decimals ?? vault.underlying?.decimals) ?? 6
    if (!tokenAddress) return
    await deposit({ token: tokenAddress as `0x${string}`, amount: parseTokenAmount(goal.amount, decimals), chainId: 8453 })
  }

  const symbol = vault?.asset?.symbol ?? vault?.underlying?.symbol ?? ''
  const timer  = nextLabel(goal)

  return (
    <motion.div
      initial={{ opacity:0, y:14 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, x:-14, scale:0.97 }}
      transition={{ delay: index * 0.05, duration:0.42, ease:[0.16,1,0.3,1] }}
      style={{
        background: due ? 'rgba(214,255,52,0.04)' : 'rgba(255,255,255,0.025)',
        border:`1px solid ${due ? 'rgba(214,255,52,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:18, padding:'16px 18px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        gap:12, flexWrap:'wrap',
        position:'relative', overflow:'hidden',
        backdropFilter:'blur(12px)',
        transition:'border-color 0.3s, background 0.3s',
      }}
    >
      {/* Due left accent strip */}
      {due && (
        <div aria-hidden style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(180deg, #d6ff34, rgba(214,255,52,0.22))', borderRadius:'18px 0 0 18px' }} />
      )}

      {/* Left: icon + info */}
      <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0, paddingLeft: due ? 4 : 0 }}>
        <div style={{
          width:44, height:44, borderRadius:12, flexShrink:0,
          background: due ? 'rgba(214,255,52,0.1)' : 'rgba(255,255,255,0.04)',
          border:`1px solid ${due ? 'rgba(214,255,52,0.22)' : 'rgba(255,255,255,0.07)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: due ? '0 0 14px rgba(214,255,52,0.1)' : 'none',
        }}>
          <Target size={18} color={due ? '#d6ff34' : 'rgba(255,255,255,0.3)'} />
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:5, flexWrap:'wrap' }}>
            <span style={{ fontFamily:F_MONO, fontSize:20, fontWeight:500, color:'#fff', lineHeight:1, letterSpacing:'-0.015em' }}>
              ${parseFloat(goal.amount).toFixed(2)}
            </span>
            {symbol && (
              <span style={{ fontFamily:F_SANS, fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                {symbol}
              </span>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
            <span style={{ fontFamily:F_SANS, fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.3)' }}>
              {goal.period} · {goal.vaultId}
            </span>
            <span style={{ width:3, height:3, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'inline-block', flexShrink:0 }} />
            <span style={{ fontFamily:F_MONO, fontSize:11, color: due ? '#d6ff34' : 'rgba(255,255,255,0.26)' }}>
              {timer}
            </span>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0 }}>
        {due ? (
          <button
            onClick={handleExecute}
            disabled={isLoading || isSuccess}
            style={{
              height:36, padding:'0 16px', borderRadius:10, border:'none',
              cursor: isLoading || isSuccess ? 'not-allowed' : 'pointer',
              background: isSuccess ? 'rgba(16,185,129,0.15)' : '#d6ff34',
              color: isSuccess ? '#10b981' : '#05070A',
              fontFamily:F_SANS, fontSize:11, fontWeight:700,
              letterSpacing:'0.08em', textTransform:'uppercase',
              display:'flex', alignItems:'center', gap:6,
              transition:'all 0.2s',
              boxShadow: isSuccess ? 'none' : '0 0 16px rgba(214,255,52,0.2)',
              opacity: isLoading ? 0.65 : 1,
              whiteSpace:'nowrap',
            }}
          >
            {isLoading
              ? <><Loader2 size={12} style={{ animation:'sipSpin 0.8s linear infinite' }} /> Executing…</>
              : isSuccess
              ? <><CheckCircle2 size={12} /> Confirmed</>
              : <><Zap size={12} /> Execute</>
            }
          </button>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:9, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <CheckCircle2 size={11} color="rgba(255,255,255,0.22)" />
            <span style={{ fontFamily:F_SANS, fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>
              Scheduled
            </span>
          </div>
        )}
        <button
          onClick={onRemove}
          aria-label="Remove plan"
          style={{ width:36, height:36, borderRadius:10, border:'none', cursor:'pointer', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.18s, color 0.18s', color:'rgba(255,255,255,0.22)', flexShrink:0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(248,113,113,0.1)'; (e.currentTarget as HTMLButtonElement).style.color='#f87171' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='transparent';          (e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.22)' }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1L10 10M1 10L10 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </motion.div>
  )
}




// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { ConnectButton } from '@rainbow-me/rainbowkit'
// import { useAccount } from 'wagmi'
// import { useVaults, useDeposit } from '@yo-protocol/react'
// import { VAULTS, parseTokenAmount } from '@yo-protocol/core'
// import { Target, Calendar, TrendingUp, CheckCircle2, Loader2, Zap } from 'lucide-react'

// const PERIODS = ['Daily', 'Weekly', 'Monthly'] as const
// type Period = (typeof PERIODS)[number]

// interface SIPGoal {
//   vaultId: string
//   amount: string
//   period: Period
//   createdAt: number
// }

// const STORAGE_KEY = 'yo_sip_goals'

// function loadGoals(): SIPGoal[] {
//   try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
// }
// function saveGoals(g: SIPGoal[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(g)) }

// function isDue(goal: SIPGoal): boolean {
//   const now = Date.now()
//   const age = now - goal.createdAt
//   const ms = { Daily: 86_400_000, Weekly: 604_800_000, Monthly: 2_592_000_000 }[goal.period]
//   return age >= ms
// }

// export default function SIPPage() {
//   const { isConnected } = useAccount()
//   const [goals, setGoals] = useState<SIPGoal[]>(loadGoals)
//   const [form, setForm] = useState({ vaultId: 'yoUSD', amount: '', period: 'Weekly' as Period })


//   const addGoal = () => {
//     if (!form.amount || parseFloat(form.amount) <= 0) return
//     const newGoal: SIPGoal = { ...form, createdAt: Date.now() }
//     const updated = [...goals, newGoal]
//     setGoals(updated)
//     saveGoals(updated)
//     setForm({ ...form, amount: '' })
//   }

//   const removeGoal = (idx: number) => {
//     const updated = goals.filter((_, i) => i !== idx)
//     setGoals(updated)
//     saveGoals(updated)
//   }

//   if (!isConnected) {
//     return (
//       <div className="flex flex-col items-center justify-center py-24 gap-6">
//         <div className="w-16 h-16 rounded-full bg-yo-neon-dim border border-yo-neon/20 flex items-center justify-center">
//           <Target size={28} className="text-yo-neon" />
//         </div>
//         <h2 className="text-2xl font-bold text-white text-center">Setup SIP Savings</h2>
//         <p className="text-yo-muted text-center max-w-xs">
//           Automate your DeFi savings goals on Base without custom smart contracts.
//         </p>
//         <ConnectButton />
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-12 pb-24 pt-8">
//       <header className="space-y-4 text-center max-w-lg mx-auto">
//         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yo-neon/10 border border-yo-neon/20">
//           <Calendar size={12} className="text-yo-neon" />
//           <span className="text-[10px] font-bold text-yo-neon tracking-[0.2em] uppercase">Smart Savings</span>
//         </div>
//         <h1 className="text-3xl font-extrabold text-white tracking-tight">Recurring SIP</h1>
//         <p className="text-yo-muted text-sm font-medium leading-relaxed max-w-sm mx-auto">
//           Automate your wealth building with scheduled deposits into high-yield YO vaults.
//         </p>
//       </header>

//       <motion.section
//         initial={{ opacity: 0, scale: 0.98 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
//         className="glass rounded-[32px] p-8 space-y-8 relative overflow-hidden shadow-2xl"
//       >
//         <div className="absolute top-0 right-0 w-32 h-32 bg-yo-neon/5 blur-[80px]" />
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           <div className="space-y-2.5">
//             <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.3em] px-1">Select Vault</label>
//             <div className="relative group">
//               <select
//                 value={form.vaultId}
//                 onChange={(e) => setForm((f) => ({ ...f, vaultId: e.target.value }))}
//                 className="w-full h-12 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 text-[13px] font-bold text-white outline-none focus:border-yo-neon/40 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer"
//               >
//                 {Object.keys(VAULTS).map((id) => (
//                   <option key={id} value={id} className="bg-yo-dark">{id}</option>
//                 ))}
//               </select>
//               <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-yo-muted group-hover:text-yo-neon transition-colors">
//                 <Target size={14} />
//               </div>
//             </div>
//           </div>
//           <div className="space-y-2.5">
//             <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.3em] px-1">Frequency</label>
//             <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1 h-12">
//               {PERIODS.map((p) => (
//                 <button
//                   key={p}
//                   onClick={() => setForm((f: any) => ({ ...f, period: p }))}
//                   className={`flex-1 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest ${
//                     form.period === p 
//                       ? 'bg-yo-neon text-black shadow-[0_4px_12px_rgba(214,255,52,0.2)]' 
//                       : 'text-yo-muted hover:text-white hover:bg-white/5'
//                   }`}
//                 >
//                   {p}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="space-y-2.5">
//           <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.3em] px-1">Saving Amount</label>
//           <div className="group relative">
//             <input
//               type="number"
//               placeholder="0.00"
//               value={form.amount}
//               onChange={(e) => setForm((f: any) => ({ ...f, amount: e.target.value }))}
//               className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 text-xl font-black text-white outline-none focus:border-yo-neon/40 focus:bg-white/[0.06] transition-all group-hover:border-white/20"
//             />
//             <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 shadow-inner">
//               <span className="text-[11px] font-black text-white uppercase tracking-widest">USDC</span>
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={addGoal}
//           className="w-full h-14 rounded-2xl bg-yo-neon text-black font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 hover:shadow-[0_0_40px_rgba(214,255,52,0.3)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
//         >
//           Initialize Plan
//           <TrendingUp size={18} />
//         </button>
//       </motion.section>

//       {goals.length > 0 && (
//       <section className="space-y-8 pt-6">
//         <div className="flex items-center justify-between px-2 text-yo-muted">
//           <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">Active Strategies</h2>
//           <span className="text-[10px] font-bold uppercase">{goals.length} Plans</span>
//         </div>
//           <div className="space-y-4">
//             {goals.map((goal, i) => {
//               const due = isDue(goal)
//               const vault = VAULTS[goal.vaultId as keyof typeof VAULTS]

//               return (
//                 <GoalRow
//                   key={i}
//                   goal={goal}
//                   vault={vault}
//                   due={due}
//                   onRemove={() => removeGoal(i)}
//                   onExecuted={() => {
//                     const updated = goals.map((g, gi) =>
//                       gi === i ? { ...g, createdAt: Date.now() } : g
//                     )
//                     setGoals(updated)
//                     saveGoals(updated)
//                   }}
//                 />
//               )
//             })}
//           </div>
//         </section>
//       )}

//       {goals.length === 0 && (
//         <div className="rounded-[40px] border border-dashed border-white/10 p-16 text-center glass group hover:border-yo-neon/20 transition-colors">
//           <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4 text-yo-muted opacity-40 group-hover:opacity-100 group-hover:text-yo-neon transition-all">
//             <Calendar size={20} />
//           </div>
//           <p className="text-yo-muted text-sm font-medium tracking-tight">No active savings plans.</p>
//           <p className="text-yo-muted opacity-40 text-xs mt-1">Initialize your first SIP to start automated growth.</p>
//         </div>
//       )}
//     </div>
//   )
// }

// function GoalRow({
//   goal,
//   vault,
//   due,
//   onRemove,
//   onExecuted,
// }: {
//   goal: SIPGoal
//   vault: any
//   due: boolean
//   onRemove: () => void
//   onExecuted: () => void
// }) {
//   const { address } = useAccount()
//   const { deposit, isLoading, isSuccess } = useDeposit({
//     vault: vault?.address as `0x${string}`,
//     slippageBps: 50,
//   })

//   if (isSuccess) {
//     onExecuted()
//   }

//   const handleExecute = async () => {
//     if (!vault || !address) return
//     const tokenAddress = vault.asset?.address || (vault.underlying?.address ? (vault.underlying.address[8453] || vault.underlying.address[Object.keys(vault.underlying.address)[0]]) : undefined)
//     const decimals = (vault.asset?.decimals || vault.underlying?.decimals) ?? 6
    
//     if (!tokenAddress) return

//     await deposit({
//       token: tokenAddress as `0x${string}`,
//       amount: parseTokenAmount(goal.amount, decimals),
//       chainId: 8453,
//     })
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className={`relative glass rounded-[32px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden group transition-all duration-700 ${
//         due ? 'border-yo-neon/30 bg-yo-neon/[0.02]' : 'border-white/[0.03]'
//       }`}
//     >
//       <div className="absolute inset-0 bg-gradient-to-r from-yo-neon/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
//       <div className="flex items-center gap-5 relative z-10">
//         <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center transition-all duration-500 group-hover:border-white/10 ${due ? 'shadow-[0_0_20px_rgba(214,255,52,0.1)]' : ''}`}>
//           <Target size={24} className={due ? "text-yo-neon" : "text-yo-muted opacity-50"} />
//         </div>
//         <div>
//           <h4 className="text-lg font-black text-white tracking-tight leading-none mb-1.5 flex items-center gap-2">
//             {goal.amount} <span className="text-[10px] text-yo-muted uppercase font-bold tracking-widest">{(vault?.asset?.symbol || vault?.underlying?.symbol)}</span>
//           </h4>
//           <p className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em] opacity-60">Scheduled {goal.period} · {goal.vaultId}</p>
//         </div>
//       </div>

//       <div className="flex items-center gap-4 w-full sm:w-auto relative z-10">
//         {due ? (
//           <button
//             onClick={handleExecute}
//             disabled={isLoading || isSuccess}
//             className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-yo-neon text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
//           >
//             {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={14} />}
//             {isSuccess ? 'Verified' : 'Execute SIP'}
//           </button>
//         ) : (
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em]">
//             <CheckCircle2 size={12} className="text-yo-accent opacity-60" />
//             Confirmed
//           </div>
//         )}
//         <button 
//           onClick={onRemove} 
//           className="w-12 h-12 flex items-center justify-center rounded-2xl text-yo-muted/20 hover:text-red-400 hover:bg-white/5 transition-all"
//         >
//           <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//           </svg>
//         </button>
//       </div>
//     </motion.div>
//   )
// }
