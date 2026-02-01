import { useState } from 'react'
import Dashboard from './Dashboard'
import TenderDetail from './TenderDetail'
import { Tender } from '../api/client'

export default function RadarPage() {
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

  return <Dashboard onSelectTender={setSelectedTender} />
}
