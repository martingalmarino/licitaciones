import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import RadarPage from './pages/RadarPage'
import RiskSimulatorLanding from './pages/RiskSimulatorLanding'
import RiskSimulatorWizard from './pages/RiskSimulatorWizard'
import RiskSimulatorResult from './pages/RiskSimulatorResult'
import RiskSimulatorHistory from './pages/RiskSimulatorHistory'
import Performance from './pages/Performance'
import LibraryHome from './pages/LibraryHome'
import LibraryList from './pages/LibraryList'
import LibraryItemDetail from './pages/LibraryItemDetail'

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
        <Route path="/performance" element={<Performance />} />
        <Route path="/library" element={<LibraryHome />} />
        <Route path="/library/checklists" element={<LibraryList type="CHECKLIST" />} />
        <Route path="/library/pliegos" element={<LibraryList type="PLIEGO" />} />
        <Route path="/library/item/:id" element={<LibraryItemDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
