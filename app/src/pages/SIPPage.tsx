import { useState } from 'react'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useVaults, useDeposit } from '@yo-protocol/react'
import { VAULTS, parseTokenAmount } from '@yo-protocol/core'
import { Target, Calendar, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react'

const PERIODS = ['Daily', 'Weekly', 'Monthly'] as const
type Period = (typeof PERIODS)[number]

interface SIPGoal {
  vaultId: string
  amount: string
  period: Period
  createdAt: number
}

const STORAGE_KEY = 'yo_sip_goals'

function loadGoals(): SIPGoal[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveGoals(g: SIPGoal[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(g)) }

function isDue(goal: SIPGoal): boolean {
  const now = Date.now()
  const age = now - goal.createdAt
  const ms = { Daily: 86_400_000, Weekly: 604_800_000, Monthly: 2_592_000_000 }[goal.period]
  return age >= ms
}

export default function SIPPage() {
  const { address, isConnected } = useAccount()
  const { vaults } = useVaults()
  const [goals, setGoals] = useState<SIPGoal[]>(loadGoals)
  const [form, setForm] = useState({ vaultId: 'yoUSD', amount: '', period: 'Weekly' as Period })

  const getVaultConfig = (vaultId: string) =>
    vaults?.find((v: any) => v.contracts.vaultAddress.toLowerCase() === VAULTS[vaultId as keyof typeof VAULTS]?.address.toLowerCase())

  const addGoal = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return
    const newGoal: SIPGoal = { ...form, createdAt: Date.now() }
    const updated = [...goals, newGoal]
    setGoals(updated)
    saveGoals(updated)
    setForm({ ...form, amount: '' })
  }

  const removeGoal = (idx: number) => {
    const updated = goals.filter((_, i) => i !== idx)
    setGoals(updated)
    saveGoals(updated)
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 rounded-full bg-yo-neon-dim border border-yo-neon/20 flex items-center justify-center">
          <Target size={28} className="text-yo-neon" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center">Setup SIP Savings</h2>
        <p className="text-yo-muted text-center max-w-xs">
          Automate your DeFi savings goals on Base without custom smart contracts.
        </p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-yo-neon" size={24} />
          SIP Savings (One-Click)
        </h1>
        <p className="text-yo-muted text-sm mt-1">
          Set goals and get notified when it's time to save.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-yo-card border border-yo-border rounded-2xl p-6 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-yo-muted">Vault</label>
            <select
              value={form.vaultId}
              onChange={(e) => setForm((f) => ({ ...f, vaultId: e.target.value }))}
              className="w-full bg-yo-black border border-yo-border rounded-xl px-4 py-2.5 text-white outline-none focus:border-yo-neon/50 transition-colors"
            >
              {Object.keys(VAULTS).map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-yo-muted">Frequency</label>
            <div className="flex bg-yo-black border border-yo-border rounded-xl p-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm((f: any) => ({ ...f, period: p }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.period === p ? 'bg-yo-neon text-black' : 'text-yo-muted hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-yo-black rounded-xl border border-yo-border flex items-center gap-3">
          <input
            type="number"
            placeholder="Amount to save..."
            value={form.amount}
            onChange={(e) => setForm((f: any) => ({ ...f, amount: e.target.value }))}
            className="flex-1 bg-transparent text-white font-semibold outline-none"
          />
          <span className="text-yo-neon font-bold text-sm">USDC</span>
        </div>

        <button
          onClick={addGoal}
          className="w-full py-3.5 rounded-xl bg-yo-neon text-black font-bold hover:brightness-110 active:scale-95 transition-all"
        >
          Create Savings Goal
        </button>
      </motion.section>

      {goals.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-yo-muted uppercase tracking-widest">Your Goals</h2>
          {goals.map((goal, i) => {
            const due = isDue(goal)
            const config = getVaultConfig(goal.vaultId)
            const vault = VAULTS[goal.vaultId as keyof typeof VAULTS]

            return (
              <GoalRow
                key={i}
                goal={goal}
                config={config}
                vault={vault}
                due={due}
                onRemove={() => removeGoal(i)}
                onExecuted={() => {
                  const updated = goals.map((g, gi) =>
                    gi === i ? { ...g, createdAt: Date.now() } : g
                  )
                  setGoals(updated)
                  saveGoals(updated)
                }}
              />
            )
          })}
        </section>
      )}

      {goals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-yo-border p-8 text-center">
          <p className="text-yo-muted text-sm">No savings goals yet. Create one above.</p>
        </div>
      )}
    </div>
  )
}

function GoalRow({
  goal,
  config,
  vault,
  due,
  onRemove,
  onExecuted,
}: {
  goal: SIPGoal
  config: any
  vault: any
  due: boolean
  onRemove: () => void
  onExecuted: () => void
}) {
  const { address } = useAccount()
  const { deposit, isLoading, isSuccess } = useDeposit({
    vault: vault?.address as `0x${string}`,
    slippageBps: 50,
  })

  // Need to handle the result of useDeposit to call onExecuted
  if (isSuccess) {
    onExecuted()
  }

  const handleExecute = async () => {
    if (!vault || !address) return
    // Handle both VaultConfig and VaultStatsItem structures
    const vaultAddr = vault.contracts?.vaultAddress || vault.address
    const tokenAddress = vault.asset?.address || (vault.underlying?.address ? (vault.underlying.address[8453] || vault.underlying.address[Object.keys(vault.underlying.address)[0]]) : undefined)
    const decimals = (vault.asset?.decimals || vault.underlying?.decimals) ?? 6
    
    if (!tokenAddress) return

    await deposit({
      token: tokenAddress as `0x${string}`,
      amount: parseTokenAmount(goal.amount, decimals),
      chainId: 8453,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between bg-yo-card border rounded-2xl px-5 py-4 transition-all ${
        due ? 'border-yo-neon/40 shadow-[0_0_20px_rgba(214,255,52,0.06)]' : 'border-yo-border'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-yo-black border border-yo-border flex items-center justify-center">
          <Target size={16} className="text-yo-neon" />
        </div>
        <div>
          <p className="font-medium text-white text-sm">
            {goal.amount} {(vault?.asset?.symbol || vault?.underlying?.symbol)} · {goal.period}
          </p>
          <p className="text-xs text-yo-muted">{goal.vaultId}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {due ? (
          <button
            onClick={handleExecute}
            disabled={isLoading || isSuccess}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yo-neon text-black text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <TrendingUp size={12} />}
            {isSuccess ? 'Done!' : 'Execute SIP'}
          </button>
        ) : (
          <span className="text-xs text-yo-muted px-2">On schedule</span>
        )}
        <button onClick={onRemove} className="text-yo-muted2 hover:text-red-400 transition-colors text-xs px-1">
          ✕
        </button>
      </div>
    </motion.div>
  )
}
