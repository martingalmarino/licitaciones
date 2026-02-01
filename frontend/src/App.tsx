import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import RadarPage from './pages/RadarPage'
import RiskSimulatorLanding from './pages/RiskSimulatorLanding'
import RiskSimulatorWizard from './pages/RiskSimulatorWizard'
import RiskSimulatorResult from './pages/RiskSimulatorResult'
import RiskSimulatorHistory from './pages/RiskSimulatorHistory'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<RadarPage />} />
        <Route path="/risk-simulator" element={<RiskSimulatorLanding />} />
        <Route path="/risk-simulator/wizard" element={<RiskSimulatorWizard />} />
        <Route path="/risk-simulator/result/:id" element={<RiskSimulatorResult />} />
        <Route path="/risk-simulator/history" element={<RiskSimulatorHistory />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
