import RiskPortfolios from '../components/RiskPortfolios'

const F = "'Outfit', system-ui, sans-serif"

export default function PortfoliosPage() {
  return (
    <div style={{ fontFamily: F, minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: 48, marginTop: 16 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.8)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Automated Wealth</span>
        </div>
        <h1 style={{ fontFamily: F, fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 16px' }}>
          Diversified <span style={{ color: '#d6ff34' }}>Portfolios</span>
        </h1>
        <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: 15, fontWeight: 400, maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
          Not sure which vault to pick? Deposit a single bundle of funds and instantly diversify across Base Mainnet vaults tailored to your exact risk tolerance.
        </p>
      </header>

      <RiskPortfolios />
    </div>
  )
}
