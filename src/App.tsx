import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import VaultsPage from './pages/VaultsPage'
import DashboardPage from './pages/DashboardPage'
import SIPPage from './pages/SIPPage'
import PortfoliosPage from './pages/PortfoliosPage'
import GiftPage from './pages/GiftPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<VaultsPage />} />
          <Route path="/portfolios" element={<PortfoliosPage />} />
          <Route path="/gift" element={<GiftPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sip" element={<SIPPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
