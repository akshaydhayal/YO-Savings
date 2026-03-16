import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import VaultsPage from './pages/VaultsPage'
import DashboardPage from './pages/DashboardPage'
import SIPPage from './pages/SIPPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<VaultsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sip" element={<SIPPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
