import { useState, useMemo } from 'react'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Calculator, TrendingUp } from 'lucide-react'

const F    = "'Outfit', system-ui, sans-serif"
const FNUM = "'DM Mono', 'Fira Code', monospace"

export default function YieldCalculator({ avgApy = 10.5 }: { avgApy?: number }) {
  const [monthlyDeposit, setMonthlyDeposit] = useState(500)
  const [years, setYears] = useState(5)

  const bankApy = 0.5

  const data = useMemo(() => {
    const points = []
    let totalDeposited = 0
    let bankBalance = 0
    let yoBalance = 0

    // Calculate month by month
    for (let m = 0; m <= years * 12; m++) {
      if (m > 0) {
        totalDeposited += monthlyDeposit
        // Monthly compounding
        bankBalance = (bankBalance + monthlyDeposit) * (1 + (bankApy / 100) / 12)
        yoBalance = (yoBalance + monthlyDeposit) * (1 + (avgApy / 100) / 12)
      }
      
      if (m % 12 === 0) {
        points.push({
          year: `Year ${m / 12}`,
          deposits: Math.round(totalDeposited),
          bank: Math.round(bankBalance),
          yo: Math.round(yoBalance),
        })
      }
    }
    return points
  }, [monthlyDeposit, years, avgApy])

  const finalYo = data[data.length - 1].yo
  const finalDeposits = data[data.length - 1].deposits
  const profit = finalYo - finalDeposits

  return (
    <div style={{ background: 'rgba(13,17,23,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, backdropFilter: 'blur(12px)', padding: '24px', fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(214,255,52,0.1)', border: '1px solid rgba(214,255,52,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calculator size={20} color="#d6ff34" />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.01em' }}>Yield Projection</h2>
          <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, fontWeight: 600 }}>
            Compound Interest Simulator
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }} className="calc-grid">
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(148,163,184,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monthly Deposit</label>
              <span style={{ fontFamily: FNUM, fontSize: 14, fontWeight: 600, color: '#fff' }}>${monthlyDeposit}</span>
            </div>
            <input 
              type="range" 
              min="50" max="5000" step="50" 
              value={monthlyDeposit} 
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#d6ff34' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(148,163,184,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Time Horizon</label>
              <span style={{ fontFamily: FNUM, fontSize: 14, fontWeight: 600, color: '#fff' }}>{years} Years</span>
            </div>
            <input 
              type="range" 
              min="1" max="20" step="1" 
              value={years} 
              onChange={(e) => setYears(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#d6ff34' }}
            />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Projected Yield</p>
            <p style={{ fontFamily: FNUM, fontSize: 28, fontWeight: 600, color: '#10b981', margin: 0, letterSpacing: '-0.02em' }}>+${profit.toLocaleString()}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <TrendingUp size={12} color="#d6ff34" />
              <span style={{ fontSize: 11, color: 'rgba(214,255,52,0.9)', fontWeight: 500 }}>{avgApy.toFixed(1)}% Avg APY vs Bank (0.5%)</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: 300, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorYo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4E6FFF" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4E6FFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.5)' }} tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <Tooltip 
                contentStyle={{ background: 'rgba(13,17,23,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                itemStyle={{ fontFamily: FNUM, fontWeight: 600 }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="bank" stroke="#4E6FFF" strokeWidth={2} fillOpacity={1} fill="url(#colorBank)" name="Traditional Bank" />
              <Area type="monotone" dataKey="yo" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorYo)" name="Yo Protocol" />
              <Area type="monotone" dataKey="deposits" stroke="rgba(255,255,255,0.5)" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Your Deposits" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) { .calc-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
