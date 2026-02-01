import { useState, useEffect } from 'react'
import TenderTable from '../components/TenderTable'
import Filters from '../components/Filters'
import { getTenders, getDemoTenders, refreshData, Tender, TenderFilters } from '../api/client'

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
  const [usingDemoData, setUsingDemoData] = useState(false)

  const applyFilters = (items: Tender[]) => {
    let filtered = [...items]
    if (filters.province) filtered = filtered.filter(t => t.province === filters.province)
    if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority)
    if (filters.status) filtered = filtered.filter(t => t.status === filters.status)
    if (filters.q) {
      const q = filters.q.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.organization?.toLowerCase().includes(q)) ||
        (t.description?.toLowerCase().includes(q))
      )
    }
    const sortKey = filters.sort || 'open_date'
    const order = filters.order || 'asc'
    filtered.sort((a, b) => {
      const aVal = sortKey === 'score' ? a.score_total : (a as any)[sortKey]
      const bVal = sortKey === 'score' ? b.score_total : (b as any)[sortKey]
      if (!aVal && !bVal) return 0
      if (!aVal) return order === 'asc' ? 1 : -1
      if (!bVal) return order === 'asc' ? -1 : 1
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return order === 'desc' ? -cmp : cmp
    })
    return filtered
  }

  const loadTenders = async () => {
    setLoading(true)
    try {
      const response = await getTenders(filters)
      setTenders(response.items)
      setTotal(response.total)
      setUsingDemoData(false)
    } catch (error) {
      console.warn('API no disponible, usando datos demo:', error)
      try {
        const demo = await getDemoTenders()
        const filtered = applyFilters(demo.items)
        setTenders(filtered)
        setTotal(filtered.length)
        setUsingDemoData(true)
      } catch (e) {
        console.error('Error cargando datos demo:', e)
        alert('Error al cargar licitaciones. Verifique que el backend esté corriendo.')
      }
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

      {usingDemoData && (
        <div className="demo-banner">Mostrando datos demo (20 licitaciones). Conecte el backend para datos en tiempo real.</div>
      )}
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
