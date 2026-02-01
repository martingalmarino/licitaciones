import { useState, useEffect } from 'react'
import TenderTable from '../components/TenderTable'
import Filters from '../components/Filters'
import Header from '../components/Header'
import { getTenders, refreshData, Tender, TenderFilters } from '../api/client'

interface DashboardProps {
  onSelectTender: (tender: Tender) => void
}

export default function Dashboard({ onSelectTender }: DashboardProps) {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<TenderFilters>({
    sort: 'open_date',
    order: 'asc',
    limit: 100,
  })
  const [refreshing, setRefreshing] = useState(false)

  const loadTenders = async () => {
    setLoading(true)
    try {
      const response = await getTenders(filters)
      setTenders(response.items)
      setTotal(response.total)
    } catch (error) {
      console.error('Error loading tenders:', error)
      alert('Error al cargar licitaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTenders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.province,
    filters.priority,
    filters.status,
    filters.q,
    filters.open_date_from,
    filters.open_date_to,
    filters.sort,
    filters.order,
    filters.skip,
    filters.limit
  ])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()
      await loadTenders()
      alert('Datos actualizados correctamente')
    } catch (error) {
      console.error('Error refreshing data:', error)
      alert('Error al actualizar datos')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="app-container">
      <Header />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Radar de Licitaciones</h1>
          <button
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
          </button>
        </div>

      <Filters filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <div className="results-info">
            Mostrando {tenders.length} de {total} licitaciones
          </div>
          <TenderTable tenders={tenders} onSelectTender={onSelectTender} />
        </>
      )}
      </div>
    </div>
  )
}
