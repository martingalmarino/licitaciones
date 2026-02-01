import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import TenderDetail from './pages/TenderDetail'
import { Tender } from './api/client'

function App() {
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null)

  if (selectedTender) {
    return (
      <TenderDetail
        tenderId={selectedTender.id}
        initialTender={selectedTender}
        onClose={() => setSelectedTender(null)}
        onUpdate={(updated) => setSelectedTender(updated)}
      />
    )
  }

  return (
    <Dashboard onSelectTender={setSelectedTender} />
  )
}

export default App
